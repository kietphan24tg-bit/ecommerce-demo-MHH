from typing import Literal

from fastapi import APIRouter, Response
from sqlalchemy import text

from core.redis import get_redis
from db.database import engine

router = APIRouter(tags=["health"])

CheckStatus = Literal["ok", "error"]


def _check_database() -> tuple[CheckStatus, str | None]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return "ok", None
    except Exception as exc:
        return "error", str(exc)


def _check_redis() -> tuple[CheckStatus, str | None]:
    try:
        get_redis().ping()
        return "ok", None
    except Exception as exc:
        return "error", str(exc)


@router.get("/health")
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def readiness(response: Response) -> dict:
    db_status, db_error = _check_database()
    redis_status, redis_error = _check_redis()

    checks: dict[str, dict[str, str]] = {
        "database": {"status": db_status},
        "redis": {"status": redis_status},
    }
    if db_error:
        checks["database"]["error"] = db_error
    if redis_error:
        checks["redis"]["error"] = redis_error

    all_ok = db_status == "ok" and redis_status == "ok"
    if not all_ok:
        response.status_code = 503

    return {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
    }
