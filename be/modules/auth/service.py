from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import secrets

import httpx
from sqlalchemy.orm import Session

from core.config import get_settings
from core.exceptions import (
    BadRequestException,
    InvalidCredentialsException,
    UnauthorizedException,
)
from core.rate_limit.policies import record_forgot_verify_attempt
from modules.auth.email_service import send_password_reset_email
from modules.auth import repository
from modules.auth.schemas.request import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyTokenRequest,
)
from modules.auth.schemas.response import (
    AuthTokenResponse,
    MessageResponse,
    RequestPasswordResetResponse,
    RefreshTokenResponse,
    UserResponse,
    VerifyPasswordResetResponse,
)
from modules.auth.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from modules.users.model import User

settings = get_settings()
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/oauth/access_token"
FACEBOOK_USERINFO_URL = "https://graph.facebook.com/me"


@dataclass(slots=True)
class AuthSessionResult:
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserResponse

    def to_response(self) -> AuthTokenResponse:
        return AuthTokenResponse(
            access_token=self.access_token,
            expires_in=self.expires_in,
            user=self.user,
        )


@dataclass(slots=True)
class RefreshSessionResult:
    access_token: str
    refresh_token: str
    expires_in: int

    def to_response(self) -> RefreshTokenResponse:
        return RefreshTokenResponse(
            access_token=self.access_token,
            expires_in=self.expires_in,
        )


@dataclass(slots=True)
class SocialIdentity:
    provider_name: str
    provider_user_id: str
    email: str | None
    full_name: str


def build_auth_session_result(
    *,
    user: User,
    refresh_token: str,
    session_id: int,
) -> AuthSessionResult:
    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
        session_id=session_id,
    )

    return AuthSessionResult(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.jwt_expires_in * 60,
        user=UserResponse.model_validate(user),
    )


def register_user(db: Session, payload: RegisterRequest) -> AuthSessionResult:
    existing_user = repository.get_user_by_email(db, payload.email)
    if existing_user:
        raise BadRequestException(message="Email already exists")

    existing_phone = repository.get_user_by_phone(db, payload.phone)
    if existing_phone:
        raise BadRequestException(message="Phone already exists")

    user = repository.create_user(
        db,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )

    refresh_token = create_refresh_token()
    session = repository.create_session(
        db,
        user_id=user.id,
        refresh_token=refresh_token,
    )

    return build_auth_session_result(
        user=user,
        refresh_token=refresh_token,
        session_id=session.id,
    )


def login_user(db: Session, payload: LoginRequest) -> AuthSessionResult:
    if payload.login_type == "email":
        user = repository.get_user_by_email(db, payload.identifier)
    else:
        user = repository.get_user_by_phone(db, payload.identifier)

    if not user:
        raise InvalidCredentialsException(message="Invalid login credentials")

    if not user.password_hash:
        raise InvalidCredentialsException(message="Invalid login credentials")

    if not verify_password(payload.password, user.password_hash):
        raise InvalidCredentialsException(message="Invalid login credentials")

    return create_auth_session(db, user)


def create_auth_session(db: Session, user: User) -> AuthSessionResult:
    refresh_token = create_refresh_token()
    session = repository.create_session(
        db,
        user_id=user.id,
        refresh_token=refresh_token,
    )

    return build_auth_session_result(
        user=user,
        refresh_token=refresh_token,
        session_id=session.id,
    )


def _require_provider_config(
    *,
    provider_name: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
) -> None:
    if client_id and client_secret and redirect_uri:
        return

    raise BadRequestException(
        message=f"{provider_name.title()} login is not configured",
    )


def _exchange_google_code(code: str) -> SocialIdentity:
    _require_provider_config(
        provider_name="google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        redirect_uri=settings.google_redirect_uri,
    )

    try:
        token_response = httpx.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10.0,
        )
        token_response.raise_for_status()
        token_payload = token_response.json()

        userinfo_response = httpx.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_payload['access_token']}"},
            timeout=10.0,
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
    except (KeyError, httpx.HTTPError, ValueError) as exc:
        raise BadRequestException(message="Google authentication failed") from exc

    provider_user_id = userinfo.get("sub")
    email = userinfo.get("email")
    full_name = userinfo.get("name") or (
        email.split("@", 1)[0] if email else "Google User"
    )

    if not provider_user_id:
        raise BadRequestException(message="Google account identifier is missing")

    if not email:
        raise BadRequestException(message="Google account email is missing")

    if userinfo.get("email_verified") is not True:
        raise BadRequestException(message="Google account email is not verified")

    return SocialIdentity(
        provider_name="google",
        provider_user_id=provider_user_id,
        email=email,
        full_name=full_name,
    )


