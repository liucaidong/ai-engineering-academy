import importlib.util
import unittest
from threading import Thread
from pathlib import Path

ROOT = Path(__file__).parent

def load_module(filename: str, name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

topology = load_module("01_topology_cost.py", "topology")
a2a = load_module("02_a2a_contract.py", "a2a")
state = load_module("03_shared_state.py", "shared_state")
ledger = load_module("04_evidence_ledger.py", "evidence_ledger")
evaluation = load_module("05_multiagent_evaluation.py", "multiagent_evaluation")


class M14ExamplesTest(unittest.TestCase):
    def test_topology_cost_and_latency_models(self):
        calls = [{"input_tokens": 1000, "output_tokens": 500, "input_price_per_million": 1.0, "output_price_per_million": 2.0}]
        self.assertAlmostEqual(topology.total_cost(calls, 0.01, 0.02), 0.032)
        self.assertEqual(topology.parallel_latency([2, 5, 3], barrier=1, synthesis=2), 8)
        self.assertEqual(topology.serial_latency([2, 5, 3], coordination=1), 12)
        self.assertAlmostEqual(topology.cost_per_success(10, 0.5), 20)
        with self.assertRaises(ValueError):
            topology.parallel_latency([])

    def test_a2a_agent_card_task_message_artifact_shapes(self):
        card = {
            "name": "Agent", "description": "Research",
            "supportedInterfaces": [{"url": "https://agent.example/a2a", "protocolBinding": "HTTP+JSON", "protocolVersion": "1.0"}],
            "version": "1.0", "capabilities": {}, "defaultInputModes": ["text/plain"],
            "defaultOutputModes": ["text/plain"], "skills": [],
        }
        self.assertEqual(a2a.validate_agent_card(card), [])
        self.assertIn("missing_supportedInterfaces", a2a.validate_agent_card({k: v for k, v in card.items() if k != "supportedInterfaces"}))
        bad_binding = {**card, "supportedInterfaces": [{**card["supportedInterfaces"][0], "protocolBinding": "XMLRPC"}]}
        self.assertIn("interface_0_unsupported_core_binding", a2a.validate_agent_card(bad_binding))
        self.assertEqual(a2a.validate_task({"id": "t-1", "status": {"state": "TASK_STATE_WORKING"}}), [])
        self.assertEqual(a2a.validate_task({"id": "t-2", "status": {"state": "TASK_STATE_AUTH_REQUIRED"}}), [])
        self.assertIn("invalid_task_status_state", a2a.validate_task({"id": "t-3", "status": "working"}))
        self.assertEqual(a2a.validate_message({"messageId": "m-1", "role": "ROLE_AGENT", "parts": [{"text": "done"}]}), [])
        self.assertIn("invalid_message_role", a2a.validate_message({"messageId": "m-2", "role": "agent", "parts": [{"text": "done"}]}))
        self.assertIn("part_must_have_exactly_one_content_field", a2a.validate_message({"messageId": "m-3", "role": "ROLE_USER", "parts": [{"text": "a", "data": {"b": 1}}]}))
        self.assertEqual(a2a.validate_artifact({"artifactId": "a-1", "parts": [{"text": "report"}]}), [])

    def test_shared_state_compare_and_swap_and_idempotent_event(self):
        shared = state.SharedState({"summary": "v1"})
        self.assertEqual(shared.compare_and_swap(1, {"summary": "v2"}), 2)
        with self.assertRaisesRegex(RuntimeError, "stale_version"):
            shared.compare_and_swap(1, {"summary": "stale"})
        concurrent = state.SharedState({"summary": "start"})
        outcomes: list[str] = []
        def writer(value: str) -> None:
            try:
                concurrent.compare_and_swap(1, {"summary": value})
                outcomes.append("committed")
            except RuntimeError:
                outcomes.append("stale")
        workers = [Thread(target=writer, args=(f"v{i}",)) for i in range(2)]
        for worker in workers: worker.start()
        for worker in workers: worker.join()
        self.assertCountEqual(outcomes, ["committed", "stale"])
        self.assertEqual(concurrent.version, 2)
        self.assertTrue(shared.append_event("evt-1", {"source_ref": "paper"}))
        self.assertFalse(shared.append_event("evt-1", {"source_ref": "paper"}))
        self.assertEqual(len(shared.events), 1)

    def test_evidence_ledger_and_agent_diversity(self):
        evidence = [
            {"source_id": "paper-A-copy-1", "lineage_id": "paper-A", "stance": "supports"},
            {"source_id": "paper-A-copy-2", "lineage_id": "paper-A", "stance": "supports"},
            {"source_id": "paper-B", "lineage_id": "paper-B", "stance": "supports"},
        ]
        self.assertEqual(ledger.independent_source_count(evidence), 2)
        self.assertEqual(ledger.claim_status(evidence, True), "verified")
        contradictory = evidence + [{"source_id": "paper-C", "lineage_id": "paper-C", "stance": "contradicts"}]
        self.assertEqual(ledger.claim_status(contradictory, True), "needs_review")
        agents = [
            {"model": "m1", "prompt_id": "p1", "toolset": "s1", "source_pool": "d1"},
            {"model": "m1", "prompt_id": "p1", "toolset": "s1", "source_pool": "d1"},
            {"model": "m2", "prompt_id": "p2", "toolset": "s2", "source_pool": "d2"},
        ]
        self.assertEqual(ledger.agent_diversity(agents)["models"], 2)

    def test_evaluation_confidence_percentile_and_cost_per_success(self):
        low, high = evaluation.wilson_interval(8, 10)
        self.assertLess(low, 0.8)
        self.assertGreater(high, 0.8)
        self.assertEqual(evaluation.percentile([1, 3, 2, 4], 0.95), 4)
        self.assertAlmostEqual(evaluation.cost_per_success([1, 2, 3], [True, False, True]), 3)
        self.assertEqual(evaluation.cost_per_success([1, 2], [False, False]), float("inf"))
        with self.assertRaises(ValueError):
            evaluation.wilson_interval(3, 2)


if __name__ == "__main__":
    unittest.main()
