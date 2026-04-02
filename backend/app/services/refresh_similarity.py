from app.repositories.similarity_repository import (
    get_user_features,
    get_similarity_candidates,
    replace_similarity_edges,
)
from app.services.similarity import compute_similarity


def refresh_user_similarity(user_id: str, candidate_limit: int = 500, result_limit: int = 50) -> list[dict]:
    source_user = get_user_features(user_id)
    if not source_user:
        return []

    candidates = get_similarity_candidates(user_id, candidate_limit)

    scored = []
    for candidate in candidates:
        result = compute_similarity(source_user, candidate)
        if result.similarity_score > 0:
            scored.append(result)

    scored.sort(key=lambda x: x.similarity_score, reverse=True)
    top_results = scored[:result_limit]

    replace_similarity_edges(user_id, top_results)

    return [
        {
            "user_id": r.user_id,
            "similar_user_id": r.similar_user_id,
            "similarity_score": r.similarity_score,
            "reason": r.reason,
        }
        for r in top_results
    ]