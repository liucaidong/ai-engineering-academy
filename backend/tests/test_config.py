from cryptography.fernet import Fernet
from pydantic import SecretStr, ValidationError
import pytest

from app.core.config import Settings


def valid_oidc_settings(**overrides) -> Settings:
    values = {
        "_env_file": None,
        "database_required": True,
        "database_url": SecretStr("postgresql+asyncpg://academy:test@localhost/academy"),
        "oidc_issuer": "https://identity.example.test",
        "oidc_client_id": "academy-web",
        "oidc_redirect_uri": "https://api.example.test/auth/callback",
        "oidc_transaction_encryption_key": SecretStr(Fernet.generate_key().decode("ascii")),
        "oidc_allowed_origins": ["https://academy.example.test"],
        "oidc_post_login_redirect_url": "https://academy.example.test/",
        "csrf_secret": SecretStr("x" * 48),
    }
    values.update(overrides)
    return Settings(**values)


def test_oidc_is_disabled_when_no_provider_configuration_is_present() -> None:
    settings = Settings(_env_file=None)
    assert settings.oidc_login_enabled is False


def test_partial_oidc_configuration_fails_closed() -> None:
    with pytest.raises(ValidationError, match="OIDC activation requires"):
        Settings(_env_file=None, oidc_issuer="https://identity.example.test")


def test_complete_oidc_configuration_is_validated_and_normalized() -> None:
    settings = valid_oidc_settings(oidc_allowed_origins=["HTTPS://Academy.Example.Test:443"])
    assert settings.oidc_login_enabled is True
    assert settings.oidc_allowed_origins == ["https://academy.example.test"]
    assert settings.oidc_provider_config.client_id == "academy-web"


def test_post_login_redirect_must_be_allowlisted() -> None:
    with pytest.raises(ValidationError, match="allowed-origin"):
        valid_oidc_settings(
            oidc_post_login_redirect_url="https://other.example.test/"
        )


def test_production_oidc_requires_secure_session_cookie() -> None:
    with pytest.raises(ValidationError, match="Secure cookies"):
        valid_oidc_settings(
            environment="production",
            session_cookie_secure=False,
        )


def test_oidc_requires_database_and_valid_csrf_secret() -> None:
    with pytest.raises(ValidationError, match="database"):
        valid_oidc_settings(database_required=False)
    with pytest.raises(ValidationError, match="CSRF secret"):
        valid_oidc_settings(csrf_secret=SecretStr("too-short"))
