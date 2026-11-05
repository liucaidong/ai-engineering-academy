from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_has_one_linear_revision_chain() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    config = Config(str(backend_dir / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "migrations"))

    scripts = ScriptDirectory.from_config(config)

    assert scripts.get_heads() == ["0002_release_publication_state"]
    initial = scripts.get_revision("0001_course_releases")
    lifecycle = scripts.get_revision("0002_release_publication_state")

    assert initial is not None
    assert initial.down_revision is None
    assert lifecycle is not None
    assert lifecycle.down_revision == initial.revision
