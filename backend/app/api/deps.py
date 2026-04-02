from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase_auth import User

from app.core.supabase_client import get_supabase_client


security = HTTPBearer()

def get_access_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    return credentials.credentials

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    supabase = get_supabase_client()
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
