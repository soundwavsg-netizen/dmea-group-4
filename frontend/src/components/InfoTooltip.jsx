import React, { useState, useRef, useEffect } from 'react';

const InfoTooltip = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = buttonRect.bottom + 8; // 8px below button
      let left = buttonRect.left;

      // Check if tooltip goes off right edge
      if (left + tooltipRect.width > viewportWidth - 16) {
        left = viewportWidth - tooltipRect.width - 16;
      }

      // Check if tooltip goes off left edge
      if (left < 16) {
        left = 16;
      }

      // Check if tooltip goes off bottom
      if (top + tooltipRect.height > viewportHeight - 16) {
        top = buttonRect.top - tooltipRect.height - 8; // Show above button
      }

      // Check if tooltip goes off top
      if (top < 16) {
        top = 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-2">
      <button
        ref={buttonRef}
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
          ref={tooltipRef}
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-[#E0AFA0]/30 p-4 max-w-md"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
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
