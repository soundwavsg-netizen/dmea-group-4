# Shared Folder Module - Implementation Plan

## Project Overview
**Goal**: Build a complete Shared Folder module with folder management, file upload/preview/download/delete, role-based permissions, and analytics.

**Tech Stack**:
- Frontend: React + Shadcn UI + Tailwind + Firebase Storage
- Backend: FastAPI + Firestore + Firebase Admin SDK
- Storage: Firebase Storage (/shared/ path)

---

## Phase 1: Backend Foundation (Status: In Progress)

### 1.1 Database Models & Collections
- [x] Plan Firestore collections structure
- [ ] Create `folders` collection schema
- [ ] Create `sharedFiles` collection schema
- [ ] Create `shared_folder_permissions` settings document
- [ ] Add indexes for queries

### 1.2 Backend Services
- [ ] Create `services/shared_folder_service.py` (folder CRUD)
- [ ] Create `services/shared_files_service.py` (file metadata CRUD)
- [ ] Create `services/shared_folder_permissions_service.py` (permission toggles)
- [ ] Add permission checking helper functions

### 1.3 Backend API Endpoints (15 total)

**Folder Management (Superadmin only)**:
- [ ] POST `/api/shared-folders` - Create folder
- [ ] GET `/api/shared-folders` - List all folders
- [ ] PUT `/api/shared-folders/{folder_id}` - Rename folder
- [ ] DELETE `/api/shared-folders/{folder_id}` - Delete folder (if empty)

**File Management**:
- [ ] POST `/api/shared-files` - Create file metadata (after frontend uploads to Storage)
- [ ] GET `/api/shared-files` - List files (with filters: folder, uploader, type)
- [ ] GET `/api/shared-files/{file_id}` - Get single file
- [ ] DELETE `/api/shared-files/{file_id}` - Delete file (owner or superadmin)
- [ ] PUT `/api/shared-files/{file_id}/download` - Increment download count

**Permission Settings (Superadmin only)**:
- [ ] GET `/api/admin/shared-folder-permissions` - Get current toggles
- [ ] PUT `/api/admin/shared-folder-permissions` - Update toggles

**Analytics (Superadmin only)**:
- [ ] GET `/api/admin/shared-folder-analytics` - Get aggregated metrics

### 1.4 Pydantic Models
- [ ] Create `models_shared_folder.py` with all request/response models

---

## Phase 2: Frontend Core (Status: Not Started)

### 2.1 Shared Folder Main Page
- [ ] Create `pages/SharedFolder.jsx`
- [ ] Left panel: Folder list navigation (All Files, My Uploads, custom folders)
- [ ] Top bar: Upload button, search, sort, view toggle
- [ ] Main panel: File table/grid with actions
- [ ] Implement folder filtering

### 2.2 File Upload Flow
- [ ] Create `components/UploadFileModal.jsx`
- [ ] Multi-file drag & drop support
- [ ] Folder selection dropdown
- [ ] Firebase Storage upload with progress
- [ ] Backend metadata creation
- [ ] Size validation (20MB max)
- [ ] File type validation

### 2.3 File Viewer (Reuse Presentations)
- [ ] Extend `PresentationViewerModal.jsx` or create wrapper
- [ ] Support PDF, images, videos, text
- [ ] Download button in modal
- [ ] Handle unsupported file types

### 2.4 File Actions
- [ ] Download functionality
- [ ] Delete confirmation modal (reuse `DeleteConfirmModal.jsx`)
- [ ] Permission-based action visibility

### 2.5 Sorting & Filtering
- [ ] Sort dropdown (date, name, uploader)
- [ ] Filter by folder
- [ ] Filter by uploader
- [ ] Filter by file type
- [ ] Search by filename

### 2.6 Navigation Integration
- [ ] Add "Shared Folder" to `Navigation.jsx`
- [ ] Permission-based visibility
- [ ] Route setup in App.js

---

## Phase 3: Permissions & Admin Panel (Status: Not Started)

