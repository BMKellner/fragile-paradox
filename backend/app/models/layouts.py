from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel




class LayoutBase(BaseModel):
    json_data: Dict[str, Any]
    is_public: bool


class LayoutCreate(LayoutBase):
    creator_id: Optional[str] = None


class Layout(LayoutBase):
    layout_id: str
    creator_id: str
    created_at: datetime
    updated_at: datetime
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
