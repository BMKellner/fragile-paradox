from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    openai_api_key: str
    supabase_url: str
    supabase_pub_key: str
    supabase_service_role_key: str

    model_config = SettingsConfigDict(
            env_file=".env",
    )
