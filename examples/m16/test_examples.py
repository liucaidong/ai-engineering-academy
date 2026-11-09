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

workflow = load_module("01_workflow_control.py", "workflow_control")
saga = load_module("02_saga_events.py", "saga_events")
resilience = load_module("03_retry_resilience.py", "retry_resilience")
approval = load_module("04_approval_audit.py", "approval_audit")
replay = load_module("05_replay_version.py", "replay_version")


class M16ExamplesTest(unittest.TestCase):
    def test_workflow_guard_and_agent_proposal_schema(self):
        proposal = {"kind": "risk_label", "evidence_refs": ["doc-1"], "confidence": 0.8}
        self.assertEqual(workflow.validate_agent_proposal(proposal), [])
        self.assertIn("unsupported_agent_output_kind", workflow.validate_agent_proposal({**proposal, "kind": "approve_payment"}))
        self.assertIn("invalid_confidence", workflow.validate_agent_proposal({**proposal, "confidence": True}))
        self.assertIn("invalid_confidence", workflow.validate_agent_proposal({**proposal, "confidence": float("nan")}))
        self.assertEqual(workflow.transition("received", "validate"), "validated")
        with self.assertRaisesRegex(ValueError, "not_allowed"):
            workflow.transition("awaiting_review", "pay")

    def test_saga_event_validation_dedup_and_compensation(self):
        event = {"specversion": "1.0", "id": "e1", "source": "urn:order:1", "type": "com.example.payment.captured"}
        self.assertEqual(saga.validate_event(event), [])
        inbox = saga.EventInbox()
        self.assertTrue(inbox.accept(event))
        self.assertFalse(inbox.accept(event))
        self.assertEqual(saga.compensation_plan(["inventory_reserved", "payment_captured"]), ["refund_payment", "release_inventory"])
        outbox = saga.TransactionalOutbox()
        self.assertTrue(outbox.commit("order-1", "paid", event))
        self.assertFalse(outbox.commit("order-1", "paid", event))
        self.assertEqual(outbox.business_state["order-1"], "paid")
        self.assertEqual(len(outbox.pending()), 1)
        self.assertTrue(outbox.mark_published(event["source"], event["id"]))
        self.assertEqual(outbox.pending(), [])
        with self.assertRaises(ValueError):
            inbox.accept({"id": "missing-fields"})

    def test_retry_schedule_error_classification_and_breaker_probe(self):
        first = resilience.retry_delays(0.5, 2, 5, 4, seed=7)
        second = resilience.retry_delays(0.5, 2, 5, 4, seed=7)
        self.assertEqual(first, second)
        self.assertTrue(all(0 <= delay <= window for delay, window in zip(first, [0.5, 1.0, 2.0, 4.0])))
        self.assertTrue(resilience.should_retry("transient"))
        self.assertFalse(resilience.should_retry("business_rule"))
        breaker = resilience.CircuitBreaker(2, 10)
        breaker.failure(1)
        breaker.failure(2)
        self.assertEqual(breaker.state, "open")
        self.assertTrue(breaker.permit(12))
        self.assertEqual(breaker.state, "half_open")
        self.assertFalse(breaker.permit(12))
        breaker.success()
        self.assertTrue(breaker.permit(13))
        self.assertEqual(breaker.state, "closed")

    def test_durable_approval_wait_requires_authenticated_approver_and_one_time_nonce(self):
        action = {"resource": "invoice-9", "resource_version": 3, "amount": 200, "currency": "USD"}
        key = b"test-approval-key-material-32-bytes"
        request = approval.create_approval_request("wf-9", "pay-1", "requester-1", "approver-2", action, "policy-v2", 500, "trace-9", "nonce-9")
        event = approval.sign_approval_event(request, "approval-evt-1", "approver-2", "approved", key)
        nonce_store = approval.NonceStore()
        self.assertTrue(approval.apply_approval_event(request, event, action, "approver-2", 300, key, nonce_store))
        self.assertFalse(approval.apply_approval_event(request, event, action, "approver-2", 300, key, nonce_store))

        request2 = approval.create_approval_request("wf-10", "pay-2", "requester-1", "approver-2", action, "policy-v2", 500, "trace-10", "nonce-10")
        self_approval = approval.sign_approval_event(request2, "evt-self", "requester-1", "approved", key)
        self.assertFalse(approval.apply_approval_event(request2, self_approval, action, "requester-1", 300, key, approval.NonceStore()))
        expired = approval.sign_approval_event(request2, "evt-expired", "approver-2", "approved", key)
        self.assertFalse(approval.apply_approval_event(request2, expired, action, "approver-2", 500, key, approval.NonceStore()))
        changed = {**action, "amount": 999}
        self.assertFalse(approval.apply_approval_event(request2, expired, changed, "approver-2", 300, key, approval.NonceStore()))
        tampered = {**expired, "actor": "attacker"}
        self.assertFalse(approval.apply_approval_event(request2, tampered, action, "attacker", 300, key, approval.NonceStore()))
        changed_request = {**request2, "expires_at": 900}
        self.assertFalse(approval.apply_approval_event(changed_request, expired, action, "approver-2", 300, key, approval.NonceStore()))
        rejected_request = approval.create_approval_request("wf-11", "pay-3", "requester-1", "approver-2", action, "policy-v2", 500, "trace-11", "nonce-11")
        rejected_event = approval.sign_approval_event(rejected_request, "evt-reject", "approver-2", "rejected", key)
        self.assertTrue(approval.apply_approval_event(rejected_request, rejected_event, action, "approver-2", 300, key, approval.NonceStore()))
        self.assertEqual(rejected_request["status"], "rejected")

    def test_replay_compatibility_and_version_routing(self):
        history = replay.workflow_commands("v1")
        self.assertTrue(replay.replay_compatible(history, replay.workflow_commands("v1")))
        self.assertFalse(replay.replay_compatible(history, replay.workflow_commands("v2-unsafe")))
        self.assertTrue(replay.replay_compatible(history, replay.workflow_commands("v2-existing-v1")))
        self.assertFalse(replay.replay_compatible(history + ["activity:notify"], replay.workflow_commands("v1")))


if __name__ == "__main__":
    unittest.main()
