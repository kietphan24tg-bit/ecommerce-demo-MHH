from typing import Any

from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    *,
    message: str | None = None,
    status_code: int = 200,
) -> JSONResponse:
    payload: dict[str, Any] = {
        "success": True,
        "data": data,
    }

    if message is not None:
        payload["message"] = message

    return JSONResponse(content=payload, status_code=status_code)
