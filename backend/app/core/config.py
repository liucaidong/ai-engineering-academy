"""Environment-backed service configuration with fail-closed OIDC activation."""
from functools import lru_cache
from urllib.parse import urlsplit

from cryptography.fernet import Fernet
from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.security.oidc_provider import OIDCProviderConfig


def _normalize_origin(value: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("OIDC allowed origins must be bare HTTPS origins")
    try:
        port = parsed.port
    except ValueError as error:
        raise ValueError("OIDC allowed origin contains an invalid port") from error
    host = parsed.hostname
    if not host:
        raise ValueError("OIDC allowed origin must contain a hostname")
    host = f"[{host.lower()}]" if ":" in host else host.lower()
    if port is not None and port != 443:
        host = f"{host}:{port}"
    return f"https://{host}"


def _validate_https_url(value: str, name: str) -> None:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
    ):
        raise ValueError(f"{name} must be an absolute HTTPS URL without credentials or fragment")
    try:
        _ = parsed.port
    except ValueError as error:
        raise ValueError(f"{name} contains an invalid port") from error


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

    oidc_issuer: str | None = None
    oidc_client_id: str | None = None
    oidc_client_secret: SecretStr | None = None
    oidc_redirect_uri: str | None = None
    oidc_transaction_encryption_key: SecretStr | None = None
    oidc_allowed_origins: list[str] = Field(default_factory=list)
    oidc_post_login_redirect_url: str | None = None
    oidc_allowed_algorithms: tuple[str, ...] = ("RS256", "ES256", "PS256")
    oidc_scopes: tuple[str, ...] = ("openid", "profile", "email")
    oidc_jwks_cache_ttl_seconds: int = 300
    oidc_request_timeout_seconds: float = 5.0
    oidc_clock_skew_seconds: int = 60

    csrf_secret: SecretStr | None = None
    session_ttl_seconds: int = 43200
    session_cookie_secure: bool = True
    learner_data_api_enabled: bool = False

    @model_validator(mode="after")
    def enforce_production_database(self) -> "Settings":
        if self.environment == "production":
            if not self.database_required or self.database_url is None:
                raise ValueError(
                    "Production requires ACADEMY_DATABASE_REQUIRED=true "
                    "and ACADEMY_DATABASE_URL to be configured"
                )
        return self

    @model_validator(mode="after")
    def validate_oidc_configuration(self) -> "Settings":
        required_values = (
            self.oidc_issuer,
            self.oidc_client_id,
            self.oidc_redirect_uri,
            self.oidc_transaction_encryption_key,
            self.oidc_post_login_redirect_url,
            self.csrf_secret,
        )
        configured = (
            any(value is not None for value in required_values)
            or self.oidc_client_secret is not None
            or bool(self.oidc_allowed_origins)
            or self.learner_data_api_enabled
        )
        if not configured:
            return self

        if any(value is None for value in required_values) or not self.oidc_allowed_origins:
            raise ValueError(
                "OIDC activation requires issuer, client ID, redirect URI, encryption key, "
                "post-login URL, CSRF secret and allowed origins"
            )
        if not self.database_required or self.database_url is None:
            raise ValueError("OIDC sign-in requires ACADEMY_DATABASE_REQUIRED=true and a database URL")
        if self.environment == "production" and not self.session_cookie_secure:
            raise ValueError("Production OIDC sessions require Secure cookies")
        if not 300 <= self.session_ttl_seconds <= 90 * 24 * 60 * 60:
            raise ValueError("Session TTL must be between 5 minutes and 90 days")
        if len(self.csrf_secret.get_secret_value().encode("utf-8")) < 32:
            raise ValueError("CSRF secret must contain at least 32 bytes")
        try:
            Fernet(self.oidc_transaction_encryption_key.get_secret_value().encode("ascii"))
        except (TypeError, ValueError) as error:
            raise ValueError("OIDC transaction encryption key must be a valid Fernet key") from error

        OIDCProviderConfig(
            issuer=self.oidc_issuer,
            client_id=self.oidc_client_id,
            client_secret=self.oidc_client_secret,
            allowed_algorithms=self.oidc_allowed_algorithms,
            cache_ttl_seconds=self.oidc_jwks_cache_ttl_seconds,
            request_timeout_seconds=self.oidc_request_timeout_seconds,
            clock_skew_seconds=self.oidc_clock_skew_seconds,
        )
        _validate_https_url(self.oidc_redirect_uri, "OIDC redirect URI")
        _validate_https_url(self.oidc_post_login_redirect_url, "Post-login redirect URL")
        origins = [_normalize_origin(origin) for origin in self.oidc_allowed_origins]
        if len(set(origins)) != len(origins):
            raise ValueError("OIDC allowed origins must be unique")
        self.oidc_allowed_origins = origins
        post_login = urlsplit(self.oidc_post_login_redirect_url)
        post_login_origin = _normalize_origin(f"{post_login.scheme}://{post_login.netloc}")
        if post_login_origin not in set(origins):
            raise ValueError("Post-login redirect origin must be in the OIDC allowed-origin list")
        if not self.oidc_scopes or "openid" not in self.oidc_scopes:
            raise ValueError("OIDC scopes must include openid")
        if len(set(self.oidc_scopes)) != len(self.oidc_scopes):
            raise ValueError("OIDC scopes must be unique")
        return self

    @property
    def oidc_login_enabled(self) -> bool:
        return self.oidc_issuer is not None

    @property
    def oidc_provider_config(self) -> OIDCProviderConfig:
        if not self.oidc_login_enabled:
            raise RuntimeError("OIDC sign-in is not configured")
        return OIDCProviderConfig(
            issuer=self.oidc_issuer,
            client_id=self.oidc_client_id,
            client_secret=self.oidc_client_secret,
            allowed_algorithms=self.oidc_allowed_algorithms,
            cache_ttl_seconds=self.oidc_jwks_cache_ttl_seconds,
            request_timeout_seconds=self.oidc_request_timeout_seconds,
            clock_skew_seconds=self.oidc_clock_skew_seconds,
        )

    @property
    def oidc_transaction_key(self) -> str:
        if self.oidc_transaction_encryption_key is None:
            raise RuntimeError("OIDC transaction encryption key is not configured")
        return self.oidc_transaction_encryption_key.get_secret_value()

    @property
    def csrf_secret_value(self) -> str:
        if self.csrf_secret is None:
            raise RuntimeError("CSRF secret is not configured")
        return self.csrf_secret.get_secret_value()

    @property
    def sqlalchemy_database_url(self) -> str | None:
        if self.database_url is None:
            return None
        return self.database_url.get_secret_value()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
