import React, { useState } from 'react';
import { X, Upload, FileText, Video } from 'lucide-react';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebaseConfig';
import authService from '../services/authService';

const AddPresentationModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('slides'); // 'slides' or 'video'
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = fileType === 'slides' 
        ? ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        : ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      
      if (!validTypes.includes(file.type)) {
        setError(`Please select a valid ${fileType === 'slides' ? 'presentation' : 'video'} file`);
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Please enter a presentation name');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (uploadMethod === 'url') {
      if (!fileUrl.trim()) {
        setError('Please enter a file URL');
        return;
      }

      // Basic URL validation
      try {
        new URL(fileUrl);
      } catch {
        setError('Please enter a valid URL');
        return;
      }
    } else {
      if (!selectedFile) {
        setError('Please select a file to upload');
        return;
      }
    }

    setLoading(true);
    setUploadProgress('');

    try {
      let uploadedFileUrl = fileUrl.trim();

      // Upload file directly to Firebase Storage if using file method
      if (uploadMethod === 'file' && selectedFile) {
        setUploadProgress('Uploading to Firebase Storage...');
        
        // Create storage reference
        const timestamp = Date.now();
        const storageRef = ref(storage, `presentations/${timestamp}_${selectedFile.name}`);
        
        // Upload file with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        
        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Calculate progress percentage
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(`Uploading: ${progress}%`);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              // Upload completed, get download URL
              uploadedFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
        
        setUploadProgress('Saving presentation...');
      }

      // Send presentation data to backend (with Firebase Storage URL)
      const response = await axios.post(
        `${backendUrl}/api/presentations`,
        {
          name: name.trim(),
          description: description.trim(),
          file_url: uploadedFileUrl,
          file_type: fileType
        },
        {
          headers: {
            'X-User-Name': session.username || session.email
          }
        }
      );

      setUploadProgress('Success!');
      setSuccess(true);
      setName('');
      setDescription('');
      setFileUrl('');
      setSelectedFile(null);
      setFileType('slides');
      setUploadMethod('url');

      // Call onSuccess callback and close after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setUploadProgress('');
      }, 1500);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Upload timeout - file may be too large. Try a smaller file or use URL method.');
      } else {
        setError(err.response?.data?.detail || 'Failed to add presentation');
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setFileUrl('');
      setSelectedFile(null);
      setFileType('slides');
      setUploadMethod('url');
      setError('');
      setSuccess(false);
      setUploadProgress('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50" style={{ zIndex: 100 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Add New Presentation
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[#6C5F5F] hover:text-[#A62639] transition-colors disabled:opacity-50"
            data-testid="close-add-presentation-btn"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Presentation added successfully!
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              <span>{uploadProgress}</span>
            </div>
          )}

          {/* Presentation Name */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Presentation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q4 Marketing Strategy"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="presentation-name-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this presentation covers..."
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent resize-none"
              data-testid="presentation-description-input"
            />
          </div>

          {/* File Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              File Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFileType('slides')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  fileType === 'slides'
                    ? 'border-[#A62639] bg-[#A62639]/5 text-[#A62639]'
                    : 'border-gray-300 text-[#6C5F5F] hover:border-[#A62639]/50'
                }`}
                data-testid="file-type-slides"
              >
                <FileText size={20} />
                <span className="font-medium">Slides</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('video')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  fileType === 'video'
                    ? 'border-[#A62639] bg-[#A62639]/5 text-[#A62639]'
                    : 'border-gray-300 text-[#6C5F5F] hover:border-[#A62639]/50'
                }`}
                data-testid="file-type-video"
              >
                <Video size={20} />
                <span className="font-medium">Video</span>
              </button>
            </div>
          </div>

          {/* Upload Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Upload Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('url');
                  setSelectedFile(null);
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  uploadMethod === 'url'
                    ? 'border-[#A62639] bg-[#A62639]/5 text-[#A62639]'
                    : 'border-gray-300 text-[#6C5F5F] hover:border-[#A62639]/50'
                }`}
              >
                Provide URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('file');
                  setFileUrl('');
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  uploadMethod === 'file'
                    ? 'border-[#A62639] bg-[#A62639]/5 text-[#A62639]'
                    : 'border-gray-300 text-[#6C5F5F] hover:border-[#A62639]/50'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {/* File URL (if URL method selected) */}
          {uploadMethod === 'url' && (
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-2">
                File URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://docs.google.com/presentation/... or https://youtube.com/..."
                required={uploadMethod === 'url'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
                data-testid="presentation-url-input"
              />
              <p className="text-xs text-[#6C5F5F] mt-1">
                {fileType === 'slides' 
                  ? 'Google Slides, PowerPoint Online, or PDF URL'
                  : 'YouTube, Vimeo, or direct video URL'}
              </p>
            </div>
          )}

          {/* File Upload (if file method selected) */}
          {uploadMethod === 'file' && (
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#A62639] transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={fileType === 'slides' ? '.pdf,.ppt,.pptx' : '.mp4,.mov,.avi,.webm'}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-[#6C5F5F]" />
                  <p className="text-[#333333] font-medium mb-1">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-[#6C5F5F]">
                    {fileType === 'slides' ? 'PDF, PPT, PPTX (max 50MB)' : 'MP4, MOV, AVI, WEBM (max 50MB)'}
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-[#6C5F5F] rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex items-center gap-2 px-6 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="add-presentation-submit"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {!loading && <Upload size={18} />}
              {loading ? 'Uploading...' : 'Add Presentation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPresentationModal;
