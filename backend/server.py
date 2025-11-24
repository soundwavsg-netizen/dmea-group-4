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
from models_daily_reflections import (
    DailyReflectionCreate,
    DailyReflectionUpdate,
    DailyReflectionResponse
)

# Import services
from services.insights_service import InsightsService
from services.report_service import ReportService
from services.clustering_service import ClusteringService
from services.persona_service import PersonaService
from services.daily_reflections_service import DailyReflectionsService
from firebase_client import db
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

def check_daily_reflections_access(x_user_name: Optional[str] = None):
    """Check if user has access to Daily Reflections module - All authenticated users have access"""
    # Daily Reflections is available to ALL authenticated users
    # Each user can only see their own reflections
    if not x_user_name:
        raise HTTPException(status_code=401, detail="User identification required.")
    return x_user_name

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

# ==================== Daily Reflections Endpoints ====================

@app.post("/api/daily-reflections", response_model=DailyReflectionResponse)
def create_daily_reflection(
    reflection: DailyReflectionCreate,
    x_user_name: Optional[str] = Header(None)
):
    """Create a new daily reflection (user-specific)"""
    user_id = check_daily_reflections_access(x_user_name)
    try:
        result = DailyReflectionsService.create_reflection(
            data=reflection.dict(),
            created_by=user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/daily-reflections", response_model=List[DailyReflectionResponse])
def get_all_daily_reflections(
    limit: int = 100,
    x_user_name: Optional[str] = Header(None)
):
    """Get all daily reflections for the current user"""
    user_id = check_daily_reflections_access(x_user_name)
    try:
        return DailyReflectionsService.get_all_reflections(user_id=user_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/daily-reflections/{reflection_id}", response_model=DailyReflectionResponse)
def get_daily_reflection(
    reflection_id: str,
    x_user_name: Optional[str] = Header(None)
):
    """Get a single daily reflection by ID (user can only access their own)"""
    user_id = check_daily_reflections_access(x_user_name)
    try:
        return DailyReflectionsService.get_reflection_by_id(reflection_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/daily-reflections/{reflection_id}", response_model=DailyReflectionResponse)
def update_daily_reflection(
    reflection_id: str,
    reflection: DailyReflectionUpdate,
    x_user_name: Optional[str] = Header(None)
):
    """Update an existing daily reflection (user can only update their own)"""
    user_id = check_daily_reflections_access(x_user_name)
    try:
        result = DailyReflectionsService.update_reflection(
            reflection_id=reflection_id,
            data=reflection.dict(exclude_unset=True),
            user_id=user_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/daily-reflections/{reflection_id}")
def delete_daily_reflection(
    reflection_id: str,
    x_user_name: Optional[str] = Header(None)
):
    """Delete a daily reflection (user can only delete their own)"""
    user_id = check_daily_reflections_access(x_user_name)
    try:
        DailyReflectionsService.delete_reflection(reflection_id, user_id)
        return {"message": "Reflection deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Change Password Endpoint ====================

@app.post("/api/change-password")
def change_password(
    request: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Change user password (blocked for demo accounts: user1, user2, admin, admin2)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="User identification required")
    
    # List of locked accounts
    LOCKED_ACCOUNTS = ['user1', 'user2', 'admin', 'admin2']
    
    if x_user_name in LOCKED_ACCOUNTS:
        raise HTTPException(status_code=403, detail=f"Password change not allowed for demo account: {x_user_name}")
    
    current_password = request.get('current_password')
    new_password = request.get('new_password')
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current password and new password are required")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    # Hardcoded credentials (same as frontend authService.js)
    HARDCODED_ACCOUNTS = {
        "superadmin": "SUPERPASS",
        "admin": "ADMINPASS",
        "user1": "USERPASS",
        "user2": "USERPASS",
        "anthony": "anthony",
        "chris": "chris",
        "drgu": "drgu",
        "jessica": "jessica",
        "juliana": "juliana",
        "munifah": "munifah",
        "shannon": "shannon",
        "tasha": "tasha"
    }
    
    try:
        # Check if it's a hardcoded account
        if x_user_name in HARDCODED_ACCOUNTS:
            # Verify current password against hardcoded value
            if HARDCODED_ACCOUNTS[x_user_name] != current_password:
                raise HTTPException(status_code=401, detail="Current password is incorrect")
            
            # Store password override in Firestore
            password_override_ref = db.collection('password_overrides').document(x_user_name)
            password_override_ref.set({
                'username': x_user_name,
                'new_password': new_password,
                'changed_at': firestore.SERVER_TIMESTAMP
            })
            
            return {"message": "Password changed successfully. Please use new password on next login."}
        
        # For Firestore users (like admin2)
        users_ref = db.collection('users')
        query = users_ref.where('username', '==', x_user_name).limit(1).stream()
        user_doc = None
        user_id = None
        
        for doc in query:
            user_doc = doc.to_dict()
            user_id = doc.id
            break
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        # Verify current password
        if user_doc.get('password') != current_password:
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Update password
        db.collection('users').document(user_id).update({
            'password': new_password
        })
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Main ====================

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
