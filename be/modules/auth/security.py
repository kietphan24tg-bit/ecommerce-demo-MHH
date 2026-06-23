from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel, ValidationError

from core.config import get_settings
from core.errors import ErrorCode
from core.exceptions import UnauthorizedException

settings = get_settings()
password_hasher = PasswordHash.recommended()


class TokenPayload(BaseModel):
    sub: str
    role: str
    sid: int | None = None
    type: str
    iat: int
    exp: int
    iss: str | None = None


def _get_jwt_secret_key() -> str:
    secret_key = settings.jwt_secret_key.strip()
    if not secret_key:
        raise ValueError("JWT secret key is not configured")
    return secret_key


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def create_access_token(
    *,
    user_id: int,
    role: str,
    session_id: int | None = None,
    expires_in_minutes: int | None = None,
) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(
        minutes=expires_in_minutes or settings.jwt_expires_in,
    )
    payload = {
        "sub": str(user_id),
        "role": role,
        "sid": session_id,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
        "iss": settings.jwt_issuer,
    }

    return jwt.encode(
        payload,
        _get_jwt_secret_key(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> TokenPayload:
    try:
        decoded = jwt.decode(
            token,
            _get_jwt_secret_key(),
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
        )
    except ExpiredSignatureError as exc:
        raise UnauthorizedException(
            message="Access token has expired",
            code=ErrorCode.AUTH_TOKEN_EXPIRED,
        ) from exc
    except InvalidTokenError as exc:
        raise UnauthorizedException(
            message="Access token is invalid",
            code=ErrorCode.AUTH_TOKEN_INVALID,
        ) from exc

    try:
        payload = TokenPayload.model_validate(decoded)
    except ValidationError as exc:
        raise UnauthorizedException(
            message="Access token payload is invalid",
            code=ErrorCode.AUTH_TOKEN_INVALID,
            details=exc.errors(),
        ) from exc

    if payload.type != "access":
        raise UnauthorizedException(
            message="Access token type is invalid",
            code=ErrorCode.AUTH_TOKEN_INVALID,
        )

    if not payload.sub:
        raise UnauthorizedException(
            message="Access token subject is missing",
            code=ErrorCode.AUTH_TOKEN_INVALID,
        )

    if not payload.role:
        raise UnauthorizedException(
            message="Access token role is missing",
            code=ErrorCode.AUTH_TOKEN_INVALID,
        )

    return payload


def validate_access_token(token: str) -> bool:
    decode_access_token(token)
    return True


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)
