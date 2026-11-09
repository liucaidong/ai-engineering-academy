import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).parent

def load(filename,name):
    spec=importlib.util.spec_from_file_location(name,ROOT/filename)
    module=importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

requirements=load("01_requirements.py","requirements")
architecture=load("02_architecture_review.py","architecture_review")
vertical=load("03_vertical_slice.py","vertical_slice")
matrix=load("04_evidence_matrix.py","evidence_matrix")
defense=load("05_defense_readiness.py","defense_readiness")

class M20ExamplesTest(unittest.TestCase):
    def test_requirement_traceability_and_duplicate_ids(self):
        items=[{"id":"R1","statement":"do x","priority":"must","owner":"a","acceptance":"x=true","verification":"T1","evidence_status":"tested"}]
        self.assertEqual(requirements.validate_requirements(items),[])
        self.assertEqual(requirements.traceability_coverage(items),1)
        self.assertIn("duplicate_id_R1",requirements.validate_requirements(items+items))
        self.assertEqual(requirements.traceability_coverage([{"id":"R2"}]),0)
        self.assertIn("item_0_invalid_priority", requirements.validate_requirements([{**items[0], "priority":"urgent"}]))
        self.assertIn("item_0_invalid_priority", requirements.validate_requirements([{**items[0], "priority":[]}]))
        self.assertIn("item_0_invalid_evidence_status", requirements.validate_requirements([{**items[0], "evidence_status":"success"}]))
        self.assertIn("item_0_must_be_object", requirements.validate_requirements([None]))
        with self.assertRaises(ValueError):
            requirements.traceability_coverage([])

    def test_adr_completeness_and_lifecycle(self):
        adr={"id":"ADR-1","status":"accepted","context":"x","options":["a","b"],"decision":"a","consequences":"c","validation_plan":"t","owner":"o"}
        self.assertEqual(architecture.validate_adr(adr),[])
        self.assertTrue(architecture.adr_state_valid("deprecated"))
        self.assertFalse(architecture.adr_state_valid("approved"))
        self.assertIn("options_must_contain_at_least_two_nonempty_strings", architecture.validate_adr({**adr, "options":["only-one"]}))
        self.assertEqual(architecture.validate_adr(None), ["adr_must_be_object"])
        self.assertIn("invalid_status", architecture.validate_adr({**adr, "status":[]}))

    def test_vertical_slice_paths_and_evidence_levels(self):
        events=[{"path":"success","trace_id":"t1","evidence_ref":"e1"},{"path":"failure","trace_id":"t2","evidence_ref":"e2"},{"path":"security_denial","trace_id":"t3","evidence_ref":"e3"}]
        self.assertEqual(vertical.validate_slice(events),[])
        self.assertIn("missing_path_failure",vertical.validate_slice(events[:1]))
        self.assertEqual(vertical.evidence_grade("mock"),"simulated")
        self.assertEqual(vertical.evidence_grade("target"),"tested-in-target-environment")
        self.assertIn("duplicate_path_success", vertical.validate_slice(events+[events[0]]))
        self.assertIn("event_0_invalid_path", vertical.validate_slice([{**events[0], "path":[]}]))
        self.assertIn("event_0_missing_trace_id", vertical.validate_slice([{**events[0], "trace_id":""}, *events[1:]]))

    def test_evidence_matrix_gate_and_hard_grade(self):
        row={"risk_id":"R1","control":"authz","test_id":"T1","evidence_grade":"tested-in-local","decision":"pass","decision_owner":"security","hard_constraint":True}
        self.assertEqual(matrix.validate_matrix([row]),[])
        self.assertTrue(matrix.gate_passes([row],"tested-in-local"))
        self.assertFalse(matrix.gate_passes([row],"tested-in-target-environment"))
        self.assertFalse(matrix.gate_passes([{**row,"decision":"accepted_residual_risk"}],"tested-in-local"))
        self.assertTrue(matrix.gate_passes([{**row,"hard_constraint":False,"decision":"accepted_residual_risk"}],"tested-in-local"))
        self.assertIn("row_0_invalid_decision", matrix.validate_matrix([{**row, "decision":[]}]))
        with self.assertRaises(ValueError):
            matrix.gate_passes([], "simulated")
        with self.assertRaises(ValueError):
            matrix.gate_passes([row], [])

    def test_defense_readiness_and_explicit_limitations(self):
        manifest={key:f"{key}-v1" for key in defense.REQUIRED}
        manifest["evidence_grade"]="tested-in-local"
        result=defense.readiness(manifest)
        self.assertTrue(result["ready"])
        self.assertEqual(result["unverified"],"limitations-v1")
        self.assertFalse(defense.readiness({"commit":"abc"})["ready"])
        self.assertFalse(defense.readiness(None)["ready"])
        self.assertIn("valid_evidence_grade", defense.readiness({**manifest,"evidence_grade":"production-ready"})["missing"])
        self.assertIn("valid_evidence_grade", defense.readiness({**manifest,"evidence_grade":[]})["missing"])

if __name__=="__main__":
    unittest.main()
