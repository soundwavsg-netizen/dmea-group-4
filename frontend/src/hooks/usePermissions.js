import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Hook to check user permissions for modules, tabs, and actions
 */
export const usePermissions = (moduleName) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const session = authService.getSession();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/api/permissions/me`, {
          headers: { 
            'X-User-Name': session.username,
            'X-User-Role': session.role
          }
        });
        
        console.log('Permissions API response for', moduleName, ':', response.data);
        
        const modulePerms = response.data.modules[moduleName] || {
          enabled: false,
          tabs: {},
          actions: {}
        };
        
        console.log('Module permissions for', moduleName, ':', modulePerms);
        setPermissions(modulePerms);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Default to no permissions on error
        setPermissions({
          enabled: false,
          tabs: {},
          actions: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [moduleName, session?.username]);

  // Helper functions
  const canViewTab = (tabName) => {
    if (!permissions) return false;
    // Superadmin can see everything
    if (session?.role === 'superadmin') return true;
    return permissions.enabled && (permissions.tabs[tabName] === true);
  };

  const canPerformAction = (actionName) => {
    if (!permissions) return false;
    // Superadmin can do everything
    if (session?.role === 'superadmin') return true;
    return permissions.enabled && (permissions.actions[actionName] === true);
  };

  const isModuleEnabled = () => {
    if (!permissions) return false;
    // Superadmin always has access
    if (session?.role === 'superadmin') return true;
    return permissions.enabled === true;
  };

  return {
    permissions,
    loading,
    canViewTab,
    canPerformAction,
    isModuleEnabled,
    isSuperadmin: session?.role === 'superadmin'
  };
};

export default usePermissions;
