"""
Service for managing sidebar module ordering
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from typing import List, Dict, Any


class ModuleOrderService:
    """Service for module ordering"""
    
    ORDER_DOC_PATH = "settings/module_order"
    
    # Default order for all modules
    DEFAULT_ORDER = [
        "dashboard",
        "buyer_persona",
        "daily_reflections",
        "presentations",
        "seo_content",
        "social_media",
        "analytics",
        "final_capstone",
        "shared_folder",
        "important_links"
    ]
    
    @staticmethod
    def get_order() -> List[str]:
        """Get current module order"""
        doc = db.document(ModuleOrderService.ORDER_DOC_PATH).get()
        
        if not doc.exists:
            # Initialize with defaults
            ModuleOrderService._initialize_defaults()
            return ModuleOrderService.DEFAULT_ORDER.copy()
        
        data = doc.to_dict()
        return data.get('order', ModuleOrderService.DEFAULT_ORDER.copy())
    
    @staticmethod
    def update_order(new_order: List[str]) -> List[str]:
        """Update module order (Superadmin only)"""
        doc_ref = db.document(ModuleOrderService.ORDER_DOC_PATH)
        
        # Validate that all required modules are present
        required_modules = set(ModuleOrderService.DEFAULT_ORDER)
        provided_modules = set(new_order)
        
        # Only allow reordering of existing modules
        if not provided_modules.issubset(required_modules):
            # Remove any invalid modules
            new_order = [m for m in new_order if m in required_modules]
        
        # Add any missing modules at the end
        for module in required_modules:
            if module not in new_order:
                new_order.append(module)
        
        # Save to Firestore
        doc_ref.set({'order': new_order})
        
        return new_order
    
    @staticmethod
    def _initialize_defaults():
        """Initialize default order if not exists"""
        doc_ref = db.document(ModuleOrderService.ORDER_DOC_PATH)
        doc_ref.set({'order': ModuleOrderService.DEFAULT_ORDER})
