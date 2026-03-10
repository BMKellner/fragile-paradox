from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.layouts import Layout, LayoutCreate


router = APIRouter(prefix="/layouts", tags=["layouts"])


def _get_owned_layout(supabase, layout_id: str, user_id: str):
    response = (
        supabase.table("layouts")
        .select("*")
        .eq("layout_id", layout_id)
        .eq("creator_id", user_id)
        .execute()
    )

    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Layout not found")

    return response.data[0]


@router.post("/", response_model=Layout)
async def create_layout(payload: LayoutCreate, user=Depends(verify_token)):
    """Create a layout for the authenticated user."""
    try:
        supabase = get_supabase_client()

        if payload.creator_id and payload.creator_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only create layouts for your own user",
            )

        insert_data = payload.model_dump(exclude={"creator_id"})
        insert_data["creator_id"] = user.id

        response = supabase.table("layouts").insert(insert_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create layout")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating layout: {str(e)}")


@router.get("/", response_model=List[Layout])
async def get_my_layouts(user=Depends(verify_token), limit: int = 50, offset: int = 0):
    """Get all layouts for the authenticated user."""
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("layouts")
            .select("*")
            .eq("creator_id", user.id)
            .order("created_at", desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching layouts: {str(e)}")


@router.get("/public", response_model=List[Layout])
async def get_public_layouts(limit: int = 50, offset: int = 0):
    """Get all public layouts."""
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("layouts")
            .select("*")
            .eq("visibility", "public")
            .order("created_at", desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching public layouts: {str(e)}"
        )


@router.delete("/{layout_id}")
async def delete_layout(layout_id: str, user=Depends(verify_token)):
    """Delete a layout that belongs to the authenticated user."""
    try:
        supabase = get_supabase_client()
        _get_owned_layout(supabase, layout_id, user.id)

        supabase.table("layouts").delete().eq("layout_id", layout_id).execute()

        return {"success": True, "message": "Layout deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting layout: {str(e)}")
