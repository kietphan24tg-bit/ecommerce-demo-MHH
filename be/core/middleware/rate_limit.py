from fastapi import Request

from core.exception_handlers import app_exception_handler
from core.exceptions import AppException
from core.rate_limit.policies import apply_global_rate_limit


async def rate_limit_middleware(request: Request, call_next):
    try:
        apply_global_rate_limit(request)
    except AppException as exc:
        return await app_exception_handler(request, exc)
    return await call_next(request)
