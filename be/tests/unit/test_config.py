import pytest

from core.config import Settings, get_settings


@pytest.mark.unit
def test_database_url_normalizes_postgres_scheme() -> None:
    settings = Settings(database_url="postgres://user:pass@localhost:5432/app")
    assert settings.database_url == "postgresql+psycopg://user:pass@localhost:5432/app"


@pytest.mark.unit
def test_database_url_normalizes_postgresql_scheme() -> None:
    settings = Settings(database_url="postgresql://user:pass@localhost:5432/app")
    assert settings.database_url == "postgresql+psycopg://user:pass@localhost:5432/app"


@pytest.mark.unit
@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("true", True),
        ("1", True),
        ("yes", True),
        ("false", False),
        ("0", False),
    ],
)
def test_boolean_env_parsing(raw: str, expected: bool) -> None:
    settings = Settings(debug=raw, rate_limit_enabled=raw)
    assert settings.debug is expected
    assert settings.rate_limit_enabled is expected


@pytest.mark.unit
def test_refresh_cookie_flags_in_development() -> None:
    settings = Settings(app_env="development")
    assert settings.resolved_refresh_cookie_secure is False
    assert settings.resolved_refresh_cookie_samesite == "lax"


@pytest.mark.unit
def test_refresh_cookie_flags_in_production() -> None:
    settings = Settings(app_env="production")
    assert settings.resolved_refresh_cookie_secure is True
    assert settings.resolved_refresh_cookie_samesite == "lax"


@pytest.mark.unit
def test_refresh_cookie_flags_for_cross_site_auth() -> None:
    settings = Settings(app_env="production", auth_cross_site=True)
    assert settings.resolved_refresh_cookie_secure is True
    assert settings.resolved_refresh_cookie_samesite == "none"


@pytest.mark.unit
def test_refresh_cookie_flags_honor_explicit_overrides() -> None:
    settings = Settings(
        app_env="production",
        refresh_cookie_secure=False,
        refresh_cookie_samesite="strict",
    )
    assert settings.resolved_refresh_cookie_secure is False
    assert settings.resolved_refresh_cookie_samesite == "strict"


@pytest.mark.unit
def test_get_settings_is_cached() -> None:
    get_settings.cache_clear()
    first = get_settings()
    second = get_settings()
    assert first is second
