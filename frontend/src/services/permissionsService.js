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
      this.permissions = response.data.modules;
      return this.permissions;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return null;
    }
  }

  getPermissions() {
    return this.permissions;
  }

  canAccessModule(moduleName) {
    if (!this.permissions || !this.permissions[moduleName]) {
      return false;
    }
    return this.permissions[moduleName].enabled;
  }

  canAccessTab(moduleName, tabName) {
    if (!this.canAccessModule(moduleName)) {
      return false;
    }
    const module = this.permissions[moduleName];
    if (!module.tabs || !module.tabs[tabName]) {
      return true; // If no tab restrictions, allow access
    }
    return module.tabs[tabName];
  }

  canPerformAction(moduleName, actionName) {
    if (!this.canAccessModule(moduleName)) {
      return false;
    }
    const module = this.permissions[moduleName];
    if (!module.actions || !module.actions[actionName]) {
      return false;
    }
    return module.actions[actionName];
  }

  clearPermissions() {
    this.permissions = null;
  }
}

export default new PermissionsService();
