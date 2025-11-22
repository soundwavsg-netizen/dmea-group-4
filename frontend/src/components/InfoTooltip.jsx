import React, { useState } from 'react';

const InfoTooltip = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#B7343C]/10 text-[#B7343C] hover:bg-[#B7343C]/20 transition-colors"
        data-testid={`tooltip-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-[#E0AFA0]/30 p-4"
          style={{
            left: '1rem',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <div className="text-sm text-[#1F1A1A] whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
