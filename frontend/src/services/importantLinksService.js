import axios from 'axios';
import authService from './authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ImportantLinksService {
  async getAllLinks() {
    try {
      const session = authService.getSession();
      const response = await axios.get(`${API}/api/important-links`, {
        headers: {
          'X-User-Name': session?.username,
          'X-User-Role': session?.role
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching important links:', error);
      throw error;
    }
  }

  async createLink(linkData) {
    try {
      const session = authService.getSession();
      const response = await axios.post(`${API}/api/important-links`, linkData, {
        headers: {
          'X-User-Name': session?.username,
          'X-User-Role': session?.role
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating important link:', error);
      throw error;
    }
  }

  async updateLink(linkId, linkData) {
    try {
      const session = authService.getSession();
      const response = await axios.put(`${API}/api/important-links/${linkId}`, linkData, {
        headers: {
          'X-User-Name': session?.username,
          'X-User-Role': session?.role
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating important link:', error);
      throw error;
    }
  }

  async deleteLink(linkId) {
    try {
      const session = authService.getSession();
      await axios.delete(`${API}/api/important-links/${linkId}`, {
        headers: {
          'X-User-Name': session?.username,
          'X-User-Role': session?.role
        }
      });
    } catch (error) {
      console.error('Error deleting important link:', error);
      throw error;
    }
  }
}

export default new ImportantLinksService();
