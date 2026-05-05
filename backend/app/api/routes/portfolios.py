import re
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.portfolios import (
    Portfolio,
    PortfolioCreate,
    PortfolioUpdate,
    TemplateConfigResult,
    TemplateConfigUpsert,
)

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


class PortfolioPdfExportRequest(BaseModel):
    html: str
    paper_format: str = "A4"


def _get_owned_portfolio(supabase, portfolio_id: str, user_id: str):
    response = (
        supabase.table("portfolios")
        .select("*")
        .eq("id", portfolio_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return response.data[0]


def _get_owned_user_template(supabase, user_template_id: str, user_id: str):
    response = (
        supabase.table("user_templates")
        .select("*")
        .eq("id", user_template_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="User template not found")
    return response.data[0]


def _assert_user_template_owned_or_null(supabase, user_template_id: Optional[str], user_id: str):
    if not user_template_id:
        return
    _get_owned_user_template(supabase, user_template_id, user_id)


def _extract_template_config_from_user_template_document(document: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not isinstance(document, dict):
        return None

    for key in ("template_config", "legacy_template_config", "__template_config"):
        value = document.get(key)
        if isinstance(value, dict):
            return value

    return None


def _is_missing_portfolios_user_template_id_column_error(error: Exception) -> bool:
    """Detect schema drift where portfolios.user_template_id does not exist in PostgREST cache."""
    message = str(error).lower()
    return (
        "pgrst204" in message
        and "user_template_id" in message
        and "portfolios" in message
        and "schema cache" in message
    )


def _execute_portfolio_write_with_user_template_fallback(
    *,
    payload: Dict[str, Any],
    write_operation: Callable[[Dict[str, Any]], Any],
) -> Any:
    """Retry writes without user_template_id when the target DB hasn't migrated yet."""
    try:
        return write_operation(payload)
    except Exception as error:
        if "user_template_id" in payload and _is_missing_portfolios_user_template_id_column_error(error):
            fallback_payload = dict(payload)
            fallback_payload.pop("user_template_id", None)
            return write_operation(fallback_payload)
        raise


@router.get("/", response_model=List[Portfolio])
async def get_my_portfolios(user=Depends(verify_token), limit: int = 50, offset: int = 0):
    """Get all portfolios for the current user"""
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("portfolios")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching portfolios: {str(e)}")


@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Get a specific portfolio by ID"""
    try:
        supabase = get_supabase_client()
        return _get_owned_portfolio(supabase, portfolio_id, user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching portfolio: {str(e)}")


@router.post("/", response_model=Portfolio)
async def create_portfolio(portfolio_data: PortfolioCreate, user=Depends(verify_token)):
    """Create a new portfolio"""
    try:
        supabase = get_supabase_client()

        portfolio_dict = portfolio_data.model_dump()
        portfolio_dict["user_id"] = user.id

        _assert_user_template_owned_or_null(supabase, portfolio_dict.get("user_template_id"), user.id)

        response = _execute_portfolio_write_with_user_template_fallback(
            payload=portfolio_dict,
            write_operation=lambda candidate_payload: supabase.table("portfolios").insert(candidate_payload).execute(),
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create portfolio")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating portfolio: {str(e)}")


@router.put("/{portfolio_id}")
async def update_portfolio(portfolio_id: str, portfolio_data: PortfolioUpdate, user=Depends(verify_token)):
    """Update a portfolio"""
    try:
        supabase = get_supabase_client()
        _get_owned_portfolio(supabase, portfolio_id, user.id)

        portfolio_dict = portfolio_data.model_dump(exclude_unset=True)
        _assert_user_template_owned_or_null(supabase, portfolio_dict.get("user_template_id"), user.id)

        response = _execute_portfolio_write_with_user_template_fallback(
            payload=portfolio_dict,
            write_operation=lambda candidate_payload: (
                supabase.table("portfolios")
                .update(candidate_payload)
                .eq("id", portfolio_id)
                .eq("user_id", user.id)
                .execute()
            ),
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update portfolio")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating portfolio: {str(e)}")


@router.delete("/{portfolio_id}")
async def delete_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Delete a portfolio"""
    try:
        supabase = get_supabase_client()
        _get_owned_portfolio(supabase, portfolio_id, user.id)

        supabase.table("portfolios").delete().eq("id", portfolio_id).eq("user_id", user.id).execute()

        return {"success": True, "message": "Portfolio deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting portfolio: {str(e)}")


@router.patch("/{portfolio_id}/publish")
async def toggle_publish_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Toggle publish status of a portfolio"""
    try:
        supabase = get_supabase_client()

        existing = (
            supabase.table("portfolios")
            .select("is_published")
            .eq("id", portfolio_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not existing.data:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        new_status = not existing.data[0].get("is_published", False)

        response = (
            supabase.table("portfolios")
            .update({"is_published": new_status})
            .eq("id", portfolio_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update portfolio")

        return {"success": True, "is_published": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling publish status: {str(e)}")


@router.get("/{portfolio_id}/template-config", response_model=TemplateConfigResult)
async def get_template_config(portfolio_id: str, user=Depends(verify_token)):
    """Get template config for a portfolio owned by the current user.

    Backward compatibility:
    1) prefer linked user_templates document when available
    2) fallback to data.__template_config in portfolio payload
    """
    try:
        supabase = get_supabase_client()
        portfolio = _get_owned_portfolio(supabase, portfolio_id, user.id)

        user_template_id = portfolio.get("user_template_id")
        if user_template_id:
            user_template = _get_owned_user_template(supabase, user_template_id, user.id)
            template_document = user_template.get("document") or {}
            template_config = _extract_template_config_from_user_template_document(template_document)
            if isinstance(template_config, dict):
                return {
                    "portfolio_id": portfolio_id,
                    "template_config": template_config,
                }

        data = portfolio.get("data") or {}
        template_config = data.get("__template_config")

        if not isinstance(template_config, dict):
            raise HTTPException(status_code=404, detail="Template config not found")

        return {
            "portfolio_id": portfolio_id,
            "template_config": template_config,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template config: {str(e)}")


@router.put("/{portfolio_id}/template-config", response_model=TemplateConfigResult)
async def upsert_template_config(portfolio_id: str, payload: TemplateConfigUpsert, user=Depends(verify_token)):
    """Create or update template config for a portfolio owned by the current user."""
    try:
        supabase = get_supabase_client()
        portfolio = _get_owned_portfolio(supabase, portfolio_id, user.id)

        user_template_id = portfolio.get("user_template_id")
        if user_template_id:
            existing_template = _get_owned_user_template(supabase, user_template_id, user.id)
            existing_document = (
                existing_template.get("document") if isinstance(existing_template.get("document"), dict) else {}
            )
            next_document = {**(existing_document or {}), "legacy_template_config": payload.template_config}
            next_version = int(existing_template.get("version") or 1) + 1

            update_response = (
                supabase.table("user_templates")
                .update(
                    {
                        "document": next_document,
                        "version": next_version,
                    }
                )
                .eq("id", user_template_id)
                .eq("user_id", user.id)
                .execute()
            )

            if not update_response.data:
                raise HTTPException(status_code=500, detail="Failed to save template config")

            updated_template = update_response.data[0]
            supabase.table("user_template_versions").insert(
                {
                    "user_template_id": user_template_id,
                    "user_id": user.id,
                    "version": next_version,
                    "schema_version": int(updated_template.get("schema_version") or 1),
                    "document": updated_template.get("document") or next_document,
                    "change_summary": "Updated template config from legacy template-config endpoint",
                }
            ).execute()

            return {
                "portfolio_id": portfolio_id,
                "template_config": payload.template_config,
            }

        existing_data = portfolio.get("data") if isinstance(portfolio.get("data"), dict) else {}
        next_data = {**(existing_data or {}), "__template_config": payload.template_config}

        response = (
            supabase.table("portfolios")
            .update({"data": next_data})
            .eq("id", portfolio_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save template config")

        return {
            "portfolio_id": portfolio_id,
            "template_config": payload.template_config,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving template config: {str(e)}")


@router.get("/{portfolio_id}/export/json")
async def export_portfolio_json(portfolio_id: str, user=Depends(verify_token)):
    """Export a portfolio payload, including linked user template when present."""
    try:
        supabase = get_supabase_client()
        portfolio = _get_owned_portfolio(supabase, portfolio_id, user.id)

        payload = {
            "portfolio": portfolio,
            "exported_at": datetime.now(timezone.utc).isoformat(),
        }

        user_template_id = portfolio.get("user_template_id")
        if user_template_id:
            payload["user_template"] = _get_owned_user_template(supabase, user_template_id, user.id)

        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting portfolio json: {str(e)}")


@router.post("/{portfolio_id}/export/pdf")
async def export_portfolio_pdf(
    portfolio_id: str,
    payload: PortfolioPdfExportRequest,
    user=Depends(verify_token),
):
    """Render provided HTML to PDF using pyppeteer.

    Note: this endpoint requires pyppeteer and a runnable Chromium environment.
    """
    try:
        if not payload.html or not payload.html.strip():
            raise HTTPException(status_code=400, detail="HTML payload is required")

        supabase = get_supabase_client()
        portfolio = _get_owned_portfolio(supabase, portfolio_id, user.id)

        try:
            from pyppeteer import launch  # type: ignore
        except Exception as exc:  # pragma: no cover - runtime dependency guard
            raise HTTPException(
                status_code=501,
                detail="PDF export is unavailable: pyppeteer is not installed in this environment",
            ) from exc

        browser = await launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        )

        try:
            page = await browser.newPage()
            await page.setContent(payload.html, waitUntil="networkidle0")
            pdf_bytes = await page.pdf(
                {
                    "format": payload.paper_format or "A4",
                    "printBackground": True,
                    "margin": {"top": "12mm", "right": "12mm", "bottom": "12mm", "left": "12mm"},
                }
            )
        finally:
            await browser.close()

        raw_name = str(portfolio.get("name") or "portfolio")
        safe_name = re.sub(r"[^a-zA-Z0-9._-]+", "_", raw_name).strip("_") or "portfolio"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.pdf"',
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting portfolio PDF: {str(e)}")
