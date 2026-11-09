#!/usr/bin/env python3
"""Demonstrate CloudEvents usage ingestion, durable-key dedupe and Decimal settlement."""
from __future__ import annotations

import argparse
from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from threading import Lock


def validate_usage_event(event: dict[str, object]) -> None:
    if not isinstance(event, dict):
        raise ValueError("event_must_be_object")
    for field in ("id", "source", "type", "time", "subject"):
        if not isinstance(event.get(field), str) or not event[field]:
            raise ValueError(f"missing_or_invalid_{field}")
    if event.get("specversion") != "1.0":
        raise ValueError("unsupported_cloud_event_specversion")
    try:
        event_time = datetime.fromisoformat(str(event["time"]).replace("Z", "+00:00"))
        if event_time.tzinfo is None:
            raise ValueError("event_time_must_include_timezone")
    except ValueError as exc:
        raise ValueError("invalid_event_time") from exc
    data = event.get("data")
    if not isinstance(data, dict):
        raise ValueError("event_data_must_be_object")
    for field in ("tenant_id", "request_id", "provider", "model", "price_version", "currency", "usage_origin"):
        if not isinstance(data.get(field), str) or not data[field]:
            raise ValueError(f"missing_or_invalid_data_{field}")
    if event["subject"] != data["tenant_id"]:
        raise ValueError("subject_tenant_mismatch")
    if len(data["currency"]) != 3 or not data["currency"].isascii() or not data["currency"].isalpha() or data["currency"] != data["currency"].upper():
        raise ValueError("currency_must_be_three_letter_uppercase_token; validate ISO_4217 separately")
    if data["usage_origin"] not in {"provider", "estimated"}:
        raise ValueError("invalid_usage_origin")
    for field in ("input_tokens", "output_tokens"):
        if type(data.get(field)) is not int or data[field] < 0:
            raise ValueError(f"{field}_must_be_nonnegative_integer")


class UsageLedger:
    """Process-local idempotency demo; production needs a durable unique (source,id) key."""

    def __init__(self) -> None:
        self._seen: set[tuple[str, str]] = set()
        self._events: dict[tuple[str, str], dict[str, object]] = {}
        self._lock = Lock()

    def ingest_once(self, events: list[dict[str, object]]) -> tuple[list[dict[str, object]], int]:
        # Validate the full batch before mutating the ledger.
        for event in events:
            validate_usage_event(event)
        accepted: list[dict[str, object]] = []
        duplicates = 0
        with self._lock:
            staged: dict[tuple[str, str], dict[str, object]] = {}
            for event in events:
                key = (event["source"], event["id"])
                existing = self._events.get(key) or staged.get(key)
                if existing is not None:
                    if existing != event:
                        raise ValueError("idempotency_key_payload_conflict")
                    duplicates += 1
                    continue
                staged[key] = {**event, "data": dict(event["data"])}
            # Mutate only after all duplicate keys have been checked for payload conflicts.
            for key, stored in staged.items():
                self._seen.add(key)
                self._events[key] = stored
                accepted.append(stored)
        return accepted, duplicates


def _money(value: Decimal | str | int) -> Decimal:
    if isinstance(value, float) or isinstance(value, bool):
        raise ValueError("money must be Decimal, string or integer; floats are not accepted")
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError("invalid monetary amount") from exc
    if not amount.is_finite() or amount < 0:
        raise ValueError("amount must be finite and non-negative")
    return amount


def settle(reserved_amount: Decimal | str | int,
           actual_amount: Decimal | str | int) -> dict[str, Decimal]:
    reserved = _money(reserved_amount)
    actual = _money(actual_amount)
    return {
        "reserved": reserved,
        "actual": actual,
        "release": max(Decimal("0"), reserved - actual),
        "additional_charge": max(Decimal("0"), actual - reserved),
    }


def price_usage(input_tokens: int, output_tokens: int,
                input_per_million: Decimal | str | int,
                output_per_million: Decimal | str | int) -> Decimal:
    if type(input_tokens) is not int or type(output_tokens) is not int or min(input_tokens, output_tokens) < 0:
        raise ValueError("token usage must be non-negative integers")
    input_price = _money(input_per_million)
    output_price = _money(output_per_million)
    return (
        Decimal(input_tokens) * input_price / Decimal(1_000_000)
        + Decimal(output_tokens) * output_price / Decimal(1_000_000)
    )



def quantize_currency(amount: Decimal | str | int, minor_unit_exponent: int,
                      rounding: str = "ROUND_HALF_UP") -> Decimal:
    """Quantize with a caller-supplied, versioned currency exponent and rounding policy."""
    value = _money(amount)
    if type(minor_unit_exponent) is not int or not 0 <= minor_unit_exponent <= 6:
        raise ValueError("minor-unit exponent must be an integer in [0, 6]")
    if rounding != "ROUND_HALF_UP":
        raise ValueError("this teaching example only implements ROUND_HALF_UP")
    quantum = Decimal(1).scaleb(-minor_unit_exponent)
    return value.quantize(quantum, rounding=ROUND_HALF_UP)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    base = {
        "specversion":"1.0", "source":"urn:ai-gateway:tenant-a", "type":"ai.usage.recorded",
        "time":"2026-11-10T00:00:00Z", "subject":"tenant-a",
        "data":{"tenant_id":"tenant-a","request_id":"req-1","provider":"openai","model":"gpt-model-x",
               "input_tokens":1200,"output_tokens":300,"price_version":"2026-11-01","currency":"USD","usage_origin":"provider"},
    }
    events = [{**base,"id":"req-1"},{**base,"id":"req-1"},{**base,"id":"req-2","data":{**base["data"],"request_id":"req-2"}}]
    ledger = UsageLedger()
    accepted, duplicates = ledger.ingest_once(events)
    print("accepted:", len(accepted), "duplicates:", duplicates)
    print("settlement:", settle("0.020000", "0.013000"))
    raw_cost = price_usage(1200, 300, "2.00", "8.00")
    print("estimated charge:", raw_cost, "USD; rounded:", quantize_currency(raw_cost, 2), "USD")
    print("Persist raw events and price version; estimated usage is not a provider invoice.")


if __name__ == "__main__":
    main()
