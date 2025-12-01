from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: str
    user_id: str
    email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

