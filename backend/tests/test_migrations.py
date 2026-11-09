from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_has_one_linear_revision_chain() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    config = Config(str(backend_dir / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "migrations"))

    scripts = ScriptDirectory.from_config(config)

    revision_ids = [
        "0001_course_releases",
        "0002_release_publication_state",
        "0003_identity_tenancy",
        "0004_tenant_rls",
        "0005_learner_records",
        "0006_session_lookup_rls",
        "0007_oidc_login_transactions",
        "0008_oidc_identity_provisioning",
        "0009_assessment_grade_guard",
        "0010_tenant_membership_discovery",
        "0011_personal_tenant_bootstrap",
    ]
    assert all(len(revision_id) <= 32 for revision_id in revision_ids)
    assert scripts.get_heads() == [revision_ids[-1]]

    previous = None
    for revision_id in revision_ids:
        revision = scripts.get_revision(revision_id)
        assert revision is not None
        assert revision.down_revision == previous
        previous = revision.revision
