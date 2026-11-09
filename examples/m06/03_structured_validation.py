#!/usr/bin/env python3
"""Demonstrate parse, schema, business, and authorization validation layers."""
from __future__ import annotations
import argparse
import json

def validate_refund(raw: str, order_balances: dict[str, float], user_orders: dict[str, set[str]]) -> tuple[str, str]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return "parse", "invalid_json"
    if not isinstance(payload, dict):
        return "schema", "object_required"
    required = {"request_id", "order_id", "amount", "currency", "reason"}
    if not required.issubset(payload) or set(payload) - required:
        return "schema", "required_or_unknown_field"
    if not isinstance(payload["amount"], (int, float)) or isinstance(payload["amount"], bool) or payload["amount"] <= 0:
        return "schema", "amount_must_be_positive_number"
    if payload["currency"] not in {"USD", "EUR", "CNY"} or payload["reason"] not in {"duplicate", "damaged", "not_received"}:
        return "schema", "enum_violation"
    order_id = payload["order_id"]
    if order_id not in order_balances or payload["amount"] > order_balances[order_id]:
        return "business", "order_missing_or_refund_exceeds_balance"
    # The trusted principal comes from the caller, not from model-generated JSON.
    return "business", "valid_pending_authorization"

def authorize_refund(stage_result: tuple[str, str], principal: str, order_id: str, user_orders: dict[str, set[str]]) -> tuple[str, str]:
    if stage_result != ("business", "valid_pending_authorization"):
        return stage_result
    if order_id not in user_orders.get(principal, set()):
        return "authorization", "forbidden"
    return "accepted", "requires_idempotent_execution_and_approval_policy"

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--user", default="alice")
    args = parser.parse_args()
    balances = {"order-100": 80.0}
    ownership = {"alice": {"order-100"}, "bob": set()}
    raw = '{"request_id":"r-1","order_id":"order-100","amount":50,"currency":"USD","reason":"damaged"}'
    first = validate_refund(raw, balances, ownership)
    print("Pre-authorization:", first)
    print("Final:", authorize_refund(first, args.user, "order-100", ownership))
    print("This example validates data only; it does not execute a refund.")

if __name__ == "__main__":
    main()
