import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response
from starlette.status import HTTP_201_CREATED

from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.core.text_extract import extract_text_from_upload
from app.core.resume_parser import parse_resume_with_openai
from app.models.resumes import ResumeSchema, Resume


router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.get("/")
async def list_resumes(user=Depends(verify_token), limit: int = 50, offset: int = 0):
    """List all resumes for the authenticated user."""

    try:
        supabase = get_supabase_client()
        response = supabase.table("resumes")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")

@router.get("/{resume_id}")
async def get_resume(resume_id: str, user=Depends(verify_token)):
    """Get a specific resume by ID for the authenticated user."""

    try:
        supabase = get_supabase_client()
        response = supabase.from_("resumes").select("*").eq("id", resume_id).eq("user_id", user.id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")

@router.get("/{resume_id}/download")
async def download_resume(resume_id: str, user=Depends(verify_token)):
    """Download the resume file by ID for the authenticated user."""

    try:
        supabase = get_supabase_client()
        response = supabase.from_("resumes").select("*").eq("id", resume_id).eq("user_id", user.id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume = Resume.model_validate(response.data[0])
        file_path = resume.file_path

        download_response = supabase.storage.from_("users").download(file_path)

        if not download_response:
            raise HTTPException(status_code=404, detail="File not found in storage")

        return Response(
            content=download_response,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={resume.title}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")

@router.delete("/{resume_id}", status_code=204)
async def delete_resume(resume_id: str, user=Depends(verify_token)):
    """Delete a specific resume by ID for the authenticated user."""

    try:
        supabase = get_supabase_client()
        response = supabase.from_("resumes").select("*").eq("id", resume_id).eq("user_id", user.id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume = Resume.model_validate(response.data[0])
        file_path = resume.file_path

        # Delete from storage
        supabase.storage.from_("users").remove([file_path])

        # Delete from database
        supabase.from_("resumes").delete().eq("id", resume_id).eq("user_id", user.id).execute()

        return Response(status_code=204)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")



@router.post("/", status_code=HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(verify_token),
):
    supabase = get_supabase_client()

    allowed_types = {
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    }

    if not file.filename:
        raise HTTPException(400, "No file uploaded.")
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Only PDF and DOCX files are allowed.")

    ext = allowed_types[file.content_type]
    resume_id = str(uuid.uuid4())
    file_path = f"{user.id}/resumes/{resume_id}{ext}"

    file_bytes = await file.read()

    text = extract_text_from_upload(file, file_bytes)

    uploaded = False  # Track if storage file exists

    try:

        # Parse resume with OpenAI
        parsed_resume: ResumeSchema = parse_resume_with_openai(text)

        # Upload file to Supabase Storage
        supabase.storage.from_("users").upload(
            file_path,
            file_bytes,
            {
                "content-type": file.content_type
            }
        )

        uploaded = True

        # Insert row into database
        resume_entry = Resume(
            id=resume_id,
            user_id=user.id,
            title=file.filename,
            file_path=file_path,
            data=parsed_resume,
                )

        payload = resume_entry.model_dump()

        result = supabase.table("resumes").insert(payload).execute()
        if not result.data or len(result.data) == 0:
            raise Exception("No data returned from insert.")

        return JSONResponse(status_code=HTTP_201_CREATED, content=result.data[0])

    except Exception as e:
        # Roll back storage file if created
        if uploaded:
            try:
                supabase.storage.from_("users").remove([file_path])
            except:
                pass

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )
