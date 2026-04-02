from fastapi import APIRouter, Depends
from app.api.deps import verify_token
from app.services.refresh_similarity import refresh_user_similarity

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/refresh")
async def refresh_recommendations(user=Depends(verify_token)):
    results = refresh_user_similarity(str(user.id))
    return {
        "success": True,
        "count": len(results),
        "data": results,
    }