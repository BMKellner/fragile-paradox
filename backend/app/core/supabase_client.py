from supabase import create_client, Client
from app.core.config import Settings


def get_supabase_client() -> Client:
    settings = Settings() # type: ignore
    supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return supabase
