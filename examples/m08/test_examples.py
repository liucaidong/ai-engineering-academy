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

trace = load_module("01_rag_pipeline_trace.py", "trace")
chunking = load_module("02_chunking_budget.py", "chunking")
hybrid = load_module("03_hybrid_retrieval.py", "hybrid")
citations = load_module("04_grounding_citations.py", "citations")
metrics = load_module("05_rag_eval_metrics.py", "metrics")


class M08ExamplesTest(unittest.TestCase):
    def test_pipeline_latency_and_failure_classification(self):
        stages = [{"name": "retrieve", "duration_ms": 10, "ok": True}, {"name": "generate", "duration_ms": 20, "ok": False}]
        self.assertEqual(trace.summarize_trace(stages)["total_ms"], 30)
        self.assertEqual(trace.summarize_trace(stages)["failed_stages"], ["generate"])
        self.assertEqual(trace.classify_rag_failure(0, False, False, False), "retrieval_miss")
        self.assertEqual(trace.classify_rag_failure(2, False, True, False), "generation_grounding")

    def test_chunk_count_and_overlap(self):
        self.assertEqual(chunking.estimate_chunk_count(10000, 500, 50), 23)
        self.assertEqual(chunking.estimate_chunk_count(10000, 500, 100), 25)
        stats_50 = chunking.estimate_chunk_stats(10000, 500, 50)
        self.assertEqual(stats_50["actual_indexed_tokens"], 11100)
        self.assertEqual(stats_50["duplicated_tokens"], 1100)
        self.assertEqual(stats_50["padded_capacity_slots"], 11500)
        self.assertEqual(stats_50["padding_tokens"], 400)
        self.assertAlmostEqual(stats_50["redundancy_ratio"], 0.11)
        stats_100 = chunking.estimate_chunk_stats(10000, 500, 100)
        self.assertEqual(stats_100["actual_indexed_tokens"], 12400)
        self.assertEqual(stats_100["duplicated_tokens"], 2400)
        self.assertEqual(stats_100["padded_capacity_slots"], 12500)
        self.assertEqual(stats_100["padding_tokens"], 100)
        chunks = chunking.split_words(["a", "b", "c", "d", "e", "f", "g"], 4, 1)
        self.assertEqual(chunks, [["a", "b", "c", "d"], ["d", "e", "f", "g"]])

    def test_bm25_and_rrf(self):
        docs = {"d1": "travel reimbursement policy limit", "d2": "old travel policy", "d3": "expense receipt form"}
        scores = hybrid.bm25_scores("travel reimbursement", docs)
        self.assertEqual(max(scores, key=scores.get), "d1")
        fused = hybrid.rrf_fuse([["d1", "d2"], ["d2", "d1"], ["d2", "d3"]])
        self.assertEqual(max(fused, key=fused.get), "d2")

    def test_citation_resolution(self):
        evidence = {"c1": {"document_version": "v2", "source": "policy.pdf"}}
        claims = [
            {"claim_id": "a", "citation_ids": ["c1"]},
            {"claim_id": "b", "citation_ids": []},
            {"claim_id": "c", "citation_ids": ["missing"]},
        ]
        results = citations.validate_citations(claims, evidence)
        self.assertEqual([item["status"] for item in results], ["citation_resolves", "missing_citation", "unknown_citation:missing"])

    def test_rag_ranking_and_claim_metrics(self):
        retrieved = ["d3", "d1", "d2"]
        relevant = {"d1", "d3"}
        self.assertEqual(metrics.recall_at_k(retrieved, relevant, 3), 1.0)
        self.assertEqual(metrics.reciprocal_rank(retrieved, relevant), 1.0)
        self.assertAlmostEqual(metrics.ndcg_at_k(retrieved, {"d1": 3, "d2": 1, "d3": 2}, 3), 0.8428, places=4)
        self.assertAlmostEqual(metrics.claim_support_rate([True, True, False]), 2 / 3)


if __name__ == "__main__":
    unittest.main()
