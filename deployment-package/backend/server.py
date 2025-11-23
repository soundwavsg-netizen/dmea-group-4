from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import models
from models import (
    InsightCreate,
    InsightResponse,
    PersonaResponse,
    ReportResponse,
    GeneratePersonasResponse
)

# Import services
from services.insights_service import InsightsService
from services.report_service import ReportService
from services.clustering_service import ClusteringService
from services.persona_service import PersonaService
from config import settings

# Initialize FastAPI app
app = FastAPI(title="MUFE Group 4 - User Research API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
persona_service = PersonaService()

# ==================== Role-Based Access Control ====================

def check_admin_access(x_user_role: Optional[str] = None):
    """Check if user has admin or superadmin role"""
    if not x_user_role or x_user_role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    return x_user_role

# ==================== Health Check ====================

@app.get("/")
def read_root():
    return {"message": "MUFE Group 4 User Research API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# ==================== Insights Endpoints ====================

@app.post("/api/insights", response_model=InsightResponse)
def create_insight(
    insight: InsightCreate, 
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Create a new user research insight"""
    try:
        # Capture createdBy from header
        if x_user_name:
            insight.created_by = x_user_name
        return InsightsService.create_insight(insight)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights", response_model=List[InsightResponse])
def get_all_insights(
    limit: int = 100,
    x_user_role: Optional[str] = Header(None)
):
    """Get all insights - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        return InsightsService.get_all_insights(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/{insight_id}", response_model=InsightResponse)
def get_insight(insight_id: str):
    """Get a single insight by ID"""
    try:
        return InsightsService.get_insight_by_id(insight_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/insights/{insight_id}")
def delete_insight(
    insight_id: str,
    x_user_role: Optional[str] = Header(None)
):
    """Delete an insight - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        InsightsService.delete_insight(insight_id)
        return {"success": True, "message": "Insight deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Report Endpoint ====================

@app.get("/api/report", response_model=ReportResponse)
def get_report(x_user_role: Optional[str] = Header(None)):
    """Get aggregated report of all insights - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        return ReportService.generate_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Persona Endpoints ====================

@app.post("/api/personas/generate", response_model=GeneratePersonasResponse)
def generate_personas(x_user_role: Optional[str] = Header(None)):
    """Generate personas from insights using clustering and LLM - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        # Step 1: Create clusters
        clusters = ClusteringService.create_clusters()
        
        if not clusters:
            return GeneratePersonasResponse(
                success=False,
                message="Not enough data to generate personas. Need more insights with varied demographics.",
                personas_count=0
            )
        
        # Step 2: Generate personas from clusters
        personas = []
        for i, cluster in enumerate(clusters, 1):
            persona = persona_service.generate_persona_from_cluster(cluster, i)
            personas.append(persona)
        
        # Step 3: Save personas (overwrite previous)
        PersonaService.save_personas(personas)
        
        return GeneratePersonasResponse(
            success=True,
            message=f"Successfully generated {len(personas)} personas",
            personas_count=len(personas)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/personas", response_model=List[PersonaResponse])
def get_all_personas(x_user_role: Optional[str] = Header(None)):
    """Get all generated personas - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        return PersonaService.get_all_personas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Main ====================

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
