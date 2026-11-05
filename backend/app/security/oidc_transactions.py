"""One-time OIDC login transaction storage with encrypted PKCE verifier."""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import UUID

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import clear_oidc_state_context, set_oidc_state_context
from app.models.identity import OIDCLoginTransaction
from app.security.oidc import generate_oidc_login_parameters, sha256_hex


class OIDCLoginTransactionError(ValueError):
    """Raised when an OIDC login transaction cannot be safely consumed."""


@dataclass(frozen=True)
class OIDCLoginStart:
    state: str
    nonce: str
    code_challenge: str
    redirect_uri: str
    expires_at: datetime


@dataclass(frozen=True)
class ConsumedOIDCLogin:
    transaction_id: UUID
    nonce_hash: str
    code_verifier: str
    redirect_uri: str


def _cipher(encryption_key: str | bytes) -> Fernet:
    key = encryption_key.encode("ascii") if isinstance(encryption_key, str) else encryption_key
    try:
        return Fernet(key)
    except (TypeError, ValueError) as error:
        raise ValueError("OIDC transaction encryption key must be a valid Fernet key") from error


def _validate_redirect_uri(redirect_uri: str) -> None:
    parsed = urlsplit(redirect_uri)
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
    ):
        raise ValueError("OIDC redirect URI must be an absolute HTTPS URL without a fragment")


async def create_login_transaction(
    db: AsyncSession,
    *,
    redirect_uri: str,
    encryption_key: str | bytes,
    ttl: timedelta = timedelta(minutes=5),
    now: datetime | None = None,
) -> OIDCLoginStart:
    """Persist only state/nonce hashes and an encrypted PKCE verifier."""
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("OIDC transaction timestamps must be timezone-aware")
    if ttl.total_seconds() <= 0 or ttl > timedelta(minutes=15):
        raise ValueError("OIDC transaction TTL must be greater than zero and at most 15 minutes")
    _validate_redirect_uri(redirect_uri)
    cipher = _cipher(encryption_key)
    parameters = generate_oidc_login_parameters()
    record = OIDCLoginTransaction(
        state_hash=parameters.state_hash,
        nonce_hash=parameters.nonce_hash,
        code_verifier_ciphertext=cipher.encrypt(
            parameters.code_verifier.encode("ascii")
        ).decode("ascii"),
        redirect_uri=redirect_uri,
        created_at=current,
        expires_at=current + ttl,
    )
    await set_oidc_state_context(db, parameters.state_hash)
    db.add(record)
    await db.flush()
    await clear_oidc_state_context(db)
    return OIDCLoginStart(
        state=parameters.state,
        nonce=parameters.nonce,
        code_challenge=parameters.code_challenge,
        redirect_uri=redirect_uri,
        expires_at=record.expires_at,
    )


async def consume_login_transaction(
    db: AsyncSession,
    *,
    state: str,
    encryption_key: str | bytes,
    now: datetime | None = None,
) -> ConsumedOIDCLogin | None:
    """Atomically consume a state exactly once and decrypt its PKCE verifier."""
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        raise ValueError("OIDC transaction timestamps must be timezone-aware")
    if not isinstance(state, str) or not 32 <= len(state) <= 512:
        return None
    try:
        state.encode("ascii")
    except UnicodeEncodeError:
        return None

    state_hash = sha256_hex(state)
    await set_oidc_state_context(db, state_hash)
    result = await db.execute(
        select(OIDCLoginTransaction)
        .where(
            OIDCLoginTransaction.state_hash == state_hash,
            OIDCLoginTransaction.consumed_at.is_(None),
            OIDCLoginTransaction.expires_at > current,
        )
        .with_for_update()
    )
    record = result.scalar_one_or_none()
    if record is None:
        await clear_oidc_state_context(db)
        return None

    try:
        code_verifier = _cipher(encryption_key).decrypt(
            record.code_verifier_ciphertext.encode("ascii")
        ).decode("ascii")
    except (InvalidToken, UnicodeDecodeError, ValueError) as error:
        raise OIDCLoginTransactionError("OIDC transaction verifier could not be decrypted") from error

    record.consumed_at = current
    await db.flush()
    await clear_oidc_state_context(db)
    return ConsumedOIDCLogin(
        transaction_id=record.id,
        nonce_hash=record.nonce_hash,
        code_verifier=code_verifier,
        redirect_uri=record.redirect_uri,
    )


def build_authorization_url(
    *,
    authorization_endpoint: str,
    client_id: str,
    login: OIDCLoginStart,
    scopes: tuple[str, ...] = ("openid", "profile", "email"),
) -> str:
    """Build an Authorization Code + PKCE URL without accepting caller query overrides."""
    parsed = urlsplit(authorization_endpoint)
    if parsed.scheme != "https" or not parsed.netloc or parsed.fragment:
        raise ValueError("OIDC authorization endpoint must be an HTTPS URL")
    normalized_scopes = tuple(dict.fromkeys(("openid", *scopes)))
    if not client_id or any(not scope or " " in scope for scope in normalized_scopes):
        raise ValueError("OIDC client ID and scopes must be valid")
    parameters = dict(parse_qsl(parsed.query, keep_blank_values=True))
    parameters.update(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": login.redirect_uri,
            "scope": " ".join(normalized_scopes),
            "state": login.state,
            "nonce": login.nonce,
            "code_challenge": login.code_challenge,
            "code_challenge_method": "S256",
        }
    )
    return urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urlencode(parameters), "")
    )
