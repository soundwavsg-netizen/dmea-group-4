import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import featureFlagService from '../services/featureFlagService';

const Navigation = () => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const role = session?.role;
  const isSuperAdmin = authService.isSuperAdmin();
  const isAdmin = authService.isAdmin();
  const isUser = authService.isUser();
  
  const flags = featureFlagService.getFlags();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const activeLinkStyle = (isActive) => 
    `text-[#4A3F35] font-semibold text-base transition-all py-2 ${
      isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
    }`;

  // Define navigation items based on role
  const getNavigationItems = () => {
    const items = [];
    
    // Dashboard - visible to all
    items.push({ label: 'Dashboard', path: '/', visible: true });
    
    if (isUser) {
      // USER: Only Dashboard + Add Insight
      items.push({ label: 'Add Insight', path: '/add-insight', visible: true });
    }
    
    if (isAdmin || isSuperAdmin) {
      // ADMIN & SUPERADMIN: Buyer Persona Module
      if (isSuperAdmin || flags.buyer_research) {
        items.push({ label: 'Buyer Persona', path: '/report', visible: true, submenu: [
          { label: 'Report', path: '/report' },
          { label: 'Add Insight', path: '/add-insight' },
          { label: 'Generator', path: '/persona-generator' },
          { label: 'Personas', path: '/personas' }
        ]});
      }
      
      // SEO & Content Module
      if (isSuperAdmin || flags.seo_content) {
        items.push({ label: 'SEO & Content', path: '/seo', visible: true });
      }
      
      // Social Media Module
      if (isSuperAdmin || flags.social_media) {
        items.push({ label: 'Social Media', path: '/social/library', visible: true });
      }
      
      // Analytics Module
      if (isSuperAdmin || flags.analytics) {
        items.push({ label: 'Analytics', path: '/analytics/traffic', visible: true });
      }
      
      // Presentation Module
      if (isSuperAdmin || flags.presentation) {
        items.push({ label: 'Presentation', path: '/presentation/drafts', visible: true });
      }
      
      // Final Capstone Module
      if (isSuperAdmin || flags.final_capstone) {
        items.push({ label: 'Final Capstone', path: '/final/report', visible: true });
      }
    }
    
    // Admin Panel - SUPERADMIN only
    if (isSuperAdmin) {
      items.push({ label: 'Admin Panel', path: '/admin', visible: true });
    }
    
    return items.filter(item => item.visible);
  };

  const navItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-50 bg-white h-[60px] shadow-sm" style={{boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}}>
      <div className="max-w-7xl mx-auto h-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left: Navigation Links */}
          <div className="flex items-center space-x-8">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => activeLinkStyle(isActive)}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right: User Info + Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-[#6C5F5F] text-sm">
              {session?.username} 
              <span className="text-[#A62639] font-semibold">({role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#E0AFA0] text-[#1F1A1A] rounded-full text-sm font-semibold hover:bg-[#D19F90] transition-colors"
              data-testid="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
