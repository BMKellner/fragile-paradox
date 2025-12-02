from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.portfolios import PortfolioCreate, PortfolioUpdate, Portfolio
from typing import List

router = APIRouter(prefix="/portfolios", tags=["portfolios"])

@router.get("/", response_model=List[Portfolio])
async def get_my_portfolios(
    user=Depends(verify_token),
    limit: int = 50,
    offset: int = 0
):
    """Get all portfolios for the current user"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("portfolios")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching portfolios: {str(e)}")

@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Get a specific portfolio by ID"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("portfolios")\
            .select("*")\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Portfolio not found")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching portfolio: {str(e)}")

@router.post("/", response_model=Portfolio)
async def create_portfolio(portfolio_data: PortfolioCreate, user=Depends(verify_token)):
    """Create a new portfolio"""
    try:
        supabase = get_supabase_client()
        
        portfolio_dict = portfolio_data.model_dump()
        portfolio_dict["user_id"] = user.id
        
        response = supabase.table("portfolios").insert(portfolio_dict).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create portfolio")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating portfolio: {str(e)}")

@router.put("/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str, 
    portfolio_data: PortfolioUpdate, 
    user=Depends(verify_token)
):
    """Update a portfolio"""
    try:
        supabase = get_supabase_client()
        
        # Verify ownership
        existing = supabase.table("portfolios")\
            .select("*")\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        # Update portfolio
        portfolio_dict = portfolio_data.model_dump(exclude_unset=True)
        
        response = supabase.table("portfolios")\
            .update(portfolio_dict)\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to update portfolio")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating portfolio: {str(e)}")

@router.delete("/{portfolio_id}")
async def delete_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Delete a portfolio"""
    try:
        supabase = get_supabase_client()
        
        # Verify ownership before deleting
        existing = supabase.table("portfolios")\
            .select("*")\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        supabase.table("portfolios").delete().eq("id", portfolio_id).eq("user_id", user.id).execute()
        
        return {"success": True, "message": "Portfolio deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting portfolio: {str(e)}")

@router.patch("/{portfolio_id}/publish")
async def toggle_publish_portfolio(portfolio_id: str, user=Depends(verify_token)):
    """Toggle publish status of a portfolio"""
    try:
        supabase = get_supabase_client()
        
        # Get current status
        existing = supabase.table("portfolios")\
            .select("is_published")\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        # Toggle publish status
        new_status = not existing.data[0].get("is_published", False)
        
        response = supabase.table("portfolios")\
            .update({"is_published": new_status})\
            .eq("id", portfolio_id)\
            .eq("user_id", user.id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to update portfolio")
            
        return {"success": True, "is_published": new_status}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error toggling publish status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error toggling publish status: {str(e)}")

