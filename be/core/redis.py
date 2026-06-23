import logging
from functools import lru_cache

from redis import Redis

from core.config import get_settings

logger = logging.getLogger(__name__)

_redis_degraded = False


def is_redis_degraded() -> bool:
    return _redis_degraded


def set_redis_degraded(value: bool) -> None:
    global _redis_degraded
    _redis_degraded = value


@lru_cache
def get_redis() -> Redis:
    settings = get_settings()
    return Redis.from_url(settings.redis_url, decode_responses=True)


def verify_redis_connectivity() -> None:
    settings = get_settings()
    if not settings.rate_limit_enabled:
        logger.info("Rate limiting disabled, skipping Redis connectivity check")
        return

    try:
        get_redis().ping()
        set_redis_degraded(False)
        logger.info("Redis connectivity verified")
    except Exception as exc:
        if settings.is_development_env:
            set_redis_degraded(True)
            logger.warning(
                "Redis unavailable in development; rate limiting is degraded: %s",
                exc,
            )
            return

        raise RuntimeError("Redis is required but unavailable") from exc
