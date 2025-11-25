from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

# Import models
from models import (
    InsightCreate,
    InsightResponse,
    PersonaResponse,
    ReportResponse,
    GeneratePersonasResponse
)
from models_permissions import (
    UserPermissionsResponse, 
    UpdatePermissionsRequest, 
    UserListItem,
    ModulePermission
)
from models_daily_reflections import (
    DailyReflectionCreate,
    DailyReflectionUpdate,
    DailyReflectionResponse
)

# Import services
from services.insights_service import InsightsService
from services.report_service import ReportService
# Clustering service is imported dynamically in endpoints
from services.persona_service import PersonaService
from services.daily_reflections_service import DailyReflectionsService
from services import presentations_service
from firebase_client import db
from firebase_admin import firestore
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
    """Generate personas from insights using K-Means clustering - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        from services.persona_generation_service import generate_personas_from_insights
        
        # Run complete persona generation workflow
        result = generate_personas_from_insights(n_clusters=3)
        
        return GeneratePersonasResponse(
            success=result['success'],
            message=result['message'],
            personas_count=result['personas_created']
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/personas", response_model=List[PersonaResponse])
def get_all_personas(x_user_role: Optional[str] = Header(None)):
    """Get all generated personas - Admin/SuperAdmin only"""
    check_admin_access(x_user_role)
    try:
        personas = []
        docs = db.collection('personas').stream()
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            personas.append(data)
        return personas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/personas/{persona_id}")
def update_persona(
    persona_id: str,
    updates: Dict[str, Any],
    x_user_role: Optional[str] = Header(None)
):
    """Update persona fields - SuperAdmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can edit personas")
    
    try:
        persona_ref = db.collection('personas').document(persona_id)
        persona = persona_ref.get()
        
        if not persona.exists:
            raise HTTPException(status_code=404, detail="Persona not found")
        
        # Update with timestamp
        from datetime import datetime, timezone
        updates['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        persona_ref.update(updates)
        
        # Return updated persona
        updated = persona_ref.get().to_dict()
        updated['id'] = persona_id
        return updated
    except HTTPException:
        raise
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

# ==================== Authentication Endpoints ====================

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    """Login endpoint - validates credentials against hardcoded accounts and password overrides"""
    username = request.username
    password = request.password
    
    # Hardcoded credentials (matching frontend authService.js)
    HARDCODED_ACCOUNTS = {
        "superadmin": {"password": "SUPERPASS", "role": "superadmin"},
        "admin": {"password": "ADMINPASS", "role": "admin"},
        "admin2": {"password": "ADMINPASS2", "role": "admin"},
        "user1": {"password": "USERPASS", "role": "user"},
        "user2": {"password": "USERPASS", "role": "user"},
        "anthony": {"password": "anthony", "role": "user"},
        "chris": {"password": "chris", "role": "user"},
        "drgu": {"password": "drgu", "role": "user"},
        "jessica": {"password": "jessica", "role": "user"},
        "juliana": {"password": "juliana", "role": "user"},
        "munifah": {"password": "munifah", "role": "user"},
        "shannon": {"password": "shannon", "role": "user"},
        "tasha": {"password": "tasha", "role": "user"}
    }
    
    # Check if user exists in hardcoded accounts
    if username not in HARDCODED_ACCOUNTS:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user_data = HARDCODED_ACCOUNTS[username]
    
    try:
        # FIRST: Check if password has been overridden in Firestore
        password_override_ref = db.collection('password_overrides').document(username)
        password_override_doc = password_override_ref.get()
        
        if password_override_doc.exists:
            # Password override exists - ONLY validate against new password
            override_data = password_override_doc.to_dict()
            new_password = override_data.get('new_password')
            
            if password != new_password:
                raise HTTPException(status_code=401, detail="Invalid username or password")
            
            # New password is valid
            return {
                "success": True,
                "username": username,
                "role": user_data["role"]
            }
        
        # NO override exists - validate against hardcoded password
        if password != user_data["password"]:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Hardcoded password is valid
        return {
            "success": True,
            "username": username,
            "role": user_data["role"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

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
    
    if len(new_password) < 5:
        raise HTTPException(status_code=400, detail="New password must be at least 5 characters")
    
    # Hardcoded credentials (same as frontend authService.js)
    HARDCODED_ACCOUNTS = {
        "superadmin": "SUPERPASS",
        "admin": "ADMINPASS",
        "admin2": "ADMINPASS2",
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

# ==================== Custom Presentations Endpoints ====================

class PresentationCreate(BaseModel):
    name: str
    description: str
    file_url: str  # Now required - provided by frontend after direct upload
    file_type: str  # 'slides' or 'video'

@app.get("/api/presentations")
def get_presentations(
    x_user_name: Optional[str] = Header(None)
):
    """Get all custom presentations"""
    try:
        presentations = presentations_service.get_all_presentations()
        return {"presentations": presentations}
    except Exception as e:
        print(f"Error fetching presentations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/presentations")
def create_presentation(
    presentation: PresentationCreate,
    x_user_name: Optional[str] = Header(None)
):
    """Create a new custom presentation (frontend uploads file directly)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # file_url is now required - frontend uploads to Firebase Storage first
    if not presentation.file_url:
        raise HTTPException(status_code=400, detail="File URL is required")
    
    try:
        new_presentation = presentations_service.create_presentation(
            name=presentation.name,
            description=presentation.description,
            file_url=presentation.file_url,
            file_type=presentation.file_type,
            created_by=x_user_name
        )
        return new_presentation
    except Exception as e:
        print(f"Error creating presentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/presentations/{presentation_id}")
def delete_presentation(
    presentation_id: str,
    x_user_role: Optional[str] = Header(None)
):
    """Delete a presentation (superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can delete presentations")
    
    try:
        success = presentations_service.delete_presentation(presentation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Presentation not found")
        return {"message": "Presentation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting presentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/presentations/{presentation_id}")
def get_presentation(presentation_id: str):
    """Get a single presentation by ID"""
    try:
        presentation = presentations_service.get_presentation_by_id(presentation_id)
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentation not found")
        return presentation
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching presentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Superadmin Reset Password Endpoint ====================

@app.post("/api/admin/reset-password")
def admin_reset_password(
    request: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Superadmin endpoint to reset any user's password"""
    # Check if user is superadmin
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can reset passwords")
    
    target_username = request.get('username')
    new_password = request.get('new_password')
    
    if not target_username or not new_password:
        raise HTTPException(status_code=400, detail="Username and new password are required")
    
    if len(new_password) < 5:
        raise HTTPException(status_code=400, detail="New password must be at least 5 characters")
    
    # List of valid accounts
    VALID_ACCOUNTS = [
        "superadmin", "admin", "admin2", "user1", "user2",
        "anthony", "chris", "drgu", "jessica", "juliana", 
        "munifah", "shannon", "tasha"
    ]
    
    if target_username not in VALID_ACCOUNTS:
        raise HTTPException(status_code=404, detail=f"User '{target_username}' not found")
    
    try:
        # Store password override in Firestore (or update if exists)
        password_override_ref = db.collection('password_overrides').document(target_username)
        password_override_ref.set({
            'username': target_username,
            'new_password': new_password,
            'changed_at': firestore.SERVER_TIMESTAMP,
            'reset_by': 'superadmin'
        })
        
        return {
            "message": f"Password reset successfully for user: {target_username}",
            "username": target_username
        }
        
    except Exception as e:
        print(f"Error resetting password: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Main ====================

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
