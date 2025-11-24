from pydantic import BaseModel
from typing import Optional

class DailyReflectionCreate(BaseModel):
    """Model for creating a new daily reflection"""
    topic: str
    key_takeaways: str
    growth_challenge: str
    immediate_action: str
    personal_application: str
    created_by: Optional[str] = None

class DailyReflectionUpdate(BaseModel):
    """Model for updating an existing daily reflection"""
    topic: Optional[str] = None
    key_takeaways: Optional[str] = None
    growth_challenge: Optional[str] = None
    immediate_action: Optional[str] = None
    personal_application: Optional[str] = None

class DailyReflectionResponse(BaseModel):
    """Model for daily reflection response"""
    id: str
    topic: str
    key_takeaways: str
    growth_challenge: str
    immediate_action: str
    personal_application: str
    created_by: str
    created_at: str
    updated_at: str
