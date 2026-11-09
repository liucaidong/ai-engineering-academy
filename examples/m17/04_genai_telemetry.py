#!/usr/bin/env python3
"""Build privacy-minimized GenAI span attributes and check metric cardinality."""
from __future__ import annotations
import argparse

SAFE_SPAN_ATTRIBUTE_KEYS = {
    "gen_ai.operation.name",
    "gen_ai.provider.name",
    "gen_ai.request.model",
    "gen_ai.response.model",
    "gen_ai.usage.input_tokens",
    "gen_ai.usage.output_tokens",
    "error.type",
}
ALLOWED_METRIC_LABELS = {"provider", "model", "operation", "environment", "status", "region"}


def build_span_attributes(provider: str, request_model: str, response_model: str,
                          input_tokens: int, output_tokens: int, operation: str,
                          error_type: str | None = None) -> dict[str, object]:
    if any(not isinstance(value, str) or not value for value in (provider, request_model, response_model, operation)):
        raise ValueError("provider, model and operation values must be non-empty strings")
    if (type(input_tokens) is not int or type(output_tokens) is not int
            or input_tokens < 0 or output_tokens < 0):
        raise ValueError("token counts must be non-negative integers")
    if error_type is not None and (not isinstance(error_type, str) or not error_type):
        raise ValueError("error_type must be a non-empty string when provided")
    attributes: dict[str, object] = {
        "gen_ai.operation.name": operation,
        "gen_ai.provider.name": provider,
        "gen_ai.request.model": request_model,
        "gen_ai.response.model": response_model,
        "gen_ai.usage.input_tokens": input_tokens,
        "gen_ai.usage.output_tokens": output_tokens,
    }
    if error_type:
        attributes["error.type"] = error_type
    return attributes


def metric_label_keys_allowed(labels: set[str]) -> bool:
    """Check label names only; actual value cardinality needs runtime controls."""
    return labels.issubset(ALLOWED_METRIC_LABELS)


def sanitize_content_attributes(attributes: dict[str, object]) -> dict[str, object]:
    # Allowlist rather than a short denylist: unknown/custom fields may contain secrets or PII.
    return {key: value for key, value in attributes.items() if key in SAFE_SPAN_ATTRIBUTE_KEYS}

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    attrs = build_span_attributes("openai", "model-a", "model-b", 1200, 300, "chat")
    print("span attributes:", attrs)
    print("safe metric labels:", metric_label_keys_allowed({"model", "provider", "operation"}))
    print("content removed:", sanitize_content_attributes({**attrs, "prompt": "PII text"}))
    print("Semantic Convention versions and stability levels must be pinned in production.")

if __name__ == "__main__":
    main()
