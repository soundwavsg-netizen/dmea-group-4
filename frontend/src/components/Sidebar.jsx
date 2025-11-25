import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import permissionsService from '../services/permissionsService';
import ChangePasswordModal from './ChangePasswordModal';
import ResetPasswordModal from './ResetPasswordModal';
import featureFlagService from '../services/featureFlagService';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const session = authService.getSession();
  const role = session?.role;
  const isSuperAdmin = authService.isSuperAdmin();
  const isAdmin = authService.isAdmin();
  const flags = featureFlagService.getFlags();

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

  const handleLogout = () => {
    permissionsService.clearPermissions(); // Clear permissions on logout
    authService.logout();
    navigate('/login');
  };

  // Compute modules list based on permissions (reactive)
  const modules = React.useMemo(() => {
    const modulesList = [];
    
    // Only show modules if permissions are loaded
    if (!permissionsLoaded) {
      return modulesList; // Return empty until permissions load
    }
    
    // Dashboard - check permissions
    if (permissionsService.canAccessModule('dashboard')) {
      modulesList.push({ label: 'Dashboard', path: '/', icon: '🏠' });
    }
    
    // Buyer Persona - check permissions
    if (permissionsService.canAccessModule('buyer_persona')) {
      modulesList.push({ label: 'Buyer Persona', path: '/report', icon: '👥' });
    }
    
    // Daily Reflections - check permissions
    if (permissionsService.canAccessModule('daily_reflections')) {
      modulesList.push({ label: 'Daily Reflections', path: '/daily-reflections', icon: '📝' });
    }
    
    // Presentations - check permissions
    if (permissionsService.canAccessModule('presentations')) {
      modulesList.push({ label: 'Presentations', path: '/presentations', icon: '📊' });
    }
    
    // SEO & Content - feature flag check
    if (isSuperAdmin || flags.seo_content) {
      modulesList.push({ label: 'SEO & Content', path: '/seo', icon: '🔍' });
    }
    
    // Social Media - feature flag check
    if (isSuperAdmin || flags.social_media) {
      modulesList.push({ label: 'Social Media', path: '/social/library', icon: '📱' });
    }
    
    // Analytics - feature flag check
    if (isSuperAdmin || flags.analytics) {
      modulesList.push({ label: 'Analytics', path: '/analytics/traffic', icon: '📊' });
    }
    
    // Presentation - feature flag check
    if (isSuperAdmin || flags.presentation) {
      modulesList.push({ label: 'Presentation', path: '/presentation/drafts', icon: '🎤' });
    }
    
    // Final Capstone - feature flag check
    if (isSuperAdmin || flags.final_capstone) {
      modulesList.push({ label: 'Final Capstone', path: '/final/report', icon: '🎓' });
    }
    
    // Admin Panel - Superadmin only (no permission check needed)
    if (isSuperAdmin) {
      modulesList.push({ label: 'Admin Panel', path: '/admin', icon: '⚙️' });
    }
    
    return modulesList;
  }, [permissionsLoaded, isSuperAdmin, flags]);

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

        {/* User Info & Actions Section - At the top */}
        <div className="flex-shrink-0 p-4 border-b border-[#E0AFA0]/30">
          <div className="mb-3 px-2">
            <p className="text-xs text-[#6C5F5F]">Logged in as</p>
            <p className="text-sm font-semibold text-[#1F1A1A]">{session?.username}</p>
            <p className="text-xs text-[#A62639]">{role}</p>
          </div>
          
          {/* Change Password Button */}
          <button
            onClick={() => setChangePasswordOpen(true)}
            className="w-full px-4 py-2 mb-2 bg-white border border-[#E0AFA0] text-[#A62639] rounded-lg text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
            data-testid="change-password-btn"
          >
            Change Password
          </button>
          
          {/* Reset Password Button (Superadmin only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setResetPasswordOpen(true)}
              className="w-full px-4 py-2 mb-2 bg-[#A62639] text-white rounded-lg text-sm font-semibold hover:bg-[#8a1f2d] transition-colors"
              data-testid="reset-password-btn"
            >
              Reset User Password
            </button>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-[#E0AFA0] text-[#1F1A1A] rounded-lg text-sm font-semibold hover:bg-[#D19F90] transition-colors"
            data-testid="sidebar-logout-btn"
          >
            Logout
          </button>
        </div>

        {/* Navigation - Scrollable with bottom padding */}
        <nav className="flex-1 overflow-y-auto p-4 pb-24" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
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
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        username={session?.username}
      />
      
      {/* Reset Password Modal (Superadmin only) */}
      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </>
  );
};

export default Sidebar;
