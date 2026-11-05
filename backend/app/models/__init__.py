"""Import model modules here so Alembic can discover all mapped tables."""
from app.models.course_release import CourseRelease

__all__ = ["CourseRelease"]
