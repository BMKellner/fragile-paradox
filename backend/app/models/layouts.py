from datetime import datetime
from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel


Visibility = Literal["public", "private"]


class LayoutBase(BaseModel):
    json_data: Dict[str, Any]
    visibility: Visibility


class LayoutCreate(LayoutBase):
    creator_id: Optional[str] = None


class Layout(LayoutBase):
    layout_id: str
    creator_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
