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
    age_group: str
    gender: str
    skin_type: str
    tone: str

class PersonaResponse(BaseModel):
    id: str
    name: str
    persona_animated_image_url: str
    cluster_id: str
    
    # WTS-based traits
    dominant_motivations: List[str]
    dominant_pain_points: List[str]
    intent_category: str
    influence_category: str
    
    # Frequency-based traits
    behaviour_patterns: List[str]
    channel_preference: List[str]
    top_products: List[str]
    demographic_profile: Dict[str, str]
    representative_quotes: List[str]
    
    # Generated descriptions
    buying_trigger: str
    summary_description: str
    
    # Metadata
    created_at: str
    insight_count: int
    
    # TCSS and star persona data (new)
    tcss: Optional[float] = 0.0  # TCSS score for persona ranking
    is_star_persona: Optional[bool] = False  # Whether this is the star persona
    
    # Legacy scoring (optional for backward compatibility)
    best_persona_score: Optional[float] = 0.0  
    avg_purchase_intent: Optional[float] = 0.0  
    avg_motivation_score: Optional[float] = 0.0
    avg_influencer_effect: Optional[float] = 0.0  # New field
    is_editable: bool

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
