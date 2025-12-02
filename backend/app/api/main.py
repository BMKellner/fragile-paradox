from fastapi import APIRouter
from app.api.routes import supabase_routes, profiles, portfolios
from app.api.routes import resumes, users

api_router = APIRouter()

api_router.include_router(resumes.router)
api_router.include_router(users.router)
api_router.include_router(supabase_routes.router)
api_router.include_router(profiles.router)
api_router.include_router(portfolios.router)
