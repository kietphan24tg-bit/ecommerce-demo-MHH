import logging
from dataclasses import dataclass

from redis import Redis

from core.config import get_settings
from core.errors import ErrorCode
from core.exceptions import AppException
from core.redis import is_redis_degraded

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class RateLimitResult:
    allowed: bool
    current: int
    retry_after_seconds: int | None = None


class TooManyRequestsException(AppException):
    def __init__(
        self,
        *,
        message: str = "Too many requests",
        retry_after_seconds: int | None = None,
        key_type: str | None = None,
        details: dict | None = None,
    ) -> None:
        payload = dict(details or {})
        payload["retry_after_seconds"] = max(retry_after_seconds or 1, 1)
        if key_type is not None:
            payload["key_type"] = key_type

        super().__init__(
            status_code=429,
            code=ErrorCode.TOO_MANY_REQUESTS,
            message=message,
            details=payload,
        )


def _should_skip_rate_limit() -> bool:
    settings = get_settings()
    return not settings.rate_limit_enabled or is_redis_degraded()


def _raise_rate_limit(
    *,
    message: str,
    retry_after_seconds: int,
    key_type: str,
    key: str,
) -> None:
    retry_after = max(retry_after_seconds, 1)
    logger.warning(
        "event=rate_limit_blocked key_type=%s key=%s retry_after_seconds=%s",
        key_type,
        key,
        retry_after,
    )
    raise TooManyRequestsException(
        message=message,
        retry_after_seconds=retry_after,
        key_type=key_type,
    )


def enforce_window_limit(
    *,
    redis: Redis,
    key: str,
    key_type: str,
    limit: int,
    window_seconds: int,
    message: str,
) -> RateLimitResult:
    if _should_skip_rate_limit():
        return RateLimitResult(allowed=True, current=0)

    current = redis.incr(key)
    if current == 1:
        redis.expire(key, window_seconds)

    ttl = redis.ttl(key)
    if current > limit:
        _raise_rate_limit(
            message=message,
            retry_after_seconds=ttl,
            key_type=key_type,
            key=key,
        )

    return RateLimitResult(
        allowed=True,
        current=current,
        retry_after_seconds=max(ttl, 0),
    )


def enforce_cooldown(
    *,
    redis: Redis,
    key: str,
    key_type: str,
    cooldown_seconds: int,
    message: str,
) -> None:
    if _should_skip_rate_limit():
        return

    if redis.exists(key):
        ttl = redis.ttl(key)
        _raise_rate_limit(
            message=message,
            retry_after_seconds=ttl,
            key_type=key_type,
            key=key,
        )

    redis.set(key, "1", ex=cooldown_seconds)


def increment_attempts_or_block(
    *,
    redis: Redis,
    key: str,
    key_type: str,
    max_attempts: int,
    window_seconds: int,
    message: str,
) -> int:
    if _should_skip_rate_limit():
        return 0

    current = redis.incr(key)
    if current == 1:
        redis.expire(key, window_seconds)

    ttl = redis.ttl(key)
    if current > max_attempts:
        _raise_rate_limit(
            message=message,
            retry_after_seconds=ttl,
            key_type=key_type,
            key=key,
        )

    return current
