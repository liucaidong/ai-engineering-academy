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

autonomy = load_module("01_autonomy_envelope.py", "autonomy")
trace = load_module("02_agent_loop_trace.py", "trace")
durable = load_module("03_durable_execution.py", "durable")
capability = load_module("04_capability_policy.py", "capability")
evaluation = load_module("05_agent_evaluation.py", "evaluation")


class M10ExamplesTest(unittest.TestCase):
    def test_autonomy_policy_and_budgets(self):
        self.assertTrue(autonomy.authorize_action("read", 1))
        self.assertFalse(autonomy.authorize_action("irreversible", 4))
        self.assertTrue(autonomy.authorize_action("irreversible", 4, True))
        self.assertEqual(
            autonomy.budget_exhausted(8, 8, 10, 10, 1.0, 1.0),
            ["turn_budget_exhausted", "tool_call_budget_exhausted", "cost_budget_exhausted"],
        )

    def test_trace_loop_detection_and_stop(self):
        events = [
            {"kind": "action", "signature": "write:invoice-1", "status": "submitted"},
            {"kind": "observation", "signature": "o1", "status": "no_progress"},
            {"kind": "action", "signature": "write:invoice-1", "status": "submitted"},
        ]
        result = trace.analyze_trace(events, 8)
        self.assertEqual(result["repeated_signatures"], ["write:invoice-1"])
        self.assertEqual(result["stop_reason"], "repeated_action_detected")
        verified = [{"kind": "observation", "signature": "o2", "status": "goal_verified"}]
        self.assertEqual(trace.analyze_trace(verified, 8)["stop_reason"], "goal_verified")

    def test_replay_and_idempotent_side_effect(self):
        ledger = {}
        side_effects = []
        self.assertEqual(durable.execute_once("payment-1", "accepted", ledger, side_effects), "accepted")
        self.assertEqual(durable.execute_once("payment-1", "accepted", ledger, side_effects), "accepted")
        self.assertEqual(side_effects, ["payment-1"])
        history = [{"type": "state_update", "key": "status", "value": "approved"}]
        self.assertEqual(durable.replay_event_history(history), {"status": "approved"})

    def test_capability_scope_tenant_expiry_and_traversal(self):
        cap = {"tenant": "t1", "actions": ["read"], "resource_scopes": ["/docs"], "expires_at": 100}
        self.assertTrue(capability.authorize(cap, "read", "/docs/a.pdf", "t1", 99))
        self.assertFalse(capability.authorize(cap, "write", "/docs/a.pdf", "t1", 99))
        self.assertFalse(capability.authorize(cap, "read", "/docs/a.pdf", "t2", 99))
        self.assertFalse(capability.authorize(cap, "read", "/docs/../secrets", "t1", 99))
        self.assertFalse(capability.authorize(cap, "read", "/docs/a.pdf", "t1", 100))

    def test_agent_success_pass_k_and_cost(self):
        self.assertEqual(evaluation.success_rate(9, 12), 0.75)
        runs = [[True, True, True], [True, False, True], [True, True, True], [False, True, True]]
        self.assertEqual(evaluation.pass_k(runs), 0.5)
        self.assertEqual(evaluation.cost_per_success(18.0, 9), 2.0)
        low, high = evaluation.wilson_interval(9, 12)
        self.assertLess(low, 0.75)
        self.assertGreater(high, 0.75)


if __name__ == "__main__":
    unittest.main()
