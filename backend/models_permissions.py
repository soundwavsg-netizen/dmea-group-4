"""
Permission Models for Admin Panel
Defines user permissions for modules, tabs, and actions
"""
from pydantic import BaseModel
from typing import Dict, List, Optional

class ModulePermission(BaseModel):
    """Permissions for a single module"""
    enabled: bool = False
    tabs: Dict[str, bool] = {}  # Tab name -> enabled
    actions: Dict[str, bool] = {}  # Action name -> enabled

class UserPermissions(BaseModel):
    """Complete permission set for a user"""
    username: str
    role: str
    modules: Dict[str, ModulePermission] = {}
    
class UserPermissionsResponse(BaseModel):
    """Response model for user permissions"""
    username: str
    role: str
    modules: Dict[str, ModulePermission]

class UpdatePermissionsRequest(BaseModel):
    """Request to update user permissions"""
    username: str
    modules: Dict[str, ModulePermission]

class UserListItem(BaseModel):
    """User item in admin panel list"""
    username: str
    role: str
    has_custom_permissions: bool
    modules_enabled: List[str]

# Default permissions for new users
DEFAULT_PERMISSIONS = {
    "dashboard": ModulePermission(enabled=True, tabs={}, actions={}),
    "buyer_persona": ModulePermission(
        enabled=True, 
        tabs={
            "home": True,
            "add_insight": True,
            "report": False,
            "manage_insights": False,
            "persona_generator": False,
            "personas": False
        },
        actions={
            "add_insight": True,
            "edit_insight": False,
            "delete_insight": False,
            "view_personas": False,
            "generate_persona": False,
            "edit_persona": False
        }
    ),
    "daily_reflections": ModulePermission(
        enabled=True,  # ✅ Enabled by default for all users
        tabs={},
        actions={
            "add": True,      # ✅ Can add their own reflections
            "edit": True,     # ✅ Can edit their own reflections
            "delete": True    # ✅ Can delete their own reflections
        }
    ),
    "presentations": ModulePermission(
        enabled=False,
        tabs={
            "home": False,
            "friendly_brief": False,
            "clustering_technical": False
        },
        actions={
            "add": False,
            "delete": False
        }
    ),
    "social_media_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": False,
            "dashboard": True,
            "insight_summary": False
        },
        actions={
            "add_column": False,
            "delete_column": False,
            "rename_column": False,
            "add_row": False,
            "delete_row": False,
            "upload_csv": False,
            "save_data": False,
            "perform_mapping": False,
            "analyze_data": False
        }
    ),
    "search_marketing_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": False,
            "dashboard": True,
            "insight_summary": False
        },
        actions={
            "add_column": False,
            "delete_column": False,
            "rename_column": False,
            "add_row": False,
            "delete_row": False,
            "upload_csv": False,
            "save_data": False,
            "perform_mapping": False,
            "analyze_data": False
        }
    ),
    "shared_folder": ModulePermission(
        enabled=True,
        tabs={
            "view_files": True,
            "analytics": False
        },
        actions={
            "upload": False,
            "delete": False,
            "share": False
        }
    )
}

# Admin default permissions (full access)
ADMIN_PERMISSIONS = {
    "dashboard": ModulePermission(enabled=True, tabs={}, actions={}),
    "buyer_persona": ModulePermission(
        enabled=True, 
        tabs={
            "home": True,
            "add_insight": True,
            "report": True,
            "manage_insights": True,
            "persona_generator": True,
            "personas": True
        },
        actions={
            "add_insight": True,
            "edit_insight": True,
            "delete_insight": True,
            "view_personas": True,
            "generate_persona": True,
            "edit_persona": False  # Only superadmin can edit
        }
    ),
    "daily_reflections": ModulePermission(
        enabled=True,
        tabs={},
        actions={
            "add": True,
            "edit": True,
            "delete": True
        }
    ),
    "presentations": ModulePermission(
        enabled=True,
        tabs={
            "home": True,
            "friendly_brief": True,
            "clustering_technical": True
        },
        actions={
            "add": True,
            "delete": True
        }
    ),
    "social_media_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": True,
            "dashboard": True,
            "insight_summary": True
        },
        actions={
            "add_column": True,
            "delete_column": True,
            "rename_column": True,
            "add_row": True,
            "delete_row": True,
            "upload_csv": True,
            "save_data": True,
            "perform_mapping": True,
            "analyze_data": True
        }
    ),
    "search_marketing_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": True,
            "dashboard": True,
            "insight_summary": True
        },
        actions={
            "add_column": True,
            "delete_column": True,
            "rename_column": True,
            "add_row": True,
            "delete_row": True,
            "upload_csv": True,
            "save_data": True,
            "perform_mapping": True,
            "analyze_data": True
        }
    ),
    "shared_folder": ModulePermission(
        enabled=True,
        tabs={
            "view_files": True,
            "analytics": True
        },
        actions={
            "upload": True,
            "delete": True,
            "share": True
        }
    )
}

# Superadmin has full access to everything
SUPERADMIN_PERMISSIONS = {
    "dashboard": ModulePermission(enabled=True, tabs={}, actions={}),
    "buyer_persona": ModulePermission(
        enabled=True, 
        tabs={
            "home": True,
            "add_insight": True,
            "report": True,
            "manage_insights": True,
            "persona_generator": True,
            "personas": True
        },
        actions={
            "add_insight": True,
            "edit_insight": True,
            "delete_insight": True,
            "view_personas": True,
            "generate_persona": True,
            "edit_persona": True
        }
    ),
    "daily_reflections": ModulePermission(
        enabled=True,
        tabs={},
        actions={
            "add": True,
            "edit": True,
            "delete": True
        }
    ),
    "presentations": ModulePermission(
        enabled=True,
        tabs={
            "home": True,
            "friendly_brief": True,
            "clustering_technical": True
        },
        actions={
            "add": True,
            "delete": True
        }
    ),
    "social_media_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": True,
            "dashboard": True,
            "insight_summary": True
        },
        actions={
            "add_column": True,
            "delete_column": True,
            "rename_column": True,
            "add_row": True,
            "delete_row": True,
            "upload_csv": True,
            "save_data": True,
            "perform_mapping": True,
            "analyze_data": True
        }
    ),
    "search_marketing_diagnostics": ModulePermission(
        enabled=True,
        tabs={
            "data_input": True,
            "column_mapping": True,
            "dashboard": True,
            "insight_summary": True
        },
        actions={
            "add_column": True,
            "delete_column": True,
            "rename_column": True,
            "add_row": True,
            "delete_row": True,
            "upload_csv": True,
            "save_data": True,
            "perform_mapping": True,
            "analyze_data": True
        }
    )
}
