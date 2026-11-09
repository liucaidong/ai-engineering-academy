"""OIDC Authorization Code + PKCE routes; disabled until explicitly configured."""

import hmac
from datetime import timedelta
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.config import Settings, get_settings
from app.db.session import transaction_scope
from app.security.oidc import derive_csrf_token
from app.security.oidc_provider import OIDCProviderError, OIDCVerifier
from app.security.oidc_transactions import (
    OIDCLoginTransactionError,
    build_authorization_url,
    consume_login_transaction,
    create_login_transaction,
)
from app.security.sessions import (
    SESSION_COOKIE_NAME,
    clear_session_cookies,
    create_session,
    resolve_session,
    revoke_session,
    set_session_cookies,
)
from app.services.oidc_identity import (
    OIDCIdentityRejected,
    resolve_or_provision_oidc_identity,
)

router = APIRouter(prefix="/auth", tags=["auth"])
OIDC_STATE_COOKIE_NAME = "__Host-academy_oidc_state"
OIDC_LOGIN_TRANSACTION_TTL_SECONDS = 300


def _settings() -> Settings:
    settings = get_settings()
    if not settings.oidc_login_enabled:
        raise HTTPException(status_code=503, detail="Authentication is not configured")
    return settings


async def _database(request: Request):
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise HTTPException(status_code=503, detail="Database is unavailable")
    try:
        await database.check_schema_revision("0011_personal_tenant_bootstrap")
    except (SQLAlchemyError, RuntimeError, ValueError) as error:
        raise HTTPException(
            status_code=503,
            detail="Database migrations are not at the required revision",
        ) from error
    return database


def _verifier(request: Request) -> OIDCVerifier:
    verifier = getattr(request.app.state, "oidc_verifier", None)
    if verifier is None:
        raise HTTPException(status_code=503, detail="OIDC provider is unavailable")
    return verifier


@router.get("/login")
async def login(request: Request) -> RedirectResponse:
    settings = _settings()
    verifier = _verifier(request)
    database = await _database(request)
    try:
        discovery = await verifier.discover()
        async with transaction_scope(database) as db:
            login_transaction = await create_login_transaction(
                db,
                redirect_uri=settings.oidc_redirect_uri,
                encryption_key=settings.oidc_transaction_key,
            )
        authorization_url = build_authorization_url(
            authorization_endpoint=discovery.authorization_endpoint,
            client_id=settings.oidc_client_id,
            login=login_transaction,
            scopes=settings.oidc_scopes,
        )
    except OIDCProviderError as error:
        raise HTTPException(status_code=503, detail="Identity provider is unavailable") from error
    except OIDCLoginTransactionError as error:
        raise HTTPException(status_code=503, detail="Unable to start sign-in") from error
    response = RedirectResponse(authorization_url, status_code=303)
    response.set_cookie(
        key=OIDC_STATE_COOKIE_NAME,
        value=login_transaction.state,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
        max_age=OIDC_LOGIN_TRANSACTION_TTL_SECONDS,
    )
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response


@router.get("/callback")
async def callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    settings = _settings()
    browser_state = request.cookies.get(OIDC_STATE_COOKIE_NAME)
    if (
        not state
        or not browser_state
        or not hmac.compare_digest(browser_state.encode("utf-8"), state.encode("utf-8"))
    ):
        raise HTTPException(status_code=400, detail="Invalid sign-in response")
    verifier = _verifier(request)
    database = await _database(request)

    try:
        async with transaction_scope(database) as db:
            login_transaction = await consume_login_transaction(
                db,
                state=state,
                encryption_key=settings.oidc_transaction_key,
            )
    except OIDCLoginTransactionError as exception:
        raise HTTPException(status_code=400, detail="Invalid sign-in response") from exception
    if login_transaction is None:
        raise HTTPException(status_code=400, detail="Invalid or expired sign-in transaction")
    if error is not None or not code:
        raise HTTPException(status_code=400, detail="Sign-in was not completed")

    try:
        id_token = await verifier.exchange_authorization_code(
            code=code,
            redirect_uri=login_transaction.redirect_uri,
            code_verifier=login_transaction.code_verifier,
        )
        claims = await verifier.verify_id_token(
            id_token,
            expected_nonce_hash=login_transaction.nonce_hash,
        )
    except OIDCProviderError as exception:
        raise HTTPException(
            status_code=401, detail="Identity provider response was rejected"
        ) from exception

    async def provision_and_create_session():
        async with transaction_scope(database) as db:
            identity = await resolve_or_provision_oidc_identity(
                db,
                claims=claims,
                request_id=uuid4().hex,
            )
            _session_record, raw_token = await create_session(
                db,
                user_id=identity.user_id,
                ttl=timedelta(seconds=settings.session_ttl_seconds),
            )
            return raw_token

    try:
        raw_session_token = await provision_and_create_session()
    except IntegrityError:
        # Concurrent first sign-ins can race on issuer/subject or personal-tenant
        # uniqueness. The failed transaction is rolled back before resolving again.
        try:
            raw_session_token = await provision_and_create_session()
        except OIDCIdentityRejected as exception:
            raise HTTPException(
                status_code=403, detail="This account cannot sign in"
            ) from exception
    except OIDCIdentityRejected as exception:
        raise HTTPException(status_code=403, detail="This account cannot sign in") from exception

    response = RedirectResponse(settings.oidc_post_login_redirect_url, status_code=303)
    set_session_cookies(
        response,
        raw_session_token=raw_session_token,
        csrf_secret=settings.csrf_secret_value,
        max_age_seconds=settings.session_ttl_seconds,
        secure=settings.session_cookie_secure,
    )
    response.delete_cookie(
        key=OIDC_STATE_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response


@router.get("/me")
async def current_session(request: Request) -> JSONResponse:
    _settings()
    database = await _database(request)
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    async with transaction_scope(database) as db:
        resolved = await resolve_session(db, raw_token)
    if resolved is None:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")
    response = JSONResponse(
        {
            "user_id": str(resolved.user_id),
            "expires_at": resolved.expires_at.isoformat(),
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/csrf")
async def csrf_token(request: Request) -> JSONResponse:
    """Return a session-bound CSRF token to an allowlisted credentialed frontend."""
    settings = _settings()
    database = await _database(request)
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    async with transaction_scope(database) as db:
        resolved = await resolve_session(db, raw_token)
    if resolved is None:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")
    response = JSONResponse(
        {"csrf_token": derive_csrf_token(raw_token, settings.csrf_secret_value)}
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request) -> Response:
    settings = _settings()
    database = await _database(request)
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if raw_token:
        async with transaction_scope(database) as db:
            await revoke_session(db, raw_token)
    response = Response(status_code=204)
    clear_session_cookies(response, secure=settings.session_cookie_secure)
    response.headers["Cache-Control"] = "no-store"
    return response
