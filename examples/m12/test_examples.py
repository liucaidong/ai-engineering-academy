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

eras = load_module("01_protocol_eras.py", "eras")
cache = load_module("02_capability_cache.py", "cache")
http = load_module("03_streamable_http.py", "http")
oauth = load_module("04_oauth_binding.py", "oauth")
extensions = load_module("05_extension_matrix.py", "extensions")


class M12ExamplesTest(unittest.TestCase):
    def test_legacy_and_modern_protocol_lifecycles(self):
        self.assertEqual(eras.protocol_era("2025-11-25"), "legacy_handshake")
        self.assertEqual(eras.protocol_era("2026-07-28"), "modern_stateless")
        self.assertEqual(eras.lifecycle_steps("2025-11-25")[0], "initialize")
        self.assertIn("server/discover", eras.lifecycle_steps("2026-07-28")[0])
        self.assertIn("io.modelcontextprotocol/protocolVersion", eras.required_meta("2026-07-28", {}))
        self.assertEqual(eras.required_meta("2025-11-25", {}), {})
        with self.assertRaises(ValueError):
            eras.protocol_era("unknown")

    def test_cache_scope_and_private_identity(self):
        self.assertTrue(cache.cache_policy(1000, "public")["cacheable"])
        self.assertFalse(cache.cache_policy(0, "private")["cacheable"])
        public_a = cache.cache_key("tools/list", "2026-07-28", "v1", "{}", "t1", "u1", "public")
        public_b = cache.cache_key("tools/list", "2026-07-28", "v1", "{}", "t2", "u2", "public")
        self.assertEqual(public_a, public_b)
        private_a = cache.cache_key("tools/list", "2026-07-28", "v1", "{}", "t1", "u1", "private")
        private_b = cache.cache_key("tools/list", "2026-07-28", "v1", "{}", "t2", "u2", "private")
        self.assertNotEqual(private_a, private_b)
        with self.assertRaises(ValueError):
            cache.cache_key("tools/list", "2026-07-28", "v1", "{}", None, None, "private")

    def test_streamable_http_envelope_and_route_consistency(self):
        request = http.build_request("tools/call", "search", 7, {"arguments": {"q": "protocol"}}, "2026-07-28", {"tools": {}})
        self.assertTrue(http.validate_route(request))
        request["headers"]["Mcp-Name"] = "delete"
        self.assertFalse(http.validate_route(request))

    def test_oauth_issuer_audience_and_scope_binding(self):
        token = {"iss": "https://issuer.example", "aud": ["https://mcp.example"], "scope": ["tools:read", "resources:read"]}
        self.assertEqual(oauth.validate_access_context(token, "https://issuer.example", "https://mcp.example", {"tools:read"}), [])
        errors = oauth.validate_access_context(token, "https://other-issuer.example", "https://other-resource.example", {"tools:write"})
        self.assertEqual(errors, ["issuer_mismatch", "audience_mismatch", "insufficient_scope"])
        self.assertFalse(oauth.may_forward_token("https://mcp.example", "https://other-resource.example"))

    def test_extension_negotiation_and_tasks_gating(self):
        negotiated = extensions.negotiate_extensions({"io.modelcontextprotocol/tasks", "x/a"}, {"io.modelcontextprotocol/tasks", "x/b"})
        self.assertEqual(negotiated, {"io.modelcontextprotocol/tasks"})
        self.assertTrue(extensions.tasks_allowed("2026-07-28", negotiated))
        self.assertFalse(extensions.tasks_allowed("2026-07-28", negotiated, "prompts/get"))
        self.assertFalse(extensions.tasks_allowed("2026-07-28", negotiated, "resources/read"))
        self.assertFalse(extensions.tasks_allowed("2025-11-25", negotiated))
        self.assertFalse(extensions.tasks_allowed("2026-07-28", {"x/a"}))
        self.assertEqual(extensions.feature_status("sampling"), "deprecated")


if __name__ == "__main__":
    unittest.main()
