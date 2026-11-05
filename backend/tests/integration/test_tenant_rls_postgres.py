"""Optional PostgreSQL integration test for RLS using separate admin/runtime roles.

Set ACADEMY_TEST_ADMIN_DATABASE_URL to a test-only superuser/BYPASSRLS connection
and ACADEMY_TEST_RUNTIME_DATABASE_URL to the actual non-owner application role.
The database must already be migrated to head.
"""
import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.asyncio
async def test_runtime_role_cannot_read_another_tenants_rows() -> None:
    admin_url = os.getenv("ACADEMY_TEST_ADMIN_DATABASE_URL")
    runtime_url = os.getenv("ACADEMY_TEST_RUNTIME_DATABASE_URL")
    if not admin_url or not runtime_url:
        pytest.skip("PostgreSQL RLS integration URLs are not configured")

    admin_engine = create_async_engine(admin_url)
    runtime_engine = create_async_engine(runtime_url)

    user_a, user_b = uuid4(), uuid4()
    tenant_a, tenant_b = uuid4(), uuid4()
    membership_a, membership_b = uuid4(), uuid4()
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
            assert admin_can_bypass_rls, "Admin test connection must bypass RLS for isolated fixture setup"

            await connection.execute(
                text(
                    "INSERT INTO users (id, status) VALUES "
                    "(:user_a, 'active'), (:user_b, 'active')"
                ),
                {"user_a": user_a, "user_b": user_b},
            )
            await connection.execute(
                text(
                    "INSERT INTO tenants (id, tenant_type, name, personal_owner_user_id) VALUES "
                    "(:tenant_a, 'personal', 'Tenant A', :user_a), "
                    "(:tenant_b, 'personal', 'Tenant B', :user_b)"
                ),
                {
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "user_a": user_a,
                    "user_b": user_b,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO tenant_memberships (id, tenant_id, user_id, status) VALUES "
                    "(:membership_a, :tenant_a, :user_a, 'active'), "
                    "(:membership_b, :tenant_b, :user_b, 'active')"
                ),
                {
                    "membership_a": membership_a,
                    "membership_b": membership_b,
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "user_a": user_a,
                    "user_b": user_b,
                },
            )
            await connection.execute(
                text(
                    "INSERT INTO tenant_membership_roles "
                    "(tenant_id, membership_id, role) VALUES "
                    "(:tenant_a, :membership_a, 'learner'), "
                    "(:tenant_b, :membership_b, 'learner')"
                ),
                {
                    "tenant_a": tenant_a,
                    "tenant_b": tenant_b,
                    "membership_a": membership_a,
                    "membership_b": membership_b,
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
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true)"
                    ),
                    {"user_id": str(user_a), "tenant_id": str(tenant_a)},
                )
                visible_tenants = (
                    await connection.execute(text("SELECT id FROM tenants"))
                ).scalars().all()
                visible_memberships = (
                    await connection.execute(text("SELECT id FROM tenant_memberships"))
                ).scalars().all()
                visible_roles = (
                    await connection.execute(
                        text("SELECT role FROM tenant_membership_roles")
                    )
                ).scalars().all()

                assert visible_tenants == [tenant_a]
                assert visible_memberships == [membership_a]
                assert visible_roles == ["learner"]

            async with connection.begin():
                await connection.execute(
                    text(
                        "SELECT set_config('app.user_id', :user_id, true), "
                        "set_config('app.tenant_id', :tenant_id, true)"
                    ),
                    {"user_id": str(user_a), "tenant_id": str(tenant_b)},
                )
                assert (
                    await connection.execute(text("SELECT id FROM tenants"))
                ).scalars().all() == []
                assert (
                    await connection.execute(text("SELECT id FROM tenant_memberships"))
                ).scalars().all() == []

            async with connection.begin():
                assert (
                    await connection.execute(text("SELECT id FROM tenants"))
                ).scalars().all() == []

    finally:
        if admin_can_bypass_rls:
            async with admin_engine.begin() as connection:
                await connection.execute(
                    text("DELETE FROM tenants WHERE id IN (:tenant_a, :tenant_b)"),
                    {"tenant_a": tenant_a, "tenant_b": tenant_b},
                )
                await connection.execute(
                    text("DELETE FROM users WHERE id IN (:user_a, :user_b)"),
                    {"user_a": user_a, "user_b": user_b},
                )
        await runtime_engine.dispose()
        await admin_engine.dispose()
