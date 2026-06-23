# Ecommerce Backend (FastAPI)

FastAPI backend for the ecommerce platform. The official runtime artifact is the Docker image published to Docker Hub on merges to `main`.

## Requirements

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Docker (optional, for container workflow)
- PostgreSQL and Redis for local development

## Local development

1. Copy the environment template and fill in values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
uv sync
```

3. Run migrations and start the API:

```bash
make dev
```

The API listens on `http://0.0.0.0:4000`.

Useful endpoints:

- `GET /health` — liveness probe
- `GET /ready` — readiness probe (database + Redis)
- `GET /api/v1/...` — application routes

## Tests

Install dev dependencies:

```bash
uv sync --group dev
```

Run the default CI test scope (unit + api):

```bash
make test
```

Other targets:

```bash
make test-unit
make test-api
make test-integration
```

Pytest markers:

- `unit` — fast isolated tests
- `api` — HTTP tests with FastAPI `TestClient`
- `integration` — reserved for Postgres/Redis service-container tests

## Docker

Build the image locally:

```bash
make docker-build
```

Run the container with a valid `.env` file:

```bash
make docker-run
```

### Image contract

| Item | Value |
|------|-------|
| Build context | `be/` |
| Exposed port | `4000` |
| Startup flow | `uv sync` deps → `alembic upgrade head` → `uvicorn` |
| Registry image | `<dockerhub-username>/ecommerce-be` |
| Official tags | `latest`, `sha-<short_commit_sha>` |

The image does not bake secrets. Provide runtime configuration through environment variables.

### Required runtime environment

At minimum, a production container needs:

- `database_url` — PostgreSQL connection string
- `jwt_secret_key` — signing secret for access tokens
- `redis_url` — Redis endpoint when `rate_limit_enabled=true`

See `.env.example` for the full environment contract.

## CI/CD

GitHub Actions workflows:

| File | Role |
|------|------|
| `.github/workflows/backend-ci.yml` | Test on PR and push to `main` |
| `.github/workflows/backend-publish.yml` | Build and push Docker image after CI passes on `main` |

| Event | Actions |
|-------|---------|
| Pull request to `main` | Run `unit` + `api` tests only |
| Push to `main` | Run tests, then publish image to Docker Hub |

`backend-publish` is triggered by `workflow_run` when `Backend CI` succeeds on a `push` to `main`. PR runs never publish images.

Published tags on `main`:

- `latest`
- `sha-<short_commit_sha>`

PR workflows do not publish images.

### GitHub secrets

Configure these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Makefile reference

| Command | Description |
|---------|-------------|
| `make migrate` | Apply Alembic migrations |
| `make run` | Start uvicorn with reload |
| `make dev` | Migrate then run |
| `make test` | Run unit + api tests |
| `make docker-build` | Build local Docker image |
| `make docker-run` | Run image with `.env` |
