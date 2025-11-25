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
      return false;
    }
    return this.permissions[moduleName].enabled === true;
  }

  canAccessTab(moduleName, tabName) {
    // Superadmin has access to everything
    if (this.role === 'superadmin') {
      return true;
    }
    
    if (!this.canAccessModule(moduleName)) {
      return false;
    }
    const module = this.permissions[moduleName];
    if (!module.tabs || !module.tabs[tabName]) {
      return true; // If no tab restrictions, allow access
    }
    return module.tabs[tabName] === true;
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
