"""
Permissions Service
Manages user permissions in Firestore
"""
from firebase_client import db
from models_permissions import (
    UserPermissions, 
    ModulePermission,
    DEFAULT_PERMISSIONS,
    ADMIN_PERMISSIONS,
    SUPERADMIN_PERMISSIONS
)
from typing import Dict, Optional

def get_user_permissions(username: str, role: str) -> Dict[str, ModulePermission]:
    """
    Get user permissions from Firestore or return defaults
    
    Args:
        username: User's username
        role: User's role (user/admin/superadmin)
    
    Returns:
        Dictionary of module permissions
    """
    # Superadmin always has full access
    if role == "superadmin":
        return SUPERADMIN_PERMISSIONS
    
    # Check for custom permissions in Firestore
    try:
        doc = db.collection('user_permissions').document(username).get()
        if doc.exists:
            data = doc.to_dict()
            # Convert dict to ModulePermission objects
            modules = {}
            for module_name, module_data in data.get('modules', {}).items():
                modules[module_name] = ModulePermission(**module_data)
            return modules
    except Exception as e:
        print(f"Error getting permissions for {username}: {e}")
    
    # Return default permissions based on role
    if role == "admin":
        return ADMIN_PERMISSIONS
    else:
        return DEFAULT_PERMISSIONS


def update_user_permissions(username: str, role: str, modules: Dict[str, ModulePermission]) -> bool:
    """
    Update user permissions in Firestore
    
    Args:
        username: User's username
        role: User's role
        modules: Dictionary of module permissions
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Convert ModulePermission objects to dicts
        modules_dict = {}
        for module_name, module_perm in modules.items():
            modules_dict[module_name] = module_perm.dict()
        
        # Save to Firestore
        doc_ref = db.collection('user_permissions').document(username)
        doc_ref.set({
            'username': username,
            'role': role,
            'modules': modules_dict
        })
        return True
    except Exception as e:
        print(f"Error updating permissions for {username}: {e}")
        return False


def get_all_users_with_permissions():
    """
    Get all users and their permission status
    
    Returns:
        List of user permission summaries
    """
    # This would need to integrate with your user management system
    # For now, return hardcoded users
    users = [
        {"username": "superadmin", "role": "superadmin"},
        {"username": "admin", "role": "admin"},
        {"username": "admin2", "role": "admin"},
        {"username": "user1", "role": "user"},
        {"username": "user2", "role": "user"},
        {"username": "anthony", "role": "user"},
        {"username": "chris", "role": "user"},
        {"username": "jessica", "role": "user"},
        {"username": "tasha", "role": "user"},
        {"username": "drgu", "role": "user"},
        {"username": "juliana", "role": "user"},
        {"username": "shannon", "role": "user"},
        {"username": "munifah", "role": "user"},
    ]
    
    result = []
    for user in users:
        username = user["username"]
        role = user["role"]
        
        # Get permissions
        perms = get_user_permissions(username, role)
        
        # Check if has custom permissions
        has_custom = False
        try:
            doc = db.collection('user_permissions').document(username).get()
            has_custom = doc.exists
        except:
            pass
        
        # Get list of enabled modules
        enabled_modules = [
            name for name, perm in perms.items() 
            if perm.enabled
        ]
        
        result.append({
            "username": username,
            "role": role,
            "has_custom_permissions": has_custom,
            "modules_enabled": enabled_modules
        })
    
    return result


def reset_user_permissions(username: str) -> bool:
    """
    Reset user permissions to default based on role
    
    Args:
        username: User's username
    
    Returns:
        True if successful
    """
    try:
        doc_ref = db.collection('permissions').document(username)
        doc_ref.delete()
        return True
    except Exception as e:
        print(f"Error resetting permissions for {username}: {e}")
        return False
