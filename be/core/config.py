from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()
