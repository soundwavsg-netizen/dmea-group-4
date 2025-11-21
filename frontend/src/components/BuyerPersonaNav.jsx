import React from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../services/authService';

const BuyerPersonaNav = () => {
  const isUser = authService.isUser();
  const isAdminOrAbove = authService.isAdminOrAbove();
  
  const activeLinkStyle = (isActive) => 
    `px-4 py-3 md:py-2 font-semibold text-sm md:text-base transition-all whitespace-nowrap ${
      isActive
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
          <NavLink
            to="/"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="persona-nav-home"
          >
            Home
          </NavLink>
          <NavLink
            to="/add-insight"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="persona-nav-add-insight"
          >
            Add Insight
          </NavLink>
          <NavLink
            to="/report"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="persona-nav-report"
          >
            Report
          </NavLink>
          <NavLink
            to="/persona-generator"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="persona-nav-generator"
          >
            Persona Generator
          </NavLink>
          <NavLink
            to="/personas"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="persona-nav-personas"
          >
            Personas
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default BuyerPersonaNav;
