"""
Service for managing Shared Folder permission toggles
"""
from firebase_client import db
from typing import Dict, Any


class SharedFolderPermissionsService:
    """Service for permission toggles management"""
    
    SETTINGS_DOC_PATH = "settings/shared_folder_permissions"
    
    DEFAULT_PERMISSIONS = {
        "allowUpload": True,
        "allowDeleteOwn": True,
        "allowViewAll": True,
        "allowDownloadAll": True,
        "allowCreateFolders": False,
        "allowDeleteFolders": False
    }
    
    @staticmethod
    def get_permissions() -> Dict[str, bool]:
        """Get current permission settings"""
        doc = db.document(SharedFolderPermissionsService.SETTINGS_DOC_PATH).get()
        
        if not doc.exists:
            # Initialize with defaults
            SharedFolderPermissionsService._initialize_defaults()
            return SharedFolderPermissionsService.DEFAULT_PERMISSIONS.copy()
        
        return doc.to_dict()
    
    @staticmethod
    def update_permissions(updates: Dict[str, bool]) -> Dict[str, bool]:
        """Update permission settings (Superadmin only)"""
        doc_ref = db.document(SharedFolderPermissionsService.SETTINGS_DOC_PATH)
        
        # Get current settings or use defaults
        current = SharedFolderPermissionsService.get_permissions()
        
        # Merge updates
        for key, value in updates.items():
            if key in SharedFolderPermissionsService.DEFAULT_PERMISSIONS:
                current[key] = value
        
        # Save to Firestore
        doc_ref.set(current)
        
        return current
    
    @staticmethod
    def _initialize_defaults():
        """Initialize default permissions if not exists"""
        doc_ref = db.document(SharedFolderPermissionsService.SETTINGS_DOC_PATH)
        doc_ref.set(SharedFolderPermissionsService.DEFAULT_PERMISSIONS)
    
    @staticmethod
    def check_permission(user_role: str, permission_key: str) -> bool:
        """
        Check if a user has a specific permission
        
        Args:
            user_role: 'superadmin', 'admin', or 'user'
            permission_key: One of the permission keys (e.g., 'allowUpload')
        
        Returns:
            bool: True if allowed, False otherwise
        """
        # Superadmin always has all permissions
        if user_role == 'superadmin':
            return True
        
        # Get current permission settings
        permissions = SharedFolderPermissionsService.get_permissions()
        
        # For admin and user, check the toggle
        # (currently treating admin same as user per requirements)
        return permissions.get(permission_key, False)
