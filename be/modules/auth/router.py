from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.orm import Session

from core.config import get_settings
from core.exceptions import UnauthorizedException
from db.database import get_db
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
from modules.auth.service import (
    login_user,
    logout_user,
    request_password_reset,
    refresh_session,
    register_user,
    reset_password,
    verify_password_reset_code,
)
from modules.auth.dependencies import get_current_user
from modules.users.model import User

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # local dev
        samesite="lax",
        max_age=settings.jwt_refresh_expires_in * 24 * 60 * 60,
        path="/",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key="refresh_token",
        path="/",
    )


@router.post("/register", response_model=AuthTokenResponse)
def register(
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    result = register_user(db, payload)
    set_refresh_cookie(response, result.refresh_token)
    return result.to_response()


@router.post("/login", response_model=AuthTokenResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    result = login_user(db, payload)
    set_refresh_cookie(response, result.refresh_token)
    return result.to_response()


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
):
    if not refresh_token:
        clear_refresh_cookie(response)
        raise UnauthorizedException(message="Refresh token is missing")

    result = refresh_session(db, refresh_token)
    set_refresh_cookie(response, result.refresh_token)
    return result.to_response()


@router.post("/logout", response_model=MessageResponse)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
):
    if not refresh_token:
        clear_refresh_cookie(response)
        raise UnauthorizedException(message="Refresh token is missing")

    result = logout_user(db, refresh_token)
    clear_refresh_cookie(response)
    return result

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password/request", response_model=RequestPasswordResetResponse)
def forgot_password_request(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    return request_password_reset(db, payload)


@router.post("/forgot-password/verify", response_model=VerifyPasswordResetResponse)
def forgot_password_verify(
    payload: VerifyTokenRequest,
    db: Session = Depends(get_db),
):
    return verify_password_reset_code(db, payload)


@router.post("/forgot-password/reset", response_model=MessageResponse)
def forgot_password_reset(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return reset_password(db, payload)
