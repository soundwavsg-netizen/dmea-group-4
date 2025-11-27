"""
Service for managing module visibility settings
"""
from firebase_client import db
from typing import Dict, Any


class ModuleSettingsService:
    """Service for module toggle settings"""
    
    SETTINGS_DOC_PATH = "settings/module_visibility"
    
    DEFAULT_SETTINGS = {
        "shared_folder_enabled": True,
        "important_links_enabled": True
    }
    
    @staticmethod
    def get_settings() -> Dict[str, bool]:
        """Get current module visibility settings"""
        doc = db.document(ModuleSettingsService.SETTINGS_DOC_PATH).get()
        
        if not doc.exists:
            # Initialize with defaults
            ModuleSettingsService._initialize_defaults()
            return ModuleSettingsService.DEFAULT_SETTINGS.copy()
        
        return doc.to_dict()
    
    @staticmethod
    def update_settings(updates: Dict[str, bool]) -> Dict[str, bool]:
        """Update module visibility settings (Superadmin only)"""
        doc_ref = db.document(ModuleSettingsService.SETTINGS_DOC_PATH)
        
        # Get current settings or use defaults
        current = ModuleSettingsService.get_settings()
        
        # Merge updates
        for key, value in updates.items():
            if key in ModuleSettingsService.DEFAULT_SETTINGS:
                current[key] = value
        
        # Save to Firestore
        doc_ref.set(current)
        
        return current
    
    @staticmethod
    def _initialize_defaults():
        """Initialize default settings if not exists"""
        doc_ref = db.document(ModuleSettingsService.SETTINGS_DOC_PATH)
        doc_ref.set(ModuleSettingsService.DEFAULT_SETTINGS)
