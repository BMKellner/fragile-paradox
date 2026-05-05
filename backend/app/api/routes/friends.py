from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import verify_token
from app.core.supabase_client import get_supabase_client
from app.models.friends import (
    FriendRequest,
    FriendRequestCreate,
    FriendRequestStatus,
    FriendSummary,
)


router = APIRouter(prefix="/friends", tags=["friends"])


def _canonical_pair(user_a: str, user_b: str) -> tuple[str, str]:
    if user_a < user_b:
        return user_a, user_b
    return user_b, user_a


def _get_pending_request_between(supabase, sender_id: str, recipient_id: str):
    response = (
        supabase.table("friend_requests")
        .select("*")
        .eq("sender_id", sender_id)
        .eq("recipient_id", recipient_id)
        .eq("status", "pending")
        .limit(1)
        .execute()
    )
    if not response.data:
        return None
    return response.data[0]


def _friendship_exists(supabase, user_a: str, user_b: str) -> bool:
    left, right = _canonical_pair(user_a, user_b)
    response = (
        supabase.table("friendships")
        .select("id")
        .eq("user_id", left)
        .eq("friend_id", right)
        .limit(1)
        .execute()
    )
    return bool(response.data)


@router.post("/requests", response_model=FriendRequest)
async def send_friend_request(payload: FriendRequestCreate, user=Depends(verify_token)):
    try:
        if payload.recipient_id == user.id:
            raise HTTPException(status_code=400, detail="You cannot send a friend request to yourself")

        supabase = get_supabase_client()

        if _friendship_exists(supabase, user.id, payload.recipient_id):
            raise HTTPException(status_code=409, detail="You are already friends")

        existing_outgoing = _get_pending_request_between(
            supabase, sender_id=user.id, recipient_id=payload.recipient_id
        )
        if existing_outgoing:
            raise HTTPException(status_code=409, detail="Friend request already sent")

        existing_incoming = _get_pending_request_between(
            supabase, sender_id=payload.recipient_id, recipient_id=user.id
        )
        if existing_incoming:
            raise HTTPException(
                status_code=409,
                detail="This user already sent you a pending friend request",
            )

        response = (
            supabase.table("friend_requests")
            .insert({"sender_id": user.id, "recipient_id": payload.recipient_id})
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create friend request")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending friend request: {str(e)}")


@router.get("/requests/incoming", response_model=List[FriendRequest])
async def get_incoming_friend_requests(
    user=Depends(verify_token),
    status: FriendRequestStatus = "pending",
):
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("friend_requests")
            .select("*")
            .eq("recipient_id", user.id)
            .eq("status", status)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching incoming requests: {str(e)}")


