from __future__ import annotations

import re
from typing import Iterable, List

from app.models.resumes import (
    NormalizedAboutSection,
    NormalizedContactSection,
    NormalizedExperienceItem,
    NormalizedExperienceSection,
    NormalizedHeroSection,
    NormalizedProjectItem,
    NormalizedProjectLinks,
    NormalizedProjectsSection,
    NormalizedSectionPresence,
    NormalizedSkillCategory,
    NormalizedSkillsSection,
    NormalizedTemplateSections,
    NormalizedTemplateSeed,
    ResumeSchema,
)

URL_REGEX = re.compile(r"https?://[^\s)]+", re.IGNORECASE)
SPLIT_REGEX = re.compile(r"\n|\u2022|;|\.(?=\s)")
TOKENIZE_REGEX = re.compile(r"[^a-z0-9+.#\-\s]")
SENTENCE_REGEX = re.compile(r"^.+?[.!?](?=\s|$)")
WHITESPACE_REGEX = re.compile(r"\s+")


def _non_empty(value: str | None) -> str:
    if not value:
        return ""
    return value.strip()


def _unique(items: Iterable[str]) -> List[str]:
    seen: set[str] = set()
    unique_items: List[str] = []
    for item in items:
        normalized = item.strip()
        lowered = normalized.lower()
        if not normalized or lowered in seen:
            continue
        seen.add(lowered)
        unique_items.append(normalized)
    return unique_items


def _split_text(value: str, limit: int) -> List[str]:
    if not value:
        return []
    return [
        part.strip()
        for part in SPLIT_REGEX.split(value)
        if part and part.strip()
    ][:limit]


def _extract_urls(value: str) -> List[str]:
    if not value:
        return []
    return _unique(URL_REGEX.findall(value))


def _tokenize(value: str) -> List[str]:
    cleaned = TOKENIZE_REGEX.sub(" ", value.lower())
    return [token for token in cleaned.split() if token]


def _matches_skill(text: str, skill: str) -> bool:
    skill_tokens = _tokenize(skill)
    if not skill_tokens:
        return False

    text_tokens = set(_tokenize(text))
    if not text_tokens:
        return False

    # Tiny tokens (e.g. "go", "c") should only match exact token membership.
    if len(skill_tokens) == 1 and len(skill_tokens[0]) <= 2:
        return skill_tokens[0] in text_tokens

    return all(token in text_tokens for token in skill_tokens)


def _skill_tags_for_text(text: str, skills: List[str], limit: int = 6) -> List[str]:
    if not text:
        return []
    return [skill for skill in skills if _matches_skill(text, skill)][:limit]


def _categorize_skills(skills: List[str]) -> List[NormalizedSkillCategory]:
    if not skills:
        return []

    language_tokens = {
        "javascript",
        "typescript",
        "python",
        "java",
        "go",
        "rust",
        "ruby",
        "php",
        "swift",
        "kotlin",
        "sql",
    }
    framework_tokens = {
        "react",
        "next",
        "node",
        "express",
        "vue",
        "angular",
        "tailwind",
        "graphql",
        "django",
        "flask",
        "spring",
    }
    database_tokens = {
        "postgres",
        "mysql",
        "mongodb",
        "redis",
        "sqlite",
        "supabase",
        "firebase",
        "prisma",
        "dynamodb",
    }

    buckets: dict[str, List[str]] = {
        "Languages": [],
        "Frameworks & Libraries": [],
        "Databases": [],
        "Tools & Platforms": [],
    }

    for skill in skills:
        tokens = set(_tokenize(skill))
        if tokens & language_tokens:
            buckets["Languages"].append(skill)
            continue
        if tokens & framework_tokens:
            buckets["Frameworks & Libraries"].append(skill)
            continue
        if tokens & database_tokens:
            buckets["Databases"].append(skill)
            continue
        buckets["Tools & Platforms"].append(skill)

    categories: List[NormalizedSkillCategory] = []
    for title in ["Languages", "Frameworks & Libraries", "Databases", "Tools & Platforms"]:
        grouped = _unique(buckets[title])
        if grouped:
            categories.append(NormalizedSkillCategory(title=title, skills=grouped))

    if not categories:
        categories.append(NormalizedSkillCategory(title="Skills", skills=skills))

    return categories


