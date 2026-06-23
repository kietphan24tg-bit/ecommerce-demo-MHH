# Backend Infrastructure Summary

Duoi day la cac phan chinh da duoc chinh sua/tao them trong backend, kem code minh hoa va y nghia cua tung phan.

## 1. Cau hinh app an toan hon

File: [be/core/config.py](/D:/Workspace/MHH/Ecommerce/be/core/config.py:1)

```python
CookieSameSite = Literal["lax", "strict", "none"]
DEVELOPMENT_ENVS = frozenset({"development", "dev", "local", "test"})

@property
def is_development_env(self) -> bool:
    return self.app_env.strip().lower() in DEVELOPMENT_ENVS

@property
def resolved_refresh_cookie_secure(self) -> bool:
    if self.refresh_cookie_secure is not None:
        return self.refresh_cookie_secure
    if self.auth_cross_site:
        return True
    return not self.is_development_env

@property
def resolved_refresh_cookie_samesite(self) -> CookieSameSite:
    if self.refresh_cookie_samesite is not None:
        return self.refresh_cookie_samesite
    if self.auth_cross_site:
        return "none"
    return "lax"
```

Y nghia:
- Khong hard-code cookie auth nua.
- Tu suy ra `Secure` va `SameSite` theo moi truong.
- Chuan bi san cho local, same-site, cross-site.

Phan normalize DB URL:

```python
@field_validator("database_url", mode="before")
@classmethod
def normalize_database_url(cls, value: str) -> str:
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql+psycopg2://"):
        return "postgresql+psycopg://" + url[len("postgresql+psycopg2://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url
```

Y nghia:
- Tranh sai driver khi doi moi truong.
- Chuan hoa het ve `psycopg`.

## 2. Cookie auth va rate limit cho auth routes

File: [be/modules/auth/router.py](/D:/Workspace/MHH/Ecommerce/be/modules/auth/router.py:1)

```python
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,
    secure=settings.resolved_refresh_cookie_secure,
    samesite=settings.resolved_refresh_cookie_samesite,
    max_age=settings.jwt_refresh_expires_in * 24 * 60 * 60,
    path="/",
)
```

Y nghia:
- Cookie refresh token gio di theo config.
- Khong con `secure=False` co dinh.

Rate limit ap vao route:

```python
@router.post("/login", response_model=AuthTokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    apply_login_rate_limit(request, payload.identifier)
    result = login_user(db, payload)
```

Y nghia:
- Chan brute-force ngay tai endpoint.
- Ap cho `register`, `login`, `refresh`, `forgot-password`.

## 3. Khong tu tao schema khi app boot

File: [be/main.py](/D:/Workspace/MHH/Ecommerce/be/main.py:1)

Truoc day app dung `Base.metadata.create_all(...)`. Gio doi sang:

```python
@app.on_event("startup")
def on_startup() -> None:
    verify_database_connectivity()
    verify_redis_connectivity()
```

Y nghia:
- App khong tu sua schema nua.
- Alembic la nguon su that duy nhat cho DB.
- Startup chi kiem tra downstream con song.

## 4. Healthcheck va readiness

File: [be/core/health.py](/D:/Workspace/MHH/Ecommerce/be/core/health.py:1)

```python
@router.get("/health")
def liveness() -> dict[str, str]:
    return {"status": "ok"}

@router.get("/ready")
def readiness(response: Response) -> dict:
    db_status, db_error = _check_database()
    redis_status, redis_error = _check_redis()

    all_ok = db_status == "ok" and redis_status == "ok"
    if not all_ok:
        response.status_code = 503

    return {
        "status": "ok" if all_ok else "degraded",
        "checks": {
            "database": {"status": db_status},
            "redis": {"status": redis_status},
        },
    }
```

Y nghia:
- `/health`: process con song.
- `/ready`: DB/Redis co san sang khong.
- Rat can cho Docker, reverse proxy, sau nay deploy.

## 5. Redis lifecycle va degraded mode

File: [be/core/redis.py](/D:/Workspace/MHH/Ecommerce/be/core/redis.py:1)

```python
def verify_redis_connectivity() -> None:
    settings = get_settings()
    if not settings.rate_limit_enabled:
        return

    try:
        get_redis().ping()
        set_redis_degraded(False)
    except Exception as exc:
        if settings.is_development_env:
            set_redis_degraded(True)
            logger.warning("Redis unavailable in development; rate limiting is degraded: %s", exc)
            return

        raise RuntimeError("Redis is required but unavailable") from exc
```

Y nghia:
- Dev co the cho Redis chet ma app van len.
- Prod/staging thi fail fast neu Redis bat buoc.

## 6. Rate limit service chuan hoa loi 429

