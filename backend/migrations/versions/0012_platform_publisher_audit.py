"""Allow the isolated platform course-publisher role to append global audit events.

Revision ID: 0012_platform_publisher_audit
Revises: 0011_personal_tenant_bootstrap
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0012_platform_publisher_audit"
down_revision: str | None = "0011_personal_tenant_bootstrap"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

POLICY = "audit_events_platform_publisher_insert"


def upgrade() -> None:
    # The login role is provisioned separately by a database administrator.
    # This policy is intentionally tied to current_user, not a caller-set GUC.
    # The pre-existing tenant-user audit policy contains a membership EXISTS
    # subquery. PostgreSQL still checks relation privileges for that policy
    # expression, even when the publisher's null tenant/user cannot satisfy it.
    # Grant SELECT separately, then use a restrictive role-aware policy so
    # this role can never read membership rows, even with caller-set GUC values.
    op.execute(
        "CREATE POLICY tenant_memberships_publisher_select_deny "
        "ON tenant_memberships AS RESTRICTIVE FOR SELECT "
        "USING (current_user <> 'academy_course_publisher')"
    )
    op.execute(
        f"CREATE POLICY {POLICY} ON audit_events FOR INSERT WITH CHECK ("
        "current_user = 'academy_course_publisher' "
        "AND actor_user_id IS NULL AND tenant_id IS NULL)"
    )
    op.execute(
        """
        CREATE FUNCTION public.guard_course_release_immutability()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY INVOKER
        SET search_path = pg_catalog, public
        AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                IF current_user = 'academy_course_publisher'
                   AND NEW.status <> 'published' THEN
                    RAISE EXCEPTION 'platform publisher may only insert published releases';
                END IF;
                RETURN NEW;
            END IF;

            IF OLD.status IN ('published', 'retired') THEN
                IF TG_OP = 'DELETE' THEN
                    RAISE EXCEPTION 'published course releases cannot be deleted';
                END IF;
                IF NEW.course_key IS DISTINCT FROM OLD.course_key
                   OR NEW.version IS DISTINCT FROM OLD.version
                   OR NEW.schema_version IS DISTINCT FROM OLD.schema_version
                   OR NEW.content_sha256 IS DISTINCT FROM OLD.content_sha256
                   OR NEW.content IS DISTINCT FROM OLD.content
                   OR NEW.published_at IS DISTINCT FROM OLD.published_at
                   OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
                    RAISE EXCEPTION 'published course release snapshots are immutable';
                END IF;
                IF OLD.status = 'retired' AND NEW.status <> 'retired' THEN
                    RAISE EXCEPTION 'retired course releases cannot be reactivated';
                END IF;
                IF OLD.status = 'published' AND NEW.status NOT IN ('published', 'retired') THEN
                    RAISE EXCEPTION 'published course releases may only transition to retired';
                END IF;
            END IF;
            RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
        END;
        $$
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_course_release_immutability
        BEFORE INSERT OR UPDATE OR DELETE ON course_releases
        FOR EACH ROW EXECUTE FUNCTION public.guard_course_release_immutability()
        """
    )


def downgrade() -> None:
    # The grant is provisioned out-of-band. Revoke its narrowly scoped SELECT
    # before removing the restrictive RLS policy, if the dedicated role exists.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'academy_course_publisher') THEN
                REVOKE SELECT ON TABLE tenant_memberships FROM academy_course_publisher;
            END IF;
        END;
        $$
        """
    )
    op.execute(
        "DROP POLICY IF EXISTS tenant_memberships_publisher_select_deny ON tenant_memberships"
    )
    op.execute("DROP TRIGGER IF EXISTS trg_course_release_immutability ON course_releases")
    op.execute("DROP FUNCTION IF EXISTS public.guard_course_release_immutability()")
    op.execute(f"DROP POLICY IF EXISTS {POLICY} ON audit_events")
