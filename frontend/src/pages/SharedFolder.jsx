import React, { useState, useEffect } from 'react';
import { Upload, Search, Grid, List, Download, Trash2, Eye, FolderOpen, FileText, User, BarChart3 } from 'lucide-react';
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
  
  const session = authService.getSession();
  const isSuperAdmin = authService.isSuperAdmin();

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
      const params = {};
      
      if (selectedFolder !== 'all' && selectedFolder !== 'my-uploads') {
        params.folderID = selectedFolder;
      }
      
      if (selectedFolder === 'my-uploads') {
        params.uploaderID = session.username;
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
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileView = (file) => {
    setSelectedFile(file);
    setViewerModalOpen(true);
  };

  const handleFileDownload = async (file) => {
    try {
      // Increment download count
      await axios.put(`${API}/api/shared-files/${file.id}/download`, {}, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      // Trigger download
      window.open(file.fileURL, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
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
    return isSuperAdmin || file.uploaderUserID === session.username;
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

  return (
    <div className="min-h-screen bg-[#F8F6F5]">
      <div className="flex h-[calc(100vh-60px)]">
        
        {/* Left Sidebar - Folder Navigation */}
        <div className="w-64 bg-white border-r border-[#E0AFA0]/30 p-4">
          <h2 className="text-lg font-bold text-[#1F1A1A] mb-4 font-display">Folders</h2>
          
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
              <FolderOpen size={18} />
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
              <User size={18} />
              <span className="text-sm font-medium">My Uploads</span>
            </button>
          </div>
          
          <div className="h-px bg-[#E0AFA0]/30 my-4"></div>
          
          {/* Custom Folders */}
          <div className="space-y-1">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-[#A62639] text-white'
                    : 'text-[#6C5F5F] hover:bg-[#F1D6CD]'
                }`}
                data-testid={`folder-${folder.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} style={{ color: selectedFolder === folder.id ? 'white' : folder.color }} />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                <span className="text-xs">{folder.fileCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Bar */}
          <div className="bg-white border-b border-[#E0AFA0]/30 p-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Left: Upload Button */}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors"
                data-testid="upload-file-btn"
              >
                <Upload size={18} />
                Upload File
              </button>
              
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
                            <FileText size={18} className="text-[#A62639]" />
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

      {selectedFile && (
        <PresentationViewerModal
          isOpen={viewerModalOpen}
          onClose={() => {
            setViewerModalOpen(false);
            setSelectedFile(null);
          }}
          presentation={{
            name: selectedFile.fileName,
            file_url: selectedFile.fileURL,
            file_type: selectedFile.previewType
          }}
        />
      )}

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
    </div>
  );
};

export default SharedFolder;
