from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class PortfolioBase(BaseModel):
    name: str
    template_id: str
    data: Dict[str, Any]
    color: Optional[str] = "blue"
    display_mode: Optional[str] = "light"
    is_published: Optional[bool] = False

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    template_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    color: Optional[str] = None
    display_mode: Optional[str] = None
    is_published: Optional[bool] = None

class Portfolio(PortfolioBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


