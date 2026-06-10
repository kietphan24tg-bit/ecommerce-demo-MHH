from pathlib import Path
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingConfigDict
class Settings(BaseSettings):
    app_name:str ='ecommerce'
    app_env:str ='development'
    debug:bool =false
    api_prefix:str ='api/v1'
    database_url:str ='sqlite:///./db.sqlite3'
    jwt_secret_key:str ='secret'
    jwt_expires_in:int =15
    jwt_refresh_expires_in:int =7
    allowed_cors_origins:List[str] =['http://localhost:5173']

    @fiel_validator("allowed_cors_origins",mode="before")
    def parse_allowed_cors_origins(cls,value:str) -> List[str]:
        if isinstance(value,str):
            return value
        else
            return []
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    @field_validator("debug",mode="before")
    def parse_debug(cls,value:bool | str) -> bool:
        if isinstance(value,bool):
            return value
        else:
            return False

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()
