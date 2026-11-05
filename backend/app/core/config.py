"""Environment-backed service configuration."""
from functools import lru_cache

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="ACADEMY_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    database_url: SecretStr | None = None
    database_required: bool = Field(default=False)

    @model_validator(mode="after")
    def enforce_production_database(self) -> "Settings":
        if self.environment == "production":
            if not self.database_required or self.database_url is None:
                raise ValueError(
                    "Production requires ACADEMY_DATABASE_REQUIRED=true "
                    "and ACADEMY_DATABASE_URL to be configured"
                )
        return self

    @property
    def sqlalchemy_database_url(self) -> str | None:
        if self.database_url is None:
            return None
        return self.database_url.get_secret_value()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
