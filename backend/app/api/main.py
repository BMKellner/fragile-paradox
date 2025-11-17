from fastapi import APIRouter, Depends, UploadFile, File
from app.core.config import Settings
from app.api.routes import supabase_routes

api_router = APIRouter()

api_router.include_router(supabase_routes.router)
