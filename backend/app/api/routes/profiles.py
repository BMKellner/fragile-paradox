from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.profiles import ProfileCreate, ProfileUpdate, Profile
from typing import Optional

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/me")
async def get_my_profile(user=Depends(verify_token)):
    """Get the current user's profile"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("profiles").select("*").eq("user_id", user.id).execute()
        
        if not response.data or len(response.data) == 0:
            return None
            
        return response.data[0]
    except Exception as e:
        print(f"Error fetching profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.post("/me")
async def create_my_profile(profile_data: ProfileCreate, user=Depends(verify_token)):
    """Create a new profile for the current user"""
    try:
        supabase = get_supabase_client()
        
        # Check if profile already exists
        existing = supabase.table("profiles").select("*").eq("user_id", user.id).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
        
        # Create profile
        profile_dict = profile_data.model_dump(exclude_unset=True)
        profile_dict["user_id"] = user.id
        profile_dict["email"] = user.email
        
        response = supabase.table("profiles").insert(profile_dict).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create profile")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")

@router.put("/me")
async def update_my_profile(profile_data: ProfileUpdate, user=Depends(verify_token)):
    """Update the current user's profile"""
    try:
        supabase = get_supabase_client()
        
        # Check if profile exists
        existing = supabase.table("profiles").select("*").eq("user_id", user.id).execute()
        if not existing.data or len(existing.data) == 0:
            # Create profile if it doesn't exist
            profile_dict = profile_data.model_dump(exclude_unset=True)
            profile_dict["user_id"] = user.id
            profile_dict["email"] = user.email
            
            response = supabase.table("profiles").insert(profile_dict).execute()
            if not response.data or len(response.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create profile")
            return response.data[0]
        
        # Update existing profile
        profile_dict = profile_data.model_dump(exclude_unset=True)
        
        response = supabase.table("profiles").update(profile_dict).eq("user_id", user.id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to update profile")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.delete("/me")
async def delete_my_profile(user=Depends(verify_token)):
    """Delete the current user's profile"""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("profiles").delete().eq("user_id", user.id).execute()
        
        return {"success": True, "message": "Profile deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting profile: {str(e)}")

