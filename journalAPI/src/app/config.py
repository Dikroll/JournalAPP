from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  

class Settings(BaseSettings):
    UPSTREAM_BASE_URL: str
    UPSTREAM_APP_KEY: str
    SECRET_KEY: str
    ENCRYPT_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    BASE_URL: str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8"
    )

settings = Settings()