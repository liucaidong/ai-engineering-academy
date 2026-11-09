"""Origin and CSRF protection for cookie-authenticated unsafe requests.

The middleware is intentionally not installed by default: deployment must
supply its exact trusted-origin allowlist and a dedicated 256-bit CSRF secret.
"""

import hmac
from urllib.parse import urlsplit

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.security.oidc import verify_csrf_token
from app.security.sessions import CSRF_COOKIE_NAME, SESSION_COOKIE_NAME

UNSAFE_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


def normalize_origin(origin: str) -> str:
    """Accept only a bare HTTP(S) origin; reject paths, credentials and opaque origins."""
    if not isinstance(origin, str) or not origin or origin == "null":
        raise ValueError("Origin header is missing or invalid")
    parsed = urlsplit(origin)
    if (
        parsed.scheme not in {"https", "http"}
        or not parsed.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Origin header must contain only an HTTP(S) origin")
    try:
        _ = parsed.port
    except ValueError as error:
        raise ValueError("Origin header contains an invalid port") from error
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}"


class CSRFSecurityMiddleware(BaseHTTPMiddleware):
    """Require allowlisted Origin and a session-bound double-submit CSRF token."""

    def __init__(
        self,
        app,
        *,
        allowed_origins: set[str] | frozenset[str],
        csrf_secret: str | bytes,
    ) -> None:
        super().__init__(app)
        if (
            not csrf_secret
            or len(csrf_secret.encode("utf-8") if isinstance(csrf_secret, str) else csrf_secret)
            < 32
        ):
            raise ValueError("CSRF secret must contain at least 32 bytes")
        if not allowed_origins:
            raise ValueError("at least one trusted origin must be configured")
        self.allowed_origins = frozenset(normalize_origin(item) for item in allowed_origins)
        self.csrf_secret = csrf_secret

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        if request.method.upper() in UNSAFE_METHODS and SESSION_COOKIE_NAME in request.cookies:
            try:
                origin = normalize_origin(request.headers.get("origin", ""))
            except ValueError:
                return JSONResponse({"detail": "untrusted request origin"}, status_code=403)
            if origin not in self.allowed_origins:
                return JSONResponse({"detail": "untrusted request origin"}, status_code=403)

            session_token = request.cookies.get(SESSION_COOKIE_NAME, "")
            csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME, "")
            csrf_header = request.headers.get("x-csrf-token", "")
            try:
                double_submit_matches = hmac.compare_digest(
                    csrf_cookie.encode("utf-8"),
                    csrf_header.encode("utf-8"),
                )
            except UnicodeError:
                double_submit_matches = False
            if (
                not csrf_cookie
                or not csrf_header
                or not double_submit_matches
                or not verify_csrf_token(session_token, csrf_header, self.csrf_secret)
            ):
                return JSONResponse({"detail": "CSRF validation failed"}, status_code=403)
        return await call_next(request)
