from pydantic import BaseModel
from typing import List, TypedDict, Any


class ContactInfo(BaseModel):
    email: str
    linkedin: str
    phone: str
    address: str

class Education(BaseModel):
    school: str
    majors: List[str]
    minors: List[str]
    expected_grad: str

class PersonalInformation(BaseModel):
    full_name: str
    contact_info: ContactInfo
    education: Education

class Overview(BaseModel):
    career_name: str
    resume_summary: str

class Project(BaseModel):
    title: str
    description: str

class Experience(BaseModel):
    company: str
    description: str
    employed_dates: str

class ResumeSchema(BaseModel):
    resume_pdf: str
    portfolio_id: str
    personal_information: PersonalInformation
    overview: Overview
    projects: List[Project]
    skills: List[str]
    experience: List[Experience]


class Resume(BaseModel):
    id: str
    user_id: str
    title: str
    file_path: str
    data: ResumeSchema

class ResumeRow(TypedDict):
    id: str
    user_id: str
    title: str
    file_path: str
    parsed_data: dict[str, Any] | None


