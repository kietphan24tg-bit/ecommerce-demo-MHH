"""Shared pytest configuration and fixtures."""

from __future__ import annotations

import os
from pathlib import Path

# Configure the test environment before importing application modules.
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./.pytest.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-min-32-chars-long")
os.environ.setdefault("RATE_LIMIT_ENABLED", "true")
os.environ.setdefault("MAIL_ENABLED", "false")
os.environ.setdefault("DEBUG", "false")

import fakeredis
import pytest
from fastapi.testclient import TestClient

from core.config import Settings, get_settings
from db.base import Base
from db.database import SessionLocal

TEST_DB_PATH = Path(__file__).resolve().parents[1] / ".pytest.db"
_fake_redis = fakeredis.FakeRedis(decode_responses=True)


def _get_test_redis():
    return _fake_redis


def _import_models() -> None:
    from modules.auth.models.password_reset import PasswordReset  # noqa: F401
    from modules.auth.models.session import Session  # noqa: F401
    from modules.auth.models.user_provider import UserProvider  # noqa: F401
    from modules.categories.model import Category  # noqa: F401
    from modules.carts.cart_item import CartItem  # noqa: F401
    from modules.orders.models.address import Address  # noqa: F401
    from modules.orders.models.order import Order  # noqa: F401
    from modules.orders.models.payment_method import PaymentMethod  # noqa: F401
    from modules.orders.models.promotion import Promotion  # noqa: F401
    from modules.orders.models.shipping_method import ShippingMethod  # noqa: F401
    from modules.products.models.benefits import Benefits  # noqa: F401
    from modules.products.models.product import Product  # noqa: F401
    from modules.products.models.product_review import ProductReview  # noqa: F401
    from modules.saved_items.model import SavedItem  # noqa: F401
    from modules.users.model import User  # noqa: F401


def _patch_redis_clients() -> None:
    import core.health
    import core.rate_limit.policies
    import core.redis

    core.redis.get_redis = _get_test_redis
    core.health.get_redis = _get_test_redis
    core.rate_limit.policies.get_redis = _get_test_redis
    core.redis.set_redis_degraded(False)


get_settings.cache_clear()
_import_models()
_patch_redis_clients()

from db.database import engine  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def database_schema() -> None:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture(autouse=True)
def reset_redis_state() -> None:
    _fake_redis.flushall()
    import core.redis

    core.redis.set_redis_degraded(False)


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def settings() -> Settings:
    get_settings.cache_clear()
    return get_settings()


@pytest.fixture
def test_settings(monkeypatch: pytest.MonkeyPatch) -> Settings:
    get_settings.cache_clear()
    return get_settings()
