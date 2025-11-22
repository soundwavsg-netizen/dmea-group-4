from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# ==================== Request Models ====================

class MotivationPainItem(BaseModel):
    name: str
    strength: int = Field(ge=0, le=100)

class InsightCreate(BaseModel):
    age_group: str
    gender: str
    skin_type: str
    skin_tone: str
    lifestyle: str
    platform: str
    research_method: str
    products: List[str]
    motivations: List[MotivationPainItem]
    pains: List[MotivationPainItem]
    behaviours: List[str]
    channels: List[str]
    purchase_intent: int = Field(ge=0, le=100)
    influencer_effect: int = Field(ge=0, le=100)
    quote: Optional[str] = ''
    notes: Optional[str] = ''
    created_by: Optional[str] = None  # Username of creator
    created_at: Optional[str] = None  # Timestamp

# ==================== Response Models ====================

class InsightResponse(BaseModel):
    id: str
    age_group: str
    gender: str
    skin_type: str
    skin_tone: str
    lifestyle: str
    platform: str
    research_method: str
    products: List[str]
    motivations: List[Dict[str, Any]]
    pains: List[Dict[str, Any]]
    behaviours: List[str]
    channels: List[str]
    purchase_intent: int
    influencer_effect: int
    quote: str
    notes: str
    created_by: Optional[str] = None
    created_at: str

class PersonaDemographics(BaseModel):
    age: str
    skin_type: str
    lifestyle: str

class PersonaResponse(BaseModel):
    id: str
    name: str
    background: str
    motivations: List[str]
    pains: List[str]
    behaviours: List[str]
    channels: List[str]
    demographics: PersonaDemographics
    quotes: List[str]
    intent_summary: str
    influence_summary: str
    created_at: str

class MotivationScore(BaseModel):
    name: str
    score: float
    frequency: Optional[int] = None  # Not used in raw score mode

class PainScore(BaseModel):
    name: str
    score: float
    frequency: Optional[int] = None  # Not used in raw score mode

class DemographicBreakdown(BaseModel):
    age_groups: Dict[str, int]
    genders: Dict[str, int]
    skin_types: Dict[str, int]
    skin_tones: Dict[str, int]
    lifestyles: Dict[str, int]

class ReportResponse(BaseModel):
    total_insights: int
    top_motivations: List[MotivationScore]
    top_pains: List[PainScore]
    demographics: DemographicBreakdown
    top_behaviours: Dict[str, int]
    top_channels: Dict[str, int]
    top_products: Dict[str, int]
    platform_counts: Dict[str, int]  # NEW: Platform counts
    avg_purchase_intent: float
    avg_influencer_effect: float
    intent_distribution: Dict[str, int]
    influence_distribution: Dict[str, int]

class GeneratePersonasResponse(BaseModel):
    success: bool
    message: str
    personas_count: int
