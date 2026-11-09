from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

import pytest
from cryptography.fernet import Fernet

from app.models.identity import OIDCLoginTransaction
from app.security.oidc import sha256_hex
from app.security.oidc_transactions import (
    OIDCLoginTransactionError,
    build_authorization_url,
    consume_login_transaction,
    create_login_transaction,
)

KEY = Fernet.generate_key()
REDIRECT_URI = "https://academy.example.test/auth/callback"


def fake_db(*results):
    return SimpleNamespace(
        execute=AsyncMock(side_effect=list(results)),
        add=MagicMock(),
        flush=AsyncMock(),
        in_transaction=MagicMock(return_value=True),
    )


@pytest.mark.asyncio
async def test_login_transaction_stores_only_hashes_and_encrypted_verifier() -> None:
    now = datetime(2026, 11, 5, tzinfo=UTC)
    db = fake_db(None, None)

    login = await create_login_transaction(
        db,
        redirect_uri=REDIRECT_URI,
        encryption_key=KEY,
        now=now,
    )

    record = db.add.call_args.args[0]
    verifier = Fernet(KEY).decrypt(record.code_verifier_ciphertext.encode("ascii")).decode("ascii")
    assert record.state_hash != login.state
    assert record.nonce_hash != login.nonce
    assert len(record.state_hash) == 64
    assert len(record.nonce_hash) == 64
    assert verifier
    assert record.redirect_uri == REDIRECT_URI
    assert record.expires_at == now + timedelta(minutes=5)
    assert login.code_challenge
    assert db.flush.await_count == 1
    assert db.execute.await_count == 2


@pytest.mark.asyncio
async def test_login_transaction_is_consumed_once_under_transaction_lock() -> None:
    now = datetime(2026, 11, 5, tzinfo=UTC)
    verifier = "a" * 43
    state = "c" * 43
    record = OIDCLoginTransaction(
        id=uuid4(),
        state_hash=sha256_hex(state),
        nonce_hash="b" * 64,
        code_verifier_ciphertext=Fernet(KEY).encrypt(verifier.encode("ascii")).decode("ascii"),
        redirect_uri=REDIRECT_URI,
        created_at=now - timedelta(minutes=1),
        expires_at=now + timedelta(minutes=4),
    )
    db = fake_db(None, SimpleNamespace(scalar_one_or_none=lambda: record), None)

    consumed = await consume_login_transaction(
        db,
        state=state,
        encryption_key=KEY,
        now=now,
    )

    assert consumed is not None
    assert consumed.transaction_id == record.id
    assert consumed.nonce_hash == record.nonce_hash
    assert consumed.code_verifier == verifier
    assert consumed.redirect_uri == REDIRECT_URI
    assert record.consumed_at == now
    assert db.flush.await_count == 1
    assert db.execute.await_count == 3


@pytest.mark.asyncio
async def test_login_transaction_replay_or_unknown_state_is_rejected() -> None:
    db = fake_db(None, SimpleNamespace(scalar_one_or_none=lambda: None), None)
    consumed = await consume_login_transaction(
        db,
        state="d" * 43,
        encryption_key=KEY,
    )
    assert consumed is None
    assert db.flush.await_count == 0
    assert db.execute.await_count == 3


@pytest.mark.asyncio
async def test_invalid_verifier_ciphertext_fails_without_consuming_record() -> None:
    now = datetime(2026, 11, 5, tzinfo=UTC)
    state = "g" * 43
    record = OIDCLoginTransaction(
        id=uuid4(),
        state_hash=sha256_hex(state),
        nonce_hash="f" * 64,
        code_verifier_ciphertext="not-fernet-ciphertext",
        redirect_uri=REDIRECT_URI,
        created_at=now - timedelta(minutes=1),
        expires_at=now + timedelta(minutes=4),
    )
    db = fake_db(None, SimpleNamespace(scalar_one_or_none=lambda: record))

    with pytest.raises(OIDCLoginTransactionError, match="could not be decrypted"):
        await consume_login_transaction(
            db,
            state=state,
            encryption_key=KEY,
            now=now,
        )
    assert record.consumed_at is None
    assert db.flush.await_count == 0


@pytest.mark.asyncio
async def test_login_transaction_rejects_non_https_redirect_uri() -> None:
    db = fake_db()
    with pytest.raises(ValueError, match="HTTPS"):
        await create_login_transaction(
            db,
            redirect_uri="http://academy.example.test/callback",
            encryption_key=KEY,
        )


@pytest.mark.asyncio
async def test_authorization_url_contains_state_nonce_and_s256_pkce() -> None:
    db = fake_db(None, None)
    login = await create_login_transaction(
        db,
        redirect_uri=REDIRECT_URI,
        encryption_key=KEY,
    )
    url = build_authorization_url(
        authorization_endpoint="https://identity.example.test/authorize?tenant=academy",
        client_id="academy-web",
        login=login,
    )
    query = parse_qs(urlsplit(url).query)

    assert query["tenant"] == ["academy"]
    assert query["response_type"] == ["code"]
    assert query["client_id"] == ["academy-web"]
    assert query["redirect_uri"] == [REDIRECT_URI]
    assert query["state"] == [login.state]
    assert query["nonce"] == [login.nonce]
    assert query["code_challenge"] == [login.code_challenge]
    assert query["code_challenge_method"] == ["S256"]
    assert "openid" in query["scope"][0].split()
