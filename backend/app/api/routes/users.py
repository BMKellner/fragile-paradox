from fastapi import APIRouter, UploadFile, File, Depends, Response
from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.core.config import Settings


router = APIRouter(prefix="/user", tags=["users"])
settings = Settings()  # type: ignore

@router.get("/")
async def read_user(user=Depends(verify_token)):
    """Endpoint to read user info"""
    return {"user_id": user.id, "email": user.email}

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
        return {"error": f"Supabase error: {str(e)}"}

@router.get("/pfp")
async def get_pfp(user=Depends(verify_token)):
    """Endpoint to get profile picture from Supabase Storage"""

    try:
        supabase = get_supabase_client()

        # Get filetype
        pfp_response = supabase.storage.from_("users").list(user.id,options={
            "limit": 1,
            "search": "profile_picture"
            })
        content_type = pfp_response[0]['metadata']['mimetype']

        response = supabase.storage.from_("users").download(f"{user.id}/profile_picture")

        return Response(content=response, media_type=content_type)

    except Exception as e:
        return {"error": f"Supabase error: {str(e)}"}

