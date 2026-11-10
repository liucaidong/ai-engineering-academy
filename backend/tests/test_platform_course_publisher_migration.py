from pathlib import Path


def test_platform_publisher_audit_policy_is_role_bound_and_global_only() -> None:
    source = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "0012_platform_publisher_audit.py"
    ).read_text(encoding="utf-8")
    assert "current_user = 'academy_course_publisher'" in source
    assert "actor_user_id IS NULL AND tenant_id IS NULL" in source
    assert "FOR INSERT WITH CHECK" in source
    assert "DROP POLICY IF EXISTS" in source
    assert "REVOKE SELECT ON TABLE tenant_memberships FROM academy_course_publisher" in source
    assert "BYPASSRLS" not in source


def test_published_course_snapshots_are_immutable_at_the_database_boundary() -> None:
    source = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "0012_platform_publisher_audit.py"
    ).read_text(encoding="utf-8")
    assert "guard_course_release_immutability" in source
    assert "BEFORE INSERT OR UPDATE OR DELETE ON course_releases" in source
    assert "published course release snapshots are immutable" in source
    assert "retired course releases cannot be reactivated" in source
    assert "platform publisher may only insert published releases" in source


def test_publisher_cannot_read_tenant_memberships_even_with_custom_rls_context() -> None:
    source = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "0012_platform_publisher_audit.py"
    ).read_text(encoding="utf-8")
    assert "AS RESTRICTIVE FOR SELECT" in source
    assert "current_user <> 'academy_course_publisher'" in source
    assert "tenant_memberships_publisher_select_deny" in source
