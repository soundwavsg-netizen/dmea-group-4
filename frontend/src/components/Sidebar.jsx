import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import featureFlagService from '../services/featureFlagService';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const session = authService.getSession();
  const role = session?.role;
  const isSuperAdmin = authService.isSuperAdmin();
  const isAdmin = authService.isAdmin();
  const flags = featureFlagService.getFlags();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getModules = () => {
    const modules = [];
    
    // Dashboard - visible to all
    modules.push({ label: 'Dashboard', path: '/', icon: '🏠' });
    
    // Buyer Persona - visible to all authenticated users
    modules.push({ label: 'Buyer Persona', path: '/report', icon: '👥' });
    
    // Daily Reflections - visible to ALL authenticated users (personal/private)
    modules.push({ label: 'Daily Reflections', path: '/daily-reflections', icon: '📓' });
    
    if (isAdmin || isSuperAdmin) {
      // Presentations - Admin and SuperAdmin only
      modules.push({ label: 'Presentations', path: '/presentations', icon: '📊' });
      
      // SEO & Content
      if (isSuperAdmin || flags.seo_content) {
        modules.push({ label: 'SEO & Content', path: '/seo', icon: '🔍' });
      }
      
      // Social Media
      if (isSuperAdmin || flags.social_media) {
        modules.push({ label: 'Social Media', path: '/social/library', icon: '📱' });
      }
      
      // Analytics
      if (isSuperAdmin || flags.analytics) {
        modules.push({ label: 'Analytics', path: '/analytics/traffic', icon: '📊' });
      }
      
      // Presentation
      if (isSuperAdmin || flags.presentation) {
        modules.push({ label: 'Presentation', path: '/presentation/drafts', icon: '🎤' });
      }
      
      // Final Capstone
      if (isSuperAdmin || flags.final_capstone) {
        modules.push({ label: 'Final Capstone', path: '/final/report', icon: '🎓' });
      }
    }
    
    // Admin Panel - SuperAdmin only
    if (isSuperAdmin) {
      modules.push({ label: 'Admin Panel', path: '/admin', icon: '⚙️' });
    }
    
    return modules;
  };

  const modules = getModules();

  return (
    <>
      {/* Mobile Hamburger Button - Highest z-index */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed p-2 bg-white rounded-lg shadow-md"
        style={{ 
          top: '12px',
          left: '12px',
          zIndex: 1100
        }}
        id="burger-menu"
        data-testid="hamburger-menu"
      >
        <svg className="w-6 h-6 text-[#A62639]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 59 }}
          onClick={() => setIsOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar - Lowest z-index in mobile nav stack */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
        style={{ zIndex: 60 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-[#E0AFA0]/30">
          <h1 className="text-xl font-bold text-[#A62639]">MUFE GROUP 4</h1>
          <p className="text-sm text-[#6C5F5F] mt-1">Research Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {modules.map((module, index) => (
              <NavLink
                key={index}
                to={module.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#A62639] text-white'
                      : 'text-[#4A3F35] hover:bg-[#E0AFA0]/20'
                  }`
                }
                data-testid={`sidebar-${module.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-xl">{module.icon}</span>
                <span className="font-semibold text-sm">{module.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-[#E0AFA0]/30">
          <div className="mb-3 px-2">
            <p className="text-xs text-[#6C5F5F]">Logged in as</p>
            <p className="text-sm font-semibold text-[#1F1A1A]">{session?.username}</p>
            <p className="text-xs text-[#A62639]">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-[#E0AFA0] text-[#1F1A1A] rounded-lg text-sm font-semibold hover:bg-[#D19F90] transition-colors"
            data-testid="sidebar-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
