from dataclasses import dataclass
from typing import Any


@dataclass
class MatchFeatures:
    user_id: str
    skills: set[str]
    majors: set[str]
    school: str | None
    companies: set[str]
    project_titles: set[str]


@dataclass
class SimilarityResult:
    user_id: str
    similar_user_id: str
    similarity_score: float
    reason: dict[str, Any]


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip().lower()
    return value or None


def normalize_list(values: list[str] | None) -> set[str]:
    if not values:
        return set()
    return {
        v.strip().lower()
        for v in values
        if v and v.strip()
    }


def row_to_match_features(row: dict) -> MatchFeatures:
    return MatchFeatures(
        user_id=str(row["user_id"]),
        skills=normalize_list(row.get("skills")),
        majors=normalize_list(row.get("majors")),
        school=normalize_text(row.get("school")),
        companies=normalize_list(row.get("companies")),
        project_titles=normalize_list(row.get("project_titles")),
    )


def jaccard(a: set[str], b: set[str]) -> float:
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def compute_similarity(user: MatchFeatures, other: MatchFeatures) -> SimilarityResult:
    shared_skills = user.skills & other.skills
    shared_majors = user.majors & other.majors
    shared_companies = user.companies & other.companies
    shared_projects = user.project_titles & other.project_titles
    same_school = bool(user.school and other.school and user.school == other.school)

    skills_score = jaccard(user.skills, other.skills)
    majors_score = jaccard(user.majors, other.majors)
    companies_score = jaccard(user.companies, other.companies)
    projects_score = jaccard(user.project_titles, other.project_titles)
    school_score = 1.0 if same_school else 0.0

    score = (
        0.50 * skills_score
        + 0.15 * majors_score
        + 0.15 * school_score
        + 0.10 * companies_score
        + 0.10 * projects_score
    )

    return SimilarityResult(
        user_id=user.user_id,
        similar_user_id=other.user_id,
        similarity_score=round(score, 6),
        reason={
            "shared_skills": sorted(shared_skills),
            "shared_majors": sorted(shared_majors),
            "same_school": same_school,
            "shared_companies": sorted(shared_companies),
            "shared_projects": sorted(shared_projects),
        },
    )