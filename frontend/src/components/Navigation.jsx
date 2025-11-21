import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navigation = () => {
  const navigate = useNavigate();
  const isAdmin = authService.isAdmin();
  const isUser = authService.isUser();
  const session = authService.getSession();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Style for disabled links (USER role)
  const disabledLinkStyle = "text-[#9CA3AF] font-semibold text-base cursor-not-allowed opacity-50";
  const activeLinkStyle = (isActive) => 
    `text-[#4A3F35] font-semibold text-base transition-all ${
      isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white h-[60px] shadow-sm" style={{boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}}>
      <div className="max-w-7xl mx-auto h-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-8">
            {/* Home - Always accessible */}
            <NavLink
              to="/"
              className={({ isActive }) => activeLinkStyle(isActive)}
              data-testid="nav-home"
            >
              Home
            </NavLink>

            {/* Add Insight - Always accessible */}
            <NavLink
              to="/add-insight"
              className={({ isActive }) => activeLinkStyle(isActive)}
              data-testid="nav-add-insight"
            >
              Add Insight
            </NavLink>

            {/* Report - Admin only or disabled for users */}
            {isAdmin ? (
              <NavLink
                to="/report"
                className={({ isActive }) => activeLinkStyle(isActive)}
                data-testid="nav-report"
              >
                Report
              </NavLink>
            ) : (
              <span
                className={disabledLinkStyle}
                title="Admin access required"
                data-testid="nav-report-disabled"
              >
                Report
              </span>
            )}

            {/* Persona Generator - Admin only or disabled for users */}
            {isAdmin ? (
              <NavLink
                to="/persona-generator"
                className={({ isActive }) => activeLinkStyle(isActive)}
                data-testid="nav-persona-generator"
              >
                Persona Generator
              </NavLink>
            ) : (
              <span
                className={disabledLinkStyle}
                title="Admin access required"
                data-testid="nav-persona-generator-disabled"
              >
                Persona Generator
              </span>
            )}

            {/* Personas - Admin only or disabled for users */}
            {isAdmin ? (
              <NavLink
                to="/personas"
                className={({ isActive }) => activeLinkStyle(isActive)}
                data-testid="nav-personas"
              >
                Personas
              </NavLink>
            ) : (
              <span
                className={disabledLinkStyle}
                title="Admin access required"
                data-testid="nav-personas-disabled"
              >
                Personas
              </span>
            )}
          </div>

          {/* Right side: User info and Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-[#6C5F5F] text-sm">
              {session?.username} ({session?.role})
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
