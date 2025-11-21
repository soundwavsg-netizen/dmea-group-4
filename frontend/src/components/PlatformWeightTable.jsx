import React, { useState } from 'react';
import InfoTooltip from './InfoTooltip';

const PLATFORM_WEIGHTS = [
  { platform: 'Face to Face', weight: 1.2 },
  { platform: 'Lazada Review', weight: 1.0 },
  { platform: 'Shopee Review', weight: 1.0 },
  { platform: 'Sephora Review', weight: 1.0 },
  { platform: 'Xiaohongshu 小红书', weight: 1.0 },
  { platform: 'Reddit', weight: 1.0 },
  { platform: 'FB Group', weight: 0.9 },
  { platform: 'YouTube', weight: 0.9 },
  { platform: 'Blog/Article', weight: 0.8 },
  { platform: 'TikTok', weight: 0.8 },
  { platform: 'Instagram', weight: 0.8 },
  { platform: 'Other', weight: 0.8 },
];

const PlatformWeightTable = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tooltipContent = `Platform weight represents reliability of insight sources.
Higher weight = deeper qualitative insights.`;

  return (
    <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-[#1F1A1A]">Platform Weight</h3>
          <InfoTooltip content={tooltipContent} title="Platform Weight" />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#A62639] hover:text-[#8E1F31] transition-colors flex items-center gap-2"
          data-testid="platform-weight-toggle"
        >
          <span className="text-sm font-semibold">{isExpanded ? 'Collapse' : 'View Table'}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 overflow-x-auto -mx-6 px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[#E0AFA0]/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#1F1A1A]">Platform</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#1F1A1A]">Weight</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORM_WEIGHTS.map((item, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-[#E0AFA0]/10 ${index % 2 === 0 ? 'bg-[#F8F6F5]/50' : ''}`}
                >
                  <td className="py-3 px-4 text-sm text-[#1F1A1A]">{item.platform}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-[#A62639]">{item.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-xs text-[#6C5F5F] italic">
        "Face to Face" has the highest reliability (1.2). Long-form reviews weighted at 1.0. Short-form platforms (TikTok/IG) weighted lowest (0.8).
      </div>
    </div>
  );
};

export default PlatformWeightTable;
