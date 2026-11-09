#!/usr/bin/env python3
"""Check SRM and compare binary outcomes using two-proportion diagnostics."""
from __future__ import annotations

import argparse
import math


def _count(value: int, name: str, minimum: int = 0) -> None:
    if type(value) is not int or value < minimum:
        raise ValueError(f"{name} must be an integer >= {minimum}")


def sample_ratio_mismatch(
    control: int, treatment: int, expected_control: float = 0.5
) -> float:
    _count(control, "control")
    _count(treatment, "treatment")
    if (
        control + treatment <= 0
        or isinstance(expected_control, bool)
        or not isinstance(expected_control, (int, float))
        or not math.isfinite(expected_control)
        or not 0 < expected_control < 1
    ):
        raise ValueError("invalid experiment counts or allocation")
    total = control + treatment
    expected = total * expected_control
    other = total - expected
    return (control - expected) ** 2 / expected + (treatment - other) ** 2 / other


def srm_p_value(chi_square_statistic: float) -> float:
    """Upper-tail p-value for the two-arm chi-square test (1 degree of freedom)."""
    if (
        isinstance(chi_square_statistic, bool)
        or not isinstance(chi_square_statistic, (int, float))
        or not math.isfinite(chi_square_statistic)
        or chi_square_statistic < 0
    ):
        raise ValueError("chi-square statistic must be finite and non-negative")
    return math.erfc(math.sqrt(chi_square_statistic / 2))


def conversion_rate(successes: int, exposures: int) -> float:
    _count(successes, "successes")
    _count(exposures, "exposures", 1)
    if successes > exposures:
        raise ValueError("successes cannot exceed exposures")
    return successes / exposures


def pooled_standard_error(
    control_successes: int,
    control_n: int,
    treatment_successes: int,
    treatment_n: int,
) -> float:
    control_rate = conversion_rate(control_successes, control_n)
    treatment_rate = conversion_rate(treatment_successes, treatment_n)
    pooled = (control_successes + treatment_successes) / (control_n + treatment_n)
    return math.sqrt(pooled * (1 - pooled) * (1 / control_n + 1 / treatment_n))


def two_proportion_z_test(
    control_successes: int,
    control_n: int,
    treatment_successes: int,
    treatment_n: int,
) -> tuple[float, float]:
    control_rate = conversion_rate(control_successes, control_n)
    treatment_rate = conversion_rate(treatment_successes, treatment_n)
    standard_error = pooled_standard_error(
        control_successes, control_n, treatment_successes, treatment_n
    )
    if standard_error == 0:
        if control_rate == treatment_rate:
            return 0.0, 1.0
        raise ValueError("pooled standard error is zero for unequal arm rates")
    z_score = (treatment_rate - control_rate) / standard_error
    return z_score, math.erfc(abs(z_score) / math.sqrt(2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    srm = sample_ratio_mismatch(520, 480)
    control = conversion_rate(210, 1_000)
    treatment = conversion_rate(235, 1_000)
    z_score, p_value = two_proportion_z_test(210, 1_000, 235, 1_000)
    print("SRM chi-square:", round(srm, 3), "p-value:", srm_p_value(srm))
    print("conversion:", control, treatment, "absolute lift:", treatment - control)
    print("two-proportion z:", z_score, "two-sided p-value:", p_value)
    print("This calculator omits clustering, sequential testing, multiple testing and power planning.")


if __name__ == "__main__":
    main()
