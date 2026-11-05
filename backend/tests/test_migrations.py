from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_has_one_linear_initial_revision() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    config = Config(str(backend_dir / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "migrations"))

    scripts = ScriptDirectory.from_config(config)

    assert scripts.get_heads() == ["0001_course_releases"]
    revision = scripts.get_revision("0001_course_releases")
    assert revision is not None
    assert revision.down_revision is None
