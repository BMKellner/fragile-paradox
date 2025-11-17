from fastapi import APIRouter
from app.api.routes import resumes, profile_picture

api_router = APIRouter()

api_router.include_router(resumes.router)
api_router.include_router(profile_picture.router)
