import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ModuleSettingsService {
  async getSettings() {
    try {
      const response = await axios.get(`${API}/api/admin/module-settings`, {
        headers: {
          'X-User-Role': 'superadmin' // Only superadmin can fetch, but will apply to all users
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching module settings:', error);
      // Return defaults if error
      return {
        shared_folder_enabled: true,
        important_links_enabled: true
      };
    }
  }
}

export default new ModuleSettingsService();
