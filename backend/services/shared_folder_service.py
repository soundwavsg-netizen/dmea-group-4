"""
Service for managing folders in Shared Folder module
"""
from firebase_client import db
from firebase_admin import firestore
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import uuid


class SharedFolderService:
    """Service for folder CRUD operations"""
    
    @staticmethod
    def create_folder(name: str, created_by: str, icon: str = "folder", color: str = "#A62639", is_personal: bool = False, owner_user_id: str = None) -> Dict[str, Any]:
        """Create a new folder (Superadmin only, or auto-create for personal folders)"""
        folder_id = str(uuid.uuid4())
        
        # Get current max order
        existing_folders = list(db.collection('folders').stream())
        max_order = 0
        for folder in existing_folders:
            folder_order = folder.to_dict().get('order', 0)
            if folder_order > max_order:
                max_order = folder_order
        
        folder_data = {
            "id": folder_id,
            "name": name,
            "createdBy": created_by,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "icon": icon,
            "color": color,
            "order": max_order + 1,
            "isPersonal": is_personal,
            "ownerUserID": owner_user_id if is_personal else None
        }
        
        db.collection('folders').document(folder_id).set(folder_data)
        return folder_data
    
    @staticmethod
    def get_or_create_personal_folder(user_id: str) -> Dict[str, Any]:
        """Get or create a personal folder for a user"""
        # Check if personal folder exists
        folders = db.collection('folders').where('isPersonal', '==', True).where('ownerUserID', '==', user_id).limit(1).stream()
        
        for folder in folders:
            folder_data = folder.to_dict()
            folder_data['id'] = folder.id
            return folder_data
        
        # Create if doesn't exist
        return SharedFolderService.create_folder(
            name=f"{user_id}'s Files",
            created_by=user_id,
            icon="user",
            color="#9C27B0",
            is_personal=True,
            owner_user_id=user_id
        )
    
    @staticmethod
    def get_all_folders(user_id: str = None, include_personal: bool = False) -> List[Dict[str, Any]]:
        """Get all folders with file counts, ordered by order field"""
        folders = []
        folder_docs = list(db.collection('folders').stream())
        
        # First pass: collect all folders and check for missing order fields
        for doc in folder_docs:
            folder_data = doc.to_dict()
            folder_data['id'] = doc.id
            
            # Filter personal folders unless requested
            is_personal = folder_data.get('isPersonal', False)
            if is_personal:
                # Only include personal folders if:
                # 1. include_personal is True AND
                # 2. It belongs to the requesting user
                if not (include_personal and folder_data.get('ownerUserID') == user_id):
                    continue
            
            # Get file count for this folder
            file_count = db.collection('sharedFiles').where('folderID', '==', doc.id).count().get()[0][0].value
            folder_data['fileCount'] = file_count
            
            folders.append(folder_data)
        
        # Assign order if missing (only for non-personal folders)
        for i, folder in enumerate(folders):
            if not folder.get('isPersonal', False):
                if 'order' not in folder or folder.get('order') is None or folder.get('order') == 0:
                    new_order = i + 1
                    db.collection('folders').document(folder['id']).update({'order': new_order})
                    folder['order'] = new_order
                    print(f"Updated folder {folder['name']} with order {new_order}")
        
        # Sort by order field
        folders.sort(key=lambda x: x.get('order', 0))
        
        return folders
    
    @staticmethod
    def get_folder_by_id(folder_id: str) -> Optional[Dict[str, Any]]:
        """Get a single folder by ID"""
        doc = db.collection('folders').document(folder_id).get()
        if not doc.exists:
            return None
        
        folder_data = doc.to_dict()
        folder_data['id'] = doc.id
        
        # Get file count
        file_count = db.collection('sharedFiles').where('folderID', '==', folder_id).count().get()[0][0].value
        folder_data['fileCount'] = file_count
        
        return folder_data
    
    @staticmethod
    def update_folder(folder_id: str, name: str, icon: Optional[str] = None, color: Optional[str] = None) -> Dict[str, Any]:
        """Update folder name/icon/color (Superadmin only)"""
        folder_ref = db.collection('folders').document(folder_id)
        folder_doc = folder_ref.get()
        
        if not folder_doc.exists:
            raise ValueError(f"Folder with ID {folder_id} not found")
        
        update_data = {"name": name}
        if icon:
            update_data["icon"] = icon
        if color:
            update_data["color"] = color
        
        folder_ref.update(update_data)
        
        # Return updated folder
        updated_doc = folder_ref.get()
        folder_data = updated_doc.to_dict()
        folder_data['id'] = folder_id
        return folder_data
    
    @staticmethod
    def delete_folder(folder_id: str) -> bool:
        """Delete a folder only if it has no files (Superadmin only)"""
        # Check if folder has any files
        file_count = db.collection('sharedFiles').where('folderID', '==', folder_id).count().get()[0][0].value
        
        if file_count > 0:
            raise ValueError(f"Cannot delete folder: contains {file_count} file(s)")
        
        # Delete the folder
        db.collection('folders').document(folder_id).delete()
        return True
    
    @staticmethod
    def reorder_folder(folder_id: str, direction: str) -> bool:
        """Move folder up or down in order (Superadmin only)"""
        folders = SharedFolderService.get_all_folders()
        
        # Find current folder
        current_index = None
        for i, folder in enumerate(folders):
            if folder['id'] == folder_id:
                current_index = i
                break
        
        if current_index is None:
            return False
        
        # Determine swap index
        if direction == 'up' and current_index > 0:
            swap_index = current_index - 1
        elif direction == 'down' and current_index < len(folders) - 1:
            swap_index = current_index + 1
        else:
            return False  # Can't move
        
        # Swap order values
        current_order = folders[current_index].get('order', current_index)
        swap_order = folders[swap_index].get('order', swap_index)
        
        db.collection('folders').document(folder_id).update({'order': swap_order})
        db.collection('folders').document(folders[swap_index]['id']).update({'order': current_order})
        
        return True
    
    @staticmethod
    def initialize_default_folders(created_by: str = "system"):
        """Initialize default folders if they don't exist"""
        default_folders = [
            {"name": "General", "icon": "folder", "color": "#A62639"},
            {"name": "Documents", "icon": "file-text", "color": "#1769AA"},
            {"name": "Reports", "icon": "bar-chart", "color": "#2E7D32"},
            {"name": "Media", "icon": "image", "color": "#B26A00"},
            {"name": "Resources", "icon": "book", "color": "#6C5F5F"}
        ]
        
        # Check if any folders exist
        existing = list(db.collection('folders').limit(1).stream())
        if existing:
            return  # Folders already initialized
        
        # Create default folders with order
        for i, folder in enumerate(default_folders):
            folder_id = str(uuid.uuid4())
            folder_data = {
                "id": folder_id,
                "name": folder["name"],
                "createdBy": created_by,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "icon": folder["icon"],
                "color": folder["color"],
                "order": i + 1
            }
            db.collection('folders').document(folder_id).set(folder_data)
