import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import BuyerPersonaNav from './BuyerPersonaNav';
import PresentationsNav from './PresentationsNav';
import DashboardNav from './DashboardNav';
import authService from '../services/authService';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminOrAbove = authService.isAdminOrAbove();
  
  // Determine if we're on Dashboard
  const isOnDashboard = location.pathname === '/';
  
  // Determine if we're in Buyer Persona module (exclude dashboard)
  const buyerPersonaPaths = ['/add-insight', '/report', '/persona-generator', '/personas', '/manage-insights'];
  const isInBuyerPersona = buyerPersonaPaths.includes(location.pathname);
  
  // Determine if we're in Presentations module
  const isInPresentations = location.pathname.startsWith('/presentations');
  
  // Show Buyer Persona sub-nav whenever in buyer persona module (permissions will filter tabs)
  const showBuyerPersonaNav = isInBuyerPersona;
  
  // Show Presentations sub-nav whenever in presentations module (permissions will filter tabs)
  const showPresentationsNav = isInPresentations;
  
  // Show Dashboard nav on dashboard page
  const showDashboardNav = isOnDashboard;

  return (
    <div className="flex h-screen overflow-hidden w-full max-w-full">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        {/* Module Sub-Navigation (if applicable) */}
        {showBuyerPersonaNav && <BuyerPersonaNav />}
        {showPresentationsNav && <PresentationsNav />}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F6F5] w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
