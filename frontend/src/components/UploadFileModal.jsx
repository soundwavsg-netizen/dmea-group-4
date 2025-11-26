import React, { useState } from 'react';
import { X, Upload, FileText, Image, Video, File } from 'lucide-react';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebaseConfig';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const UploadFileModal = ({ isOpen, onClose, onSuccess, folders, selectedFolder }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderID, setFolderID] = useState(selectedFolder || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  
  const session = authService.getSession();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes
    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed the 20MB limit`);
      return;
    }
    
    setSelectedFiles(files);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed the 20MB limit`);
      return;
    }
    
    setSelectedFiles(files);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getPreviewType = (file) => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('text/')) return 'text';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return 'document';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'spreadsheet';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'presentation';
    
    return 'unknown';
  };

  const getFileIcon = (previewType) => {
    switch(previewType) {
      case 'image': return <Image size={24} className="text-[#B26A00]" />;
      case 'video': return <Video size={24} className="text-[#A62639]" />;
      case 'pdf':
      case 'document':
        return <FileText size={24} className="text-[#1769AA]" />;
      default: return <File size={24} className="text-[#6C5F5F]" />;
    }
  };

  const uploadFile = async (file) => {
    try {
      // 1. Upload to Firebase Storage
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `shared/${folderID}/${timestamp}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Track progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          },
          (error) => {
            console.error('Firebase upload error:', error);
            reject(error);
          },
          async () => {
            try {
              // Get download URL
              const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // 2. Create metadata in backend
              const response = await axios.post(
                `${API}/api/shared-files`,
                {
                  folderID: folderID,
                  fileName: file.name,
                  fileType: file.type,
                  fileSize: file.size,
                  fileURL: fileURL,
                  previewType: getPreviewType(file)
                },
                {
                  headers: {
                    'X-User-Name': session.username,
                    'X-User-Role': session.role
                  }
                }
              );
              
              resolve(response.data);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (err) {
      throw err;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }
    
    if (!folderID) {
      setError('Please select a folder');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Upload files sequentially
      for (const file of selectedFiles) {
        await uploadFile(file);
      }
      
      // Success
      setSelectedFiles([]);
      setUploadProgress({});
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload file(s)');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setUploadProgress({});
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0AFA0]/30">
          <h2 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Upload Files
          </h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-[#6C5F5F] hover:text-[#A62639] transition-colors disabled:opacity-50"
            data-testid="close-upload-modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#1F1A1A] mb-2">
              Select Folder <span className="text-red-500">*</span>
            </label>
            <select
              value={folderID}
              onChange={(e) => setFolderID(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-2 border border-[#E0AFA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A62639] focus:border-transparent disabled:opacity-50"
              data-testid="folder-select"
            >
              <option value="">Choose a folder...</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-[#E0AFA0] rounded-lg p-8 text-center hover:border-[#A62639] transition-colors cursor-pointer"
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-input-upload"
              data-testid="file-input-upload"
            />
            <label htmlFor="file-input-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-3 text-[#6C5F5F]" />
              <p className="text-[#1F1A1A] font-medium mb-1">
                Click to select files or drag and drop
              </p>
              <p className="text-xs text-[#6C5F5F]">
                Max file size: 20MB per file
              </p>
              <p className="text-xs text-[#6C5F5F] mt-1">
                Supported: PDF, Images, Videos, Documents, Presentations
              </p>
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#1F1A1A]">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#FAF7F5] rounded-lg border border-[#E0AFA0]/30"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(getPreviewType(file))}
                      <div>
                        <p className="text-sm font-medium text-[#1F1A1A] truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-[#6C5F5F]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A62639] transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-[#6C5F5F]">
                          {uploadProgress[file.name]}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0AFA0]/30">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-2 border border-[#E0AFA0] text-[#6C5F5F] rounded-lg font-medium hover:bg-[#FAF7F5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0 || !folderID}
            className="flex items-center gap-2 px-6 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="upload-confirm-btn"
          >
            {uploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;
