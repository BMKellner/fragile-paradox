from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from openai import OpenAI
from pdfminer.high_level import extract_text
import json, uuid, docx, os
from datetime import datetime
from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.core.config import Settings
from app.models.resumes import ResumeSchema


settings = Settings() # type: ignore
router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.get("/")
async def supabase_test(user=Depends(verify_token)):
    """Simple endpoint to test Supabase connection"""

    try:
        supabase = get_supabase_client()
        response = supabase.from_("resumes").select("*").eq("user_id", user.id).execute()

        return {"success": True, "data": response.data, "response": response}
    except Exception as e:
        return {"error": f"Supabase error: {str(e)}"}

@router.post("/")
async def upload_resume(file: UploadFile = File(...), user=Depends(verify_token)):
    """Endpoint to upload resume metadata to Supabase"""


    gpt_client = OpenAI(api_key=settings.openai_api_key)
    if not gpt_client:
        return {"error": "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file"}
    
    # Save uploaded file temporarily
    file_path = f"temp_{file.filename}"
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    try:
        # Extract text based on file type
        if file.filename:
            if file.filename.endswith(".pdf"):
                text = extract_text(file_path)
            elif file.filename.endswith(".docx"):  
                doc = docx.Document(file_path)
                text = "\n".join([p.text for p in doc.paragraphs])
            else:
                return {"error": "Unsupported file type. Please upload a PDF or DOCX file."}
        else:
            return {"error": "No file uploaded."}

        # OpenAI call
        response = gpt_client.responses.parse(
            model="gpt-4o",
            input=[
                {"role": "system", "content": "You are a resume parser that outputs JSON only."},
                {"role": "system", "content": "if nothing is parsed for the overview section, automatically generate only the overview, and leave career_name empty"},
                {"role": "user", "content": f"""
                    Parse this resume text: {text}
                 """}
            ],
            text_format=ResumeSchema
        )

        if not response or not response.output_parsed:
            return {"error": "No response from OpenAI"}

        parsed_resume: ResumeSchema = response.output_parsed
        parsed_json = json.loads(parsed_resume.model_dump_json())
        parsed_json["resume_pdf"] = file.filename
        parsed_json["portfolio_id"] = str(uuid.uuid4())

    except Exception as e:
        return {"error": f"Error processing resume: {str(e)}"}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    try:
        supabase = get_supabase_client()

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        path = f"{user.id}/resumes/{timestamp}_{file.filename}"

        # Upload to supabase bucket
        response = supabase.storage.from_("users").upload(path, contents)

        # Upload to supabase pg table
        supabase.table("resumes").insert({
            "user_id": user.id,
            "data": parsed_json,
        }).execute()

        return {"success": True, "data": parsed_json}
    except Exception as e:
        print(e)
        return {"error": f"Supabase error: {str(e)}"}