def _build_education_details(majors: List[str], minors: List[str], expected_grad: str) -> str:
    parts: List[str] = []
    parts.extend([major.strip() for major in majors if major and major.strip()])
    parts.extend([f"Minor: {minor.strip()}" for minor in minors if minor and minor.strip()])
    if expected_grad:
        parts.append(f"Expected {expected_grad}")
    return " | ".join(parts)


def _normalize_text_line(value: str) -> str:
    return WHITESPACE_REGEX.sub(" ", value).strip()


def _first_sentence(value: str) -> str:
    compact = _normalize_text_line(value)
    if not compact:
        return ""

    sentence_match = SENTENCE_REGEX.match(compact)
    if sentence_match:
        return sentence_match.group(0).strip()

    return compact


def _truncate_words(value: str, max_words: int) -> str:
    words = value.split()
    if len(words) <= max_words:
        return value

    return f"{' '.join(words[:max_words]).rstrip('.,;:!?')}..."


def _resolve_hero_summary(hero_summary: str, resume_summary: str) -> str:
    # Keep hero copy concise even when parser omits hero_summary.
    candidate = _non_empty(hero_summary) or _non_empty(resume_summary)
    if not candidate:
        return ""

    sentence = _first_sentence(candidate) or candidate
    return _truncate_words(sentence, 22)


def build_normalized_template_seed(parsed_resume: ResumeSchema) -> NormalizedTemplateSeed:
    personal = parsed_resume.personal_information
    overview = parsed_resume.overview

    skills = _unique(parsed_resume.skills)

    experience_items: List[NormalizedExperienceItem] = []
    for entry in parsed_resume.experience:
        company = _non_empty(entry.company)
        description = _non_empty(entry.description)
        employed_dates = _non_empty(entry.employed_dates)
        if not company and not description and not employed_dates:
            continue

        experience_items.append(
            NormalizedExperienceItem(
                company=company,
                employedDates=employed_dates,
                bullets=_split_text(description, 4),
                tags=_skill_tags_for_text(description, skills, limit=4),
            )
        )

    project_items: List[NormalizedProjectItem] = []
    for project in parsed_resume.projects:
        title = _non_empty(project.title)
        description = _non_empty(project.description)
        if not title and not description:
            continue

        links = _extract_urls(description)
        code_link = next((url for url in links if "github.com" in url.lower()), "")
        if not code_link and len(links) > 1:
            code_link = links[1]

        project_items.append(
            NormalizedProjectItem(
                title=title,
                description=description,
                highlights=_split_text(description, 3),
                tags=_skill_tags_for_text(description, skills, limit=6),
                links=NormalizedProjectLinks(
                    demo=links[0] if links else "",
                    code=code_link,
                ),
            )
        )

    categories = _categorize_skills(skills)

    education = personal.education
    school = _non_empty(education.school)
    expected_grad = _non_empty(education.expected_grad)
    education_details = _build_education_details(
        education.majors,
        education.minors,
        expected_grad,
    )

    section_presence = NormalizedSectionPresence(
        hero=True,
        about=True,
        experience=len(experience_items) > 0,
        skills=len(categories) > 0,
        projects=len(project_items) > 0,
        contact=True,
        education=bool(school or education_details),
        certifications=False,
    )

    sections = NormalizedTemplateSections(
        hero=NormalizedHeroSection(
            fullName=_non_empty(personal.full_name),
            careerName=_non_empty(overview.career_name),
            summary=_resolve_hero_summary(overview.hero_summary, overview.resume_summary),
        ),
        about=NormalizedAboutSection(
            summary=_non_empty(overview.resume_summary),
            educationLabel=school,
            educationDetails=education_details,
        ),
        experience=NormalizedExperienceSection(items=experience_items),
        skills=NormalizedSkillsSection(categories=categories),
        projects=NormalizedProjectsSection(items=project_items),
        contact=NormalizedContactSection(
            email=_non_empty(personal.contact_info.email),
            phone=_non_empty(personal.contact_info.phone),
            address=_non_empty(personal.contact_info.address),
            linkedin=_non_empty(personal.contact_info.linkedin),
        ),
    )

    return NormalizedTemplateSeed(
        schema_version=1,
        section_presence=section_presence,
        sections=sections,
    )
