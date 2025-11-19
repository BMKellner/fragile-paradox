from fastapi import APIRouter, UploadFile, File, Depends, Response, HTTPException
from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.core.config import Settings
from app.models.users import UserUpdate


router = APIRouter(prefix="/users", tags=["users"])
settings = Settings()  # type: ignore

@router.get("/")
async def read_user(user=Depends(verify_token)):
    supabase = get_supabase_client()
    response = supabase.table("users").select("*").eq("id", user.id).execute()
    return {"success": True, "data": response.data[0] if response.data else None}

@router.patch("/")
async def supabase_patch(
    payload: UserUpdate,
    user=Depends(verify_token)
):
    try:
        supabase = get_supabase_client()

        # Only include fields that user actually sent
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(400, "No fields provided to update")

        response = (
            supabase
            .from_("users")
            .update(update_data)
            .eq("id", user.id)
            .execute()
        )

        return {"success": True, "updated": update_data, "response": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Supabase error: {str(e)}")

@router.post("/pfp")
async def upload_pfp(file: UploadFile = File(...), user=Depends(verify_token)):
    """Endpoint to upload profile picture to Supabase Storage"""

    try:
        contents = await file.read()
        if file.content_type not in ["image/jpeg", "image/png"]:
            return {"error": "Unsupported file type. Please upload a JPEG or PNG image."}


        supabase = get_supabase_client()


        path = f"{user.id}/profile/profile_picture"
        response = (
            supabase.storage
            .from_("users")
            .update(
                path,
                file=contents,
                file_options={
                    "upsert": "true",
                    "content-type": file.content_type,
                    }
            )
        )

        return {"success": True, "data": response}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload profile picture: {str(e)}"
        )

@router.get("/pfp")
def get_profile_picture(user=Depends(verify_token)):
    supabase = get_supabase_client()

    try:
        path = f"{user.id}/profile/"
        files = supabase.storage.from_("users").list(
            path,
            options={"limit": 1, "search": "profile_picture"}
        )
        if not files:
            raise HTTPException(status_code=404, detail="Profile picture not found")

        mimetype = files[0]["metadata"]["mimetype"]


        resp = supabase.storage.from_("users").download(path + "profile_picture")

        if resp is None:
            raise HTTPException(status_code=404, detail="Profile picture missing")

        return Response(content=resp, media_type=mimetype)

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error retrieving profile picture: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve profile picture"
        )
