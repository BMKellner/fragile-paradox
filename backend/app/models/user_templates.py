from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class UserTemplateBase(BaseModel):
    name: str
    template_id: str
    schema_version: int = Field(default=1, ge=1)
    document: Dict[str, Any]
    portfolio_id: Optional[str] = None


class UserTemplateCreate(BaseModel):
    name: str = "Untitled template"
    template_id: str
    schema_version: int = Field(default=1, ge=1)
    document: Dict[str, Any]
    portfolio_id: Optional[str] = None


class UserTemplateUpdate(BaseModel):
    name: Optional[str] = None
    template_id: Optional[str] = None
    schema_version: Optional[int] = Field(default=None, ge=1)
    document: Optional[Dict[str, Any]] = None
    portfolio_id: Optional[str] = None
    change_summary: Optional[str] = None
    increment_version: bool = True


class UserTemplate(UserTemplateBase):
    id: str
    user_id: str
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserTemplateVersion(BaseModel):
    id: str
    user_template_id: str
    user_id: str
    version: int
    schema_version: int
    document: Dict[str, Any]
    change_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserTemplateVersionCreate(BaseModel):
    document: Dict[str, Any]
    schema_version: int = Field(default=1, ge=1)
    change_summary: Optional[str] = None


class UserTemplateRevertResult(BaseModel):
    user_template: UserTemplate
    reverted_from_version: int


class UserTemplateExportResult(BaseModel):
    user_template_id: str
    template_id: str
    schema_version: int
    version: int
    name: str
    document: Dict[str, Any]
