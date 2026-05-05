from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.user_templates import (
    UserTemplate,
    UserTemplateCreate,
    UserTemplateExportResult,
    UserTemplateRevertResult,
    UserTemplateUpdate,
    UserTemplateVersion,
)

router = APIRouter(prefix="/user-templates", tags=["user-templates"])


def _get_owned_template(supabase, template_id: str, user_id: str):
    response = (
        supabase.table("user_templates")
        .select("*")
        .eq("id", template_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="User template not found")

    return response.data[0]


def _validate_owned_portfolio(supabase, portfolio_id: str, user_id: str):
    response = (
        supabase.table("portfolios")
        .select("id")
        .eq("id", portfolio_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Portfolio not found")


@router.get("/", response_model=List[UserTemplate])
async def list_user_templates(
    user=Depends(verify_token),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    portfolio_id: Optional[str] = Query(default=None),
    template_id: Optional[str] = Query(default=None),
):
    try:
        supabase = get_supabase_client()

        query = (
            supabase.table("user_templates")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", desc=True)
            .limit(limit)
            .offset(offset)
        )

        if portfolio_id:
            query = query.eq("portfolio_id", portfolio_id)

        if template_id:
            query = query.eq("template_id", template_id)

        response = query.execute()
        return response.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user templates: {str(e)}")


@router.get("/{user_template_id}", response_model=UserTemplate)
async def get_user_template(user_template_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        return _get_owned_template(supabase, user_template_id, user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user template: {str(e)}")


@router.post("/", response_model=UserTemplate)
async def create_user_template(payload: UserTemplateCreate, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()

        if payload.portfolio_id:
            _validate_owned_portfolio(supabase, payload.portfolio_id, user.id)

        template_dict = payload.model_dump()
        template_dict["user_id"] = user.id
        template_dict["version"] = 1

        response = supabase.table("user_templates").insert(template_dict).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user template")

        created = response.data[0]

        supabase.table("user_template_versions").insert(
            {
                "user_template_id": created["id"],
                "user_id": user.id,
                "version": 1,
                "schema_version": created.get("schema_version", payload.schema_version),
                "document": created.get("document") or payload.document,
                "change_summary": "Initial version",
            }
        ).execute()

        return created
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user template: {str(e)}")


@router.put("/{user_template_id}", response_model=UserTemplate)
@router.patch("/{user_template_id}", response_model=UserTemplate)
async def update_user_template(
    user_template_id: str, payload: UserTemplateUpdate, user=Depends(verify_token)
):
    try:
        supabase = get_supabase_client()
        existing = _get_owned_template(supabase, user_template_id, user.id)

        updates = payload.model_dump(exclude_unset=True)
        change_summary = updates.pop("change_summary", None)
        increment_version = bool(updates.pop("increment_version", True))

        if "portfolio_id" in updates and updates["portfolio_id"]:
            _validate_owned_portfolio(supabase, updates["portfolio_id"], user.id)

        next_version = int(existing.get("version") or 1)
        if increment_version and ("document" in updates or "schema_version" in updates):
            next_version += 1
            updates["version"] = next_version

        if not updates:
            return existing

        response = (
            supabase.table("user_templates")
            .update(updates)
            .eq("id", user_template_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update user template")

        updated = response.data[0]

        if increment_version and ("document" in updates or "schema_version" in updates):
            supabase.table("user_template_versions").insert(
                {
                    "user_template_id": user_template_id,
                    "user_id": user.id,
                    "version": next_version,
                    "schema_version": updated.get("schema_version", existing.get("schema_version", 1)),
                    "document": updated.get("document") or existing.get("document") or {},
                    "change_summary": change_summary or "Updated template",
                }
            ).execute()

        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user template: {str(e)}")


@router.delete("/{user_template_id}")
async def delete_user_template(user_template_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        _get_owned_template(supabase, user_template_id, user.id)

        supabase.table("user_templates").delete().eq("id", user_template_id).eq("user_id", user.id).execute()
        return {"success": True, "message": "User template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user template: {str(e)}")


@router.get("/{user_template_id}/versions", response_model=List[UserTemplateVersion])
async def list_user_template_versions(
    user_template_id: str,
    user=Depends(verify_token),
    limit: int = Query(30, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    try:
        supabase = get_supabase_client()
        _get_owned_template(supabase, user_template_id, user.id)

        response = (
            supabase.table("user_template_versions")
            .select("*")
            .eq("user_template_id", user_template_id)
            .eq("user_id", user.id)
            .order("version", desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        return response.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user template versions: {str(e)}")


@router.post("/{user_template_id}/versions/{version}/revert", response_model=UserTemplateRevertResult)
async def revert_user_template_version(user_template_id: str, version: int, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        existing = _get_owned_template(supabase, user_template_id, user.id)

        version_response = (
            supabase.table("user_template_versions")
            .select("*")
            .eq("user_template_id", user_template_id)
            .eq("user_id", user.id)
            .eq("version", version)
            .limit(1)
            .execute()
        )

        if not version_response.data:
            raise HTTPException(status_code=404, detail="Template version not found")

        target = version_response.data[0]
        next_version = int(existing.get("version") or 1) + 1

        update_response = (
            supabase.table("user_templates")
            .update(
                {
                    "document": target.get("document") or {},
                    "schema_version": int(target.get("schema_version") or existing.get("schema_version") or 1),
                    "version": next_version,
                }
            )
            .eq("id", user_template_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to revert template")

        updated = update_response.data[0]

        supabase.table("user_template_versions").insert(
            {
                "user_template_id": user_template_id,
                "user_id": user.id,
                "version": next_version,
                "schema_version": updated.get("schema_version", 1),
                "document": updated.get("document") or {},
                "change_summary": f"Reverted to version {version}",
            }
        ).execute()

        return {
            "user_template": updated,
            "reverted_from_version": version,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reverting template version: {str(e)}")


@router.get("/{user_template_id}/export/json", response_model=UserTemplateExportResult)
async def export_user_template_json(user_template_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        template = _get_owned_template(supabase, user_template_id, user.id)

        return {
            "user_template_id": template["id"],
            "template_id": template["template_id"],
            "schema_version": template.get("schema_version", 1),
            "version": template.get("version", 1),
            "name": template.get("name") or "Untitled template",
            "document": template.get("document") or {},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting user template: {str(e)}")