File: [be/core/rate_limit/service.py](/D:/Workspace/MHH/Ecommerce/be/core/rate_limit/service.py:1)

```python
class TooManyRequestsException(AppException):
    def __init__(self, *, message="Too many requests", retry_after_seconds=None, key_type=None, details=None):
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
```

Va o exception handler:

File: [be/core/exception_handlers.py](/D:/Workspace/MHH/Ecommerce/be/core/exception_handlers.py:1)

```python
if exc.status_code == 429:
    retry_after = 60
    if isinstance(exc.details, dict):
        retry_after = exc.details.get("retry_after_seconds", retry_after)
    headers["Retry-After"] = str(max(int(retry_after), 1))
```

Y nghia:
- Response `429` co `Retry-After`.
- Log co `key_type` de biet bi chan do dau.

## 7. An debug routes khoi runtime chinh

File: [be/main.py](/D:/Workspace/MHH/Ecommerce/be/main.py:45) va [be/core/debug_routes.py](/D:/Workspace/MHH/Ecommerce/be/core/debug_routes.py:1)

```python
if settings.debug:
    from core.debug_routes import router as debug_router
    app.include_router(debug_router)
```

Y nghia:
- Route test khong con lan trong production runtime.
- Chi bat khi `debug=true`.

## 8. Forgot password an toan hon

File: [be/modules/auth/service.py](/D:/Workspace/MHH/Ecommerce/be/modules/auth/service.py:189)

```python
generic_response = RequestPasswordResetResponse(
    message="If the account exists, a reset code has been sent",
    expires_in=settings.password_reset_code_expires_in * 60,
)

user = repository.get_user_by_email(db, payload.email)
if not user:
    return generic_response
```

Y nghia:
- Khong lo email co ton tai hay khong.
- Giam user enumeration.

## 9. Dockerfile cho artifact chinh thuc

File: [be/Dockerfile](/D:/Workspace/MHH/Ecommerce/be/Dockerfile:1)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

RUN chmod +x scripts/entrypoint.sh

ENV PORT=4000
EXPOSE 4000

ENTRYPOINT ["./scripts/entrypoint.sh"]
```

Y nghia:
- Build image backend thong nhat.
- Cai deps tu lockfile.
- Startup luon qua entrypoint.

## 10. Entrypoint chay migration truoc app

File: [be/scripts/entrypoint.sh](/D:/Workspace/MHH/Ecommerce/be/scripts/entrypoint.sh:1)

```sh
#!/usr/bin/env sh
set -eu

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-4000}"
```

Y nghia:
- Moi lan container len se migrate truoc.
- Sau do moi boot API.

Luu y ky thuat:
- Neu runtime can chac hon voi `uv`, co the doi sang `uv run alembic ...` va `uv run uvicorn ...`.

## 11. .dockerignore de khong day file rac/secrets

File: [be/.dockerignore](/D:/Workspace/MHH/Ecommerce/be/.dockerignore:1)

```dockerignore
.env
.env.*
!.env.example
.venv
__pycache__
.pytest_cache
.git
tests
README.md
```

Y nghia:
- Khong dua `.env`, `.venv`, cache vao build context.
- Build nhe hon, an toan hon.

## 12. Makefile cho local workflow

File: [be/Makefile](/D:/Workspace/MHH/Ecommerce/be/Makefile:1)

```makefile
migrate:
	uv run alembic upgrade head

run:
	uv run uvicorn main:app --host 0.0.0.0 --port 4000 --reload

test:
	uv run pytest -m "unit or api"

docker-build:
	docker build -t ecommerce-be .

docker-run:
	docker run --rm -p 4000:4000 --env-file .env ecommerce-be
```

Y nghia:
- Goi cac lenh hay dung thanh chuan noi bo.
- Dev va CI cung noi chung mot ngon ngu.

## 13. README backend

File: [be/README.md](/D:/Workspace/MHH/Ecommerce/be/README.md:1)

Noi dung da them:
- cach chay local
- test scopes
- Docker contract
- CI/CD flow
- secrets can cho GitHub

Y nghia:
- Onboarding de hon.
- Khong phai nho lenh thu cong.

## 14. .env.example

File: [be/.env.example](/D:/Workspace/MHH/Ecommerce/be/.env.example:1)

Y nghia:
- Tai lieu hoa toan bo env contract.
- Khong phai dung `.env` that de hieu app can gi.

## 15. Test setup

File: [be/tests/conftest.py](/D:/Workspace/MHH/Ecommerce/be/tests/conftest.py:1)

```python
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./.pytest.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-min-32-chars-long")

