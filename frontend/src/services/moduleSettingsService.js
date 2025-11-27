import axios from 'axios';
import authService from './authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ModuleSettingsService {
  async getSettings() {
    try {
      const session = authService.getSession();
      const response = await axios.get(`${API}/api/module-settings`, {
        headers: {
          'X-User-Name': session?.username
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
