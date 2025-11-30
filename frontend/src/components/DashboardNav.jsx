import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ChangePasswordModal from './ChangePasswordModal';

const DashboardNav = () => {
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const session = authService.getSession();
  const isSuperAdmin = authService.isSuperAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <div 
        className="bg-white border-b border-[#E0AFA0]/30 sticky top-0" 
        style={{ zIndex: 1000 }}
      >
        <div className="w-full px-3 md:px-6 lg:px-8 pl-14 lg:pl-6">
          <div className="flex items-center justify-between py-3">
            <div className="text-[#6C5F5F] text-sm">
              Logged in as <span className="font-semibold text-[#A62639]">{session?.username}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setChangePasswordOpen(true)}
                className="px-4 py-2 text-sm bg-[#E0AFA0] text-white rounded-lg hover:bg-[#d19a89] transition-colors"
              >
                Change Password
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 text-sm bg-[#1769AA] text-white rounded-lg hover:bg-[#135a8a] transition-colors"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ChangePasswordModal 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
      />
    </>
  );
};

export default DashboardNav;
