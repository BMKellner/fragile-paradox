from app.core.openai_client import gpt_client
from app.models.resumes import ResumeSchema


def parse_resume_with_openai(resume_text: str) -> ResumeSchema:
    # OpenAI call
    response = gpt_client.responses.parse(
        model="gpt-4o",
        input=[
            {"role": "system", "content": "You are a resume parser."},
            {"role": "system", "content": "if nothing is parsed for the overview section, automatically generate only the overview, and leave career_name empty"},
            {"role": "user", "content": f"""
                Parse this resume text: {resume_text}
             """}
        ],
        text_format=ResumeSchema
    )
    if not response or not response.output_parsed:
        raise ValueError("No response from OpenAI")

    parsed_resume: ResumeSchema = response.output_parsed
    return parsed_resume
