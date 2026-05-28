from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "football_value"
    postgres_user: str = "football"
    postgres_password: str = "football"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    api_football_key: str = ""
    fonbet_base_url: str = ""
    winline_base_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            "postgresql+psycopg://"
            f"{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"

    @property
    def cors_origins(self) -> list[str]:
        if self.app_env == "local":
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        return []


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
