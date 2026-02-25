from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    UPSTREAM_BASE_URL: str = "https://msapi.top-academy.ru/api/v2"
    UPSTREAM_APP_KEY: str = "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6"


    SECRET_KEY: str = "6f9d4c3e7a2b8f1c9d0e5a4b7c8f2d1e3a6b9c0d4e7f8a1b2c3d5e6f7a8b9c0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 дней — в отличие от upstream

    class Config:
        env_file = ".env"


settings = Settings()