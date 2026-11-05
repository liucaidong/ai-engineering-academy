from pathlib import Path

import pytest


@pytest.fixture(scope="module")
def migration_sources() -> dict[str, str]:
    directory = Path(__file__).resolve().parents[1] / "migrations" / "versions"
    return {
        path.name: path.read_text(encoding="utf-8")
        for path in directory.glob("*.py")
    }


def test_identity_rls_is_enabled_and_forced_for_every_identity_table(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0004_tenant_rls.py"]
    protected_tables = (
        "users",
        "external_identities",
        "auth_sessions",
        "tenants",
        "tenant_memberships",
        "tenant_membership_roles",
        "tenant_invitations",
        "audit_events",
    )

    assert "for table in (\"users\"" in source
    assert all(f'\"{table}\"' in source for table in protected_tables)
    assert 'op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")' in source
    assert 'op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")' in source


def test_identity_rls_context_is_transaction_local_and_fail_closed(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0004_tenant_rls.py"]

    assert "current_setting('app.user_id', true)" in source
    assert "current_setting('app.tenant_id', true)" in source
    assert "NULLIF(current_setting('app.user_id', true), '')::uuid" in source
    assert "NULLIF(current_setting('app.tenant_id', true), '')::uuid" in source


@pytest.mark.parametrize("table", ["learning_progress", "assessment_results"])
def test_learner_tables_force_rls_and_require_active_membership(
    migration_sources: dict[str, str],
    table: str,
) -> None:
    source = migration_sources["0005_learner_records.py"]

    assert 'op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")' in source
    assert 'op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")' in source
    assert f"CREATE POLICY {table}_self_select" in source
    assert f"CREATE POLICY {table}_self_insert" in source
    assert f"CREATE POLICY {table}_self_update" in source
    assert "m.status = 'active'" in source
    assert "tenant_id = {_TENANT} AND user_id = {_USER}" in source


def test_learner_rls_has_no_unscoped_policy_or_delete_policy(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0005_learner_records.py"]

    assert "USING (true)" not in source
    assert "FOR ALL" not in source
    assert "self_delete" not in source


def test_rls_downgrade_removes_policies_and_disables_protection(
    migration_sources: dict[str, str],
) -> None:
    identity = migration_sources["0004_tenant_rls.py"]
    learner = migration_sources["0005_learner_records.py"]

    for source in (identity, learner):
        assert "DROP POLICY IF EXISTS" in source
        assert "NO FORCE ROW LEVEL SECURITY" in source
        assert "DISABLE ROW LEVEL SECURITY" in source


def test_session_lookup_rls_is_limited_to_exact_transaction_token_hash(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0006_session_lookup_rls.py"]

    assert "CREATE POLICY auth_sessions_token_hash_bootstrap_select ON auth_sessions" in source
    assert "FOR SELECT USING" in source
    assert "current_setting('app.session_token_hash', true)" in source
    assert "token_hash = " in source
    assert "USING (true)" not in source
    assert "FOR ALL" not in source
    assert "DROP POLICY IF EXISTS auth_sessions_token_hash_bootstrap_select" in source


def test_oidc_login_transaction_rls_is_state_hash_scoped(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0007_oidc_login_transactions.py"]

    assert "ENABLE ROW LEVEL SECURITY" in source
    assert "FORCE ROW LEVEL SECURITY" in source
    assert "current_setting('app.oidc_state_hash', true)" in source
    assert "oidc_login_state_select" in source
    assert "oidc_login_state_insert" in source
    assert "oidc_login_state_update" in source
    assert "USING (true)" not in source
    assert "FOR ALL" not in source
    assert "DROP POLICY IF EXISTS" in source


def test_oidc_identity_bootstrap_and_personal_workspace_policies_are_scoped(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0008_oidc_identity_provisioning.py"]

    assert "issuer = NULLIF(current_setting('app.oidc_issuer', true), '')" in source
    assert "subject = NULLIF(current_setting('app.oidc_subject', true), '')" in source
    assert "tenants_personal_owner_insert" in source
    assert "tenant_memberships_personal_self_insert" in source
    assert "tenant_membership_roles_learner_self_insert" in source
    assert "role = 'learner'" in source
    assert "granted_by_user_id IS NULL" in source
    assert "USING (true)" not in source
    assert "FOR ALL" not in source
    assert "DROP POLICY IF EXISTS" in source


def test_personal_workspace_rls_never_allows_admin_role_self_grant(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0008_oidc_identity_provisioning.py"]

    assert "WITH CHECK" in source
    assert "role = 'learner'" in source
    assert "role = 'tenant_admin'" not in source
    assert "role = 'instructor'" not in source
    assert "personal_owner_user_id" in source
    assert "user_id = NULLIF(current_setting('app.user_id', true), '')::uuid" in source


def test_assessment_self_grading_guard_is_installed_and_reversible(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0009_assessment_self_grading_guard.py"]
    assert "CREATE FUNCTION public.guard_learner_assessment_fields" in source
    assert "SECURITY INVOKER" in source
    assert "NEW.grading_mode <> 'self_review'" in source
    assert "NEW.score IS NOT NULL" in source
    assert "learners cannot change assessment attempt identity" in source
    assert "learners cannot grade or modify submitted attempts" in source
    assert "CREATE TRIGGER trg_guard_learner_assessment_fields" in source
    assert "DROP TRIGGER IF EXISTS" in source
    assert "DROP FUNCTION IF EXISTS" in source


def test_tenant_membership_discovery_policy_exposes_only_active_self_rows(
    migration_sources: dict[str, str],
) -> None:
    source = migration_sources["0010_tenant_membership_discovery.py"]
    assert "tenant_memberships_self_discovery" in source
    assert "FOR SELECT USING" in source
    assert "user_id = NULLIF(current_setting('app.user_id', true), '')::uuid" in source
    assert "status = 'active'" in source
    assert "DROP POLICY IF EXISTS tenant_memberships_self_discovery" in source
