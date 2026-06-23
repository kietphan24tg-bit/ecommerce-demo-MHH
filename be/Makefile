.PHONY: migrate migrate-down revision run dev test test-unit test-api test-integration docker-build docker-run

# Run from be/ directory: make migrate
migrate:
	uv run alembic upgrade head

migrate-down:
	uv run alembic downgrade -1

revision:
	uv run alembic revision --autogenerate -m "$(msg)"

run:
	uv run uvicorn main:app --host 0.0.0.0 --port 4000 --reload

dev: migrate run

test:
	uv run pytest -m "unit or api"

test-unit:
	uv run pytest -m unit

test-api:
	uv run pytest -m api

test-integration:
	uv run pytest -m integration

docker-build:
	docker build -t ecommerce-be .

docker-run:
	docker run --rm -p 4000:4000 --env-file .env ecommerce-be
