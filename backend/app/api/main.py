from fastapi import APIRouter, Depends, UploadFile, File
from app.core.config import Settings
from app.api.routes import supabase_routes, profiles, portfolios

api_router = APIRouter()

api_router.include_router(supabase_routes.router)
api_router.include_router(profiles.router)
api_router.include_router(portfolios.router)