@router.get("/requests/outgoing", response_model=List[FriendRequest])
async def get_outgoing_friend_requests(
    user=Depends(verify_token),
    status: FriendRequestStatus = "pending",
):
    try:
        supabase = get_supabase_client()
        response = (
            supabase.table("friend_requests")
            .select("*")
            .eq("sender_id", user.id)
            .eq("status", status)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching outgoing requests: {str(e)}")


@router.post("/requests/{request_id}/accept", response_model=FriendRequest)
async def accept_friend_request(request_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        request_response = (
            supabase.table("friend_requests")
            .select("*")
            .eq("id", request_id)
            .eq("recipient_id", user.id)
            .limit(1)
            .execute()
        )

        if not request_response.data:
            raise HTTPException(status_code=404, detail="Friend request not found")

        friend_request = request_response.data[0]
        if friend_request.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Friend request is no longer pending")

        sender_id = friend_request["sender_id"]
        left, right = _canonical_pair(sender_id, user.id)

        supabase.table("friendships").upsert(
            {"user_id": left, "friend_id": right},
            on_conflict="user_id,friend_id",
        ).execute()

        now_iso = datetime.now(timezone.utc).isoformat()
        update_response = (
            supabase.table("friend_requests")
            .update({"status": "accepted", "responded_at": now_iso})
            .eq("id", request_id)
            .execute()
        )

        (
            supabase.table("friend_requests")
            .update({"status": "declined", "responded_at": now_iso})
            .eq("sender_id", user.id)
            .eq("recipient_id", sender_id)
            .eq("status", "pending")
            .execute()
        )

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update friend request")

        return update_response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accepting friend request: {str(e)}")


@router.post("/requests/{request_id}/decline", response_model=FriendRequest)
async def decline_friend_request(request_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        request_response = (
            supabase.table("friend_requests")
            .select("*")
            .eq("id", request_id)
            .eq("recipient_id", user.id)
            .limit(1)
            .execute()
        )

        if not request_response.data:
            raise HTTPException(status_code=404, detail="Friend request not found")

        friend_request = request_response.data[0]
        if friend_request.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Friend request is no longer pending")

        now_iso = datetime.now(timezone.utc).isoformat()
        update_response = (
            supabase.table("friend_requests")
            .update({"status": "declined", "responded_at": now_iso})
            .eq("id", request_id)
            .execute()
        )

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update friend request")

        return update_response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error declining friend request: {str(e)}")


@router.delete("/requests/{request_id}", response_model=FriendRequest)
async def cancel_friend_request(request_id: str, user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        request_response = (
            supabase.table("friend_requests")
            .select("*")
            .eq("id", request_id)
            .eq("sender_id", user.id)
            .limit(1)
            .execute()
        )

        if not request_response.data:
            raise HTTPException(status_code=404, detail="Friend request not found")

        friend_request = request_response.data[0]
        if friend_request.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")

        now_iso = datetime.now(timezone.utc).isoformat()
        update_response = (
            supabase.table("friend_requests")
            .update({"status": "cancelled", "responded_at": now_iso})
            .eq("id", request_id)
            .execute()
        )

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to cancel friend request")

        return update_response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling friend request: {str(e)}")


@router.get("/", response_model=List[FriendSummary])
async def list_friends(user=Depends(verify_token)):
    try:
        supabase = get_supabase_client()
        friendship_response = (
            supabase.table("friendships")
            .select("*")
            .or_(f"user_id.eq.{user.id},friend_id.eq.{user.id}")
            .order("created_at", desc=True)
            .execute()
        )

        friendships = friendship_response.data or []
        friend_ids = []
        summaries = []

        for row in friendships:
            friend_user_id = row["friend_id"] if row["user_id"] == user.id else row["user_id"]
            friend_ids.append(friend_user_id)
            summaries.append(
                {
                    "friend_user_id": friend_user_id,
                    "friendship_id": row["id"],
                    "created_at": row["created_at"],
                    "full_name": None,
                    "email": None,
                }
            )

        if not friend_ids:
            return summaries

        profile_response = (
            supabase.table("profiles")
            .select("user_id, full_name, email")
            .in_("user_id", friend_ids)
            .execute()
        )
        profile_map = {profile["user_id"]: profile for profile in (profile_response.data or [])}

        for summary in summaries:
            profile = profile_map.get(summary["friend_user_id"])
            if profile:
                summary["full_name"] = profile.get("full_name")
                summary["email"] = profile.get("email")

        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching friends: {str(e)}")


@router.delete("/{friend_user_id}")
async def remove_friend(friend_user_id: str, user=Depends(verify_token)):
    try:
        if friend_user_id == user.id:
            raise HTTPException(status_code=400, detail="You cannot remove yourself")

        supabase = get_supabase_client()
        left, right = _canonical_pair(user.id, friend_user_id)

        existing = (
            supabase.table("friendships")
            .select("id")
            .eq("user_id", left)
            .eq("friend_id", right)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(status_code=404, detail="Friend relationship not found")

        supabase.table("friendships").delete().eq("user_id", left).eq("friend_id", right).execute()

        return {"success": True, "message": "Friend removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing friend: {str(e)}")


@router.get("/status/{other_user_id}")
async def get_friend_status(other_user_id: str, user=Depends(verify_token)):
    try:
        if other_user_id == user.id:
            return {"status": "self"}

        supabase = get_supabase_client()
        if _friendship_exists(supabase, user.id, other_user_id):
            return {"status": "friends"}

        outgoing = _get_pending_request_between(supabase, user.id, other_user_id)
        if outgoing:
            return {"status": "outgoing_pending", "request_id": outgoing["id"]}

        incoming = _get_pending_request_between(supabase, other_user_id, user.id)
        if incoming:
            return {"status": "incoming_pending", "request_id": incoming["id"]}

        return {"status": "none"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking friend status: {str(e)}")
