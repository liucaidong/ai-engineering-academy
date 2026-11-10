"""Strict OIDC discovery and ID-token verification primitives.

This module is deliberately provider-neutral. It validates a configured issuer,
uses HTTPS-only discovery/JWKS endpoints, caches signing keys, refreshes once on
an unknown key id, exchanges authorization codes with PKCE and delegates JWT
cryptography to PyJWT. It does not expose HTTP authentication routes.
"""

from __future__ import annotations

import base64
import time
from dataclasses import dataclass
from typing import Any, Self
from urllib.parse import quote_plus, urlparse

import httpx
import jwt
from pydantic import SecretStr


class OIDCProviderError(ValueError):
    """Raised when provider metadata or an ID token fails validation."""


@dataclass(frozen=True)
class OIDCProviderConfig:
    issuer: str
    client_id: str
    client_secret: SecretStr | None = None
    allowed_algorithms: tuple[str, ...] = ("RS256", "ES256", "PS256")
    cache_ttl_seconds: int = 300
    request_timeout_seconds: float = 5.0
    clock_skew_seconds: int = 60

    def __post_init__(self) -> None:
        parsed = urlparse(self.issuer)
        if (
            parsed.scheme != "https"
            or not parsed.netloc
            or parsed.query
            or parsed.fragment
            or parsed.username is not None
            or parsed.password is not None
        ):
            raise ValueError("OIDC issuer must be a canonical HTTPS URL without query or fragment")
        if not self.client_id or len(self.client_id) > 512:
            raise ValueError("OIDC client_id must contain 1 to 512 characters")
        supported = {"RS256", "PS256", "ES256"}
        if (
            not self.allowed_algorithms
            or len(set(self.allowed_algorithms)) != len(self.allowed_algorithms)
            or any(algorithm not in supported for algorithm in self.allowed_algorithms)
        ):
            raise ValueError("OIDC algorithms must be a non-empty unique safe algorithm allowlist")
        if self.cache_ttl_seconds < 1 or self.cache_ttl_seconds > 86400:
            raise ValueError("OIDC cache TTL must be between 1 and 86400 seconds")
        if self.request_timeout_seconds <= 0 or self.clock_skew_seconds < 0:
            raise ValueError("OIDC timeout must be positive and clock skew cannot be negative")


@dataclass(frozen=True)
class OIDCDiscovery:
    issuer: str
    authorization_endpoint: str
    token_endpoint: str
    jwks_uri: str


