import React, { useState } from 'react';
import { X, Upload, FileText, Video } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

const AddPresentationModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState('slides'); // 'slides' or 'video'
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Please enter a presentation name');
      return;
    }

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

    setLoading(true);

    try {
      await axios.post(
        `${backendUrl}/api/presentations`,
        {
          name: name.trim(),
          file_url: fileUrl.trim(),
          file_type: fileType
        },
        {
          headers: {
            'X-User-Name': session.username || session.email
          }
        }
      );

      setSuccess(true);
      setName('');
      setFileUrl('');
      setFileType('slides');

      // Call onSuccess callback and close after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add presentation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setFileUrl('');
      setFileType('slides');
      setError('');
      setSuccess(false);
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

          {/* File URL */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              File URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/... or https://youtube.com/..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="presentation-url-input"
            />
            <p className="text-xs text-[#6C5F5F] mt-1">
              {fileType === 'slides' 
                ? 'Google Slides, PowerPoint Online, or PDF URL'
                : 'YouTube, Vimeo, or direct video URL'}
            </p>
          </div>

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
              <Upload size={18} />
              {loading ? 'Adding...' : 'Add Presentation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPresentationModal;
