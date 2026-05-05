from fastapi import APIRouter
from app.api.routes import profiles, portfolios
from app.api.routes import resumes, users, user_templates

api_router = APIRouter()

api_router.include_router(resumes.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(portfolios.router)
api_router.include_router(user_templates.router)
