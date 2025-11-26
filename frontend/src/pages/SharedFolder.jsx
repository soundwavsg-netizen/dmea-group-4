import React, { useState, useEffect } from 'react';
import { Upload, Search, Grid, List, Download, Trash2, Eye, FolderOpen, Folder, FileText, User, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import UploadFileModal from '../components/UploadFileModal';
import PresentationViewerModal from '../components/PresentationViewerModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SharedFolder = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [error, setError] = useState('');
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [selectedFolderForEdit, setSelectedFolderForEdit] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderActionLoading, setFolderActionLoading] = useState(false);
  
  const session = authService.getSession();
  const isSuperAdmin = authService.isSuperAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${API}/api/shared-folders`, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      setFolders(response.data);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const params = {};
      
      if (selectedFolder === 'my-uploads' || selectedFolder === 'personal') {
        // Both show only user's files
        params.uploaderID = session.username;
      } else if (selectedFolder !== 'all') {
        // Regular folder filter
        params.folderID = selectedFolder;
      }

      const response = await axios.get(`${API}/api/shared-files`, {
        params,
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
      // Only show error if it's not a 403 or network issue - empty folders shouldn't error
      if (err.response && err.response.status !== 403) {
        // Don't show error for empty results
        if (err.response.status !== 404) {
          setError('Failed to load files');
        }
      }
      setFiles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileView = (file) => {
    console.log('View clicked for file:', file);
    alert('View button clicked! Opening viewer...');
    setSelectedFile(file);
    setViewerModalOpen(true);
  };

  const handleFileDownload = async (file) => {
    console.log('Download clicked for file:', file);
    alert('Download button clicked! Check console for details.');
    
    try {
      // Increment download count
      await axios.put(`${API}/api/shared-files/${file.id}/download`, {}, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      console.log('Opening file URL:', file.fileURL);
      
      // Create a temporary anchor element and click it for download
      const link = document.createElement('a');
      link.href = file.fileURL;
      link.target = '_blank';
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleFileDelete = (file) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/api/shared-files/${fileToDelete.id}`, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      setDeleteModalOpen(false);
      setFileToDelete(null);
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err.response?.data?.detail || 'Failed to delete file');
    }
  };

  const canDeleteFile = (file) => {
    // In personal folder, user can delete their own files
    // Superadmin can delete any file
    // In other folders, user can delete their own files if permission allows
    if (selectedFolder === 'personal') {
      return file.uploaderUserID === session.username;
    }
    return isSuperAdmin || file.uploaderUserID === session.username;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      setFolderActionLoading(true);
      await axios.post(`${API}/api/shared-folders`, {
        name: newFolderName.trim(),
        icon: 'folder',
        color: '#A62639'
      }, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      setNewFolderName('');
      setCreateFolderModalOpen(false);
      fetchFolders();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.response?.data?.detail || 'Failed to create folder');
    } finally {
      setFolderActionLoading(false);
    }
  };

  const handleEditFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      setFolderActionLoading(true);
      await axios.put(`${API}/api/shared-folders/${selectedFolderForEdit.id}`, {
        name: newFolderName.trim(),
        icon: selectedFolderForEdit.icon,
        color: selectedFolderForEdit.color
      }, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      setNewFolderName('');
      setEditFolderModalOpen(false);
      setSelectedFolderForEdit(null);
      fetchFolders();
    } catch (err) {
      console.error('Error updating folder:', err);
      setError(err.response?.data?.detail || 'Failed to update folder');
    } finally {
      setFolderActionLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      setFolderActionLoading(true);
      await axios.delete(`${API}/api/shared-folders/${selectedFolderForEdit.id}`, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      setDeleteFolderModalOpen(false);
      setSelectedFolderForEdit(null);
      
      // If deleted folder was selected, switch to "all"
      if (selectedFolder === selectedFolderForEdit.id) {
        setSelectedFolder('all');
      }
      
      fetchFolders();
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err.response?.data?.detail || 'Failed to delete folder. Make sure the folder is empty.');
    } finally {
      setFolderActionLoading(false);
    }
  };

  const openEditFolderModal = (folder) => {
    setSelectedFolderForEdit(folder);
    setNewFolderName(folder.name);
    setEditFolderModalOpen(true);
  };

  const openDeleteFolderModal = (folder) => {
    setSelectedFolderForEdit(folder);
    setDeleteFolderModalOpen(true);
  };

  const handleReorderFolder = async (folderId, direction) => {
    try {
      await axios.put(`${API}/api/shared-folders/${folderId}/reorder?direction=${direction}`, {}, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      fetchFolders();
    } catch (err) {
      console.error('Error reordering folder:', err);
      setError(err.response?.data?.detail || 'Failed to reorder folder');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getFilteredAndSortedFiles = () => {
    let filtered = [...files];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    switch(sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.fileName.localeCompare(a.fileName));
        break;
      case 'uploader-asc':
        filtered.sort((a, b) => a.uploaderName.localeCompare(b.uploaderName));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredFiles = getFilteredAndSortedFiles();

  const getFolderName = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Unknown';
  };

  const getFolderColor = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.color : '#A62639';
  };

  return (
    <div className="min-h-screen bg-[#F8F6F5]">
      <div className="flex h-[calc(100vh-60px)]">
        
        {/* Left Sidebar - Folder Navigation */}
        <div className="w-64 bg-white border-r border-[#E0AFA0]/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1F1A1A] font-display">Folders</h2>
            {isSuperAdmin && (
              <button
                onClick={() => setCreateFolderModalOpen(true)}
                className="p-1.5 text-[#A62639] hover:bg-[#F1D6CD] rounded transition-colors"
                title="Create Folder"
                data-testid="create-folder-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Special Views */}
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === 'all'
                  ? 'bg-[#A62639] text-white'
                  : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'
              }`}
              data-testid="folder-all-files"
            >
              <FolderOpen size={20} />
              <span className="text-sm font-medium">All Files</span>
            </button>
            
            <button
              onClick={() => setSelectedFolder('my-uploads')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === 'my-uploads'
                  ? 'bg-[#A62639] text-white'
                  : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'
              }`}
              data-testid="folder-my-uploads"
            >
              <User size={20} />
              <span className="text-sm font-medium">My Uploads</span>
            </button>
          </div>
          
          <div className="h-px bg-[#E0AFA0]/30 my-4"></div>
          
          {/* Custom Folders */}
          <div className="space-y-1 mb-4">
            {folders.map((folder, index) => (
              <div
                key={folder.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-[#A62639] text-white'
                    : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'
                }`}
                data-testid={`folder-${folder.name.toLowerCase()}`}
              >
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Folder size={20} style={{ color: selectedFolder === folder.id ? 'white' : folder.color }} />
                  <span className="text-sm font-medium">{folder.name}</span>
                </button>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs mr-1">{folder.fileCount}</span>
                  
                  {isSuperAdmin && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Up Arrow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderFolder(folder.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      {/* Down Arrow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderFolder(folder.id, 'down');
                        }}
                        disabled={index === folders.length - 1}
                        className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFolderModal(folder);
                        }}
                        className="p-0.5 hover:bg-white/20 rounded ml-0.5"
                        title="Edit folder"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteFolderModal(folder);
                        }}
                        className="p-0.5 hover:bg-white/20 rounded"
                        title="Delete folder"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="h-px bg-[#E0AFA0]/30 my-4"></div>
          
          {/* Personal Folder */}
          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder('personal')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === 'personal'
                  ? 'bg-[#A62639] text-white'
                  : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'
              }`}
              data-testid="folder-personal"
            >
              <User size={20} style={{ color: selectedFolder === 'personal' ? 'white' : '#9C27B0' }} />
              <span className="text-sm font-medium">{session.username}</span>
              <span className="ml-auto text-xs opacity-70">Private</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Bar */}
          <div className="bg-white border-b border-[#E0AFA0]/30 p-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Left: Upload Button & Analytics */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors"
                  data-testid="upload-file-btn"
                >
                  <Upload size={18} />
                  Upload File
                </button>
                
                {isSuperAdmin && (
                  <button
                    onClick={() => navigate('/shared-folder/analytics')}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-[#A62639] text-[#A62639] rounded-lg font-semibold hover:bg-[#A62639] hover:text-white transition-colors"
                    data-testid="view-analytics-btn"
                  >
                    <BarChart3 size={18} />
                    Analytics
                  </button>
                )}
              </div>
              
              {/* Center: Search */}
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6C5F5F]" size={18} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E0AFA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
                  data-testid="search-files-input"
                />
              </div>
              
              {/* Right: Sort & View Mode */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-[#E0AFA0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A62639]"
                  data-testid="sort-dropdown"
                >
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="uploader-asc">Uploader (A-Z)</option>
                </select>
                
                <div className="flex items-center gap-1 border border-[#E0AFA0] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#A62639] text-white' : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'}`}
                    data-testid="view-mode-list"
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#A62639] text-white' : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'}`}
                    data-testid="view-mode-grid"
                  >
                    <Grid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File List/Grid */}
          <div className="flex-1 overflow-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#6C5F5F]">Loading files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <FileText size={64} className="text-[#E0AFA0] mb-4" />
                <p className="text-[#6C5F5F] text-lg">No files found</p>
                <p className="text-[#6C5F5F] text-sm mt-2">Upload your first file to get started</p>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="bg-white rounded-lg border border-[#E0AFA0]/30 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#FAF7F5] border-b border-[#E0AFA0]/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">File</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Folder</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Uploader</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Size</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#1F1A1A] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file, index) => (
                      <tr
                        key={file.id}
                        className={`border-b border-[#E0AFA0]/20 hover:bg-[#F8F6F5] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}`}
                        data-testid={`file-row-${file.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText size={20} style={{ color: getFolderColor(file.folderID) }} />
                            <span className="text-sm font-medium text-[#1F1A1A]">{file.fileName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6C5F5F]">{getFolderName(file.folderID)}</td>
                        <td className="px-4 py-3 text-sm text-[#6C5F5F]">{file.uploaderName}</td>
                        <td className="px-4 py-3 text-sm text-[#6C5F5F]">{formatDate(file.uploadedAt)}</td>
                        <td className="px-4 py-3 text-sm text-[#6C5F5F]">{formatFileSize(file.fileSize)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleFileView(file)}
                              className="p-1.5 text-[#1769AA] hover:bg-blue-50 rounded transition-colors"
                              title="View"
                              data-testid={`view-file-${file.id}`}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="p-1.5 text-[#2E7D32] hover:bg-green-50 rounded transition-colors"
                              title="Download"
                              data-testid={`download-file-${file.id}`}
                            >
                              <Download size={18} />
                            </button>
                            {canDeleteFile(file) && (
                              <button
                                onClick={() => handleFileDelete(file)}
                                className="p-1.5 text-[#C62828] hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                                data-testid={`delete-file-${file.id}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View - To be implemented */
              <div className="grid grid-cols-4 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="bg-white p-4 rounded-lg border border-[#E0AFA0]/30">
                    <FileText size={48} className="text-[#A62639] mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#1F1A1A] truncate">{file.fileName}</p>
                    <p className="text-xs text-[#6C5F5F] mt-1">{formatFileSize(file.fileSize)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadFileModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchFiles}
        folders={folders}
        selectedFolder={selectedFolder !== 'all' && selectedFolder !== 'my-uploads' ? selectedFolder : folders[0]?.id}
      />

      <PresentationViewerModal
        isOpen={viewerModalOpen && selectedFile !== null}
        onClose={() => {
          setViewerModalOpen(false);
          setSelectedFile(null);
        }}
        presentation={selectedFile ? {
          name: selectedFile.fileName,
          file_url: selectedFile.fileURL,
          file_type: selectedFile.previewType
        } : null}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.fileName}"? This action cannot be undone.`}
      />

      {/* Create Folder Modal */}
      {createFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0AFA0]/30">
              <h2 className="text-xl font-bold text-[#A62639]">Create New Folder</h2>
              <button
                onClick={() => {
                  setCreateFolderModalOpen(false);
                  setNewFolderName('');
                }}
                className="text-[#6C5F5F] hover:text-[#A62639]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-[#1F1A1A] mb-2">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-2 border border-[#E0AFA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A62639]"
                data-testid="folder-name-input"
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0AFA0]/30">
              <button
                onClick={() => {
                  setCreateFolderModalOpen(false);
                  setNewFolderName('');
                }}
                className="px-6 py-2 border border-[#E0AFA0] text-[#6C5F5F] rounded-lg hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={folderActionLoading || !newFolderName.trim()}
                className="px-6 py-2 bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d] disabled:opacity-50"
                data-testid="create-folder-confirm"
              >
                {folderActionLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0AFA0]/30">
              <h2 className="text-xl font-bold text-[#A62639]">Edit Folder</h2>
              <button
                onClick={() => {
                  setEditFolderModalOpen(false);
                  setSelectedFolderForEdit(null);
                  setNewFolderName('');
                }}
                className="text-[#6C5F5F] hover:text-[#A62639]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-[#1F1A1A] mb-2">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-2 border border-[#E0AFA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A62639]"
                data-testid="edit-folder-name-input"
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0AFA0]/30">
              <button
                onClick={() => {
                  setEditFolderModalOpen(false);
                  setSelectedFolderForEdit(null);
                  setNewFolderName('');
                }}
                className="px-6 py-2 border border-[#E0AFA0] text-[#6C5F5F] rounded-lg hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFolder}
                disabled={folderActionLoading || !newFolderName.trim()}
                className="px-6 py-2 bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d] disabled:opacity-50"
                data-testid="edit-folder-confirm"
              >
                {folderActionLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {deleteFolderModalOpen && selectedFolderForEdit && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0AFA0]/30">
              <h2 className="text-xl font-bold text-red-600">Delete Folder</h2>
              <button
                onClick={() => {
                  setDeleteFolderModalOpen(false);
                  setSelectedFolderForEdit(null);
                }}
                className="text-[#6C5F5F] hover:text-[#A62639]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#1F1A1A] mb-4">
                Are you sure you want to delete the folder <strong>"{selectedFolderForEdit.name}"</strong>?
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                ⚠️ You can only delete empty folders. Make sure all files are moved or deleted first.
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0AFA0]/30">
              <button
                onClick={() => {
                  setDeleteFolderModalOpen(false);
                  setSelectedFolderForEdit(null);
                }}
                className="px-6 py-2 border border-[#E0AFA0] text-[#6C5F5F] rounded-lg hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFolder}
                disabled={folderActionLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                data-testid="delete-folder-confirm"
              >
                {folderActionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedFolder;