def _exchange_facebook_code(code: str) -> SocialIdentity:
    _require_provider_config(
        provider_name="facebook",
        client_id=settings.facebook_client_id,
        client_secret=settings.facebook_client_secret,
        redirect_uri=settings.facebook_redirect_uri,
    )

    try:
        token_response = httpx.get(
            FACEBOOK_TOKEN_URL,
            params={
                "client_id": settings.facebook_client_id,
                "client_secret": settings.facebook_client_secret,
                "redirect_uri": settings.facebook_redirect_uri,
                "code": code,
            },
            timeout=10.0,
        )
        token_response.raise_for_status()
        token_payload = token_response.json()

        userinfo_response = httpx.get(
            FACEBOOK_USERINFO_URL,
            params={
                "fields": "id,name,email",
                "access_token": token_payload["access_token"],
            },
            timeout=10.0,
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
    except (KeyError, httpx.HTTPError, ValueError) as exc:
        raise BadRequestException(message="Facebook authentication failed") from exc

    provider_user_id = userinfo.get("id")
    email = userinfo.get("email")
    full_name = userinfo.get("name") or (
        email.split("@", 1)[0] if email else "Facebook User"
    )

    if not provider_user_id:
        raise BadRequestException(message="Facebook account identifier is missing")

    return SocialIdentity(
        provider_name="facebook",
        provider_user_id=provider_user_id,
        email=email,
        full_name=full_name,
    )


def _get_or_create_social_user(db: Session, identity: SocialIdentity) -> User:
    user_provider = repository.get_user_provider(
        db,
        provider_name=identity.provider_name,
        provider_user_id=identity.provider_user_id,
    )
    if user_provider:
        user = repository.get_user_by_id(db, user_provider.user_id)
        if not user:
            raise UnauthorizedException(
                message="User not found for this social account",
            )
        return user

    user = repository.get_user_by_email(db, identity.email) if identity.email else None

    if not user and not identity.email:
        raise BadRequestException(
            message=(
                f"{identity.provider_name.title()} account email is required "
                "to create a new user"
            ),
        )

    if not user:
        user = repository.create_user(
            db,
            full_name=identity.full_name,
            email=identity.email or "",
            phone=None,
            password_hash=None,
        )

    repository.create_user_provider(
        db,
        user_id=user.id,
        provider_name=identity.provider_name,
        provider_user_id=identity.provider_user_id,
    )
    return user


def login_with_google(db: Session, code: str) -> AuthSessionResult:
    identity = _exchange_google_code(code)
    user = _get_or_create_social_user(db, identity)
    return create_auth_session(db, user)


def login_with_facebook(db: Session, code: str) -> AuthSessionResult:
    identity = _exchange_facebook_code(code)
    user = _get_or_create_social_user(db, identity)
    return create_auth_session(db, user)


def refresh_session(db: Session, refresh_token: str) -> RefreshSessionResult:
    session = repository.get_session_by_refresh_token(db, refresh_token)
    if not session or session.revoked:
        raise UnauthorizedException(message="Invalid refresh token")

    user = repository.get_user_by_id(db, session.user_id)
    if not user:
        raise UnauthorizedException(message="User not found for this session")

    next_refresh_token = create_refresh_token()
    updated_session = repository.update_session_refresh_token(
        db,
        session,
        next_refresh_token,
    )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
        session_id=updated_session.id,
    )

    return RefreshSessionResult(
        access_token=access_token,
        refresh_token=updated_session.refresh_token,
        expires_in=settings.jwt_expires_in * 60,
    )


def logout_user(db: Session, refresh_token: str) -> MessageResponse:
    session = repository.get_session_by_refresh_token(db, refresh_token)
    if not session or session.revoked:
        raise UnauthorizedException(message="Invalid refresh token")

    repository.revoke_session(db, session)
    return MessageResponse(message="Logged out successfully")

def create_password_reset_code(length: int = 6) -> str:
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))

def request_password_reset(
    db: Session,
    payload: ForgotPasswordRequest,
) -> RequestPasswordResetResponse:
    generic_response = RequestPasswordResetResponse(
        message="If the account exists, a reset code has been sent",
        expires_in=settings.password_reset_code_expires_in * 60,
    )

    user = repository.get_user_by_email(db, payload.email)
    if not user:
        return generic_response

    token = create_password_reset_code(length=settings.password_reset_code_length)
    expires_at = datetime.now(UTC) + timedelta(
        minutes=settings.password_reset_code_expires_in,
    )
    repository.create_token_reset(
        db,
        user_id=user.id,
        token=token,
        expires_at=expires_at,
    )
    send_password_reset_email(to_email=user.email, code=token)
    return generic_response


def verify_password_reset_code(
    db: Session,
    payload: VerifyTokenRequest,
) -> VerifyPasswordResetResponse:
    user = repository.get_user_by_email(db, payload.email)
    if not user:
        record_forgot_verify_attempt(payload.email, payload.token)
        raise BadRequestException(message="Invalid verification request")

    password_reset = repository.get_password_reset_by_token(db, payload.token)
    if not password_reset or password_reset.user_id != user.id:
        record_forgot_verify_attempt(payload.email, payload.token)
        raise BadRequestException(message="Invalid password reset code")

    if password_reset.used_at is not None:
        raise BadRequestException(message="Password reset code has already been used")

    if password_reset.verified_at is not None:
        raise BadRequestException(
            message="Password reset code has already been verified",
        )

    if password_reset.expires_at < datetime.now(UTC):
        raise BadRequestException(message="Password reset code has expired")

    verified_reset = repository.mark_password_reset_as_verified(db, password_reset)
    return VerifyPasswordResetResponse(
        message="Password reset code verified successfully",
        reset_token=verified_reset.reset_token or "",
    )


def reset_password(
    db: Session,
    payload: ResetPasswordRequest,
) -> MessageResponse:
    user = repository.get_user_by_email(db, payload.email)
    if not user:
        raise BadRequestException(message="Invalid reset password request")

    password_reset = repository.get_password_reset_by_reset_token(
        db,
        user_id=user.id,
        reset_token=payload.reset_token,
    )
    if not password_reset:
        raise BadRequestException(message="Invalid reset password request")

    if password_reset.used_at is not None:
        raise BadRequestException(message="Reset password request has already been used")

    if password_reset.verified_at is None:
        raise BadRequestException(message="Reset password request has not been verified")

    if password_reset.expires_at < datetime.now(UTC):
        raise BadRequestException(message="Reset password request has expired")

    repository.update_user_password(
        db,
        user,
        hash_password(payload.new_password),
    )
    repository.revoke_all_user_sessions(db, user.id)
    repository.mark_password_reset_as_used(db, password_reset)
    return MessageResponse(message="Password reset successfully")
