import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import featureFlagService from '../services/featureFlagService';
import permissionsService from '../services/permissionsService';

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  superAdminOnly = false, 
  requiredFeature = null,
  requiredModule = null,
  requiredTab = null
}) => {
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  
  const isAuthenticated = authService.isAuthenticated();
  const isSuperAdmin = authService.isSuperAdmin();
  const isAdminOrAbove = authService.isAdminOrAbove();
  const session = authService.getSession();
  
  useEffect(() => {
    const checkPermissions = async () => {
      if (!isAuthenticated) {
        setPermissionsLoaded(true);
        return;
      }
      
      // Superadmin always has access
      if (isSuperAdmin) {
        setHasAccess(true);
        setPermissionsLoaded(true);
        return;
      }
      
      // Load permissions if not already loaded
      if (session?.username && session?.role) {
        await permissionsService.fetchPermissions(session.username, session.role);
      }
      
      // Check role-based access (legacy system)
      let roleBasedAccess = true;
      if (superAdminOnly && !isSuperAdmin) {
        roleBasedAccess = false;
      } else if (adminOnly && !isAdminOrAbove) {
        roleBasedAccess = false;
      }
      
      // Check feature flag (legacy system)
      if (requiredFeature && !isSuperAdmin) {
        const isFeatureEnabled = featureFlagService.isEnabled(requiredFeature);
        if (!isFeatureEnabled) {
          roleBasedAccess = false;
        }
      }
      
      // NEW: Check permission-based access
      let permissionBasedAccess = true;
      if (requiredModule) {
        permissionBasedAccess = permissionsService.canAccessModule(requiredModule);
      }
      if (permissionBasedAccess && requiredTab && requiredModule) {
        permissionBasedAccess = permissionsService.canAccessTab(requiredModule, requiredTab);
      }
      
      // Grant access if EITHER old role system OR new permission system allows it
      setHasAccess(roleBasedAccess || permissionBasedAccess);
      setPermissionsLoaded(true);
    };
    
    checkPermissions();
  }, [isAuthenticated, isSuperAdmin, isAdminOrAbove, session, requiredModule, requiredTab, requiredFeature, superAdminOnly, adminOnly]);
  
  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Show loading while checking permissions
  if (!permissionsLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
          <p className="mt-4 text-[#6C5F5F]">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check access
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
