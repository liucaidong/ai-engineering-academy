#!/usr/bin/env python3
"""Compute AI product unit economics with Decimal and explicit currency inputs."""
from __future__ import annotations

import argparse
from decimal import Decimal, InvalidOperation, ROUND_CEILING


def _amount(value: Decimal | str | int) -> Decimal:
    if isinstance(value, (float, bool)):
        raise ValueError("monetary values must be Decimal, string or integer; floats are rejected")
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError("invalid monetary value") from exc
    if not amount.is_finite() or amount < 0:
        raise ValueError("monetary values must be finite and non-negative")
    return amount


def _count(value: int, name: str, minimum: int = 0) -> None:
    if type(value) is not int or value < minimum:
        raise ValueError(f"{name} must be an integer >= {minimum}")


def model_cost(
    input_tokens: int,
    output_tokens: int,
    input_price_per_million: Decimal | str | int,
    output_price_per_million: Decimal | str | int,
) -> Decimal:
    _count(input_tokens, "input_tokens")
    _count(output_tokens, "output_tokens")
    input_price = _amount(input_price_per_million)
    output_price = _amount(output_price_per_million)
    return (
        Decimal(input_tokens) * input_price / Decimal(1_000_000)
        + Decimal(output_tokens) * output_price / Decimal(1_000_000)
    )


def task_cost(
    model: Decimal | str | int,
    tools: Decimal | str | int,
    storage: Decimal | str | int,
    human_seconds: Decimal | str | int,
    hourly_rate: Decimal | str | int,
    retry_cost: Decimal | str | int = 0,
) -> Decimal:
    model_cost_value, tool_cost, storage_cost, seconds, rate, retry = map(
        _amount, (model, tools, storage, human_seconds, hourly_rate, retry_cost)
    )
    return model_cost_value + tool_cost + storage_cost + seconds * rate / Decimal(3600) + retry


def cost_per_successful_task(
    total_cost: Decimal | str | int, attempts: int, verified_successes: int
) -> Decimal:
    cost = _amount(total_cost)
    _count(attempts, "attempts", 1)
    _count(verified_successes, "verified_successes", 1)
    if verified_successes > attempts:
        raise ValueError("verified successes cannot exceed attempts")
    return cost / Decimal(verified_successes)


def contribution_margin(
    revenue: Decimal | str | int, variable_cost: Decimal | str | int
) -> Decimal:
    revenue_value = _amount(revenue)
    cost_value = _amount(variable_cost)
    if revenue_value <= 0:
        raise ValueError("revenue must be positive")
    return (revenue_value - cost_value) / revenue_value


def break_even_volume(
    fixed_cost: Decimal | str | int,
    price: Decimal | str | int,
    variable_cost: Decimal | str | int,
) -> int:
    fixed = _amount(fixed_cost)
    price_value = _amount(price)
    variable = _amount(variable_cost)
    contribution = price_value - variable
    if contribution <= 0:
        raise ValueError("unit contribution must be positive")
    return int((fixed / contribution).to_integral_value(rounding=ROUND_CEILING))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    model = model_cost(12_000, 2_000, "2", "8")
    total = task_cost(model, "0.02", "0.01", "30", "24", "0.01")
    print("model cost:", model, "total cost:", total)
    print("cost per successful task:", cost_per_successful_task(total * 100, 100, 85))
    print("contribution margin:", contribution_margin("0.5", total))
    print("break-even tasks:", break_even_volume("10000", "0.5", total))
    print("Use independently verified successful tasks as denominator; all amounts must use one currency.")


if __name__ == "__main__":
    main()
