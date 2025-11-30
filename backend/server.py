import sys
import os
# Ensure the parent directory is in the Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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

def check_permission_access(
    x_user_name: Optional[str] = None, 
    x_user_role: Optional[str] = None,
    required_module: Optional[str] = None,
    required_tab: Optional[str] = None,
    required_action: Optional[str] = None
):
    """Check if user has permission based on new permission system"""
    from services import permissions_service
    
    # Superadmin always has access
    if x_user_role == 'superadmin':
        return True
    
    # Admin has access unless explicitly denied (backward compatibility)
    if x_user_role == 'admin':
        return True
    
    # For regular users, check permissions
    if not x_user_name or not x_user_role:
        raise HTTPException(status_code=403, detail="Access denied. Authentication required.")
    
    try:
        # Get user permissions
        permissions_dict = permissions_service.get_user_permissions(x_user_name, x_user_role)
        if not permissions_dict:
            raise HTTPException(status_code=403, detail="No permissions found for user.")
        
        # Check module access
        if required_module:
            module_perms = permissions_dict.get(required_module)
            if not module_perms or not module_perms.enabled:
                raise HTTPException(status_code=403, detail=f"Access denied to {required_module} module.")
            
            # Check tab access
            if required_tab:
                tabs = module_perms.tabs
                if tabs and required_tab in tabs and not tabs[required_tab]:
                    raise HTTPException(status_code=403, detail=f"Access denied to {required_tab} tab.")
            
            # Check action access
            if required_action:
                actions = module_perms.actions
                if actions and required_action in actions and not actions[required_action]:
                    raise HTTPException(status_code=403, detail=f"Access denied to perform {required_action}.")
        
        return True
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking permissions: {e}")
        raise HTTPException(status_code=500, detail="Error checking permissions.")

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
def get_report(
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get aggregated report of all insights - Check permissions"""
    check_permission_access(
        x_user_name=x_user_name,
        x_user_role=x_user_role,
        required_module='buyer_persona',
        required_tab='report'
    )
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
def get_all_personas(
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get all generated personas - Check view_personas permission"""
    check_permission_access(
        x_user_name=x_user_name,
        x_user_role=x_user_role,
        required_module='buyer_persona',
        required_action='view_personas'
    )
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

# ==================== Admin Panel - Permissions ====================

@app.get("/api/admin/users", response_model=List[UserListItem])
def get_all_users(x_user_role: Optional[str] = Header(None)):
    """Get all users with their permission status - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can access user management")
    
    try:
        from services.permissions_service import get_all_users_with_permissions
        return get_all_users_with_permissions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/permissions/{username}", response_model=UserPermissionsResponse)
def get_user_permissions_api(username: str, x_user_role: Optional[str] = Header(None)):
    """Get permissions for a specific user - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can view user permissions")
    
    try:
        from services.permissions_service import get_user_permissions
        # Get user role from database or hardcoded list
        user_roles = {
            "superadmin": "superadmin",
            "admin": "admin",
            "admin2": "admin",
            "user1": "user",
            "user2": "user",
            "anthony": "user",
            "chris": "user",
            "jessica": "user",
            "tasha": "user",
            "drgu": "user",
            "juliana": "user",
            "shannon": "user",
            "munifah": "user"
        }
        role = user_roles.get(username, "user")
        
        modules = get_user_permissions(username, role)
        return UserPermissionsResponse(username=username, role=role, modules=modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/permissions/{username}")
def update_user_permissions_api(
    username: str,
    request: UpdatePermissionsRequest,
    x_user_role: Optional[str] = Header(None)
):
    """Update permissions for a specific user - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can update user permissions")
    
    try:
        from services.permissions_service import update_user_permissions
        # Get user role
        user_roles = {
            "superadmin": "superadmin",
            "admin": "admin",
            "admin2": "admin",
            "user1": "user",
            "user2": "user",
            "anthony": "user",
            "chris": "user",
            "jessica": "user",
            "tasha": "user",
            "drgu": "user",
            "juliana": "user",
            "shannon": "user",
            "munifah": "user"
        }
        role = user_roles.get(username, "user")
        
        success = update_user_permissions(username, role, request.modules)
        if success:
            return {"message": f"Permissions updated for {username}", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to update permissions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/admin/user-modules/{username}")
def toggle_user_modules_api(
    username: str,
    modules_data: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Toggle module visibility for a user - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can toggle user modules")
    
    try:
        from services.permissions_service import set_user_module_list
        modules_enabled = modules_data.get('modules_enabled', [])
        
        success = set_user_module_list(username, modules_enabled)
        if success:
            return {
                "message": f"Modules updated for {username}",
                "modules_enabled": modules_enabled,
                "success": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update modules")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/permissions/{username}")
def reset_user_permissions_api(username: str, x_user_role: Optional[str] = Header(None)):
    """Reset user permissions to default - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can reset user permissions")
    
    try:
        from services.permissions_service import reset_user_permissions
        success = reset_user_permissions(username)
        if success:
            return {"message": f"Permissions reset to default for {username}", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to reset permissions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/permissions/me", response_model=UserPermissionsResponse)
def get_my_permissions(x_user_name: Optional[str] = Header(None), x_user_role: Optional[str] = Header(None)):
    """Get current user's permissions"""
    if not x_user_name or not x_user_role:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        from services.permissions_service import get_user_permissions
        modules = get_user_permissions(x_user_name, x_user_role)
        return UserPermissionsResponse(username=x_user_name, role=x_user_role, modules=modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Persona Threshold Settings ====================

@app.get("/api/admin/persona-threshold")
def get_persona_threshold_api(x_user_role: Optional[str] = Header(None)):
    """Get current persona threshold setting - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can access persona settings")
    
    try:
        from services import clustering_service
        threshold = clustering_service.get_persona_threshold()
        return {"minimum_tcss": threshold}
    except ImportError as e:
        print(f"Import error in persona threshold: {e}")
        return {"minimum_tcss": 2.0}  # Return default
    except Exception as e:
        print(f"Error in persona threshold: {e}")
        raise HTTPException(status_code=500, detail="Service temporarily unavailable")


@app.put("/api/admin/persona-threshold")
def set_persona_threshold_api(
    threshold_data: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Set persona threshold setting - Superadmin only"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can modify persona settings")
    
    try:
        threshold = float(threshold_data.get('minimum_tcss', 2.0))
        
        # Validate range
        if threshold < 0.0 or threshold > 6.0:
            raise HTTPException(status_code=400, detail="Threshold must be between 0.0 and 6.0")
        
        from services import clustering_service
        success = clustering_service.set_persona_threshold(threshold)
        
        if success:
            return {"message": f"Persona threshold updated to {threshold}", "minimum_tcss": threshold}
        else:
            return {"message": f"Threshold set to {threshold} (may not persist)", "minimum_tcss": threshold}
            
    except ImportError as e:
        print(f"Import error in set persona threshold: {e}")
        raise HTTPException(status_code=500, detail="Service temporarily unavailable")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid threshold value")
    except Exception as e:
        print(f"Error in set persona threshold: {e}")
        raise HTTPException(status_code=500, detail="Service temporarily unavailable")


# ==================== Shared Folder Endpoints ====================

# Import Shared Folder models and services
from models_shared_folder import (
    FolderCreate,
    FolderUpdate,
    FolderResponse,
    SharedFileCreate,
    SharedFileResponse,
    SharedFileListResponse,
    SharedFolderPermissions,
    UpdatePermissionsRequest,
    SharedFolderAnalyticsResponse
)
from services.shared_folder_service import SharedFolderService
from services.shared_files_service import SharedFilesService
from services.shared_folder_permissions_service import SharedFolderPermissionsService
from services.shared_folder_analytics_service import SharedFolderAnalyticsService
from services.module_settings_service import ModuleSettingsService
from services.important_links_service import ImportantLinksService
from services.module_order_service import ModuleOrderService
from services.marketing_data_service import MarketingDataService
from services.dynamic_data_service import DynamicDataService
from services.analytics_engine_service import AnalyticsEngineService
from services.insight_generator_service import InsightGeneratorService


# -------- Module Settings (Superadmin only) --------

@app.get("/api/module-settings")
def get_module_settings(x_user_name: Optional[str] = Header(None)):
    """Get module visibility settings (all authenticated users can read)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        settings = ModuleSettingsService.get_settings()
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/module-settings")
def get_module_settings_admin(x_user_role: Optional[str] = Header(None)):
    """Get module visibility settings (Superadmin only - for admin panel)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can access module settings")
    
    try:
        settings = ModuleSettingsService.get_settings()
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/admin/module-settings")
def update_module_settings(
    updates: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Update module visibility settings (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can modify module settings")
    
    try:
        updated_settings = ModuleSettingsService.update_settings(updates)
        return updated_settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Important Links --------

@app.post("/api/important-links")
def create_important_link(
    link_data: dict,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Create a new important link (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can create important links")
    
    try:
        result = ImportantLinksService.create_link(
            title=link_data.get('title'),
            url=link_data.get('url'),
            description=link_data.get('description', ''),
            icon=link_data.get('icon', 'link'),
            created_by=x_user_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/important-links")
def get_important_links(
    x_user_name: Optional[str] = Header(None)
):
    """Get all important links (all authenticated users)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        links = ImportantLinksService.get_all_links()
        return links
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/important-links/{link_id}")
def update_important_link(
    link_id: str,
    link_data: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Update an important link (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can update important links")
    
    try:
        result = ImportantLinksService.update_link(
            link_id=link_id,
            title=link_data.get('title'),
            url=link_data.get('url'),
            description=link_data.get('description'),
            icon=link_data.get('icon')
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/important-links/{link_id}")
def delete_important_link(
    link_id: str,
    x_user_role: Optional[str] = Header(None)
):
    """Delete an important link (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can delete important links")
    
    try:
        ImportantLinksService.delete_link(link_id)
        return {"message": "Link deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/important-links/{link_id}/reorder")
def reorder_important_link(
    link_id: str,
    direction: str,
    x_user_role: Optional[str] = Header(None)
):
    """Reorder link (Superadmin only) - direction: 'up' or 'down'"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can reorder important links")
    
    if direction not in ['up', 'down']:
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")
    
    try:
        success = ImportantLinksService.reorder_link(link_id, direction)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot move link in that direction")
        return {"message": "Link reordered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Folder Management (Superadmin only) --------

@app.post("/api/shared-folders", response_model=FolderResponse)
def create_folder(
    folder: FolderCreate,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Create a new folder (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can create folders")
    
    try:
        result = SharedFolderService.create_folder(
            name=folder.name,
            created_by=x_user_name,
            icon=folder.icon,
            color=folder.color
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shared-folders", response_model=List[FolderResponse])
def get_folders(
    include_personal: bool = False,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get all folders (all authenticated users)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if user can view files
    can_view = SharedFolderPermissionsService.check_permission(x_user_role, 'allowViewAll')
    if not can_view:
        raise HTTPException(status_code=403, detail="You don't have permission to view shared files")
    
    try:
        folders = SharedFolderService.get_all_folders(user_id=x_user_name, include_personal=include_personal)
        return folders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shared-folders/personal")
def get_personal_folder(
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get or create personal folder for current user"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        folder = SharedFolderService.get_or_create_personal_folder(x_user_name)
        return folder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/shared-folders/{folder_id}", response_model=FolderResponse)
def update_folder(
    folder_id: str,
    folder: FolderUpdate,
    x_user_role: Optional[str] = Header(None)
):
    """Update folder name/icon/color (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can update folders")
    
    try:
        result = SharedFolderService.update_folder(
            folder_id=folder_id,
            name=folder.name,
            icon=folder.icon,
            color=folder.color
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/shared-folders/{folder_id}")
def delete_folder(
    folder_id: str,
    x_user_role: Optional[str] = Header(None)
):
    """Delete a folder (Superadmin only, must be empty)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can delete folders")
    
    try:
        SharedFolderService.delete_folder(folder_id)
        return {"message": "Folder deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/shared-folders/{folder_id}/reorder")
def reorder_folder(
    folder_id: str,
    direction: str,
    x_user_role: Optional[str] = Header(None)
):
    """Reorder folder (Superadmin only) - direction: 'up' or 'down'"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can reorder folders")
    
    if direction not in ['up', 'down']:
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")
    
    try:
        success = SharedFolderService.reorder_folder(folder_id, direction)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot move folder in that direction")
        return {"message": "Folder reordered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/shared-folders/initialize")
def initialize_default_folders(x_user_role: Optional[str] = Header(None)):
    """Initialize default folders (Superadmin only, one-time setup)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can initialize folders")
    
    try:
        SharedFolderService.initialize_default_folders(created_by="superadmin")
        return {"message": "Default folders initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- File Management --------

@app.post("/api/shared-files", response_model=SharedFileResponse)
def create_shared_file(
    file: SharedFileCreate,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Create file metadata after frontend uploads to Firebase Storage"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check upload permission
    can_upload = SharedFolderPermissionsService.check_permission(x_user_role, 'allowUpload')
    if not can_upload:
        raise HTTPException(status_code=403, detail="You don't have permission to upload files")
    
    try:
        result = SharedFilesService.create_file(
            folder_id=file.folderID,
            file_name=file.fileName,
            file_type=file.fileType,
            file_size=file.fileSize,
            file_url=file.fileURL,
            preview_type=file.previewType,
            uploader_user_id=x_user_name,
            uploader_name=x_user_name  # Could be enhanced with full name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shared-files", response_model=List[SharedFileResponse])
def get_shared_files(
    folderID: Optional[str] = None,
    uploaderID: Optional[str] = None,
    fileType: Optional[str] = None,
    limit: int = 100,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get files with optional filters, respecting personal folder privacy"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check view permission
    can_view = SharedFolderPermissionsService.check_permission(x_user_role, 'allowViewAll')
    if not can_view:
        raise HTTPException(status_code=403, detail="You don't have permission to view shared files")
    
    try:
        files = SharedFilesService.get_all_files(
            folder_id=folderID,
            uploader_id=uploaderID,
            file_type_filter=fileType,
            limit=limit,
            requesting_user_id=x_user_name,
            is_superadmin=(x_user_role == 'superadmin')
        )
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shared-files/{file_id}", response_model=SharedFileResponse)
def get_shared_file(
    file_id: str,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Get a single file by ID"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    can_view = SharedFolderPermissionsService.check_permission(x_user_role, 'allowViewAll')
    if not can_view:
        raise HTTPException(status_code=403, detail="You don't have permission to view shared files")
    
    try:
        file_data = SharedFilesService.get_file_by_id(file_id)
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        return file_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/shared-files/{file_id}")
def delete_shared_file(
    file_id: str,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Delete a file (owner or superadmin only)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    is_superadmin = (x_user_role == 'superadmin')
    
    # Check delete permission for non-superadmin
    if not is_superadmin:
        can_delete_own = SharedFolderPermissionsService.check_permission(x_user_role, 'allowDeleteOwn')
        if not can_delete_own:
            raise HTTPException(status_code=403, detail="You don't have permission to delete files")
    
    try:
        SharedFilesService.delete_file(
            file_id=file_id,
            requesting_user_id=x_user_name,
            is_superadmin=is_superadmin
        )
        return {"message": "File deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/shared-files/{file_id}/download")
def increment_file_download(
    file_id: str,
    x_user_name: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    """Increment download count for analytics"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    can_download = SharedFolderPermissionsService.check_permission(x_user_role, 'allowDownloadAll')
    if not can_download:
        raise HTTPException(status_code=403, detail="You don't have permission to download files")
    
    try:
        success = SharedFilesService.increment_download_count(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        return {"message": "Download count incremented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Permission Settings (Superadmin only) --------

@app.get("/api/admin/shared-folder-permissions", response_model=SharedFolderPermissions)
def get_shared_folder_permissions(x_user_role: Optional[str] = Header(None)):
    """Get current shared folder permission settings (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can access permission settings")
    
    try:
        permissions = SharedFolderPermissionsService.get_permissions()
        return permissions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/admin/shared-folder-permissions", response_model=SharedFolderPermissions)
def update_shared_folder_permissions(
    updates: UpdatePermissionsRequest,
    x_user_role: Optional[str] = Header(None)
):
    """Update shared folder permission settings (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can modify permission settings")
    
    try:
        # Convert to dict, excluding None values
        update_dict = {k: v for k, v in updates.dict().items() if v is not None}
        
        updated_permissions = SharedFolderPermissionsService.update_permissions(update_dict)
        return updated_permissions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Analytics (Superadmin only) --------

@app.get("/api/admin/shared-folder-analytics", response_model=SharedFolderAnalyticsResponse)
def get_shared_folder_analytics(x_user_role: Optional[str] = Header(None)):
    """Get analytics for shared folder (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can access analytics")
    
    try:
        analytics = SharedFolderAnalyticsService.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Health Check ====================

@app.get("/")
def root():
    """Root endpoint - health check"""
    return {"status": "healthy", "service": "MUFE Persona System", "version": "1.0"}


# ==================== Module Order Endpoints ====================

@app.get("/api/module-order")
def get_module_order(
    x_user_name: Optional[str] = Header(None)
):
    """Get module order (all authenticated users)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        order = ModuleOrderService.get_order()
        return {"order": order}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/admin/module-order")
def update_module_order(
    order_data: dict,
    x_user_role: Optional[str] = Header(None)
):
    """Update module order (Superadmin only)"""
    if x_user_role != 'superadmin':
        raise HTTPException(status_code=403, detail="Only superadmin can update module order")
    
    try:
        new_order = order_data.get('order', [])
        result = ModuleOrderService.update_order(new_order)
        return {"order": result, "message": "Module order updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Dynamic Marketing Data Endpoints ====================


# Permission checking helper for diagnostic modules
def check_diagnostic_permission(username: str, role: str, module: str, action: str) -> bool:
    """
    Check if user has permission to perform an action on a diagnostic module
    Args:
        username: User's username
        role: User's role (superadmin, admin, user)
        module: Module name ('social_media' or 'search_marketing')
        action: Action to check (e.g., 'save_data', 'analyze_data', 'perform_mapping')
    Returns:
        True if user has permission, False otherwise
    """
    # Superadmin always has full access
    if role == 'superadmin':
        return True
    
    try:
        from services.permissions_service import get_user_permissions
        perms = get_user_permissions(username, role)
        
        # Module name needs to have '_diagnostics' suffix
        module_key = f"{module}_diagnostics"
        module_perms = perms.get('modules', {}).get(module_key)
        
        if not module_perms or not module_perms.get('enabled'):
            return False
        
        # Check if action is allowed
        return module_perms.get('actions', {}).get(action, False)
    except Exception as e:
        print(f"Error checking diagnostic permission: {e}")
        return False


@app.post("/api/dynamic-data/{module}")
def save_dynamic_table_data(
    module: str,
    data: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Save dynamic table data (columns + rows)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    try:
        success = DynamicDataService.save_table_data(x_user_name, module, data)
        if success:
            return {"message": "Data saved successfully"}
        raise HTTPException(status_code=500, detail="Failed to save data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dynamic-data/{module}")
def get_dynamic_table_data(
    module: str,
    x_user_name: Optional[str] = Header(None)
):
    """Get dynamic table data (columns + rows)"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    try:
        data = DynamicDataService.get_table_data(x_user_name, module)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/column-mapping/{module}")
def save_column_mapping(
    module: str,
    mappings: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Save column mappings"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    try:
        mapping_data = mappings.get('mappings', {})
        success = DynamicDataService.save_column_mapping(x_user_name, module, mapping_data)
        if success:
            return {"message": "Mappings saved successfully", "mappings": mapping_data}
        raise HTTPException(status_code=500, detail="Failed to save mappings")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/column-mapping/{module}")
def get_column_mapping(
    module: str,
    x_user_name: Optional[str] = Header(None)
):
    """Get column mappings"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    try:
        mappings = DynamicDataService.get_column_mapping(x_user_name, module)
        return {"mappings": mappings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/{module}")
def get_analytics(
    module: str,
    x_user_name: Optional[str] = Header(None)
):
    """Get analytics based on mapped data"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    try:
        # Get mapped data
        mapped_data = DynamicDataService.get_mapped_data(x_user_name, module)
        
        if not mapped_data:
            return {"error": "No mapped data available. Please upload data and complete column mapping."}
        
        # Generate analytics
        if module == 'social_media':
            analytics = AnalyticsEngineService.social_media_analytics(mapped_data)
        else:
            analytics = AnalyticsEngineService.search_marketing_analytics(mapped_data)
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-insights/{module_type}")
def generate_insights(
    module_type: str,
    analytics_data: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Generate automated insights from analytics data"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if module_type not in ['social_media', 'search_marketing']:
        raise HTTPException(status_code=400, detail="Invalid module type")
    
    try:
        # Generate insights based on module type
        if module_type == 'social_media':
            insights = InsightGeneratorService.generate_social_media_insights(analytics_data)
        else:
            insights = InsightGeneratorService.generate_search_marketing_insights(analytics_data)
        
        return insights
    except Exception as e:
        print(f"Error generating insights: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# ==================== Marketing Data Input Endpoints ====================

@app.get("/api/social-media-data")
def get_social_media_data(x_user_name: Optional[str] = Header(None)):
    """Get social media performance data for current user"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        data = MarketingDataService.get_social_media_data(x_user_name)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/social-media-data")
def save_social_media_data(
    request: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Save social media performance data for current user"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        data = request.get('data', [])
        success = MarketingDataService.save_social_media_data(x_user_name, data)
        if success:
            return {"message": "Data saved successfully", "count": len(data)}
        else:
            raise HTTPException(status_code=500, detail="Failed to save data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search-marketing-data")
def get_search_marketing_data(x_user_name: Optional[str] = Header(None)):
    """Get search marketing data for current user"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        data = MarketingDataService.get_search_marketing_data(x_user_name)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search-marketing-data")
def save_search_marketing_data(
    request: dict,
    x_user_name: Optional[str] = Header(None)
):
    """Save search marketing data for current user"""
    if not x_user_name:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        data = request.get('data', [])
        success = MarketingDataService.save_search_marketing_data(x_user_name, data)
        if success:
            return {"message": "Data saved successfully", "count": len(data)}
        else:
            raise HTTPException(status_code=500, detail="Failed to save data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    """Health check endpoint for deployment"""
    from datetime import datetime, timezone
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ==================== Main ====================

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        timeout_keep_alive=30,
        access_log=True
    )
