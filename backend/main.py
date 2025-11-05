from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pdfminer.high_level import extract_text
import docx, uuid, json, os
from openai import OpenAI
from dotenv import load_dotenv
from app import supabase_routes
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default port for development
        "https://fragile-paradox.vercel.app",  # Your Vercel frontend URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(supabase_routes.router)
# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("Warning: OPENAI_API_KEY not found in environment variables")
    print("Please copy .env.example to .env and add your OpenAI API key")

client = OpenAI(api_key=openai_api_key) if openai_api_key else None

@app.get("/")
async def root():
    return {"message": "Resume Parser API is running!"}



'''
TESTING FUNCTION FOR THE API KEY, NOT IN USE RN

@app.get("/test-openai")
async def test_openai():
    """Simple endpoint to test OpenAI connection"""
    if not client:
        return {"error": "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file"}
    
    try:
        # Simple test prompt
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that responds with JSON."},
                {"role": "user", "content": "Return a simple JSON object with a greeting message and current status."}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "openai_response": result}
        
    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}
'''

'''
MAIN PARSING FUNCTION
'''
@app.post("/parse_resume/")
async def parse_resume(file: UploadFile):
    if not client:
        return {"error": "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file"}
    
    # Save uploaded file temporarily
    file_path = f"temp_{file.filename}"
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    try:
        # Extract text based on file type
        if file.filename.endswith(".pdf"):
            text = extract_text(file_path)
        elif file.filename.endswith(".docx"):  
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        else:
            return {"error": "Unsupported file type. Please upload a PDF or DOCX file."}

        # OpenAI call
        response = client.chat.completions.create(
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

        # Later: Store in Supabase (commented out)
        # supabase.storage.upload(file)
        # supabase.db.insert(parsed_json)

        return parsed_json

    except Exception as e:
        return {"error": f"Error processing file: {str(e)}"}
    
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
