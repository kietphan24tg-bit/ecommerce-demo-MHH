import logging
import time

from fastapi import Request

logger = logging.getLogger("app")


async def logging_middleware(request: Request, call_next):
    start = time.perf_counter()
    method = request.method
    path = request.url.path

    response = await call_next(request)
    request_id = getattr(request.state, "request_id", None)

    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    logger.info(
        "event=request_completed request_id=%s method=%s path=%s status_code=%s duration_ms=%s",
        request_id,
        method,
        path,
        response.status_code,
        duration_ms,
    )

    return response
