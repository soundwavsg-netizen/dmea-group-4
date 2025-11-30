import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import permissionsService from '../services/permissionsService';

const SearchMarketingNav = ({ activeTab, setActiveTab }) => {
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const isSuperAdmin = authService.isSuperAdmin();
  const session = authService.getSession();
  
  // Load permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      if (session?.username && session?.role) {
        await permissionsService.fetchPermissions(session.username, session.role);
        setPermissionsLoaded(true);
      }
    };
    loadPermissions();
  }, [session?.username, session?.role]);
  
  // Don't render tabs until permissions are loaded
  if (!permissionsLoaded && !isSuperAdmin) {
    return (
      <div className="bg-white border-b border-[#E0AFA0]/30 sticky top-0" style={{ zIndex: 1000 }}>
        <div className="w-full px-3 md:px-6 lg:px-8 pl-14 lg:pl-6">
          <div className="flex items-center gap-4 md:gap-6 py-3">
            <span className="text-[#6C5F5F] text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  const tabStyle = (tabName) => 
    `px-4 py-3 md:py-2 font-semibold text-sm md:text-base transition-all whitespace-nowrap cursor-pointer ${
      activeTab === tabName
        ? 'text-[#A62639] border-b-2 border-[#A62639]'
        : 'text-[#4A3F35] hover:text-[#A62639]'
    }`;

  return (
    <div 
      className="bg-white border-b border-[#E0AFA0]/30 sticky top-0" 
      id="top-module-tabs"
      style={{ zIndex: 1000 }}
    >
      <div className="w-full px-3 md:px-6 lg:px-8 pl-14 lg:pl-6">
        <div 
          className="flex items-center gap-4 md:gap-6 overflow-x-auto"
          style={{
            display: 'flex',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none'
          }}
        >
          <style>{`
            #top-module-tabs > div > div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {(isSuperAdmin || permissionsService.canAccessTab('search_marketing_diagnostics', 'data_input')) && (
            <div
              onClick={() => setActiveTab('data-input')}
              className={tabStyle('data-input')}
              data-testid="search-marketing-tab-data-input"
            >
              Data Input
            </div>
          )}
          
          {(isSuperAdmin || permissionsService.canAccessTab('search_marketing_diagnostics', 'column_mapping')) && (
            <div
              onClick={() => setActiveTab('column-mapping')}
              className={tabStyle('column-mapping')}
              data-testid="search-marketing-tab-column-mapping"
            >
              Column Mapping
            </div>
          )}
          
          {(isSuperAdmin || permissionsService.canAccessTab('search_marketing_diagnostics', 'dashboard')) && (
            <div
              onClick={() => setActiveTab('dashboard')}
              className={tabStyle('dashboard')}
              data-testid="search-marketing-tab-analytics"
            >
              Analytics
            </div>
          )}
          
          {(isSuperAdmin || permissionsService.canAccessTab('search_marketing_diagnostics', 'insight_summary')) && (
            <div
              onClick={() => setActiveTab('insight-summary')}
              className={tabStyle('insight-summary')}
              data-testid="search-marketing-tab-insight-summary"
            >
              Insight Summary
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchMarketingNav;
