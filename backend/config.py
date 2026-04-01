from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    session_token_budget: int = 15000  # max tokens per session; override via SESSION_TOKEN_BUDGET in .env

    model_config = {"env_file": ".env"}


settings = Settings()
