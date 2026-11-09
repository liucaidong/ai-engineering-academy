import importlib.util
import unittest
import math
from pathlib import Path

ROOT = Path(__file__).parent

def load_module(filename: str, name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

harness = load_module("01_eval_harness.py", "eval_harness")
stats = load_module("02_statistical_eval.py", "statistical_eval")
judge = load_module("03_judge_calibration.py", "judge_calibration")
telemetry = load_module("04_genai_telemetry.py", "genai_telemetry")
slo = load_module("05_quality_slo.py", "quality_slo")


class M17ExamplesTest(unittest.TestCase):
    def test_eval_task_contract_and_outcome_grading(self):
        task = {"task_id": "t1", "input": {"q": "x"}, "expected_outcome": {"status": "done"}, "graders": ["state"], "dataset_version": "v1"}
        self.assertEqual(harness.validate_task(task), [])
        self.assertIn("missing_dataset_version", harness.validate_task({k: v for k, v in task.items() if k != "dataset_version"}))
        self.assertTrue(harness.grade_outcome({"status": "done"}, {"status": "done", "extra": 1}))
        self.assertFalse(harness.grade_outcome({"status": "done"}, {"status": "failed"}))
        self.assertEqual(harness.classify_suite(0.5, "regression"), "regression")
        self.assertIn("graders_must_be_nonempty_string_list", harness.validate_task({**task, "graders": [""]}))
        with self.assertRaises(ValueError):
            harness.classify_suite(float("nan"), "capability")

    def test_wilson_paired_bootstrap_and_pass_k_metrics(self):
        low, high = stats.wilson_interval(80, 100)
        self.assertLess(low, 0.8)
        self.assertGreater(high, 0.8)
        first = stats.paired_bootstrap_interval([0.0, 0.1, -0.1, 0.2, 0.0], iterations=500, seed=3)
        second = stats.paired_bootstrap_interval([0.0, 0.1, -0.1, 0.2, 0.0], iterations=500, seed=3)
        self.assertEqual(first, second)
        self.assertAlmostEqual(stats.pass_at_k(0.5, 3), 0.875)
        self.assertAlmostEqual(stats.pass_power_k(0.5, 3), 0.125)
        self.assertAlmostEqual(stats.human_eval_pass_at_k(10, 3, 5), 1 - (math.comb(7, 5) / math.comb(10, 5)))
        self.assertEqual(stats.human_eval_pass_at_k(10, 3, 8), 1.0)
        with self.assertRaises(ValueError):
            stats.wilson_interval(4, 3)

    def test_judge_confusion_kappa_and_position_bias(self):
        human = [True, True, False, False]
        prediction = [True, False, True, False]
        matrix = judge.confusion_matrix(human, prediction)
        self.assertEqual(matrix, {"tp": 1, "fp": 1, "tn": 1, "fn": 1})
        self.assertAlmostEqual(judge.cohen_kappa(human, prediction), 0)
        self.assertAlmostEqual(judge.first_position_win_rate(["first", "second", "first", "tie"]), 2 / 3)
        self.assertAlmostEqual(judge.paired_order_position_rate(["first", "second"], ["first", "second"]), 0.5)
        with self.assertRaises(ValueError):
            judge.first_position_win_rate(["tie"])
        with self.assertRaises(ValueError):
            judge.first_position_win_rate(["unknown"])

    def test_genai_span_attributes_privacy_and_metric_cardinality(self):
        attrs = telemetry.build_span_attributes("provider-x", "model-a", "model-b", 100, 50, "chat")
        self.assertEqual(attrs["gen_ai.usage.input_tokens"], 100)
        self.assertTrue(telemetry.metric_label_keys_allowed({"provider", "model", "operation"}))
        self.assertFalse(telemetry.metric_label_keys_allowed({"provider", "user_id"}))
        sanitized = telemetry.sanitize_content_attributes({**attrs, "prompt": "private", "gen_ai.input.messages": "PII", "customer_email": "secret", "db.statement": "sensitive"})
        self.assertNotIn("prompt", sanitized)
        self.assertNotIn("gen_ai.input.messages", sanitized)
        self.assertNotIn("customer_email", sanitized)
        self.assertNotIn("db.statement", sanitized)
        self.assertFalse(telemetry.metric_label_keys_allowed({"provider", "tenant_id"}))
        with self.assertRaises(ValueError):
            telemetry.build_span_attributes("p", "m", "m", -1, 0, "chat")
        with self.assertRaises(ValueError):
            telemetry.build_span_attributes("p", "m", "m", True, 0, "chat")

    def test_quality_sli_error_budget_and_burn_rate(self):
        self.assertAlmostEqual(slo.sli(985, 1000), 0.985)
        self.assertEqual(slo.error_budget_remaining(0.99, 0.985), 0)
        self.assertAlmostEqual(slo.burn_rate(0.015, 0.01), 1.5)
        self.assertTrue(slo.multi_window_alert(1.5, 2.0, 1.5))
        self.assertFalse(slo.multi_window_alert(1.5, 1.0, 1.5))
        with self.assertRaises(ValueError):
            slo.sli(10, 0)
        with self.assertRaises(ValueError):
            slo.sli(True, 1)
        with self.assertRaises(ValueError):
            slo.burn_rate(float("nan"), 0.01)


if __name__ == "__main__":
    unittest.main()
