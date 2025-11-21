import React from 'react';
import { NavLink } from 'react-router-dom';

const BuyerPersonaNav = () => {
  const activeLinkStyle = (isActive) => 
    `px-4 py-2 font-semibold text-sm transition-all ${
      isActive
        ? 'text-[#A62639] border-b-2 border-[#A62639]'
        : 'text-[#4A3F35] hover:text-[#A62639]'
    }`;

  return (
    <div className="bg-white border-b border-[#E0AFA0]/30 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
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
