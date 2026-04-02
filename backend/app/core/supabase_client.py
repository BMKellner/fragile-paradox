from supabase import Client, ClientOptions, create_client

from app.core.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

def get_user_supabase_client(access_token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {access_token}"})
    return create_client(settings.supabase_url, settings.supabase_pub_key, options=options)
