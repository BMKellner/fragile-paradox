from fastapi import APIRouter, Request
from supabase import ClientOptions, create_client, Client
from postgrest import SyncPostgrestClient
from typing import Union
import os

import supabase

router = APIRouter(prefix="/supabase", tags=["supabase"])


def get_postgrest_client(access_token: str) -> Union[SyncPostgrestClient, None]:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_KEY not found in environment variables")
        print("Please set these variables in your .env file")
        return None

    supabase: Client = create_client(url, key)

    print(supabase.auth.get_user(access_token))

    client = supabase.postgrest.auth(access_token)
    return client

@router.get("/users")
async def supabase_test(request: Request):
    """Simple endpoint to test Supabase connection"""
    auth_header = request.headers.get("authorization")
    access_token = auth_header.split(" ")[1] if auth_header else None

    if not access_token:
        return {"error": "Authorization header missing or malformed"}

    try:
        supabase = get_postgrest_client(access_token)

        if not supabase:
            return {"error": "Supabase client not configured. Please set SUPABASE_URL and SUPABASE_KEY in your .env file"}

        response = supabase.from_("users").select("*").execute()

        return {"success": True, "data": response.data, "response": response}
    except Exception as e:
        return {"error": f"Supabase error: {str(e)}"}

@router.post("/upload_resume")
async def upload_resume(request: Request):
    """Endpoint to upload resume metadata to Supabase"""
    auth_header = request.headers.get("authorization")
    access_token = auth_header.split(" ")[1] if auth_header else None

    if not access_token:
        return {"error": "Authorization header missing or malformed"}

    try:
        supabase = get_postgrest_client(access_token)

        if not supabase:
            return {"error": "Supabase client not configured. Please set SUPABASE_URL and SUPABASE_KEY in your .env file"}

        data = await request.json()
        response = supabase.from_("resumes").insert(data).execute()

        return {"success": True, "data": response.data, "response": response}
    except Exception as e:
        return {"error": f"Supabase error: {str(e)}"}

