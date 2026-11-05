"""Provider-neutral cryptographic primitives for the future OIDC adapter.

This module does not perform OIDC discovery, token exchange or JWT signature
verification. Those operations must be implemented by the provider adapter
before any authentication route is enabled.
"""
from dataclasses import dataclass
import base64
import hashlib
import hmac
import secrets
import string


@dataclass(frozen=True)
class OpaqueSessionToken:
    raw_token: str
    token_hash: str


@dataclass(frozen=True)
class OIDCLoginParameters:
    state: str
    state_hash: str
    nonce: str
    nonce_hash: str
    code_verifier: str
    code_challenge: str


def _base64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_session_token() -> OpaqueSessionToken:
    """Generate a 256-bit opaque session token and its database-safe hash."""
    raw_token = secrets.token_urlsafe(32)
    return OpaqueSessionToken(raw_token=raw_token, token_hash=sha256_hex(raw_token))


def hash_session_token(raw_token: str) -> str:
    if not isinstance(raw_token, str) or not 32 <= len(raw_token) <= 512:
        raise ValueError("session token has an invalid length")
    try:
        raw_token.encode("ascii")
    except UnicodeEncodeError as error:
        raise ValueError("session token must be ASCII") from error
    return sha256_hex(raw_token)


def derive_csrf_token(raw_session_token: str, secret: str | bytes) -> str:
    """Derive a session-bound double-submit token using a server-side secret."""
    key = secret.encode("utf-8") if isinstance(secret, str) else secret
    if len(key) < 32:
        raise ValueError("CSRF secret must contain at least 32 bytes")
    if not isinstance(raw_session_token, str) or len(raw_session_token) < 32:
        raise ValueError("session token has an invalid length")
    try:
        raw_session_token.encode("ascii")
    except UnicodeEncodeError as error:
        raise ValueError("session token must be ASCII") from error
    digest = hmac.new(
        key,
        b"ai-engineering-academy:csrf:v1:" + raw_session_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _base64url(digest)


def verify_csrf_token(
    raw_session_token: str,
    supplied_token: str,
    secret: str | bytes,
) -> bool:
    try:
        expected = derive_csrf_token(raw_session_token, secret)
    except (TypeError, ValueError):
        return False
    if not isinstance(supplied_token, str):
        return False
    try:
        return hmac.compare_digest(expected, supplied_token)
    except TypeError:
        return False


def generate_pkce_verifier() -> str:
    """Generate an RFC 7636-compatible high-entropy code verifier."""
    return secrets.token_urlsafe(32)


def pkce_s256_challenge(code_verifier: str) -> str:
    if not isinstance(code_verifier, str) or not 43 <= len(code_verifier) <= 128:
        raise ValueError("PKCE verifier must contain 43 to 128 characters")
    allowed = string.ascii_letters + string.digits + "-._~"
    if any(character not in allowed for character in code_verifier):
        raise ValueError("PKCE verifier contains characters outside RFC 7636 unreserved set")
    return _base64url(hashlib.sha256(code_verifier.encode("ascii")).digest())


def generate_oidc_login_parameters() -> OIDCLoginParameters:
    """Create state, nonce and PKCE values for one short-lived login attempt.

    Persist only state_hash and nonce_hash. The code verifier must be stored
    server-side with authenticated encryption until the callback consumes it.
    Never put the verifier in a browser-readable cookie or log it.
    """
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    verifier = generate_pkce_verifier()
    return OIDCLoginParameters(
        state=state,
        state_hash=sha256_hex(state),
        nonce=nonce,
        nonce_hash=sha256_hex(nonce),
        code_verifier=verifier,
        code_challenge=pkce_s256_challenge(verifier),
    )


def verify_oidc_state(supplied_state: str, expected_state_hash: str) -> bool:
    if (
        not isinstance(supplied_state, str)
        or not 32 <= len(supplied_state) <= 512
        or not isinstance(expected_state_hash, str)
        or len(expected_state_hash) != 64
    ):
        return False
    return hmac.compare_digest(sha256_hex(supplied_state), expected_state_hash)


def verify_oidc_nonce(id_token_nonce: str, expected_nonce_hash: str) -> bool:
    if (
        not isinstance(id_token_nonce, str)
        or not 32 <= len(id_token_nonce) <= 512
        or not isinstance(expected_nonce_hash, str)
        or len(expected_nonce_hash) != 64
    ):
        return False
    return hmac.compare_digest(sha256_hex(id_token_nonce), expected_nonce_hash)
