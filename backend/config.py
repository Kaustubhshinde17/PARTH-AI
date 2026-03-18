from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/parthai"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "your-super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openai_api_key: str = ""
    groq_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_env: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
