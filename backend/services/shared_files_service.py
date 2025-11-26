"""
Service for managing file metadata in Shared Folder module
"""
from firebase_client import db
from firebase_admin import firestore
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import uuid


class SharedFilesService:
    """Service for file metadata CRUD operations"""
    
    @staticmethod
    def create_file(
        folder_id: str,
        file_name: str,
        file_type: str,
        file_size: int,
        file_url: str,
        preview_type: str,
        uploader_user_id: str,
        uploader_name: str
    ) -> Dict[str, Any]:
        """Create file metadata after frontend uploads to Firebase Storage"""
        file_id = str(uuid.uuid4())
        file_data = {
            "id": file_id,
            "folderID": folder_id,
            "fileName": file_name,
            "fileType": file_type,
            "fileSize": file_size,
            "fileURL": file_url,
            "previewType": preview_type,
            "uploaderUserID": uploader_user_id,
            "uploaderName": uploader_name,
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
            "downloadCount": 0
        }
        
        db.collection('sharedFiles').document(file_id).set(file_data)
        return file_data
    
    @staticmethod
    def get_all_files(
        folder_id: Optional[str] = None,
        uploader_id: Optional[str] = None,
        file_type_filter: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get files with optional filters"""
        # Fetch all files first, then filter and sort in Python
        # This avoids Firestore composite index requirements
        all_files = []
        
        try:
            # Start with base query
            query = db.collection('sharedFiles')
            
            # Apply filters one at a time to avoid composite index issues
            if folder_id:
                query = query.where('folderID', '==', folder_id)
            elif uploader_id:
                query = query.where('uploaderUserID', '==', uploader_id)
            elif file_type_filter:
                query = query.where('previewType', '==', file_type_filter)
            
            # Fetch without ordering (to avoid composite index requirement)
            for doc in query.stream():
                file_data = doc.to_dict()
                file_data['id'] = doc.id
                all_files.append(file_data)
            
            # Sort in Python by uploadedAt (newest first)
            all_files.sort(key=lambda x: x.get('uploadedAt', ''), reverse=True)
            
            # Apply limit
            return all_files[:limit]
            
        except Exception as e:
            print(f"Error fetching files: {e}")
            return []
    
    @staticmethod
    def get_file_by_id(file_id: str) -> Optional[Dict[str, Any]]:
        """Get a single file by ID"""
        doc = db.collection('sharedFiles').document(file_id).get()
        if not doc.exists:
            return None
        
        file_data = doc.to_dict()
        file_data['id'] = doc.id
        return file_data
    
    @staticmethod
    def delete_file(file_id: str, requesting_user_id: str, is_superadmin: bool) -> bool:
        """Delete a file (owner or superadmin only)"""
        file_doc = db.collection('sharedFiles').document(file_id).get()
        
        if not file_doc.exists:
            raise ValueError(f"File with ID {file_id} not found")
        
        file_data = file_doc.to_dict()
        
        # Check permission: must be owner or superadmin
        if not is_superadmin and file_data.get('uploaderUserID') != requesting_user_id:
            raise PermissionError("You can only delete your own files")
        
        # Delete the file metadata
        db.collection('sharedFiles').document(file_id).delete()
        return True
    
    @staticmethod
    def increment_download_count(file_id: str) -> bool:
        """Increment download count for analytics"""
        file_ref = db.collection('sharedFiles').document(file_id)
        file_doc = file_ref.get()
        
        if not file_doc.exists:
            return False
        
        file_ref.update({
            "downloadCount": firestore.Increment(1)
        })
        return True
    
    @staticmethod
    def search_files(search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search files by filename (case-insensitive contains)"""
        # Firestore doesn't have native case-insensitive search or LIKE
        # We'll fetch all files and filter in Python (acceptable for moderate datasets)
        all_files = SharedFilesService.get_all_files(limit=1000)  # Get more for search
        
        search_lower = search_term.lower()
        filtered = [
            f for f in all_files
            if search_lower in f['fileName'].lower()
        ]
        
        return filtered[:limit]
    
    @staticmethod
    def get_file_count_by_folder(folder_id: str) -> int:
        """Get count of files in a folder"""
        count_result = db.collection('sharedFiles').where('folderID', '==', folder_id).count().get()
        return count_result[0][0].value
