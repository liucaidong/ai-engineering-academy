"""Optional PostgreSQL RLS acceptance using separate admin/runtime roles.

Set ACADEMY_TEST_ADMIN_DATABASE_URL to a test-only superuser/BYPASSRLS connection
and ACADEMY_TEST_RUNTIME_DATABASE_URL to the actual non-owner application role.
The database must already be migrated to head.
"""

import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.asyncio
async def test_runtime_role_enforces_rls_and_narrow_personal_tenant_bootstrap() -> None:
    admin_url = os.getenv("ACADEMY_TEST_ADMIN_DATABASE_URL")
    runtime_url = os.getenv("ACADEMY_TEST_RUNTIME_DATABASE_URL")
    if not admin_url or not runtime_url:
        pytest.skip("PostgreSQL RLS integration URLs are not configured")

    admin_engine = create_async_engine(admin_url)
    runtime_engine = create_async_engine(runtime_url)

    user_a, user_b, user_c, bootstrap_user = uuid4(), uuid4(), uuid4(), uuid4()
    tenant_a, tenant_b, bootstrap_tenant = uuid4(), uuid4(), uuid4()
    membership_a, membership_b, membership_c = uuid4(), uuid4(), uuid4()
    bootstrap_membership = uuid4()
    progress_a, progress_b, progress_c = uuid4(), uuid4(), uuid4()
    result_a, result_b, result_c = uuid4(), uuid4(), uuid4()
    release_id = uuid4()
    admin_can_bypass_rls = False

    try:
        async with admin_engine.begin() as connection:
            admin_role = (
                await connection.execute(
                    text(
                        "SELECT r.rolsuper OR r.rolbypassrls "
                        "FROM pg_roles r WHERE r.rolname = current_user"
                    )
                )
            ).scalar_one()
            admin_can_bypass_rls = bool(admin_role)
            assert admin_can_bypass_rls, "Admin test connection must bypass RLS for fixture setup"

            await connection.execute(
                text(
                    "INSERT INTO users (id, status) VALUES "
                    "(:user_a, 'active'), (:user_b, 'active'), (:user_c, 'active'), "
                    "(:bootstrap_user, 'active')"
                ),
                {
                    "user_a": user_a,
                    "user_b": user_b,
                    "user_c": user_c,
                    "bootstrap_user": bootstrap_user,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO tenants (id, tenant_type, name, personal_owner_user_id) VALUES "
                    "(:tenant_a, 'personal', 'Tenant A', :user_a), "
                    "(:tenant_b, 'personal', 'Tenant B', :user_b), "
                    "(:bootstrap_tenant, 'personal', 'Bootstrap Tenant', :bootstrap_user)"
                ),
                {
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "bootstrap_tenant": bootstrap_tenant,
                    "user_a": user_a,
                    "user_b": user_b,
                    "bootstrap_user": bootstrap_user,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO tenant_memberships (id, tenant_id, user_id, status) VALUES "
                    "(:membership_a, :tenant_a, :user_a, 'active'), "
                    "(:membership_b, :tenant_b, :user_b, 'active'), "
                    "(:membership_c, :tenant_a, :user_c, 'active')"
                ),
                {
                    "membership_a": membership_a,
                    "membership_b": membership_b,
                    "membership_c": membership_c,
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "user_a": user_a,
                    "user_b": user_b,
                    "user_c": user_c,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO tenant_membership_roles "
                    "(tenant_id, membership_id, role) VALUES "
                    "(:tenant_a, :membership_a, 'learner'), "
                    "(:tenant_b, :membership_b, 'learner'), "
                    "(:tenant_a, :membership_c, 'learner')"
                ),
                {
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "membership_a": membership_a,
                    "membership_b": membership_b,
                    "membership_c": membership_c,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO course_releases "
                    "(id, course_key, version, schema_version, content_sha256, content, status) "
                    "VALUES (:release_id, 'rls-test', '1.0.0', 1, :digest, "
                    """'{"title":"RLS test"}'::jsonb, 'draft')"""
                ),
                {"release_id": release_id, "digest": "0" * 64},
            )
            await connection.execute(
                text(
                    "INSERT INTO learning_progress "
                    "(id, tenant_id, user_id, course_release_id, module_key) VALUES "
                    "(:progress_a, :tenant_a, :user_a, :release_id, 'M01'), "
                    "(:progress_b, :tenant_b, :user_b, :release_id, 'M01'), "
                    "(:progress_c, :tenant_a, :user_c, :release_id, 'M02')"
                ),
                {
                    "progress_a": progress_a,
                    "progress_b": progress_b,
                    "progress_c": progress_c,
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "user_a": user_a,
                    "user_b": user_b,
                    "user_c": user_c,
                    "release_id": release_id,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO assessment_results "
                    "(id, tenant_id, user_id, course_release_id, assessment_key, "
                    "attempt_number, status, grading_mode) VALUES "
                    "(:result_a, :tenant_a, :user_a, :release_id, 'A01', 1, 'draft', 'self_review'), "
                    "(:result_b, :tenant_b, :user_b, :release_id, 'A01', 1, 'draft', 'self_review'), "
                    "(:result_c, :tenant_a, :user_c, :release_id, 'A01', 1, 'draft', 'self_review')"
                ),
                {
                    "result_a": result_a,
                    "result_b": result_b,
                    "result_c": result_c,
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "user_a": user_a,
                    "user_b": user_b,
                    "user_c": user_c,
                    "release_id": release_id,
                },
            )

        async with runtime_engine.connect() as connection:
            role_flags = (
                await connection.execute(
                    text(
                        "SELECT r.rolsuper, r.rolbypassrls "
                        "FROM pg_roles r WHERE r.rolname = current_user"
                    )
                )
            ).one()
            assert role_flags == (False, False)
            await connection.rollback()

            async with connection.begin():
                for table in (
                    "users",
                    "external_identities",
                    "auth_sessions",
                    "tenants",
                    "tenant_memberships",
                    "tenant_membership_roles",
                    "tenant_invitations",
                    "audit_events",
                    "learning_progress",
                    "assessment_results",
                ):
                    flags = (
                        await connection.execute(
                            text(
                                "SELECT relrowsecurity, relforcerowsecurity "
                                "FROM pg_class WHERE oid = to_regclass('public.' || :table_name)"
                            ),
                            {"table_name": table},
                        )
                    ).one()
                    assert flags == (True, True), f"RLS must be enabled and forced for {table}"
                    is_owner = (
                        await connection.execute(
                            text(
                                "SELECT pg_get_userbyid(relowner) = current_user "
                                "FROM pg_class WHERE oid = to_regclass('public.' || :table_name)"
                            ),
                            {"table_name": table},
                        )
                    ).scalar_one()
                    assert is_owner is False, f"Runtime role must not own protected table {table}"

            async with connection.begin():
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true)"
                    ),
                    {"user_id": str(user_a), "tenant_id": str(tenant_a)},
                )
                assert (
                    await connection.execute(text("SELECT id FROM tenants"))
                ).scalars().all() == [tenant_a]
                assert (
                    await connection.execute(text("SELECT id FROM tenant_memberships"))
                ).scalars().all() == [membership_a]
                assert (
                    await connection.execute(text("SELECT id FROM learning_progress"))
                ).scalars().all() == [progress_a]
                assert (
                    await connection.execute(text("SELECT id FROM assessment_results"))
                ).scalars().all() == [result_a]
                progress_update = await connection.execute(
                    text(
                        "UPDATE learning_progress SET module_key = 'M99' "
                        "WHERE id = :other_progress_id"
                    ),
                    {"other_progress_id": progress_c},
                )
                assert progress_update.rowcount == 0
                assessment_update = await connection.execute(
                    text(
                        "UPDATE assessment_results SET response = CAST(:response AS jsonb) "
                        "WHERE id = :other_result_id"
                    ),
                    {"response": '{"tampered":true}', "other_result_id": result_c},
                )
                assert assessment_update.rowcount == 0

            async with connection.begin():
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true)"
                    ),
                    {"user_id": str(user_a), "tenant_id": str(tenant_b)},
                )
                # The self-discovery policy intentionally allows a user to list
                # their own active memberships before choosing a tenant context.
                membership_rows = (
                    (await connection.execute(text("SELECT id FROM tenant_memberships")))
                    .scalars()
                    .all()
                )
                assert membership_rows == [membership_a]
                tenant_rows = (
                    (await connection.execute(text("SELECT id FROM tenants"))).scalars().all()
                )
                assert tenant_rows == [tenant_a]
                for table in ("learning_progress", "assessment_results"):
                    rows = (
                        (await connection.execute(text(f"SELECT id FROM {table}"))).scalars().all()
                    )
                    assert rows == [], f"unexpected rows visible in {table}: {rows}"

            async with connection.begin():
                for table in (
                    "tenants",
                    "tenant_memberships",
                    "learning_progress",
                    "assessment_results",
                ):
                    rows = (
                        (await connection.execute(text(f"SELECT id FROM {table}"))).scalars().all()
                    )
                    assert rows == []

        async with admin_engine.begin() as connection:
            await connection.execute(
                text(
                    "UPDATE tenant_memberships SET status = 'suspended' WHERE id = :membership_id"
                ),
                {"membership_id": membership_a},
            )

        async with runtime_engine.connect() as connection, connection.begin():
            await connection.execute(
                text(
                    "SELECT set_config('app.user_id', :user_id, true), "
                    "set_config('app.tenant_id', :tenant_id, true)"
                ),
                {"user_id": str(user_a), "tenant_id": str(tenant_a)},
            )
            assert (await connection.execute(text("SELECT id FROM tenants"))).scalars().all() == []
            assert (
                await connection.execute(text("SELECT id FROM tenant_memberships"))
            ).scalars().all() == []
            assert (
                await connection.execute(text("SELECT id FROM learning_progress"))
            ).scalars().all() == []
            assert (
                await connection.execute(text("SELECT id FROM assessment_results"))
            ).scalars().all() == []

        async with runtime_engine.connect() as connection:
            async with connection.begin():
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true), "
                        "set_config('app.oidc_personal_tenant_id', :bootstrap_tenant, true)"
                    ),
                    {
                        "user_id": str(bootstrap_user),
                        "tenant_id": str(bootstrap_tenant),
                        "bootstrap_tenant": str(bootstrap_tenant),
                    },
                )
                assert (
                    await connection.execute(text("SELECT id FROM tenants"))
                ).scalars().all() == [bootstrap_tenant]
                await connection.execute(
                    text(
                        "INSERT INTO tenant_memberships (id, tenant_id, user_id, status) "
                        "VALUES (:membership_id, :tenant_id, :user_id, 'active')"
                    ),
                    {
                        "membership_id": bootstrap_membership,
                        "tenant_id": bootstrap_tenant,
                        "user_id": bootstrap_user,
                    },
                )
                await connection.execute(
                    text("SELECT set_config('app.oidc_personal_tenant_id', '', true)")
                )
                assert (
                    await connection.execute(text("SELECT id FROM tenant_memberships"))
                ).scalars().all() == [bootstrap_membership]

            async with connection.begin():
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true), "
                        "set_config('app.oidc_personal_tenant_id', :bootstrap_tenant, true)"
                    ),
                    {
                        "user_id": str(bootstrap_user),
                        "tenant_id": str(tenant_b),
                        "bootstrap_tenant": str(tenant_b),
                    },
                )
                with pytest.raises(DBAPIError):
                    async with connection.begin_nested():
                        await connection.execute(
                            text(
                                "INSERT INTO tenant_memberships (id, tenant_id, user_id, status) "
                                "VALUES (:membership_id, :tenant_id, :user_id, 'active')"
                            ),
                            {
                                "membership_id": uuid4(),
                                "tenant_id": tenant_b,
                                "user_id": bootstrap_user,
                            },
                        )

    finally:
        if admin_can_bypass_rls:
            async with admin_engine.begin() as connection:
                await connection.execute(
                    text(
                        "DELETE FROM tenants WHERE id IN (:tenant_a, :tenant_b, :bootstrap_tenant)"
                    ),
                    {
                        "tenant_a": tenant_a,
                        "tenant_b": tenant_b,
                        "bootstrap_tenant": bootstrap_tenant,
                    },
                )
                await connection.execute(
                    text(
                        "DELETE FROM users WHERE id IN (:user_a, :user_b, :user_c, :bootstrap_user)"
                    ),
                    {
                        "user_a": user_a,
                        "user_b": user_b,
                        "user_c": user_c,
                        "bootstrap_user": bootstrap_user,
                    },
                )
                await connection.execute(
                    text("DELETE FROM course_releases WHERE id = :release_id"),
                    {"release_id": release_id},
                )
        await runtime_engine.dispose()
        await admin_engine.dispose()
