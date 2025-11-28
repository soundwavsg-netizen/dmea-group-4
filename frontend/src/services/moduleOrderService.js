import axios from 'axios';
import authService from './authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ModuleOrderService {
  async getOrder() {
    try {
      const session = authService.getSession();
      const response = await axios.get(`${API}/api/module-order`, {
        headers: {
          'X-User-Name': session?.username
        }
      });
      return response.data.order;
    } catch (error) {
      console.error('Error fetching module order:', error);
      // Return default order if error
      return [
        'dashboard',
        'buyer_persona',
        'daily_reflections',
        'presentations',
        'seo_content',
        'social_media',
        'analytics',
        'final_capstone',
        'shared_folder',
        'important_links'
      ];
    }
  }

  async updateOrder(order) {
    try {
      const session = authService.getSession();
      const response = await axios.put(`${API}/api/admin/module-order`, 
        { order },
        {
          headers: {
            'X-User-Name': session?.username,
            'X-User-Role': session?.role
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating module order:', error);
      throw error;
    }
  }
}

export default new ModuleOrderService();
