from fastapi import APIRouter, Depends, UploadFile, File
from openai import OpenAI
from pdfminer.high_level import extract_text
import json, uuid, docx, os
from datetime import datetime
from app.core.authenticate_user import verify_token
from app.core.supabase_client import get_supabase_client
from app.core.config import Settings


settings = Settings() # type: ignore
router = APIRouter(prefix="/supabase", tags=["supabase"])

@router.get("/users")
async def supabase_test(user=Depends(verify_token)):
    """Simple endpoint to test Supabase connection"""

    try:
        supabase = get_supabase_client()
        response = supabase.from_("users").select("*").execute()

        return {"success": True, "data": response.data, "response": response}
    except Exception as e:
        return {"error": f"Supabase error: {str(e)}"}


@router.post("/upload_resume")
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
        response = gpt_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a resume parser that outputs JSON only."},
                {"role": "user", "content": f"""
                    Parse this resume into JSON with this schema:
                    {{
                      "resume_pdf": "string",
                      "portfolio_id": "string",
                      "personal_information": {{
                        "full_name": "string",
                        "contact_info": {{
                          "email": "string",
                          "linkedin": "string",
                          "phone": "string",
                          "address": "string"
                        }},
                        "education": {{
                          "school": "string",
                          "majors": ["string"],
                          "minors": ["string"],
                          "expected_grad": "string"
                        }}
                      }},
                      "section_data": [
                        {{
                          "name": "string",
                          "items": ["string"]
                        }}
                      ]
                    }}

                    Resume text:
                    {text}
               """}
            ],
            response_format={"type": "json_object"}
        )

        parsed_json = json.loads(response.choices[0].message.content)
        parsed_json["resume_pdf"] = file.filename
        parsed_json["portfolio_id"] = str(uuid.uuid4())
    except Exception as e:
        return {"error": f"Error processing resume: {str(e)}"}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    try:
        supabase = get_supabase_client()

        if not supabase:
            return {"error": "Supabase client not configured. Please set SUPABASE_URL and SUPABASE_KEY in your .env file"}

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        path = f"{user.id}/{timestamp}_{file.filename}"
        response = supabase.storage.from_("resumes").upload(path, contents)

        return {"success": True, "data": parsed_json}
    except Exception as e:
        print(e)
        return {"error": f"Supabase error: {str(e)}"}

