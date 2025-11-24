import React from 'react';
import { X, Eye } from 'lucide-react';

const ViewReflectionModal = ({ isOpen, onClose, reflection }) => {
  if (!isOpen || !reflection) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ zIndex: 100 }}>
      <div className="bg-[#FAF7F5] rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Daily Reflection
            </h2>
            <p className="text-white/90 text-sm">
              Created by {reflection.created_by} on {formatDate(reflection.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            data-testid="close-view-btn"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Topic Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border-2 border-[#A62639] p-6 shadow-md">
              <h3 className="text-sm font-bold text-[#A62639] uppercase tracking-wider mb-2">
                Today's Topic
              </h3>
              <p className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {reflection.topic}
              </p>
            </div>
          </div>

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Left: Key Takeaways */}
            <div className="bg-white rounded-lg border-2 border-[#E0AFA0] shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] px-6 py-4">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Key Takeaways
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  What are the top 3 most valuable insights?
                </p>
              </div>
              <div className="p-6">
                <p className="text-[#333333] leading-relaxed whitespace-pre-wrap">
                  {reflection.key_takeaways}
                </p>
              </div>
            </div>

            {/* Top Right: Problem-Solving & Growth */}
            <div className="bg-white rounded-lg border-2 border-[#E0AFA0] shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] px-6 py-4">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Problem-Solving & Growth
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  What challenge did you face and how will you overcome it?
                </p>
              </div>
              <div className="p-6">
                <p className="text-[#333333] leading-relaxed whitespace-pre-wrap">
                  {reflection.growth_challenge}
                </p>
              </div>
            </div>

            {/* Bottom Left: Immediate Action */}
            <div className="bg-white rounded-lg border-2 border-[#E0AFA0] shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] px-6 py-4">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Immediate Action
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  What specific action will you take in the next 30 days?
                </p>
              </div>
              <div className="p-6">
                <p className="text-[#333333] leading-relaxed whitespace-pre-wrap">
                  {reflection.immediate_action}
                </p>
              </div>
            </div>

            {/* Bottom Right: Personal Application */}
            <div className="bg-white rounded-lg border-2 border-[#E0AFA0] shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] px-6 py-4">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Personal Application
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  How will this help you stand out in your role or career?
                </p>
              </div>
              <div className="p-6">
                <p className="text-[#333333] leading-relaxed whitespace-pre-wrap">
                  {reflection.personal_application}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-[#E0AFA0]/30">
            <div className="flex items-center justify-between text-sm text-[#6C5F5F]">
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(reflection.updated_at)}
              </div>
              <div className="text-[#A62639] font-medium">
                MUFE Group 4 Portal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReflectionModal;
