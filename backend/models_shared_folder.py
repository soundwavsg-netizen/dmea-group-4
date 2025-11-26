"""
Pydantic models for Shared Folder module
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ==================== Folder Models ====================

class FolderCreate(BaseModel):
    """Request model for creating a new folder"""
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = "folder"
    color: Optional[str] = "#A62639"


class FolderUpdate(BaseModel):
    """Request model for updating a folder"""
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = None
    color: Optional[str] = None


class FolderResponse(BaseModel):
    """Response model for folder"""
    id: str
    name: str
    createdBy: str
    createdAt: str
    icon: Optional[str] = "folder"
    color: Optional[str] = "#A62639"
    order: Optional[int] = 0  # Display order
    fileCount: Optional[int] = 0  # Computed field
    isPersonal: Optional[bool] = False  # Personal folder flag
    ownerUserID: Optional[str] = None  # Owner of personal folder


# ==================== Shared File Models ====================

class SharedFileCreate(BaseModel):
    """Request model for creating file metadata after frontend upload"""
    folderID: str
    fileName: str
    fileType: str
    fileSize: int = Field(..., le=20971520)  # 20MB max
    fileURL: str
    previewType: str  # pdf, image, video, text, unknown


class SharedFileResponse(BaseModel):
    """Response model for shared file"""
    id: str
    folderID: str
    fileName: str
    fileType: str
    fileSize: int
    uploaderUserID: str
    uploaderName: str
    fileURL: str
    previewType: str
    uploadedAt: str
    downloadCount: int = 0


class SharedFileListResponse(BaseModel):
    """Response model for file listing with pagination"""
    files: List[SharedFileResponse]
    total: int
    folder: Optional[str] = None


# ==================== Permission Models ====================

class SharedFolderPermissions(BaseModel):
    """Model for shared folder permission toggles"""
    allowUpload: bool = True
    allowDeleteOwn: bool = True
    allowViewAll: bool = True
    allowDownloadAll: bool = True
    allowCreateFolders: bool = False
    allowDeleteFolders: bool = False


class UpdatePermissionsRequest(BaseModel):
    """Request to update shared folder permissions"""
    allowUpload: Optional[bool] = None
    allowDeleteOwn: Optional[bool] = None
    allowViewAll: Optional[bool] = None
    allowDownloadAll: Optional[bool] = None
    allowCreateFolders: Optional[bool] = None
    allowDeleteFolders: Optional[bool] = None


# ==================== Analytics Models ====================

class FolderAnalytics(BaseModel):
    """Analytics for a specific folder"""
    folderID: str
    folderName: str
    fileCount: int
    totalSize: int


class UploaderAnalytics(BaseModel):
    """Analytics for a specific uploader"""
    uploaderUserID: str
    uploaderName: str
    fileCount: int
    totalSize: int


class FileAnalytics(BaseModel):
    """Analytics for most downloaded files"""
    id: str
    fileName: str
    downloadCount: int
    uploaderName: str


class UploadTimelineData(BaseModel):
    """Timeline data for uploads"""
    period: str  # e.g., "2024-W01" or "2024-01"
    fileCount: int


class SharedFolderAnalyticsResponse(BaseModel):
    """Complete analytics response"""
    totalFiles: int
    totalStorageBytes: int
    filesByFolder: List[FolderAnalytics]
    uploadsByUser: List[UploaderAnalytics]
    mostDownloadedFiles: List[FileAnalytics]
    uploadTimeline: List[UploadTimelineData]
