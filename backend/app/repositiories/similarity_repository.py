from app.core.supabase_client import get_supabase_client
from app.services.similarity import row_to_match_features, MatchFeatures, SimilarityResult


def get_user_features(user_id: str) -> MatchFeatures | None:
    supabase = get_supabase_client()

    response = (
        supabase.table("resume_match_features")
        .select("user_id, skills, majors, school, companies, project_titles")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    rows = response.data or []
    if not rows:
        return None

    return row_to_match_features(rows[0])

def get_similarity_candidates(user_id: str, limit: int = 500) -> list[MatchFeatures]:
    supabase = get_supabase_client()

    response = supabase.rpc(
        "get_similarity_candidates",
        {
            "p_user_id": user_id,
            "p_limit": limit,
        },
    ).execute()

    rows = response.data or []
    return [row_to_match_features(row) for row in rows]


def replace_similarity_edges(user_id: str, results: list[SimilarityResult]) -> None:
    supabase = get_supabase_client()

    supabase.table("user_similarity_edges").delete().eq("user_id", user_id).execute()

    if not results:
        return

    rows = [
        {
            "user_id": r.user_id,
            "similar_user_id": r.similar_user_id,
            "similarity_score": r.similarity_score,
            "reason": r.reason,
        }
        for r in results
    ]

    supabase.table("user_similarity_edges").insert(rows).execute()