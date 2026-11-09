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

alignment = load_module("01_multimodal_alignment.py", "alignment")
vision = load_module("02_vision_token_budget.py", "vision")
diffusion = load_module("03_diffusion_sampling_budget.py", "diffusion")
audio = load_module("04_streaming_audio_metrics.py", "audio")
video = load_module("05_video_timeline_budget.py", "video")


class M09ExamplesTest(unittest.TestCase):
    def test_contrastive_alignment_and_sigmoid_loss(self):
        low_temp = alignment.softmax_probabilities([0.9, 0.2, 0.1], 0.07)[0]
        high_temp = alignment.softmax_probabilities([0.9, 0.2, 0.1], 0.5)[0]
        self.assertGreater(low_temp, high_temp)
        matrix = [[0.9, 0.2], [0.1, 0.8]]
        self.assertGreaterEqual(alignment.symmetric_contrastive_loss(matrix, 0.1), 0)
        self.assertLess(alignment.sigmoid_pair_loss(2, 1), alignment.sigmoid_pair_loss(-2, 1))

    def test_vision_patch_and_sequence_budget(self):
        self.assertEqual(vision.patch_count(384, 384, 16), 576)
        self.assertEqual(vision.patch_count(384, 384, 8), 2304)
        budget16 = vision.token_budget([(384, 384, 16)], text_tokens=64)
        budget8 = vision.token_budget([(384, 384, 8)], text_tokens=64)
        self.assertEqual(budget16["sequence_tokens"], 641)
        self.assertEqual(budget16["full_attention_pairs"], 641 ** 2)
        self.assertEqual(budget8["sequence_tokens"], 2369)
        self.assertEqual(budget8["full_attention_pairs"], 2369 ** 2)
        pair_growth = budget8["full_attention_pairs"] / budget16["full_attention_pairs"]
        self.assertGreater(pair_growth, 4)
        self.assertLess(pair_growth, 16)

    def test_diffusion_nfe_and_latency(self):
        self.assertEqual(diffusion.denoiser_calls(20, 2), 40)
        self.assertEqual(diffusion.cfg_calls_per_step(False), 1)
        self.assertEqual(diffusion.cfg_calls_per_step(True), 2)
        self.assertEqual(diffusion.cfg_calls_per_step(True, batched_uncond_cond=True), 1)
        self.assertEqual(diffusion.estimated_latency_ms(20, 2, 85, 120), 3520)

    def test_pcm_wer_and_streaming_latency(self):
        self.assertEqual(audio.pcm_bytes(60, 16000, 16, 1), 1_920_000)
        self.assertAlmostEqual(audio.word_error_rate(4, 3, 2, 100), 0.09)
        self.assertEqual(audio.streaming_latency_ms(2, 0.2, 180, 250), 2630)

    def test_video_sampling_and_timestamp_tolerance(self):
        self.assertEqual(video.sampled_frame_count(600, 30), 18000)
        self.assertEqual(video.sampled_frame_count(600, 1), 600)
        self.assertAlmostEqual(video.event_capture_probability(0.1, 1), 0.1)
        self.assertEqual(video.event_capture_probability(1.2, 1), 1.0)
        self.assertTrue(video.timestamps_aligned(12.02, 12.0, 0.03))
        self.assertFalse(video.timestamps_aligned(12.1, 12.0, 0.03))


if __name__ == "__main__":
    unittest.main()
