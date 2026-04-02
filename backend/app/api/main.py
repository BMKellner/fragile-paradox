from fastapi import APIRouter
from app.api.routes import layouts, portfolios, profiles, resumes, users, recommendations

api_router = APIRouter()

api_router.include_router(resumes.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(portfolios.router)
api_router.include_router(layouts.router)
api_router.include_router(recommendations.router)
