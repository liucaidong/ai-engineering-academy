import pytest

from app.security.oidc import (
    derive_csrf_token,
    generate_oidc_login_parameters,
    generate_session_token,
    hash_session_token,
    pkce_s256_challenge,
    verify_csrf_token,
    verify_oidc_nonce,
    verify_oidc_state,
)

CSRF_SECRET = "0123456789abcdef0123456789abcdef"


def test_session_token_is_random_and_only_hash_is_database_safe() -> None:
    first = generate_session_token()
    second = generate_session_token()

    assert first.raw_token != second.raw_token
    assert first.token_hash == hash_session_token(first.raw_token)
    assert len(first.token_hash) == 64
    assert first.raw_token not in first.token_hash


@pytest.mark.parametrize("token", ["", "short", "x" * 513, None])
def test_session_hash_rejects_invalid_token_lengths(token: object) -> None:
    with pytest.raises(ValueError, match="invalid length"):
        hash_session_token(token)


def test_csrf_token_is_bound_to_session_and_secret() -> None:
    session = generate_session_token().raw_token
    csrf = derive_csrf_token(session, CSRF_SECRET)

    assert verify_csrf_token(session, csrf, CSRF_SECRET)
    assert not verify_csrf_token(generate_session_token().raw_token, csrf, CSRF_SECRET)
    assert not verify_csrf_token(session, csrf, "another-secret-value-that-is-32-bytes")
    assert not verify_csrf_token(session, "🙂" * 43, CSRF_SECRET)


def test_csrf_secret_must_have_at_least_32_bytes() -> None:
    with pytest.raises(ValueError, match="32 bytes"):
        derive_csrf_token(generate_session_token().raw_token, "too-short")


def test_pkce_s256_matches_rfc7636_known_vector() -> None:
    verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

    assert pkce_s256_challenge(verifier) == "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"


def test_pkce_rejects_invalid_verifier() -> None:
    with pytest.raises(ValueError, match="43 to 128"):
        pkce_s256_challenge("short")
    with pytest.raises(ValueError, match="unreserved"):
        pkce_s256_challenge("!" * 43)


def test_oidc_login_parameters_are_bound_and_distinct() -> None:
    first = generate_oidc_login_parameters()
    second = generate_oidc_login_parameters()

    assert first.state != first.nonce
    assert first.state != second.state
    assert first.nonce != second.nonce
    assert verify_oidc_state(first.state, first.state_hash)
    assert verify_oidc_nonce(first.nonce, first.nonce_hash)
    assert first.code_challenge == pkce_s256_challenge(first.code_verifier)
    assert len(first.state_hash) == 64
    assert len(first.nonce_hash) == 64


def test_oidc_state_and_nonce_reject_mismatches() -> None:
    parameters = generate_oidc_login_parameters()

    assert not verify_oidc_state("wrong-state-" + parameters.state, parameters.state_hash)
    assert not verify_oidc_nonce("wrong-nonce-" + parameters.nonce, parameters.nonce_hash)
    assert not verify_oidc_state("", parameters.state_hash)
    assert not verify_oidc_nonce("", parameters.nonce_hash)


def test_session_hash_rejects_non_ascii_tokens() -> None:
    with pytest.raises(ValueError, match="ASCII"):
        hash_session_token("😀" * 32)
