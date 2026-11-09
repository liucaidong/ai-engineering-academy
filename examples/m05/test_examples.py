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

kv = load_module("01_kv_cache_budget.py", "kv")
decoding = load_module("02_decoding_distribution.py", "decoding")
queueing = load_module("03_queueing_budget.py", "queueing")
quant = load_module("04_quantization_speculative.py", "quant")
capacity = load_module("05_serving_capacity.py", "capacity")


class M05ExamplesTest(unittest.TestCase):
    def test_kv_cache_and_block_rounding(self):
        one_request = kv.kv_cache_bytes(32, 1, 16384, 8, 128, 2)
        four_requests = kv.kv_cache_bytes(32, 4, 16384, 8, 128, 2)
        self.assertEqual(kv.gibibytes(one_request), 2.0)
        self.assertEqual(kv.gibibytes(four_requests), 8.0)
        self.assertEqual(kv.paged_token_capacity(1001, 16), 1008)

    def test_temperature_and_top_p(self):
        probs = decoding.softmax([2, 1, 0], 1)
        self.assertAlmostEqual(sum(probs), 1.0)
        self.assertAlmostEqual(probs[0], 0.6652409558)
        self.assertEqual(sum(value > 0 for value in decoding.truncate_top_p([0.6, 0.15, 0.15, 0.1], 0.8)), 3)

    def test_queue_time_is_not_system_time(self):
        result = queueing.mm1_metrics(15, 20)
        self.assertAlmostEqual(result["system_time_seconds"], 0.2)
        self.assertAlmostEqual(result["queue_wait_seconds"], 0.15)
        self.assertGreater(result["system_time_seconds"], result["queue_wait_seconds"])

    def test_quantization_and_speculative_acceptance(self):
        self.assertEqual(quant.weight_payload_gb(13e9, 16), 26.0)
        self.assertEqual(quant.weight_payload_gb(13e9, 4), 6.5)
        self.assertEqual(quant.token_acceptance_probability(0.1, 0.2), 0.5)
        self.assertEqual(quant.residual_distribution([0.5, 0.5], [0.8, 0.2]), [0.0, 1.0])

    def test_serving_capacity(self):
        budget, concurrency = capacity.serving_capacity(80, 50, 5, 0.1, 2)
        self.assertAlmostEqual(budget, 17.0)
        self.assertEqual(concurrency, 8)


if __name__ == "__main__":
    unittest.main()
