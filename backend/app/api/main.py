from fastapi import APIRouter
from app.api.routes import resumes, users

api_router = APIRouter()

api_router.include_router(resumes.router)
api_router.include_router(users.router)
