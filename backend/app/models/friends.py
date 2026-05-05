from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


FriendRequestStatus = Literal["pending", "accepted", "declined", "cancelled"]


class FriendRequestCreate(BaseModel):
    recipient_id: str


class FriendRequest(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    status: FriendRequestStatus
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Friendship(BaseModel):
    id: str
    user_id: str
    friend_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class FriendSummary(BaseModel):
    friend_user_id: str
    friendship_id: str
    created_at: datetime
    full_name: Optional[str] = None
    email: Optional[str] = None
