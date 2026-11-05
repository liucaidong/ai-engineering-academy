from __future__ import annotations

import base64
import time
from urllib.parse import parse_qs


import httpx
import jwt
import pytest
from pydantic import SecretStr
from cryptography.hazmat.primitives.asymmetric import rsa

from app.security.oidc import generate_oidc_login_parameters
from app.security.oidc_provider import OIDCProviderConfig, OIDCProviderError, OIDCVerifier


ISSUER = "https://identity.example.test"
CLIENT_ID = "academy-web"
PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
PUBLIC_JWK = jwt.algorithms.RSAAlgorithm.to_jwk(PRIVATE_KEY.public_key(), as_dict=True)
PUBLIC_JWK.update({"kid": "test-key-1", "use": "sig", "alg": "RS256"})


def make_verifier(*, issuer: str = ISSUER, jwks: list[dict] | None = None):
    metadata = {
        "issuer": ISSUER,
        "authorization_endpoint": ISSUER + "/authorize",
        "token_endpoint": ISSUER + "/token",
        "jwks_uri": ISSUER + "/jwks",
    }
    responses = {
        issuer + "/.well-known/openid-configuration": metadata,
        ISSUER + "/jwks": {"keys": jwks if jwks is not None else [PUBLIC_JWK]},
    }

    async def handler(request: httpx.Request) -> httpx.Response:
        payload = responses.get(str(request.url))
        if payload is None:
            return httpx.Response(404)
        return httpx.Response(200, json=payload)

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    verifier = OIDCVerifier(
        OIDCProviderConfig(issuer=issuer, client_id=CLIENT_ID),
        http_client=client,
    )
    return verifier, client


def signed_token(*, nonce: str, overrides: dict | None = None) -> str:
    now = int(time.time())
    claims = {
        "iss": ISSUER,
        "sub": "user-123",
        "aud": CLIENT_ID,
        "iat": now,
        "exp": now + 300,
        "nonce": nonce,
    }
    claims.update(overrides or {})
    return jwt.encode(claims, PRIVATE_KEY, algorithm="RS256", headers={"kid": "test-key-1"})


@pytest.mark.asyncio
async def test_discovery_and_signed_id_token_verification() -> None:
    parameters = generate_oidc_login_parameters()
    verifier, client = make_verifier()
    try:
        claims = await verifier.verify_id_token(
            signed_token(nonce=parameters.nonce),
            expected_nonce_hash=parameters.nonce_hash,
        )
        assert claims["sub"] == "user-123"
        assert await verifier.discover() == await verifier.discover()
    finally:
        await client.aclose()


@pytest.mark.asyncio
async def test_discovery_rejects_issuer_mismatch() -> None:
    verifier, client = make_verifier(issuer="https://attacker.example.test")
    try:
        with pytest.raises(OIDCProviderError, match="issuer"):
            await verifier.discover()
    finally:
        await client.aclose()


@pytest.mark.asyncio
async def test_id_token_rejects_nonce_mismatch_and_wrong_audience() -> None:
    parameters = generate_oidc_login_parameters()
    verifier, client = make_verifier()
    try:
        with pytest.raises(OIDCProviderError, match="nonce"):
            await verifier.verify_id_token(
                signed_token(nonce="x" * 43),
                expected_nonce_hash=parameters.nonce_hash,
            )
        with pytest.raises(OIDCProviderError, match="claims"):
            await verifier.verify_id_token(
                signed_token(nonce=parameters.nonce, overrides={"aud": "another-client"}),
                expected_nonce_hash=parameters.nonce_hash,
            )
    finally:
        await client.aclose()


@pytest.mark.asyncio
async def test_id_token_rejects_missing_or_wrong_azp_for_multiple_audiences() -> None:
    parameters = generate_oidc_login_parameters()
    verifier, client = make_verifier()
    try:
        token = signed_token(
            nonce=parameters.nonce,
            overrides={"aud": [CLIENT_ID, "other-audience"]},
        )
        with pytest.raises(OIDCProviderError, match="azp"):
            await verifier.verify_id_token(token, expected_nonce_hash=parameters.nonce_hash)
    finally:
        await client.aclose()


def test_provider_configuration_is_fail_closed() -> None:
    with pytest.raises(ValueError, match="HTTPS"):
        OIDCProviderConfig(issuer="http://identity.example.test", client_id=CLIENT_ID)
    with pytest.raises(ValueError, match="allowlist"):
        OIDCProviderConfig(
            issuer=ISSUER,
            client_id=CLIENT_ID,
            allowed_algorithms=("none",),  # type: ignore[arg-type]
        )



@pytest.mark.asyncio
async def test_public_client_code_exchange_sends_client_id_and_pkce() -> None:
    parameters = generate_oidc_login_parameters()
    captured = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "GET":
            return httpx.Response(
                200,
                json={
                    "issuer": ISSUER,
                    "authorization_endpoint": ISSUER + "/authorize",
                    "token_endpoint": ISSUER + "/token",
                    "jwks_uri": ISSUER + "/jwks",
                },
            )
        captured["form"] = parse_qs(request.content.decode("ascii"))
        return httpx.Response(200, json={"id_token": "signed-id-token"})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    verifier = OIDCVerifier(
        OIDCProviderConfig(issuer=ISSUER, client_id=CLIENT_ID),
        http_client=client,
    )
    try:
        result = await verifier.exchange_authorization_code(
            code="one-time-code",
            redirect_uri="https://academy.example.test/auth/callback",
            code_verifier=parameters.code_verifier,
        )
    finally:
        await client.aclose()

    assert result == "signed-id-token"
    assert captured["form"]["grant_type"] == ["authorization_code"]
    assert captured["form"]["client_id"] == [CLIENT_ID]
    assert captured["form"]["code_verifier"] == [parameters.code_verifier]


@pytest.mark.asyncio
async def test_confidential_client_code_exchange_uses_encoded_basic_auth() -> None:
    parameters = generate_oidc_login_parameters()
    captured = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "GET":
            return httpx.Response(
                200,
                json={
                    "issuer": ISSUER,
                    "authorization_endpoint": ISSUER + "/authorize",
                    "token_endpoint": ISSUER + "/token",
                    "jwks_uri": ISSUER + "/jwks",
                },
            )
        captured["authorization"] = request.headers.get("authorization", "")
        captured["form"] = parse_qs(request.content.decode("ascii"))
        return httpx.Response(200, json={"id_token": "signed-id-token"})

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    verifier = OIDCVerifier(
        OIDCProviderConfig(
            issuer=ISSUER,
            client_id=CLIENT_ID,
            client_secret=SecretStr("p@ss:word"),
        ),
        http_client=client,
    )
    try:
        result = await verifier.exchange_authorization_code(
            code="one-time-code",
            redirect_uri="https://academy.example.test/auth/callback",
            code_verifier=parameters.code_verifier,
        )
    finally:
        await client.aclose()

    decoded = base64.b64decode(captured["authorization"].removeprefix("Basic ")).decode("utf-8")
    assert result == "signed-id-token"
    assert decoded == "academy-web:p%40ss%3Aword"
    assert "client_id" not in captured["form"]
    assert captured["form"]["code_verifier"] == [parameters.code_verifier]
