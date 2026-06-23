from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from api.v1.router import api_router
from core.config import get_settings
from core.exception_handlers import (
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from core.exceptions import AppException
from core.health import router as health_router
from core.logging import setup_logging
from core.middleware.logging import logging_middleware
from core.middleware.rate_limit import rate_limit_middleware
from core.middleware.request_id import request_id_middleware
from core.redis import verify_redis_connectivity
from db.lifecycle import verify_database_connectivity

settings = get_settings()
setup_logging()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.middleware("http")(request_id_middleware)
app.middleware("http")(logging_middleware)
app.middleware("http")(rate_limit_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.include_router(health_router)
app.include_router(api_router, prefix=f"/{settings.api_prefix}")

if settings.debug:
    from core.debug_routes import router as debug_router

    app.include_router(debug_router)


@app.on_event("startup")
def on_startup() -> None:
    verify_database_connectivity()
    verify_redis_connectivity()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Fast api is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True)
