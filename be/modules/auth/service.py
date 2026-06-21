from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import secrets

from sqlalchemy.orm import Session

from core.config import get_settings
from core.exceptions import (
    BadRequestException,
    InvalidCredentialsException,
    UnauthorizedException,
)
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

    if not verify_password(payload.password, user.password_hash):
        raise InvalidCredentialsException(message="Invalid login credentials")

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
    user = repository.get_user_by_email(db, payload.email)
    if not user:
        raise BadRequestException(message="User with this email does not exist")

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
    return RequestPasswordResetResponse(
        message="Password reset code created successfully",
        expires_in=settings.password_reset_code_expires_in * 60,
    )


def verify_password_reset_code(
    db: Session,
    payload: VerifyTokenRequest,
) -> VerifyPasswordResetResponse:
    user = repository.get_user_by_email(db, payload.email)
    if not user:
        raise BadRequestException(message="User with this email does not exist")

    password_reset = repository.get_password_reset_by_token(db, payload.token)
    if not password_reset or password_reset.user_id != user.id:
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
