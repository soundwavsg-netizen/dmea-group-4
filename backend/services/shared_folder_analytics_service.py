"""
Service for Shared Folder analytics
"""
from firebase_client import db
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime


class SharedFolderAnalyticsService:
    """Service for generating analytics data"""
    
    @staticmethod
    def get_analytics() -> Dict[str, Any]:
        """Generate complete analytics for Shared Folder"""
        
        # Fetch all files
        all_files = list(db.collection('sharedFiles').stream())
        
        # Fetch all folders
        all_folders_docs = list(db.collection('folders').stream())
        folder_map = {doc.id: doc.to_dict()['name'] for doc in all_folders_docs}
        
        # Initialize counters
        total_files = len(all_files)
        total_storage = 0
        files_by_folder = defaultdict(lambda: {"fileCount": 0, "totalSize": 0})
        uploads_by_user = defaultdict(lambda: {"fileCount": 0, "totalSize": 0, "name": ""})
        most_downloaded = []
        upload_timeline = defaultdict(int)
        
        # Process each file
        for doc in all_files:
            file_data = doc.to_dict()
            
            # Total storage
            file_size = file_data.get('fileSize', 0)
            total_storage += file_size
            
            # Files by folder
            folder_id = file_data.get('folderID', 'unknown')
            files_by_folder[folder_id]["fileCount"] += 1
            files_by_folder[folder_id]["totalSize"] += file_size
            files_by_folder[folder_id]["folderName"] = folder_map.get(folder_id, "Unknown")
            
            # Uploads by user
            uploader_id = file_data.get('uploaderUserID', 'unknown')
            uploads_by_user[uploader_id]["fileCount"] += 1
            uploads_by_user[uploader_id]["totalSize"] += file_size
            uploads_by_user[uploader_id]["name"] = file_data.get('uploaderName', uploader_id)
            
            # Most downloaded files
            most_downloaded.append({
                "id": doc.id,
                "fileName": file_data.get('fileName', 'Unknown'),
                "downloadCount": file_data.get('downloadCount', 0),
                "uploaderName": file_data.get('uploaderName', 'Unknown')
            })
            
            # Upload timeline (by week)
            uploaded_at = file_data.get('uploadedAt')
            if uploaded_at:
                try:
                    dt = datetime.fromisoformat(uploaded_at.replace('Z', '+00:00'))
                    week_key = f"{dt.year}-W{dt.isocalendar()[1]:02d}"
                    upload_timeline[week_key] += 1
                except:
                    pass
        
        # Sort and format
        files_by_folder_list = [
            {
                "folderID": fid,
                "folderName": data["folderName"],
                "fileCount": data["fileCount"],
                "totalSize": data["totalSize"]
            }
            for fid, data in files_by_folder.items()
        ]
        files_by_folder_list.sort(key=lambda x: x["fileCount"], reverse=True)
        
        uploads_by_user_list = [
            {
                "uploaderUserID": uid,
                "uploaderName": data["name"],
                "fileCount": data["fileCount"],
                "totalSize": data["totalSize"]
            }
            for uid, data in uploads_by_user.items()
        ]
        uploads_by_user_list.sort(key=lambda x: x["fileCount"], reverse=True)
        
        # Top 10 most downloaded
        most_downloaded.sort(key=lambda x: x["downloadCount"], reverse=True)
        most_downloaded = most_downloaded[:10]
        
        # Timeline (sorted by period)
        upload_timeline_list = [
            {"period": period, "fileCount": count}
            for period, count in sorted(upload_timeline.items())
        ]
        
        return {
            "totalFiles": total_files,
            "totalStorageBytes": total_storage,
            "filesByFolder": files_by_folder_list,
            "uploadsByUser": uploads_by_user_list,
            "mostDownloadedFiles": most_downloaded,
            "uploadTimeline": upload_timeline_list
        }
