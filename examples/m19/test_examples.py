import importlib.util
from decimal import Decimal
import unittest
from pathlib import Path

ROOT=Path(__file__).parent

def load(filename,name):
    spec=importlib.util.spec_from_file_location(name,ROOT/filename)
    module=importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

discovery=load("01_discovery.py","discovery")
control=load("02_human_control.py","human_control")
economics=load("03_unit_economics.py","unit_economics")
experiment=load("04_experiment_quality.py","experiment_quality")
release=load("05_release_manifest.py","release_manifest")

class M19ExamplesTest(unittest.TestCase):
    def test_discovery_assumption_priority(self):
        self.assertAlmostEqual(discovery.assumption_priority(0.9,0.8,0.2),3.6)
        self.assertEqual(discovery.decide_evidence(0.7),"test_now")
        self.assertEqual(discovery.decide_evidence(0.2),"defer_or_monitor")
        with self.assertRaises(ValueError):
            discovery.assumption_priority(1.2,0.5,1)
        with self.assertRaises(ValueError):
            discovery.decide_evidence(float("nan"))

    def test_risk_tiered_human_control_and_bound_approval(self):
        self.assertEqual(control.control_tier("low",True,"strong"),"auto_with_audit")
        self.assertEqual(control.control_tier("high",False,"strong"),"block_or_dual_control")
        self.assertEqual(control.control_tier("high",True,"strong"),"human_approval")
        action={"actor":"u1","resource":"invoice-1","operation":"approve","arguments_digest":"sha256:x","policy_version":"p3"}
        action = {**action, "idempotency_key":"idem-1", "expires_at":500}
        self.assertTrue(control.approval_is_bound(action, action, 300))
        self.assertFalse(control.approval_is_bound({**action,"arguments_digest":"sha256:old"},action,300))
        self.assertFalse(control.approval_is_bound(action,action,500))
        with self.assertRaises(ValueError):
            control.control_tier("low",1,"strong")

    def test_unit_economics_and_successful_task_denominator(self):
        self.assertEqual(economics.model_cost(12000,2000,"2","8"),Decimal("0.040"))
        self.assertEqual(economics.task_cost("0.04","0.02","0.01","30","24","0.01"),Decimal("0.28"))
        self.assertEqual(economics.cost_per_successful_task("28",100,80),Decimal("0.35"))
        self.assertEqual(economics.contribution_margin("0.5","0.25"),Decimal("0.5"))
        self.assertEqual(economics.break_even_volume("10000","0.5","0.25"),40000)
        with self.assertRaises(ValueError):
            economics.model_cost(100,100,2.0,"8")
        with self.assertRaises(ValueError):
            economics.task_cost("NaN",0,0,0,0)
        with self.assertRaises(ValueError):
            economics.cost_per_successful_task(10,10,0)

    def test_experiment_srm_and_conversion_diagnostics(self):
        self.assertAlmostEqual(experiment.sample_ratio_mismatch(500,500),0)
        self.assertGreater(experiment.sample_ratio_mismatch(600,400),10)
        self.assertLess(experiment.srm_p_value(experiment.sample_ratio_mismatch(600,400)),1e-8)
        self.assertAlmostEqual(experiment.conversion_rate(20,100),0.2)
        self.assertGreater(experiment.pooled_standard_error(20,100,30,100),0)
        z_score, p_value = experiment.two_proportion_z_test(210,1000,235,1000)
        self.assertGreater(z_score,0)
        self.assertGreater(p_value,0.05)
        with self.assertRaises(ValueError):
            experiment.conversion_rate(101,100)

    def test_release_manifest_completeness_and_rollback(self):
        manifest={key:f"{key}-v1" for key in release.REQUIRED}
        manifest["environment"]="prod"
        self.assertEqual(release.validate_manifest(manifest),[])
        self.assertTrue(release.rollback_compatible(manifest,{**manifest,"model_version":"model-v0"}))
        self.assertFalse(release.rollback_compatible(manifest,{"environment":"prod"}))
        self.assertIn("missing_or_invalid_policy_version",release.validate_manifest({"code_commit":"abc"}))
        self.assertIn("manifest_must_be_object",release.validate_manifest(None))

if __name__=="__main__":
    unittest.main()
