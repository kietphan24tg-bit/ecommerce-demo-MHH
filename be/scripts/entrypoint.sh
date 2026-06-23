#!/usr/bin/env sh
set -eu

echo "Running database migrations..."
uv run alembic upgrade head

echo "Starting application..."
exec uv run uvicorn main:app --host 0.0.0.0 --port "${PORT:-4000}"
