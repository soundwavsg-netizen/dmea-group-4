import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class PermissionsService {
  constructor() {
    this.permissions = null;
  }

  async fetchPermissions(username, role) {
    try {
      const response = await axios.get(`${API}/api/permissions/me`, {
        headers: {
          'X-User-Name': username,
          'X-User-Role': role
        }
      });
      // Store the entire response data including role
      this.permissions = response.data.modules;
      this.role = response.data.role;
      console.log('[PermissionsService] Loaded permissions for', username, ':', this.permissions);
      return this.permissions;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return null;
    }
  }

  getPermissions() {
    return this.permissions;
  }

  getRole() {
    return this.role;
  }

  canAccessModule(moduleName) {
    // Superadmin has access to everything
    if (this.role === 'superadmin') {
      return true;
    }
    
    if (!this.permissions || !this.permissions[moduleName]) {
      console.log(`[PermissionsService] No permissions found for module: ${moduleName}`);
      return false;
    }
    const hasAccess = this.permissions[moduleName].enabled === true;
    console.log(`[PermissionsService] Module ${moduleName} access:`, hasAccess);
    return hasAccess;
  }

  canAccessTab(moduleName, tabName) {
    // Superadmin has access to everything
    if (this.role === 'superadmin') {
      return true;
    }
    
    if (!this.canAccessModule(moduleName)) {
      console.log(`[PermissionsService] Tab ${moduleName}.${tabName}: Module not accessible`);
      return false;
    }
    const module = this.permissions[moduleName];
    if (!module.tabs || module.tabs[tabName] === undefined) {
      console.log(`[PermissionsService] Tab ${moduleName}.${tabName}: No restriction (allowing)`);
      return true; // If no tab restrictions, allow access
    }
    const hasAccess = module.tabs[tabName] === true;
    console.log(`[PermissionsService] Tab ${moduleName}.${tabName} access:`, hasAccess);
    return hasAccess;
  }

  canPerformAction(moduleName, actionName) {
    // Superadmin has access to everything
    if (this.role === 'superadmin') {
      return true;
    }
    
    if (!this.canAccessModule(moduleName)) {
      return false;
    }
    const module = this.permissions[moduleName];
    if (!module.actions || module.actions[actionName] === undefined) {
      return false;
    }
    return module.actions[actionName] === true;
  }

  clearPermissions() {
    this.permissions = null;
  }
}

export default new PermissionsService();