class OIDCVerifier:
    """Async metadata/JWKS client with strict ID-token claim validation."""

    def __init__(
        self,
        config: OIDCProviderConfig,
        *,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.config = config
        self._http_client = http_client
        self._owns_http_client = http_client is None
        self._discovery: OIDCDiscovery | None = None
        self._discovery_expires_at = 0.0
        self._jwks: dict[str, dict[str, Any]] = {}
        self._jwks_expires_at = 0.0

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        if self._owns_http_client and self._http_client is not None:
            await self._http_client.aclose()
            self._http_client = None

    async def _client(self) -> httpx.AsyncClient:
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(
                timeout=self.config.request_timeout_seconds,
                follow_redirects=False,
            )
        return self._http_client

    @staticmethod
    def _require_https_endpoint(value: Any, name: str) -> str:
        if not isinstance(value, str):
            raise OIDCProviderError(f"OIDC metadata is missing {name}")
        parsed = urlparse(value)
        if (
            parsed.scheme != "https"
            or not parsed.netloc
            or parsed.username is not None
            or parsed.password is not None
            or parsed.fragment
        ):
            raise OIDCProviderError(f"OIDC {name} must be an HTTPS URL")
        return value

    async def discover(self, *, force_refresh: bool = False) -> OIDCDiscovery:
        now = time.monotonic()
        if not force_refresh and self._discovery is not None and now < self._discovery_expires_at:
            return self._discovery

        url = f"{self.config.issuer.rstrip('/')}/.well-known/openid-configuration"
        try:
            response = await (await self._client()).get(url)
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise OIDCProviderError("OIDC discovery request failed") from error
        if not isinstance(payload, dict) or payload.get("issuer") != self.config.issuer:
            raise OIDCProviderError("OIDC discovery issuer does not exactly match configuration")

        discovery = OIDCDiscovery(
            issuer=self.config.issuer,
            authorization_endpoint=self._require_https_endpoint(
                payload.get("authorization_endpoint"), "authorization_endpoint"
            ),
            token_endpoint=self._require_https_endpoint(
                payload.get("token_endpoint"), "token_endpoint"
            ),
            jwks_uri=self._require_https_endpoint(payload.get("jwks_uri"), "jwks_uri"),
        )
        self._discovery = discovery
        self._discovery_expires_at = now + self.config.cache_ttl_seconds
        return discovery

    async def _load_jwks(self, *, force_refresh: bool = False) -> dict[str, dict[str, Any]]:
        now = time.monotonic()
        if not force_refresh and self._jwks and now < self._jwks_expires_at:
            return self._jwks

        discovery = await self.discover()
        try:
            response = await (await self._client()).get(discovery.jwks_uri)
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise OIDCProviderError("OIDC JWKS request failed") from error

        raw_keys = payload.get("keys") if isinstance(payload, dict) else None
        if not isinstance(raw_keys, list):
            raise OIDCProviderError("OIDC JWKS response has no keys array")

        keys: dict[str, dict[str, Any]] = {}
        for item in raw_keys:
            if not isinstance(item, dict):
                continue
            kid = item.get("kid")
            algorithm = item.get("alg")
            key_ops = item.get("key_ops")
            if (
                isinstance(kid, str)
                and kid
                and item.get("use", "sig") == "sig"
                and (key_ops is None or (isinstance(key_ops, list) and "verify" in key_ops))
                and (algorithm is None or algorithm in self.config.allowed_algorithms)
            ):
                if kid in keys:
                    raise OIDCProviderError("OIDC JWKS contains a duplicate signing key id")
                keys[kid] = item
        if not keys:
            raise OIDCProviderError("OIDC JWKS contains no usable signing keys")
        self._jwks = keys
        self._jwks_expires_at = now + self.config.cache_ttl_seconds
        return keys

    async def exchange_authorization_code(
        self,
        *,
        code: str,
        redirect_uri: str,
        code_verifier: str,
    ) -> str:
        """Exchange one authorization code and return only its ID token.

        Confidential clients use client_secret_basic with RFC 6749 form-encoded
        credentials. Public clients send client_id in the form body and rely on
        PKCE. The access token is deliberately not retained or returned.
        """
        from app.security.oidc import pkce_s256_challenge

        if not isinstance(code, str) or not code or len(code) > 4096:
            raise OIDCProviderError("authorization code is missing or invalid")
        parsed_redirect = urlparse(redirect_uri)
        if (
            parsed_redirect.scheme != "https"
            or not parsed_redirect.netloc
            or parsed_redirect.username is not None
            or parsed_redirect.password is not None
            or parsed_redirect.fragment
        ):
            raise OIDCProviderError("OIDC redirect URI must be an HTTPS callback URL")
        try:
            pkce_s256_challenge(code_verifier)
        except ValueError as error:
            raise OIDCProviderError("PKCE verifier is invalid") from error

        discovery = await self.discover()
        form = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier,
        }
        headers: dict[str, str] = {}
        if self.config.client_secret is not None:
            secret = self.config.client_secret.get_secret_value()
            if not secret:
                raise OIDCProviderError("configured OIDC client secret is empty")
            credentials = f"{quote_plus(self.config.client_id)}:{quote_plus(secret)}"
            headers["Authorization"] = "Basic " + base64.b64encode(
                credentials.encode("utf-8")
            ).decode("ascii")
        else:
            form["client_id"] = self.config.client_id

        try:
            response = await (await self._client()).post(
                discovery.token_endpoint,
                data=form,
                headers=headers,
            )
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise OIDCProviderError("OIDC authorization-code exchange failed") from error

        id_token = payload.get("id_token") if isinstance(payload, dict) else None
        if not isinstance(id_token, str) or not id_token or len(id_token) > 16384:
            raise OIDCProviderError("OIDC token response does not contain a valid ID token")
        return id_token

    async def verify_id_token(
        self,
        encoded_token: str,
        *,
        expected_nonce_hash: str,
    ) -> dict[str, Any]:
        """Verify signature and mandatory OIDC claims; return validated claims."""
        if not isinstance(encoded_token, str) or not encoded_token or len(encoded_token) > 16384:
            raise OIDCProviderError("ID token is missing or exceeds the size limit")
        try:
            header = jwt.get_unverified_header(encoded_token)
        except jwt.PyJWTError as error:
            raise OIDCProviderError("ID token header is malformed") from error

        algorithm = header.get("alg")
        kid = header.get("kid")
        if (
            algorithm not in self.config.allowed_algorithms
            or not isinstance(kid, str)
            or not kid
            or header.get("crit")
            or header.get("b64") is False
        ):
            raise OIDCProviderError("ID token uses an unapproved algorithm or has no key id")

        keys = await self._load_jwks()
        jwk_data = keys.get(kid)
        if jwk_data is None:
            keys = await self._load_jwks(force_refresh=True)
            jwk_data = keys.get(kid)
        if jwk_data is None or jwk_data.get("alg", algorithm) != algorithm:
            raise OIDCProviderError("ID token signing key is not present in the configured JWKS")

        try:
            signing_key = jwt.PyJWK.from_dict(jwk_data, algorithm=algorithm).key
            claims = jwt.decode(
                encoded_token,
                signing_key,
                algorithms=list(self.config.allowed_algorithms),
                issuer=self.config.issuer,
                audience=self.config.client_id,
                leeway=self.config.clock_skew_seconds,
                options={
                    "require": ["iss", "sub", "aud", "exp", "iat", "nonce"],
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_iss": True,
                    "verify_aud": True,
                },
            )
        except jwt.PyJWTError as error:
            raise OIDCProviderError(
                "ID token signature or registered claims are invalid"
            ) from error

        audiences = claims.get("aud")
        if isinstance(audiences, list) and len(audiences) > 1:
            if claims.get("azp") != self.config.client_id:
                raise OIDCProviderError(
                    "ID token azp must identify this client for multiple audiences"
                )
        elif claims.get("azp") is not None and claims.get("azp") != self.config.client_id:
            raise OIDCProviderError("ID token azp does not match the configured client")
        subject = claims.get("sub")
        if (
            not isinstance(subject, str)
            or not subject
            or len(subject) > 255
            or not subject.isascii()
        ):
            raise OIDCProviderError("ID token subject is invalid")

        from app.security.oidc import verify_oidc_nonce

        nonce = claims.get("nonce")
        if not isinstance(nonce, str) or not verify_oidc_nonce(nonce, expected_nonce_hash):
            raise OIDCProviderError("ID token nonce does not match the login transaction")
        return claims
