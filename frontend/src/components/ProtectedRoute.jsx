import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import featureFlagService from '../services/featureFlagService';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, requiredFeature = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isSuperAdmin = authService.isSuperAdmin();
  const isAdminOrAbove = authService.isAdminOrAbove();
  
  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // SuperAdmin-only route
  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Admin-only route (admin or superadmin)
  if (adminOnly && !isAdminOrAbove) {
    return <Navigate to="/" replace />;
  }
  
  // Feature flag check (only for admin, superadmin bypasses)
  if (requiredFeature && !isSuperAdmin) {
    const isFeatureEnabled = featureFlagService.isEnabled(requiredFeature);
    if (!isFeatureEnabled) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
