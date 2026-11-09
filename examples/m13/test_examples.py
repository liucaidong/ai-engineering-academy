import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).parent

def load_module(filename: str, name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

metadata = load_module("01_skill_metadata.py", "skill_metadata")
disclosure = load_module("02_progressive_disclosure.py", "disclosure")
dag = load_module("03_skill_dag.py", "skill_dag")
supply = load_module("04_supply_chain.py", "supply_chain")
evaluation = load_module("05_skill_evaluation.py", "skill_evaluation")
sample_validator_path = ROOT / "repository-security-review" / "scripts" / "validate_report.py"
sample_spec = importlib.util.spec_from_file_location("sample_skill_validator", sample_validator_path)
sample_validator = importlib.util.module_from_spec(sample_spec)
assert sample_spec and sample_spec.loader
sample_spec.loader.exec_module(sample_validator)


class M13ExamplesTest(unittest.TestCase):
    def test_metadata_required_fields_and_name_directory_contract(self):
        valid = {"name": "code-review", "description": "Review repositories when asked to inspect code."}
        self.assertEqual(metadata.validate_metadata(valid, "code-review"), [])
        self.assertIn("name_syntax", metadata.validate_metadata({**valid, "name": "Code-Review"}, "Code-Review"))
        self.assertIn("directory_name_mismatch", metadata.validate_metadata(valid, "review"))
        self.assertIn("description_length", metadata.validate_metadata({"name": "code-review", "description": ""}, "code-review"))
        self.assertIn("name_syntax", metadata.validate_metadata({**valid, "name": "bad--name"}, "bad--name"))

    def test_optional_metadata_fields_and_experimental_allowed_tools(self):
        value = {
            "name": "data-analysis",
            "description": "Analyze datasets and summarize validated results.",
            "compatibility": "Requires Python 3.12",
            "metadata": {"org.example/version": "1.2.0"},
            "allowed-tools": "Read",
        }
        self.assertEqual(metadata.validate_metadata(value, "data-analysis"), [])
        self.assertIn("metadata_must_be_string_map", metadata.validate_metadata({**value, "metadata": {"version": 1}}, "data-analysis"))
        self.assertIn("experimental", metadata.describe_field("allowed-tools"))
        self.assertIn("not a standard", metadata.describe_field("version"))

    def test_progressive_disclosure_context_budget(self):
        result = disclosure.loading_budget("name: x", "long instructions " * 10, ["reference " * 20])
        self.assertGreater(result["all_at_once_tokens"], result["discovery_tokens"])
        self.assertGreater(result["execution_resource_tokens"], 0)
        self.assertEqual(result["all_at_once_tokens"], result["discovery_tokens"] + result["activation_tokens"] + result["execution_resource_tokens"])

    def test_skill_dag_topological_order_and_failures(self):
        graph = {"spec": [], "implement": ["spec"], "test": ["implement"], "security": ["implement"], "release": ["test", "security"]}
        order = dag.topological_order(graph)
        self.assertLess(order.index("spec"), order.index("implement"))
        self.assertLess(order.index("test"), order.index("release"))
        with self.assertRaisesRegex(ValueError, "cycle"):
            dag.topological_order({"a": ["b"], "b": ["a"]})
        with self.assertRaisesRegex(ValueError, "undefined"):
            dag.topological_order({"a": ["missing"]})

    def test_manifest_hash_path_and_capability_policy(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "SKILL.md").write_text("safe example")
            result = supply.manifest(root, ["SKILL.md"])
            self.assertEqual(len(result[0]["sha256"]), 64)
            with self.assertRaisesRegex(ValueError, "path_escape"):
                supply.safe_file(root, "../outside")
            link = root / "escape"
            try:
                link.symlink_to(Path(tmp).parent, target_is_directory=True)
            except OSError:
                self.skipTest("symlink creation is unavailable")
            with self.assertRaisesRegex(ValueError, "symlink"):
                supply.safe_file(root, "escape")
        self.assertEqual(supply.capability_policy({"read"}, {"read"}), {"read"})
        with self.assertRaises(PermissionError):
            supply.capability_policy({"read", "network"}, {"read"})

    def test_trigger_and_task_metrics(self):
        metrics = evaluation.trigger_metrics([True, True, False, False], [True, False, True, False])
        self.assertAlmostEqual(metrics["precision"], 0.5)
        self.assertAlmostEqual(metrics["recall"], 0.5)
        self.assertAlmostEqual(metrics["false_positive_rate"], 0.5)
        self.assertAlmostEqual(metrics["false_trigger_share"], 0.25)
        selection = evaluation.skill_selection_metrics(
            ["repo", "data", None, "repo", None],
            ["repo", "repo", "other", None, None],
        )
        self.assertAlmostEqual(selection["wrong_skill_rate"], 1 / 3)
        self.assertAlmostEqual(selection["activation_miss_rate"], 1 / 3)
        self.assertAlmostEqual(selection["false_activation_rate"], 1 / 2)
        self.assertAlmostEqual(selection["exact_selection_accuracy"], 2 / 5)
        with self.assertRaises(ValueError):
            evaluation.skill_selection_metrics([], [])
        self.assertAlmostEqual(evaluation.task_success_rate([True, False, True]), 2 / 3)
        with self.assertRaises(ValueError):
            evaluation.trigger_metrics([], [])
        with self.assertRaises(ValueError):
            evaluation.task_success_rate([])

    def test_sample_skill_package_and_report_validator(self):
        skill_dir = ROOT / "repository-security-review"
        skill_text = (skill_dir / "SKILL.md").read_text()
        frontmatter = skill_text.split("---", 2)[1]
        self.assertIn("name: repository-security-review", frontmatter)
        self.assertIn("org.example/version: \"1.0.0\"", frontmatter)
        report = json.loads((skill_dir / "sample-report.json").read_text())
        self.assertEqual(sample_validator.validate_report(report), [])
        report["findings"][0]["path"] = "../secrets.txt"
        self.assertIn("finding_0_invalid_path", sample_validator.validate_report(report))


if __name__ == "__main__":
    unittest.main()
