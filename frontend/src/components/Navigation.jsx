import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white h-[60px] shadow-sm" style={{boxShadow: '0 1px 4px rgba(0,0,0,0.08)'}}>
      <div className="max-w-7xl mx-auto h-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-[#4A3F35] font-semibold text-base transition-all ${
                  isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
                }`
              }
              data-testid="nav-home"
            >
              Home
            </NavLink>
            <NavLink
              to="/add-insight"
              className={({ isActive }) =>
                `text-[#4A3F35] font-semibold text-base transition-all ${
                  isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
                }`
              }
              data-testid="nav-add-insight"
            >
              Add Insight
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `text-[#4A3F35] font-semibold text-base transition-all ${
                  isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
                }`
              }
              data-testid="nav-report"
            >
              Report
            </NavLink>
            <NavLink
              to="/persona-generator"
              className={({ isActive }) =>
                `text-[#4A3F35] font-semibold text-base transition-all ${
                  isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
                }`
              }
              data-testid="nav-persona-generator"
            >
              Persona Generator
            </NavLink>
            <NavLink
              to="/personas"
              className={({ isActive }) =>
                `text-[#4A3F35] font-semibold text-base transition-all ${
                  isActive ? 'border-b-2 border-[#A62639] text-[#A62639]' : 'hover:text-[#A62639]'
                }`
              }
              data-testid="nav-personas"
            >
              Personas
            </NavLink>
          </div>
          <div className="text-[#A62639] font-bold text-lg">
            MUFE Research
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
