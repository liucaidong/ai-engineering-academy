"""Prevent learner-owned assessment rows from self-grading.

Revision ID: 0009_assessment_grade_guard
Revises: 0008_oidc_identity_provisioning
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0009_assessment_grade_guard"
down_revision: str | None = "0008_oidc_identity_provisioning"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("""
        CREATE FUNCTION public.guard_learner_assessment_fields()
        RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
        SET search_path = pg_catalog, public
        AS $function$
        DECLARE actor_user_id uuid;
        BEGIN
            actor_user_id := NULLIF(current_setting('app.user_id', true), '')::uuid;
            IF actor_user_id IS NULL THEN RETURN NEW; END IF;
            IF TG_OP = 'INSERT' AND NEW.user_id = actor_user_id THEN
                IF NEW.status <> 'draft' OR NEW.grading_mode <> 'self_review'
                    OR NEW.score IS NOT NULL OR NEW.graded_at IS NOT NULL
                    OR NEW.graded_by_user_id IS NOT NULL OR NEW.feedback IS NOT NULL
                THEN
                    RAISE EXCEPTION USING ERRCODE = '42501',
                        MESSAGE = 'learners may only create ungraded self-review drafts';
                END IF;
            ELSIF TG_OP = 'UPDATE' AND OLD.user_id = actor_user_id THEN
                IF NEW.id IS DISTINCT FROM OLD.id
                    OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
                    OR NEW.user_id IS DISTINCT FROM OLD.user_id
                    OR NEW.course_release_id IS DISTINCT FROM OLD.course_release_id
                    OR NEW.assessment_key IS DISTINCT FROM OLD.assessment_key
                    OR NEW.attempt_number IS DISTINCT FROM OLD.attempt_number
                    OR NEW.grading_mode IS DISTINCT FROM OLD.grading_mode
                    OR NEW.created_at IS DISTINCT FROM OLD.created_at
                THEN
                    RAISE EXCEPTION USING ERRCODE = '42501',
                        MESSAGE = 'learners cannot change assessment attempt identity';
                END IF;
                IF OLD.status <> 'draft' OR NEW.status NOT IN ('draft', 'submitted')
                    OR NEW.score IS NOT NULL OR NEW.graded_at IS NOT NULL
                    OR NEW.graded_by_user_id IS NOT NULL OR NEW.feedback IS NOT NULL
                    OR (NEW.status = 'submitted' AND NEW.submitted_at IS NULL)
                THEN
                    RAISE EXCEPTION USING ERRCODE = '42501',
                        MESSAGE = 'learners cannot grade or modify submitted attempts';
                END IF;
            END IF;
            RETURN NEW;
        END;
        $function$;
    """)
    op.execute("""
        CREATE TRIGGER trg_guard_learner_assessment_fields
        BEFORE INSERT OR UPDATE ON assessment_results
        FOR EACH ROW EXECUTE FUNCTION public.guard_learner_assessment_fields()
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_guard_learner_assessment_fields ON assessment_results")
    op.execute("DROP FUNCTION IF EXISTS public.guard_learner_assessment_fields()")