### 3.1 Admin Panel Tab
- [ ] Add "Shared Folder Permissions" tab to `AdminPanel.jsx`
- [ ] Toggle switches for 6 permissions:
  - allowUpload
  - allowDeleteOwn
  - allowViewAll
  - allowDownloadAll
  - allowCreateFolders
  - allowDeleteFolders
- [ ] Save button with backend API integration

### 3.2 Permission Enforcement
- [ ] Backend middleware for permission checks
- [ ] Frontend UI conditional rendering based on permissions
- [ ] Permission check on every protected action

### 3.3 Folder Management UI (Superadmin)
- [ ] Create folder modal
- [ ] Rename folder modal
- [ ] Delete folder modal (with empty check)

---

## Phase 4: Analytics Dashboard (Status: Not Started)

### 4.1 Analytics Page
- [ ] Create `pages/SharedFolderAnalytics.jsx` (Superadmin only)
- [ ] Total files metric card
- [ ] Total storage used metric card
- [ ] Files per folder bar chart
- [ ] Top uploaders leaderboard
- [ ] Most downloaded files list
- [ ] Upload timeline chart (by week/month)

### 4.2 Charts Library
- [ ] Install Recharts (if not already present)
- [ ] Create reusable chart components

---

## Phase 5: Testing & Polish (Status: Not Started)

### 5.1 Backend Testing
- [ ] Test all API endpoints with different roles
- [ ] Test permission enforcement
- [ ] Test file deletion (ownership check)
- [ ] Test folder deletion (empty check)

### 5.2 Frontend Testing
- [ ] Test file upload (single, multiple, drag-drop)
- [ ] Test file preview for each type
- [ ] Test permission toggles in Admin Panel
- [ ] Test sorting and filtering
- [ ] Test "My Uploads" view

### 5.3 Security Verification
- [ ] Verify server-side permission checks (not just UI)
- [ ] Test unauthorized access attempts
- [ ] Verify file URL security

### 5.4 UI/UX Polish
- [ ] Loading states for all async operations
- [ ] Error handling and user-friendly messages
- [ ] Empty states (no files, no folders)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Design system compliance (colors, fonts, spacing)

---

## Phase 6: Deployment (Status: Not Started)

### 6.1 Staging Deployment
- [ ] Deploy backend to staging environment
- [ ] Deploy frontend to staging
- [ ] Run smoke tests with test accounts

### 6.2 Production Deployment
- [ ] Review security rules
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Monitor logs for errors
- [ ] User acceptance testing

---

## Technical Specifications

### Firestore Schema

**Collection: `folders`**
```json
{
  "id": "uuid",
  "name": "General",
  "createdBy": "superadmin",
  "createdAt": "2024-01-01T00:00:00Z",
  "icon": "folder",
  "color": "#A62639"
}
```

**Collection: `sharedFiles`**
```json
{
  "id": "uuid",
  "folderID": "uuid",
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "fileSize": 1048576,
  "uploaderUserID": "user1",
  "uploaderName": "User One",
  "fileURL": "https://storage.googleapis.com/...",
  "previewType": "pdf",
  "uploadedAt": "2024-01-01T00:00:00Z",
  "downloadCount": 0
}
```

**Document: `settings/shared_folder_permissions`**
```json
{
  "allowUpload": true,
  "allowDeleteOwn": true,
  "allowViewAll": true,
  "allowDownloadAll": true,
  "allowCreateFolders": false,
  "allowDeleteFolders": false
}
```

### Firebase Storage Path
```
/shared/<folderID>/<fileID>_<safeFileName>.<ext>
```

### Default Folders
- General
- Documents
- Reports
- Media
- Resources

---

## Current Status: Phase 1 - Backend Foundation IN PROGRESS

**Next Tasks**:
1. Create Pydantic models for Shared Folder
2. Create backend services (folders, files, permissions)
3. Implement API endpoints
4. Test with superadmin account
