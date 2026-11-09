import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).parent

def load_module(filename: str, name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

trace = load_module("01_tool_call_trace.py", "trace")
schema = load_module("02_strict_schema_compat.py", "schema")
discovery = load_module("03_tool_discovery.py", "discovery")
ledger = load_module("04_idempotency_ledger.py", "ledger")
metrics = load_module("05_tool_eval_metrics.py", "metrics")


class M07ExamplesTest(unittest.TestCase):
    def test_tool_call_state_machine(self):
        state = "proposed"
        for target in ("validated", "authorized", "running", "unknown", "succeeded"):
            state = trace.transition(state, target)
        self.assertEqual(state, "succeeded")
        with self.assertRaises(ValueError):
            trace.transition("succeeded", "running")

    def test_strict_schema_constraints(self):
        valid = {
            "type": "object",
            "properties": {"id": {"type": "string"}, "reason": {"type": ["string", "null"]}},
            "required": ["id", "reason"],
            "additionalProperties": False,
        }
        invalid = {"type": "object", "properties": {"id": {"type": "string"}}, "required": [], "additionalProperties": True}
        self.assertEqual(schema.strict_schema_issues(valid), [])
        self.assertEqual(len(schema.strict_schema_issues(invalid)), 2)

    def test_deferred_tool_discovery(self):
        result = discovery.discover("refund order", discovery.TOOLS)
        self.assertIn("payments.refund", result)
        self.assertIn("orders.read", result)

    def test_idempotency_key_replay_and_conflict(self):
        store = ledger.IdempotencyLedger()
        first = store.begin("k1", "alice", {"order": "o1", "amount": 100})
        replay = store.begin("k1", "alice", {"amount": 100, "order": "o1"})
        conflict = store.begin("k1", "alice", {"order": "o1", "amount": 200})
        self.assertEqual(first, ("created", "running"))
        self.assertEqual(replay, ("existing", "running"))
        self.assertEqual(conflict[0], "conflict")
        store.complete("k1", "refund-123")
        self.assertEqual(store.begin("k1", "alice", {"order": "o1", "amount": 100}), ("existing", "succeeded:refund-123"))

    def test_layered_tool_metrics(self):
        cases = [
            {"expected_tool": "a", "actual_tool": "a", "arguments_valid": True, "authorized": True, "executed": True, "execution_success": True, "business_success": True, "duplicate_side_effect": False},
            {"expected_tool": "b", "actual_tool": "a", "arguments_valid": False, "authorized": False, "executed": True, "execution_success": False, "business_success": False, "duplicate_side_effect": True},
        ]
        result = metrics.evaluate(cases)
        self.assertEqual(result["tool_selection_accuracy"], 0.5)
        self.assertEqual(result["authorization_violation_rate"], 0.5)
        self.assertEqual(result["duplicate_side_effect_rate"], 0.5)


if __name__ == "__main__":
    unittest.main()
