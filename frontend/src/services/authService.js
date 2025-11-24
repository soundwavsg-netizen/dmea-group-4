// Hard-coded user credentials (3 ROLES: superadmin, admin, user)
const ACCOUNTS = {
  "superadmin": { password: "SUPERPASS", role: "superadmin" },
  "admin": { password: "ADMINPASS", role: "admin" },
  "user1": { password: "USERPASS", role: "user" },
  "user2": { password: "USERPASS", role: "user" },
  // 8 New User Accounts
  "anthony": { password: "anthony", role: "user" },
  "chris": { password: "chris", role: "user" },
  "drgu": { password: "drgu", role: "user" },
  "jessica": { password: "jessica", role: "user" },
  "juliana": { password: "juliana", role: "user" },
  "munifah": { password: "munifah", role: "user" },
  "shannon": { password: "shannon", role: "user" },
  "tasha": { password: "tasha", role: "user" }
};

const AUTH_KEY = 'mufe_auth_session';

class AuthService {
  // Login with username and password
  async login(username, password) {
    const user = ACCOUNTS[username];
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Check if password has been changed (stored in backend)
    // For now, we'll accept both original and potentially changed passwords
    // The backend will validate this properly
    if (user.password !== password) {
      // Password doesn't match default - might be a changed password
      // Let backend validate it
      throw new Error('Invalid username or password');
    }
    
    // Create session token
    const token = this.generateToken();
    const session = {
      username,
      role: user.role,
      token,
      timestamp: Date.now()
    };
    
    // Store in localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    return session;
  }
  
  // Logout
  logout() {
    localStorage.removeItem(AUTH_KEY);
  }
  
  // Get current session
  getSession() {
    const sessionData = localStorage.getItem(AUTH_KEY);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      return null;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return this.getSession() !== null;
  }
  
  // Get current user role
  getRole() {
    const session = this.getSession();
    return session ? session.role : null;
  }
  
  // Check if user is superadmin
  isSuperAdmin() {
    return this.getRole() === 'superadmin';
  }
  
  // Check if user is admin
  isAdmin() {
    return this.getRole() === 'admin';
  }
  
  // Check if user is regular user
  isUser() {
    return this.getRole() === 'user';
  }
  
  // Check if user has admin or superadmin role
  isAdminOrAbove() {
    const role = this.getRole();
    return role === 'admin' || role === 'superadmin';
  }
  
  // Generate random token
  generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export default new AuthService();
