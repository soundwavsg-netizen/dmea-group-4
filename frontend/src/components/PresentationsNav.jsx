import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';

const PresentationsNav = () => {
  const [customPresentations, setCustomPresentations] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  useEffect(() => {
    fetchCustomPresentations();
  }, []);

  const fetchCustomPresentations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/presentations`, {
        headers: {
          'X-User-Name': session?.username || session?.email
        }
      });
      setCustomPresentations(response.data.presentations || []);
    } catch (error) {
      console.error('Error fetching custom presentations:', error);
    }
  };

  const activeLinkStyle = (isActive) => 
    `px-4 py-3 md:py-2 font-semibold text-sm md:text-base transition-all whitespace-nowrap ${
      isActive
        ? 'text-[#A62639] border-b-2 border-[#A62639]'
        : 'text-[#4A3F35] hover:text-[#A62639]'
    }`;

  return (
    <div 
      className="bg-white border-b border-[#E0AFA0]/30 sticky top-0" 
      id="presentations-module-tabs"
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
            #presentations-module-tabs > div > div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <NavLink
            to="/presentations"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="presentations-nav-home"
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/presentations/friendly-brief"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="presentations-nav-friendly"
          >
            Friendly Brief
          </NavLink>
          <NavLink
            to="/presentations/clustering-technical"
            className={({ isActive }) => activeLinkStyle(isActive)}
            data-testid="presentations-nav-technical"
          >
            Technical Slides
          </NavLink>
          <span className="px-4 py-3 md:py-2 text-sm md:text-base text-[#6C5F5F]/50 italic">
            Future Presentations...
          </span>
        </div>
      </div>
    </div>
  );
};

export default PresentationsNav;
