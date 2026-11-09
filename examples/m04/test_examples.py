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

pretraining = load_module("01_pretraining_budget.py", "pretraining")
moe = load_module("02_moe_budget.py", "moe")
lora = load_module("03_lora_qlora_budget.py", "lora")
preference = load_module("04_preference_objectives.py", "preference")
evaluation = load_module("05_evaluation_metrics.py", "evaluation")


class M04ExamplesTest(unittest.TestCase):
    def test_pretraining_compute(self):
        self.assertEqual(pretraining.estimate_training_flops(7e9, 1.2e12), 5.04e22)

    def test_moe_total_and_active_are_distinct(self):
        total, active = moe.moe_parameter_budget(1_200_000_000, 8, 90_000_000, 2)
        self.assertEqual(total, 1_920_000_000)
        self.assertEqual(active, 1_380_000_000)
        self.assertLess(active, total)

    def test_lora_parameter_count(self):
        self.assertEqual(lora.lora_parameters(4096, 4096, 16), 131_072)

    def test_preference_objectives(self):
        self.assertAlmostEqual(preference.bradley_terry_probability(1.2, 0.2), 0.7310585786)
        self.assertAlmostEqual(preference.ppo_clipped_surrogate(1.35, 0.8), 0.96)
        self.assertGreater(preference.dpo_loss(0.7, 0.1, 0.1), 0)

    def test_evaluation_metrics(self):
        result = evaluation.classification_metrics([0.9, 0.2], [1, 0], bins=5)
        self.assertEqual(result["accuracy"], 1.0)
        self.assertGreaterEqual(result["brier"], 0.0)
        self.assertGreaterEqual(result["ece"], 0.0)


if __name__ == "__main__":
    unittest.main()
