from app.core.openai_client import gpt_client
from app.models.resumes import ResumeSchema


def parse_resume_with_openai(resume_text: str) -> ResumeSchema:
    # OpenAI call
    response = gpt_client.responses.parse(
        model="gpt-4o",
        input=[
            {
                "role": "system",
                "content": (
                    "You are a strict resume parser. Extract only explicit facts from the provided resume text. "
                    "Do not infer or invent projects, skills, companies, or dates. "
                    "When uncertain, return empty strings or empty arrays for those fields."
                ),
            },
            {
                "role": "system",
                "content": (
                    "Projects must only include explicitly labeled project work. "
                    "Do not convert general job responsibilities into projects. "
                    "Skills must come from explicit mentions. "
                    "Do not inject global skills into experience descriptions."
                ),
            },
            {
                "role": "system",
                "content": (
                    "Populate overview fields with distinct responsibilities. "
                    "overview.resume_summary must be a 2-4 sentence about narrative grounded in explicit education "
                    "and experience evidence from the resume text, written in first person ('I', 'my'). "
                    "overview.hero_summary must always be provided as a single-sentence value statement (8-22 words) that is concise and not a "
                    "near-duplicate of overview.resume_summary. "
                    "Do not invent facts in either summary."
                ),
            },
            {
                "role": "system",
                "content": (
                    "If job title/role is not explicit in the resume, leave overview.career_name empty. "
                    "If summary evidence is sparse, keep overview.hero_summary concise and grounded in explicit resume evidence "
                    "instead of leaving it blank."
                ),
            },
            {
                "role": "user",
                "content": f"""
                Parse this resume text into the required schema.
                Resume text:
                {resume_text}
             """,
            },
        ],
        text_format=ResumeSchema,
    )
    if not response or not response.output_parsed:
        raise ValueError("No response from OpenAI")

    parsed_resume: ResumeSchema = response.output_parsed
    return parsed_resume
