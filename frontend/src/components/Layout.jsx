import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import BuyerPersonaNav from './BuyerPersonaNav';
import authService from '../services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminOrAbove = authService.isAdminOrAbove();
  
  // Determine if we're in Buyer Persona module
  const buyerPersonaPaths = ['/', '/add-insight', '/report', '/persona-generator', '/personas'];
  const isInBuyerPersona = buyerPersonaPaths.includes(location.pathname);
  
  // Show Buyer Persona sub-nav for admin/superadmin or if user is on allowed pages
  const showBuyerPersonaNav = isInBuyerPersona && (isAdminOrAbove || location.pathname === '/' || location.pathname === '/add-insight');

  return (
    <div className="flex h-screen overflow-hidden w-full max-w-full">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full max-w-full overflow-hidden">
        {/* Module Sub-Navigation (if applicable) */}
        {showBuyerPersonaNav && <BuyerPersonaNav />}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F6F5] w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
