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

threat = load_module("01_threat_model.py", "threat_model")
taint = load_module("02_taint_flow.py", "taint_flow")
authorization = load_module("03_authorization.py", "authorization")
oversight = load_module("04_human_oversight.py", "human_oversight")
redteam = load_module("05_redteam_incident.py", "redteam_incident")


class M15ExamplesTest(unittest.TestCase):
    def test_threat_score_and_stride_mapping(self):
        self.assertEqual(threat.risk_score(4, 5), (20, "critical"))
        self.assertEqual(threat.map_technique("prompt_injection"), {"tampering", "elevation_of_privilege"})
        self.assertIn("information_disclosure", threat.map_technique("tool_invocation_abuse"))
        with self.assertRaises(ValueError):
            threat.risk_score(6, 1)
        with self.assertRaises(ValueError):
            threat.map_technique("unknown")

    def test_taint_provenance_and_external_egress(self):
        self.assertFalse(taint.is_trusted_instruction_source("web"))
        self.assertFalse(taint.is_trusted_instruction_source("unknown-origin"))
        self.assertFalse(taint.can_execute_instruction("web", True))
        self.assertTrue(taint.can_execute_instruction("user", True))
        self.assertFalse(taint.can_execute_instruction("unknown-origin", True))
        self.assertFalse(taint.can_execute_instruction("user", False))
        self.assertFalse(taint.can_send_data({"confidential"}, "external", {"confidential"}))
        self.assertFalse(taint.can_send_data({"unknown-label"}, "internal", {"unknown-label"}))
        self.assertFalse(taint.can_send_data({"public"}, "unknown-destination", {"public"}))
        self.assertFalse(taint.can_send_data(set(), "internal", {"public"}))
        self.assertTrue(taint.can_send_data({"public"}, "external", {"public"}))
        self.assertFalse(taint.can_send_data({"secret"}, "internal", {"public", "confidential"}))

    def test_pdp_abac_and_tenant_isolation(self):
        subject = {"subject_id": "u1", "tenant_id": "t1", "role": "finance"}
        resource = {"resource_id": "invoice-1", "owner_id": "u1", "tenant_id": "t1"}
        policy = {"role_permissions": {"finance": {"payment:write"}}, "payment_limit": 500}
        self.assertEqual(authorization.policy_decision(subject, resource, "payment:write", {"amount": 100, "mfa_verified": True}, policy), (True, "allow"))
        other_tenant = {**resource, "tenant_id": "t2"}
        self.assertEqual(authorization.policy_decision(subject, other_tenant, "payment:write", {"amount": 100, "mfa_verified": True}, policy)[1], "tenant_mismatch")
        self.assertEqual(authorization.policy_decision(subject, resource, "payment:write", {"amount": "900", "mfa_verified": True}, policy)[1], "amount_exceeds_limit")
        self.assertEqual(authorization.policy_decision(subject, resource, "payment:write", {"amount": "NaN", "mfa_verified": True}, policy)[1], "invalid_payment_amount_or_limit")
        self.assertEqual(authorization.policy_decision(subject, {**resource, "owner_id": "u2"}, "payment:write", {"amount": "100", "mfa_verified": True}, policy)[1], "resource_owner_denied")
        shared_acl = {**resource, "owner_id": "u2", "authorized_subjects": ["u1"]}
        self.assertEqual(authorization.policy_decision(subject, shared_acl, "payment:write", {"amount": "100", "mfa_verified": True}, policy), (True, "allow"))
        self.assertEqual(authorization.policy_decision(subject, resource, "payment:write", {"amount": 100, "mfa_verified": False}, policy)[1], "mfa_required")

    def test_action_bound_hmac_approval_and_expiry(self):
        key = b"test-key-material-at-least-32-bytes"
        action = {"resource": "invoice-1", "resource_version": 4, "operation": "pay", "amount": "100.00"}
        approval = authorization.sign_approval(action, "u1", "manager-1", 200, "nonce-1", key)
        nonce_store = authorization.NonceStore()
        self.assertTrue(authorization.verify_approval(approval, action, "u1", "manager-1", 100, key, nonce_store))
        self.assertFalse(authorization.verify_approval(approval, action, "u1", "manager-1", 100, key, nonce_store))
        changed = {**action, "amount": "1000.00"}
        self.assertFalse(authorization.verify_approval(approval, changed, "u1", "manager-1", 100, key, authorization.NonceStore()))
        self.assertFalse(authorization.verify_approval(approval, action, "u1", "other-manager", 100, key, authorization.NonceStore()))
        self.assertFalse(authorization.verify_approval(approval, action, "u1", "manager-1", 201, key, authorization.NonceStore()))
        tampered = {**approval, "principal": "u2"}
        self.assertFalse(authorization.verify_approval(tampered, action, "u1", "manager-1", 100, key, authorization.NonceStore()))

    def test_risk_tier_and_meaningful_review_context(self):
        self.assertEqual(oversight.oversight_tier(5, False, 4, True), ("dual_approval", 2))
        self.assertEqual(oversight.oversight_tier(1, True, 1, False), ("automated_with_monitoring", 0))
        context = {"actor": "u1", "target": "invoice", "normalized_args": {"amount": 100}, "consequence": "payment", "source_evidence": ["ticket-1"], "policy_reason": "approved"}
        self.assertTrue(oversight.review_context_complete(context))
        self.assertFalse(oversight.review_context_complete({"actor": "u1"}))
        with self.assertRaises(ValueError):
            oversight.oversight_tier(3, "yes", 2, False)

    def test_redteam_rates_and_incident_sequence(self):
        self.assertAlmostEqual(redteam.rate(2, 40), 0.05)
        self.assertEqual(redteam.mean_time_to_contain([1, 5], [4, 10]), 4)
        self.assertTrue(redteam.incident_sequence_valid(["detected", "triaged", "contained", "evidence_preserved", "credentials_revoked", "scoped", "recovered", "notified", "reviewed"]))
        self.assertTrue(redteam.incident_sequence_valid(["detected", "triaged", "contained", "scoped", "recovered", "reviewed"]))
        self.assertFalse(redteam.incident_sequence_valid(["detected", "reviewed"]))
        self.assertFalse(redteam.incident_sequence_valid(["detected", "contained", "triaged"]))
        with self.assertRaises(ValueError):
            redteam.mean_time_to_contain([5], [4])


if __name__ == "__main__":
    unittest.main()
