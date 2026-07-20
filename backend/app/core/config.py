"""
Application configuration.

All runtime configuration is sourced from environment variables via Pydantic
Settings. Nothing in this codebase should read `os.environ` directly anywhere
else — this module is the single source of truth for config, which keeps
config validation centralized and makes misconfiguration fail fast at
startup instead of deep inside a request handler.
"""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- Application ---
    PROJECT_NAME: str = "DocMind AI"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development")  # development | staging | production
    DEBUG: bool = Field(default=True)

    # --- Security (wired up fully in Milestone 2, declared now so config
    # validation is centralized from day one) ---
    SECRET_KEY: str = Field(..., min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)
    ALGORITHM: str = Field(default="HS256")

    # --- Database ---
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str = Field(default="localhost")
    POSTGRES_PORT: int = Field(default=5432)
    POSTGRES_DB: str

    # --- File storage ---
    UPLOAD_DIR: str = Field(default="storage/uploads")
    MAX_UPLOAD_SIZE_MB: int = Field(default=20)

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # --- Vector store (Milestone 4) ---
    VECTOR_STORE_DIR: str = Field(default="storage/vectorstore")

        # --- Groq ---
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL_NAME: str = Field(default="llama-3.3-70b-versatile")

    # --- CORS ---
    # Stored as the raw env string (not List[str]) deliberately:
    # pydantic-settings attempts to JSON-decode any List[...]-typed field
    # sourced from an env var *before* any field_validator runs, which
    # crashes on a plain comma-separated value like
    # "http://localhost:5173,http://localhost:3000". Keeping this as `str`
    # and parsing it ourselves in `cors_origins` avoids that entirely.
    BACKEND_CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings accessor. `lru_cache` ensures the .env file is parsed and
    validated exactly once per process, and gives us a single settings
    instance to inject via FastAPI's dependency system.
    """
    return Settings()


settings = get_settings()
