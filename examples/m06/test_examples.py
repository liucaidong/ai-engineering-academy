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

contract = load_module("01_prompt_contract.py", "contract")
fewshot = load_module("02_fewshot_selection.py", "fewshot")
structured = load_module("03_structured_validation.py", "structured")
injection = load_module("04_injection_matrix.py", "injection")
evaluation = load_module("05_prompt_eval_metrics.py", "evaluation")


class M06ExamplesTest(unittest.TestCase):
    def test_prompt_contract_required_fields(self):
        self.assertEqual(contract.missing_contract_fields({"prompt_id": "p"}), sorted(contract.REQUIRED_FIELDS - {"prompt_id"}))
        self.assertEqual(contract.missing_contract_fields({}), sorted(contract.REQUIRED_FIELDS))

    def test_fewshot_coverage_and_budget(self):
        examples = [
            {"id": "billing", "tokens": 180, "similarity": 0.91, "tags": {"billing", "normal"}},
            {"id": "refund", "tokens": 210, "similarity": 0.83, "tags": {"refund", "edge"}},
            {"id": "security", "tokens": 150, "similarity": 0.72, "tags": {"security", "refusal"}},
            {"id": "duplicate", "tokens": 190, "similarity": 0.95, "tags": {"billing", "normal"}},
        ]
        selected = fewshot.select_examples(examples, 550, {"billing", "refund", "security", "edge", "refusal"})
        self.assertEqual(sum(item["tokens"] for item in selected), 550)
        self.assertEqual(len(selected), 3)

    def test_structured_output_validation_layers(self):
        balances = {"order-100": 80.0}
        owners = {"alice": {"order-100"}, "bob": set()}
        valid = '{"request_id":"r","order_id":"order-100","amount":50,"currency":"USD","reason":"damaged"}'
        self.assertEqual(structured.validate_refund("{bad", balances, owners), ("parse", "invalid_json"))
        self.assertEqual(structured.validate_refund('{"order_id":"order-100"}', balances, owners)[0], "schema")
        self.assertEqual(structured.validate_refund(valid.replace('"amount":50', '"amount":90'), balances, owners)[0], "business")
        stage = structured.validate_refund(valid, balances, owners)
        self.assertEqual(structured.authorize_refund(stage, "bob", "order-100", owners), ("authorization", "forbidden"))
        self.assertEqual(structured.authorize_refund(stage, "alice", "order-100", owners)[0], "accepted")

    def test_injection_matrix_coverage(self):
        cases = [{"attack_class": item} for item in injection.REQUIRED_ATTACK_CLASSES]
        self.assertEqual(injection.missing_attack_classes(cases), set())
        self.assertIn("indirect_web", injection.missing_attack_classes([{"attack_class": "direct_user"}]))

    def test_wilson_interval_and_position_bias(self):
        low, high = evaluation.wilson_interval(50, 100)
        self.assertAlmostEqual(low, 0.4038, places=3)
        self.assertAlmostEqual(high, 0.5962, places=3)
        self.assertAlmostEqual(evaluation.position_bias_gap([4, 5, 4, 4], [3, 4, 4, 3]), 0.75)


if __name__ == "__main__":
    unittest.main()
