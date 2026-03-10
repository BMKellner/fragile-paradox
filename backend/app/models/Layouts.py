from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class LayoutBase(BaseModel):
    layout_id: str
    creator_id: str
    created_at: datetime
    updated_at: datetime
    json_data : Dict[str, Any]
    is_public: bool = False
    name: str
    description: Optional[str] = 'No Description Provided'

class LayoutCreate(LayoutBase):
    pass

class LayoutUpdate(LayoutBase):
    pass

class LayoutDelete(BaseModel):
    layout_id: str
    creator_id: str

