import logging
from datetime import datetime, timezone

from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from core.errors import ErrorCode
from core.exceptions import AppException

logger = logging.getLogger("app")


def build_error_response(
    *,
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details=None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details,
            },
            "statusCode": status_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": request.url.path,
            "requestId": getattr(request.state, "request_id", None),
        },
        headers=headers or {},
    )


async def app_exception_handler(request: Request, exc: AppException):
    key_type = None
    if exc.status_code == 429 and isinstance(exc.details, dict):
        key_type = exc.details.get("key_type")

    if key_type:
        logger.warning(
            "event=app_exception request_id=%s method=%s path=%s status_code=%s error_code=%s key_type=%s",
            getattr(request.state, "request_id", None),
            request.method,
            request.url.path,
            exc.status_code,
            exc.code,
            key_type,
        )
    else:
        logger.warning(
            "event=app_exception request_id=%s method=%s path=%s status_code=%s error_code=%s",
            getattr(request.state, "request_id", None),
            request.method,
            request.url.path,
            exc.status_code,
            exc.code,
        )

    headers: dict[str, str] = {}
    if exc.status_code == 429:
        retry_after = 60
        if isinstance(exc.details, dict):
            retry_after = exc.details.get("retry_after_seconds", retry_after)
        headers["Retry-After"] = str(max(int(retry_after), 1))

    return build_error_response(
        request=request,
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
        headers=headers,
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(
        "event=http_exception request_id=%s method=%s path=%s status_code=%s detail=%s",
        getattr(request.state, "request_id", None),
        request.method,
        request.url.path,
        exc.status_code,
        exc.detail,
    )
    return build_error_response(
        request=request,
        status_code=exc.status_code,
        code=ErrorCode.BAD_REQUEST,
        message=str(exc.detail),
        details=None,
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "event=unhandled_exception request_id=%s method=%s path=%s",
        getattr(request.state, "request_id", None),
        request.method,
        request.url.path,
    )
    return build_error_response(
        request=request,
        status_code=500,
        code=ErrorCode.INTERNAL_SERVER_ERROR,
        message="Internal server error",
        details=None,
    )

def format_validation_details(exc: RequestValidationError) -> dict:
    errors: dict[str, list[str]] = {}

    for err in exc.errors():
        loc = err.get("loc", ())
        msg = err.get("msg", "Invalid value")

        field = ".".join(str(part) for part in loc if part != "body")
        if not field:
            field = "request"

        errors.setdefault(field, []).append(msg)

    return errors


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        "event=validation_failed request_id=%s method=%s path=%s error_code=%s",
        getattr(request.state, "request_id", None),
        request.method,
        request.url.path,
        ErrorCode.VALIDATION_ERROR,
    )
    return build_error_response(
        request=request,
        status_code=400,
        code=ErrorCode.VALIDATION_ERROR,
        message="Validation failed",
        details=format_validation_details(exc),
    )

