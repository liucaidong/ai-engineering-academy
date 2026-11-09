import importlib.util
import unittest
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).parent

def load(filename, name):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

control = load("01_control_plane.py", "control_plane")
gateway = load("02_gateway_routing.py", "gateway_routing")
metering = load("03_metering.py", "metering")
tenant = load("04_tenant_isolation.py", "tenant_isolation")
capacity = load("05_capacity_fairness.py", "capacity_fairness")

class M18ExamplesTest(unittest.TestCase):
    def test_reconciliation_and_snapshot_guardrails(self):
        self.assertEqual(control.reconcile({"route":"b","new":None}, {"route":"a","retired":None}), {
            "new":(False,None,True,None), "retired":(True,None,False,None), "route":(True,"a",True,"b")
        })
        key = b"test-control-plane-signing-key"
        good = control.sign_snapshot(2,100,"v1","key-1",{"route":"b"},key)
        keyring = {"key-1":key}
        self.assertEqual(control.apply_snapshot(1,good,50,keyring,{"v1"}),(True,"applied"))
        self.assertEqual(control.apply_snapshot(2,good,50,keyring,{"v1"}),(False,"stale_version"))
        self.assertEqual(control.apply_snapshot(1,good,100,keyring,{"v1"}),(False,"snapshot_expired"))
        self.assertEqual(control.apply_snapshot(1,good,50,{"key-1":b"wrong"},{"v1"}),(False,"signature_invalid"))
        self.assertEqual(control.apply_snapshot(1,{**good,"config":{"route":"attacker"}},50,keyring,{"v1"}),(False,"signature_invalid"))
        self.assertEqual(control.apply_snapshot(1,good,50,keyring,{"v2"}),(False,"unsupported_schema_version"))

    def test_gateway_capability_region_policy_and_limits(self):
        routes = [
            {"provider":"a","region":"jp","capabilities":["chat","tools"],"healthy":True,"policy_approved":True,"data_policy":"jp","context_limit":64000,"schema_versions":["v1"]},
            {"provider":"b","region":"us","capabilities":["chat","tools"],"healthy":True,"policy_approved":True,"data_policy":"global","context_limit":64000,"schema_versions":["v1"]},
            {"provider":"c","region":"jp","capabilities":["chat","tools"],"healthy":False,"policy_approved":True,"data_policy":"jp","context_limit":64000,"schema_versions":["v1"]},
        ]
        self.assertEqual(len(gateway.eligible_routes(routes,{"chat","tools"},"jp",{"a","b","c"},32000,"v1",{"jp"})),1)
        self.assertTrue(gateway.fallback_allowed(routes[0],routes[0],{"chat"},"jp",{"a"},32000,"v1"))
        self.assertFalse(gateway.fallback_allowed(routes[0],routes[1],{"chat"},"jp",{"a","b"},32000,"v1"))
        self.assertFalse(gateway.fallback_allowed(routes[0],routes[2],{"chat"},"jp",{"a","c"},32000,"v1"))
        self.assertEqual(gateway.rate_limit_scope(9,100,10,100),(True,False))

    def test_usage_event_idempotency_and_settlement(self):
        base={"specversion":"1.0","source":"urn:gateway:tenant-a","type":"ai.usage.recorded","time":"2026-11-10T00:00:00Z","subject":"tenant-a","data":{"tenant_id":"tenant-a","request_id":"req-1","provider":"p1","model":"m1","input_tokens":100,"output_tokens":20,"price_version":"2026-11-01","currency":"USD","usage_origin":"provider"}}
        events=[{**base,"id":"1"},{**base,"id":"1"},{**base,"id":"2","data":{**base["data"],"request_id":"req-2"}}]
        ledger=metering.UsageLedger()
        accepted, duplicates=ledger.ingest_once(events)
        self.assertEqual((len(accepted),duplicates),(2,1))
        self.assertEqual(ledger.ingest_once([events[0]]),( [], 1))
        self.assertEqual(metering.settle("10.00","7.00"),{"reserved":Decimal("10.00"),"actual":Decimal("7.00"),"release":Decimal("3.00"),"additional_charge":Decimal("0")})
        self.assertEqual(metering.settle("5","8")["additional_charge"],Decimal("3"))
        self.assertEqual(metering.price_usage(1_000_000,500_000,"2","4"),Decimal("4"))
        self.assertEqual(metering.quantize_currency("1.235", 2), Decimal("1.24"))
        self.assertEqual(metering.quantize_currency("123.5", 0), Decimal("124"))
        with self.assertRaises(ValueError):
            metering.quantize_currency("1.2", 2, "ROUND_DOWN")
        with self.assertRaises(ValueError):
            metering.price_usage(1, 1, 2.0, 4)
        with self.assertRaises(ValueError):
            metering._money(1.2)
        with self.assertRaises(ValueError):
            ledger.ingest_once([{**base,"id":"3","data":{**base["data"],"input_tokens":True}}])
        with self.assertRaises(ValueError):
            ledger.ingest_once([{**events[0],"data":{**events[0]["data"],"input_tokens":999}}])
        self.assertEqual(ledger.ingest_once([events[0]]),([],1))
        with self.assertRaises(ValueError):
            ledger.ingest_once([{**base,"id":"4","time":"2026-11-10T00:00:00"}])
        with self.assertRaises(ValueError):
            metering.settle("NaN","1")

    def test_tenant_context_and_isolation(self):
        ctx=tenant.derive_tenant_context({"tenant_id":"a","sub":"u1"})
        resource={"tenant_id":"a","owner_id":"u1","allowed_actions":["read"],"visibility":"private","authorized_principals":[]}
        self.assertTrue(tenant.authorize_resource(ctx,resource,"read"))
        self.assertFalse(tenant.authorize_resource(ctx,{**resource,"tenant_id":"b"},"read"))
        self.assertFalse(tenant.authorize_resource(ctx,{**resource,"owner_id":"u2"},"read"))
        self.assertFalse(tenant.authorize_resource(ctx,resource,"delete"))
        shared={**resource,"visibility":"tenant","owner_id":"u2"}
        self.assertTrue(tenant.authorize_resource(ctx,shared,"read"))
        key1=tenant.cache_key(ctx,"doc","v1","p1")
        key2=tenant.cache_key({**ctx,"principal_id":"u2"},"doc","v1","p1")
        key3=tenant.cache_key(ctx,"doc","v2","p1")
        self.assertNotEqual(key1,key2)
        self.assertNotEqual(key1,key3)
        self.assertNotEqual(tenant.cache_key(ctx,"doc:a","v1","p1"), tenant.cache_key(ctx,"doc","a:v1","p1"))
        with self.assertRaises(ValueError):
            tenant.cache_key({**ctx,"tenant_id":""},"doc","v1","p1")
        self.assertEqual(tenant.cache_key(ctx,"doc","v1","p1","tenant","tenant"),tenant.cache_key({**ctx,"principal_id":"u2"},"doc","v1","p1","tenant","tenant"))
        with self.assertRaises(ValueError):
            tenant.cache_key(ctx,"doc","v1","p1","tenant","private")
        self.assertEqual(tenant.choose_isolation("high","large"),"silo")
        with self.assertRaises(ValueError):
            tenant.derive_tenant_context({"tenant_id":"a"})

    def test_weighted_schedule_admission_and_headroom(self):
        queues={"a":5,"b":5}
        schedule=capacity.weighted_schedule(queues,{"a":2,"b":1},6)
        self.assertEqual(queues,{"a":5,"b":5})
        self.assertEqual(schedule.count("a"),4)
        self.assertEqual(schedule.count("b"),2)
        self.assertTrue(capacity.admit(11,10,"critical"))
        self.assertFalse(capacity.admit(11,10,"batch"))
        self.assertAlmostEqual(capacity.capacity_headroom(80,120,0.1),0.4)
        self.assertEqual(capacity.n_plus_one_capacity(4,60,100,0.2),(True,180,125.0,0.44))
        with self.assertRaises(ValueError):
            capacity.weighted_schedule({"a":1},{"a":0},1)

if __name__ == "__main__":
    unittest.main()
