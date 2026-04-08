from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional


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
    hero_summary: str = ""


class Project(BaseModel):
    title: str
    description: str


class Experience(BaseModel):
    company: str
    description: str
    employed_dates: str


class NormalizedSectionPresence(BaseModel):
    hero: bool
    about: bool
    experience: bool
    skills: bool
    projects: bool
    contact: bool
    education: bool
    certifications: bool


class NormalizedHeroSection(BaseModel):
    fullName: str
    careerName: str
    summary: str


class NormalizedAboutSection(BaseModel):
    summary: str
    educationLabel: str
    educationDetails: str


class NormalizedExperienceItem(BaseModel):
    company: str
    employedDates: str
    bullets: List[str]
    tags: List[str]


class NormalizedExperienceSection(BaseModel):
    items: List[NormalizedExperienceItem]


class NormalizedSkillCategory(BaseModel):
    title: str
    skills: List[str]


class NormalizedSkillsSection(BaseModel):
    categories: List[NormalizedSkillCategory]


class NormalizedProjectLinks(BaseModel):
    demo: str
    code: str


class NormalizedProjectItem(BaseModel):
    title: str
    description: str
    highlights: List[str]
    tags: List[str]
    links: NormalizedProjectLinks


class NormalizedProjectsSection(BaseModel):
    items: List[NormalizedProjectItem]


class NormalizedContactSection(BaseModel):
    email: str
    phone: str
    address: str
    linkedin: str


class NormalizedTemplateSections(BaseModel):
    hero: NormalizedHeroSection
    about: NormalizedAboutSection
    experience: NormalizedExperienceSection
    skills: NormalizedSkillsSection
    projects: NormalizedProjectsSection
    contact: NormalizedContactSection


class NormalizedTemplateSeed(BaseModel):
    schema_version: int = 1
    section_presence: NormalizedSectionPresence
    sections: NormalizedTemplateSections


class ResumeSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    resume_pdf: str
    portfolio_id: str
    personal_information: PersonalInformation
    overview: Overview
    projects: List[Project]
    skills: List[str]
    experience: List[Experience]
    normalized_seed: Optional[NormalizedTemplateSeed] = Field(
        default=None,
        alias="__normalized_seed",
    )


class Resume(BaseModel):
    id: str
    user_id: str
    title: str
    file_path: str
    data: ResumeSchema | None
