# Ecommerce

Full-stack ecommerce project built as a monorepo with a FastAPI backend and a React frontend workspace.

## Overview

This repository focuses on a production-oriented backend for common ecommerce flows such as authentication, product browsing, carts, orders, saved items, and admin-facing catalog management.

The backend is the most complete part of the project today. The frontend workspace already contains route and page scaffolding for user and admin screens, and is being expanded on top of that structure.

## Tech Stack

### Backend

- FastAPI
- Python 3.12
- PostgreSQL
- SQLAlchemy
- Alembic
- Redis
- PyJWT
- Docker
- GitHub Actions

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Hook Form
- Zod

## Repository Structure

```text
.
|-- be/                 # FastAPI backend
|-- fe/ecommerce/       # React frontend
|-- docs/               # Project notes and design docs
`-- .github/workflows/  # CI/CD workflows
```

## Architecture

The backend is organized with a modular, feature-first structure.

Instead of placing all routers, services, and database models into global shared folders, each business area is grouped into its own slice under `be/modules/`. Current slices include:

- `auth`
- `users`
- `products`
- `categories`
- `carts`
- `orders`
- `saved_items`

Each slice owns the files needed for that feature, for example:

```text
be/modules/auth/
|-- router.py
|-- service.py
|-- repository.py
|-- dependencies.py
|-- security.py
|-- email_service.py
|-- schemas/
`-- models/
```

This is effectively a vertical-slice approach:

- `router` handles HTTP entry points
- `service` contains feature business logic
- `repository` manages persistence access
- `schemas` define request and response contracts
- `models` define database entities related to that feature

Cross-cutting concerns that are shared across slices live outside the modules in folders such as:

- `be/core` for config, logging, middleware, exception handling, rate limiting, Redis helpers
- `be/db` for database/session lifecycle and shared base classes
- `be/api/v1` for API composition and top-level router wiring

This structure keeps feature logic localized, reduces coupling between domains, and makes it easier to add or refactor slices such as `orders` or `products` without turning the backend into a single large service layer.

## Backend Features

- REST API for auth, users, products, categories, carts, orders, and saved items
- JWT-based authentication with refresh-token flow
- Password reset and optional Google/Facebook OAuth hooks
- PostgreSQL persistence with Alembic migrations
- Redis-backed rate limiting and readiness checks
- Structured test scopes for unit, API, and integration testing
- Docker image build and publish workflow on merges to `main`

## Frontend Scope

The frontend workspace currently includes route/page structure for:

- Authentication: login, register, forgot password
- User flows: product listing, product detail, cart, checkout, saved items
- Admin flows: dashboard, category management, product management, settings

Note: the root `App.tsx` is still a starter placeholder, so the frontend is not yet fully wired into the route structure.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Ecommerce
```

### 2. Run the backend

```bash
cd be
cp .env.example .env
uv sync
make dev
```

Backend runs at `http://127.0.0.1:4000`.

Useful endpoints:

- `GET /health`
- `GET /ready`
- `GET /api/v1/...`

### 3. Run the frontend

```bash
cd fe/ecommerce
pnpm install
pnpm dev
```

Frontend runs at `http://127.0.0.1:5173`.

## Backend Environment

The backend expects these core services:

- PostgreSQL for relational data
- Redis for rate limiting and readiness checks

Important environment variables are already documented in [be/.env.example](./be/.env.example).

## Backend Scripts

Run these from `be/`:

```bash
make migrate
make run
make dev
make test
make test-unit
make test-api
make test-integration
make docker-build
make docker-run
```

## Testing

Backend tests are organized into three scopes:

- `unit`: fast isolated tests
- `api`: HTTP tests using FastAPI `TestClient`
- `integration`: tests that require external services

Default CI scope:

```bash
cd be
make test
```

## CI/CD

GitHub Actions currently automate the backend workflow:

- `backend-ci.yml`: runs tests on pull requests and pushes to `main`
- `backend-publish.yml`: builds and pushes the backend Docker image after CI passes on `main`

## Current Status

- Backend: active and structured for local development, testing, and container publishing
- Frontend: UI structure and routes are present, but app integration is still in progress

## Notes

- Backend README: [be/README.md](./be/README.md)
- Frontend README: [fe/ecommerce/README.md](./fe/ecommerce/README.md)