import fakeredis
from fastapi.testclient import TestClient
```

Y nghia:
- Tach moi truong test khoi local that.
- Dung SQLite + fake Redis de test nhanh.

Patch Redis cho test:

```python
def _patch_redis_clients() -> None:
    import core.health
    import core.rate_limit.policies
    import core.redis

    core.redis.get_redis = _get_test_redis
    core.health.get_redis = _get_test_redis
    core.rate_limit.policies.get_redis = _get_test_redis
```

Y nghia:
- API test khong can Redis that.
- Giu test nhanh va it flaky hon.

## 16. Unit test

File: [be/tests/unit/test_config.py](/D:/Workspace/MHH/Ecommerce/be/tests/unit/test_config.py:1)

```python
def test_database_url_normalizes_postgres_scheme() -> None:
    settings = Settings(database_url="postgres://user:pass@localhost:5432/app")
    assert settings.database_url == "postgresql+psycopg://user:pass@localhost:5432/app"
```

```python
def test_refresh_cookie_flags_for_cross_site_auth() -> None:
    settings = Settings(app_env="production", auth_cross_site=True)
    assert settings.resolved_refresh_cookie_secure is True
    assert settings.resolved_refresh_cookie_samesite == "none"
```

Y nghia:
- Test logic config thuan.
- Bat regression rat som.

## 17. API test

File: [be/tests/api/test_health.py](/D:/Workspace/MHH/Ecommerce/be/tests/api/test_health.py:1)

```python
def test_health_returns_ok(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

```python
def test_ready_returns_503_when_redis_is_unavailable(client, monkeypatch) -> None:
    monkeypatch.setattr("core.health._check_redis", lambda: ("error", "redis unavailable"))
    response = client.get("/ready")
    assert response.status_code == 503
```

File: [be/tests/api/test_auth.py](/D:/Workspace/MHH/Ecommerce/be/tests/api/test_auth.py:1)

```python
def test_forgot_password_does_not_reveal_missing_email(client, db_session) -> None:
    response = client.post("/api/v1/auth/forgot-password/request", json={"email": "missing-user@example.com"})
    assert response.status_code == 200
    assert response.json()["message"] == "If the account exists, a reset code has been sent"
```

File: [be/tests/api/test_rate_limit.py](/D:/Workspace/MHH/Ecommerce/be/tests/api/test_rate_limit.py:1)

```python
def test_rate_limit_returns_429_with_retry_after(client, monkeypatch) -> None:
    first = client.get("/health")
    second = client.get("/health")
    assert second.status_code == 429
    assert second.headers.get("Retry-After") is not None
```

Y nghia:
- Kiem tra hanh vi endpoint thuc te.
- Bao phu health, auth va rate-limit.

## 18. Integration test placeholder

File: [be/tests/integration/test_placeholder.py](/D:/Workspace/MHH/Ecommerce/be/tests/integration/test_placeholder.py:1)

```python
@pytest.mark.integration
def test_integration_services_placeholder() -> None:
    pytest.skip("Integration tests run in a separate job with Postgres and Redis service containers")
```

Y nghia:
- Danh dau ro phase sau se co integration test that.
- Khong lan voi `unit/api`.

## 19. CI/CD bang GitHub Actions

File: [.github/workflows/backend-ci.yml](/D:/Workspace/MHH/Ecommerce/.github/workflows/backend-ci.yml:1)

PR workflow:

```yaml
on:
  pull_request:
    branches: [main]
```

Test job:

```yaml
- name: Install dependencies
  run: uv sync --frozen --group dev

- name: Run unit and API tests
  run: uv run pytest -m "unit or api"
```

Publish job cho `main`:

```yaml
publish:
  needs: test
  if: github.event_name == 'push' && github.ref == 'refs/heads/main' && !github.event.repository.fork
```

Docker Hub tagging:

```yaml
with:
  images: ${{ secrets.DOCKERHUB_USERNAME }}/ecommerce-be
  tags: |
    type=raw,value=latest
    type=sha,prefix=sha-,format=short
```

Y nghia:
- `PR -> test only`
- `push main -> test + build + push Docker Hub`
- artifact image co `latest` va `sha-*`

## 20. Dependency/test tooling

File: [be/pyproject.toml](/D:/Workspace/MHH/Ecommerce/be/pyproject.toml:1) va [be/uv.lock](/D:/Workspace/MHH/Ecommerce/be/uv.lock:1)

Da them:
- `redis`
- `pytest`
- `httpx`
- cac package test lien quan

Y nghia:
- CI va test local co dependency ro rang, lock lai duoc.

## Buoc tiep theo goi y

Co 2 huong hop ly:

1. Gom cac phan tren thanh mot tai lieu kien truc backend hien tai de doc nhanh hon.
2. Chi ra chinh xac phan nao van con chua hoan thien hoac nen sua tiep, vi du Docker runtime, integration test that, auto-deploy.
