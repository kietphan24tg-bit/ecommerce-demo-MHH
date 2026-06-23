from fastapi import Request

from core.config import get_settings
from core.rate_limit.keys import (
    forgot_request_cooldown_key,
    forgot_request_email_key,
    forgot_request_ip_key,
    forgot_reset_email_key,
    forgot_verify_attempt_key,
    forgot_verify_email_key,
    forgot_verify_ip_key,
    global_ip_key,
    login_identifier_key,
    login_ip_key,
    refresh_ip_key,
    register_email_key,
    register_ip_key,
)
from core.rate_limit.service import (
    enforce_cooldown,
    enforce_window_limit,
    increment_attempts_or_block,
)
from core.redis import get_redis
from core.helper.request_meta import get_client_ip


def apply_global_rate_limit(request: Request) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=global_ip_key(ip),
        key_type="global",
        limit=settings.rate_limit_global_requests,
        window_seconds=settings.rate_limit_global_window_seconds,
        message="Too many requests from this IP",
    )


def apply_login_rate_limit(request: Request, identifier: str) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=login_ip_key(ip),
        key_type="login_ip",
        limit=settings.rate_limit_login_ip_requests,
        window_seconds=settings.rate_limit_login_ip_window_seconds,
        message="Too many login attempts from this IP",
    )
    enforce_window_limit(
        redis=redis,
        key=login_identifier_key(identifier),
        key_type="login_identifier",
        limit=settings.rate_limit_login_identifier_requests,
        window_seconds=settings.rate_limit_login_identifier_window_seconds,
        message="Too many login attempts for this account",
    )


def apply_register_rate_limit(request: Request, email: str) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=register_ip_key(ip),
        key_type="register_ip",
        limit=settings.rate_limit_register_ip_requests,
        window_seconds=settings.rate_limit_register_ip_window_seconds,
        message="Too many registration attempts from this IP",
    )
    enforce_window_limit(
        redis=redis,
        key=register_email_key(email),
        key_type="register_email",
        limit=settings.rate_limit_register_email_requests,
        window_seconds=settings.rate_limit_register_email_window_seconds,
        message="Too many registration attempts for this email",
    )


def apply_forgot_request_rate_limit(request: Request, email: str) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=forgot_request_ip_key(ip),
        key_type="forgot_request_ip",
        limit=settings.rate_limit_forgot_request_ip_requests,
        window_seconds=settings.rate_limit_forgot_request_ip_window_seconds,
        message="Too many password reset requests from this IP",
    )
    enforce_window_limit(
        redis=redis,
        key=forgot_request_email_key(email),
        key_type="forgot_request_email",
        limit=settings.rate_limit_forgot_request_email_requests,
        window_seconds=settings.rate_limit_forgot_request_email_window_seconds,
        message="Too many password reset requests for this email",
    )
    enforce_cooldown(
        redis=redis,
        key=forgot_request_cooldown_key(email),
        key_type="forgot_request_cooldown",
        cooldown_seconds=settings.rate_limit_forgot_request_cooldown_seconds,
        message="Please wait before requesting another reset code",
    )


def apply_forgot_verify_rate_limit(request: Request, email: str) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=forgot_verify_ip_key(ip),
        key_type="forgot_verify_ip",
        limit=settings.rate_limit_forgot_verify_ip_requests,
        window_seconds=settings.rate_limit_forgot_verify_ip_window_seconds,
        message="Too many reset verification attempts from this IP",
    )
    enforce_window_limit(
        redis=redis,
        key=forgot_verify_email_key(email),
        key_type="forgot_verify_email",
        limit=settings.rate_limit_forgot_verify_email_requests,
        window_seconds=settings.rate_limit_forgot_verify_email_window_seconds,
        message="Too many reset verification attempts for this email",
    )


def apply_refresh_rate_limit(request: Request) -> None:
    settings = get_settings()
    redis = get_redis()
    ip = get_client_ip(request)

    enforce_window_limit(
        redis=redis,
        key=refresh_ip_key(ip),
        key_type="refresh_ip",
        limit=settings.rate_limit_refresh_ip_requests,
        window_seconds=settings.rate_limit_refresh_ip_window_seconds,
        message="Too many refresh attempts from this IP",
    )


def apply_forgot_reset_rate_limit(email: str) -> None:
    settings = get_settings()
    redis = get_redis()

    enforce_window_limit(
        redis=redis,
        key=forgot_reset_email_key(email),
        key_type="forgot_reset_email",
        limit=settings.rate_limit_forgot_reset_email_requests,
        window_seconds=settings.rate_limit_forgot_reset_email_window_seconds,
        message="Too many password reset submissions for this email",
    )


def record_forgot_verify_attempt(email: str, token: str) -> None:
    settings = get_settings()
    redis = get_redis()

    increment_attempts_or_block(
        redis=redis,
        key=forgot_verify_attempt_key(email, token),
        key_type="forgot_verify_attempt",
        max_attempts=settings.rate_limit_forgot_verify_max_attempts,
        window_seconds=settings.rate_limit_forgot_verify_attempt_window_seconds,
        message="Too many invalid verification attempts",
    )
