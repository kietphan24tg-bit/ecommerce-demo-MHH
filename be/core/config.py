from functools import lru_cache
from pathlib import Path
from typing import List, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

CookieSameSite = Literal["lax", "strict", "none"]
DEVELOPMENT_ENVS = frozenset({"development", "dev", "local", "test"})


class Settings(BaseSettings):
    app_name: str = "ecommerce"
    app_env: str = "development"
    debug: bool = False
    api_prefix: str = "api/v1"
    database_url: str = "sqlite:///./db.sqlite3"
    jwt_secret_key: str = "secret"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "ecommerce-api"
    jwt_expires_in: int = 15
    jwt_refresh_expires_in: int = 7
    mail_enabled: bool = False
    mail_from: str = "noreply@example.com"
    mail_from_name: str = "Ecommerce"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_timeout_seconds: int = 10
    password_reset_code_expires_in: int = 10
    password_reset_token_expires_in: int = 15
    password_reset_code_length: int = 6
    allowed_cors_origins: List[str] = ["http://localhost:5173"]
    trusted_proxy: bool = False
    auth_cross_site: bool = False
    refresh_cookie_secure: bool | None = None
    refresh_cookie_samesite: CookieSameSite | None = None
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    facebook_client_id: str = ""
    facebook_client_secret: str = ""
    facebook_redirect_uri: str = ""
    redis_url: str = "redis://localhost:6379/0"
    rate_limit_enabled: bool = True
    rate_limit_global_requests: int = 120
    rate_limit_global_window_seconds: int = 60
    rate_limit_login_ip_requests: int = 10
    rate_limit_login_ip_window_seconds: int = 60
    rate_limit_login_identifier_requests: int = 5
    rate_limit_login_identifier_window_seconds: int = 900
    rate_limit_register_ip_requests: int = 5
    rate_limit_register_ip_window_seconds: int = 3600
    rate_limit_register_email_requests: int = 3
    rate_limit_register_email_window_seconds: int = 3600
    rate_limit_forgot_request_ip_requests: int = 10
    rate_limit_forgot_request_ip_window_seconds: int = 3600
    rate_limit_forgot_request_email_requests: int = 3
    rate_limit_forgot_request_email_window_seconds: int = 3600
    rate_limit_forgot_request_cooldown_seconds: int = 60
    rate_limit_forgot_verify_ip_requests: int = 20
    rate_limit_forgot_verify_ip_window_seconds: int = 3600
    rate_limit_forgot_verify_email_requests: int = 5
    rate_limit_forgot_verify_email_window_seconds: int = 900
    rate_limit_forgot_verify_max_attempts: int = 5
    rate_limit_forgot_verify_attempt_window_seconds: int = 900
    rate_limit_forgot_reset_email_requests: int = 5
    rate_limit_forgot_reset_email_window_seconds: int = 3600
    rate_limit_refresh_ip_requests: int = 30
    rate_limit_refresh_ip_window_seconds: int = 600

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

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if not isinstance(value, str):
            return value

        url = value.strip()
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql+psycopg2://"):
            return "postgresql+psycopg://" + url[len("postgresql+psycopg2://") :]
        if url.startswith("postgresql://"):
            return "postgresql+psycopg://" + url[len("postgresql://") :]
        return url

    @classmethod
    @field_validator("allowed_cors_origins", mode="before")
    def parse_allowed_cors_origins(cls, value: str | list) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return value
        return []

    @classmethod
    @field_validator("debug", mode="before")
    def parse_debug(cls, value: bool | str) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "yes", "t", "on")
        return False

    @classmethod
    @field_validator("rate_limit_enabled", mode="before")
    def parse_rate_limit_enabled(cls, value: bool | str) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "yes", "t", "on")
        return False

    @classmethod
    @field_validator("trusted_proxy", "auth_cross_site", mode="before")
    def parse_bool_flags(cls, value: bool | str) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "yes", "t", "on")
        return False

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
