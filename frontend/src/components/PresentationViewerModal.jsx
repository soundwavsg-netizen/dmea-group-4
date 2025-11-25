import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const PresentationViewerModal = ({ isOpen, onClose, presentation }) => {
  if (!isOpen || !presentation) return null;

  const getViewerUrl = () => {
    const fileUrl = presentation.file_url;
    const fileType = presentation.file_type;
    const fileName = presentation.name;

    // Check if it's a URL (Google Slides, YouTube, etc.)
    if (fileUrl.includes('docs.google.com') || fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be')) {
      // For Google Slides, ensure it's in embed mode
      if (fileUrl.includes('docs.google.com/presentation')) {
        return fileUrl.replace('/edit', '/embed').replace('/view', '/embed');
      }
      // For YouTube, convert to embed
      if (fileUrl.includes('youtube.com/watch')) {
        const videoId = fileUrl.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (fileUrl.includes('youtu.be/')) {
        const videoId = fileUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return fileUrl;
    }

    // For uploaded files, determine viewer based on file extension
    const extension = fileUrl.split('.').pop().toLowerCase();

    // PowerPoint files - Use Office Online Viewer
    if (extension === 'ppt' || extension === 'pptx') {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }

    // PDF files - Use Google Docs Viewer
    if (extension === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }

    // Video files - Direct display
    if (extension === 'mp4' || extension === 'webm' || extension === 'mov') {
      return fileUrl; // Will be handled by video tag
    }

    // Default: Google Docs Viewer (works for many file types)
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  const isVideoFile = () => {
    const extension = presentation.file_url.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov', 'avi'].includes(extension);
  };

  const viewerUrl = getViewerUrl();

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/90" style={{ zIndex: 100 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {presentation.name}
            </h2>
            {presentation.description && (
              <p className="text-sm text-[#6C5F5F] mt-1">{presentation.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={presentation.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-[#A62639] border border-[#A62639] rounded-lg hover:bg-[#A62639] hover:text-white transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
              <span className="text-sm font-medium">Open Externally</span>
            </a>
            <button
              onClick={onClose}
              className="text-[#6C5F5F] hover:text-[#A62639] transition-colors p-2"
              data-testid="close-viewer-btn"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isVideoFile() ? (
            <video
              controls
              className="w-full h-full object-contain"
              src={presentation.file_url}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={presentation.name}
              allowFullScreen
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default PresentationViewerModal;
