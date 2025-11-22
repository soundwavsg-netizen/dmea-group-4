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

# ==================== Health Check ====================

@app.get("/")
def read_root():
    return {"message": "MUFE Group 4 User Research API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# ==================== Insights Endpoints ====================

@app.post("/api/insights", response_model=InsightResponse)
def create_insight(insight: InsightCreate):
    """Create a new user research insight"""
    try:
        return InsightsService.create_insight(insight)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights", response_model=List[InsightResponse])
def get_all_insights(limit: int = 100):
    """Get all insights"""
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

# ==================== Report Endpoint ====================

@app.get("/api/report", response_model=ReportResponse)
def get_report():
    """Get aggregated report of all insights"""
    try:
        return ReportService.generate_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Persona Endpoints ====================

@app.post("/api/personas/generate", response_model=GeneratePersonasResponse)
def generate_personas():
    """Generate personas from insights using clustering and LLM"""
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
def get_all_personas():
    """Get all generated personas"""
    try:
        return PersonaService.get_all_personas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Main ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
