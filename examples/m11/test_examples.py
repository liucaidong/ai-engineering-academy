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

planning = load_module("01_plan_dag.py", "planning")
records = load_module("02_memory_records.py", "records")
retrieval = load_module("03_memory_retrieval.py", "retrieval")
approval = load_module("04_approval_binding.py", "approval")
metrics = load_module("05_planning_memory_eval.py", "metrics")


class M11ExamplesTest(unittest.TestCase):
    def test_plan_dag_and_preconditions(self):
        order = planning.topological_order(["a", "b", "c"], [("a", "b"), ("b", "c")])
        self.assertEqual(order, ["a", "b", "c"])
        with self.assertRaisesRegex(ValueError, "cycle"):
            planning.topological_order(["a", "b"], [("a", "b"), ("b", "a")])
        actions = [
            {"id": "collect", "preconditions": ["vendor_known"], "effects": ["docs_ready"]},
            {"id": "screen", "preconditions": ["docs_ready"], "effects": ["screened"]},
        ]
        self.assertTrue(planning.validate_plan(actions, {"vendor_known"})["valid"])
        blocked = planning.validate_plan(actions, set())
        self.assertEqual(blocked["blocked_action"], "collect")

    def test_memory_record_provenance_scope_and_time(self):
        record = {"memory_id": "m1", "type": "episodic", "content": "meeting happened", "source_event_ids": ["e1"], "scope": "user-a", "recorded_at": 10, "valid_from": 10, "valid_until": 100, "confidence": 0.9, "version": 1}
        self.assertEqual(records.validate_record(record), [])
        self.assertTrue(records.is_current(record, 50, "user-a"))
        self.assertFalse(records.is_current(record, 50, "user-b"))
        self.assertFalse(records.is_current(record, 100, "user-a"))
        self.assertFalse(records.is_current({**record, "deleted": True}, 50, "user-a"))

    def test_memory_ranking_and_recency(self):
        recent = retrieval.memory_score(0.8, 1, 0.8, 0.9)
        old = retrieval.memory_score(0.8, 120, 0.8, 0.9)
        self.assertGreater(recent, old)
        ranked = retrieval.rank_memories([
            {"id": "old", "relevance": 0.8, "age_days": 120, "salience": 0.8, "confidence": 0.9},
            {"id": "new", "relevance": 0.8, "age_days": 1, "salience": 0.8, "confidence": 0.9},
        ])
        self.assertEqual(ranked[0][0], "new")

    def test_approval_digest_and_memory_write_policy(self):
        action = {"type": "approve", "amount": 100, "resource": "purchase-1"}
        approval_record = {"action_digest": approval.action_digest(action), "state_version": 3, "expires_at": 100, "decision": "approved"}
        self.assertTrue(approval.approval_valid(approval_record, action, 3, 50))
        self.assertFalse(approval.approval_valid(approval_record, {**action, "amount": 200}, 3, 50))
        self.assertFalse(approval.approval_valid(approval_record, action, 4, 50))
        self.assertFalse(approval.approval_valid(approval_record, action, 3, 100))
        self.assertTrue(approval.memory_write_allowed(True, True, "restricted"))
        self.assertFalse(approval.memory_write_allowed(False, True, "restricted"))
        self.assertFalse(approval.memory_write_allowed(True, False, "low"))

    def test_planning_memory_metrics(self):
        self.assertEqual(metrics.planning_success_rate(42, 50), 0.84)
        self.assertEqual(metrics.memory_recall(36, 45), 0.8)
        self.assertEqual(metrics.memory_precision(36, 40), 0.9)
        self.assertEqual(metrics.deletion_compliance(19, 20), 0.95)


if __name__ == "__main__":
    unittest.main()
