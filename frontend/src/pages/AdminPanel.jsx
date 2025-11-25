import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [personaThreshold, setPersonaThreshold] = useState(2.0);
  const [loadingThreshold, setLoadingThreshold] = useState(false);

  const session = authService.getSession();

  useEffect(() => {
    fetchUsers();
    fetchPersonaThreshold();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/admin/users`, {
        headers: { 'X-User-Role': session.role }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (username) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/admin/permissions/${username}`, {
        headers: { 'X-User-Role': session.role }
      });
      setPermissions(response.data);
      setSelectedUser(username);
      setActiveTab('permissions');
    } catch (err) {
      setError(`Failed to load permissions for ${username}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = (moduleName) => {
    setPermissions(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: {
          ...prev.modules[moduleName],
          enabled: !prev.modules[moduleName].enabled
        }
      }
    }));
  };

  const handleToggleTab = (moduleName, tabName) => {
    setPermissions(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: {
          ...prev.modules[moduleName],
          tabs: {
            ...prev.modules[moduleName].tabs,
            [tabName]: !prev.modules[moduleName].tabs[tabName]
          }
        }
      }
    }));
  };

  const handleToggleAction = (moduleName, actionName) => {
    setPermissions(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: {
          ...prev.modules[moduleName],
          actions: {
            ...prev.modules[moduleName].actions,
            [actionName]: !prev.modules[moduleName].actions[actionName]
          }
        }
      }
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError('');
      await axios.put(
        `${API}/api/admin/permissions/${selectedUser}`,
        { username: selectedUser, modules: permissions.modules },
        { headers: { 'X-User-Role': session.role } }
      );
      setSuccessMessage(`Permissions saved for ${selectedUser}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchUsers();
    } catch (err) {
      setError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async (username) => {
    console.log('Reset button clicked for:', username);
    
    if (!window.confirm(`Reset permissions to default for ${username}?`)) {
      console.log('Reset cancelled by user');
      return;
    }
    
    try {
      console.log('Starting reset process...');
      
      // Get session from multiple sources
      let session = authService.getSession();
      if (!session) {
        console.warn('No session from authService, trying localStorage directly');
        const sessionData = localStorage.getItem('mufe_auth_session');
        if (sessionData) {
          session = JSON.parse(sessionData);
        }
      }
      
      if (!session || !session.role) {
        console.error('No valid session found');
        setError('Authentication error. Please logout and login again.');
        return;
      }
      
      console.log('Making API call with session role:', session.role);
      
      const response = await axios.delete(`${API}/api/admin/permissions/${username}`, {
        headers: { 'X-User-Role': session.role }
      });
      
      console.log('Reset API response:', response.data);
      setSuccessMessage(`Permissions reset for ${username}`);
      setError(''); // Clear any previous errors
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh the data
      await fetchUsers();
      if (selectedUser === username) {
        await fetchUserPermissions(username);
      }
      
    } catch (err) {
      console.error('Reset error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to reset permissions';
      setError(errorMsg);
      setSuccessMessage(''); // Clear success message
      setTimeout(() => setError(''), 5000);
    }
  };

  const fetchPersonaThreshold = async () => {
    try {
      setLoadingThreshold(true);
      const response = await axios.get(`${API}/api/admin/persona-threshold`, {
        headers: { 'X-User-Role': session?.role }
      });
      setPersonaThreshold(response.data.minimum_tcss);
    } catch (err) {
      console.error('Error fetching persona threshold:', err);
      setError('Failed to load persona threshold');
    } finally {
      setLoadingThreshold(false);
    }
  };

  const handleThresholdUpdate = async () => {
    try {
      setSaving(true);
      const response = await axios.put(`${API}/api/admin/persona-threshold`, {
        minimum_tcss: personaThreshold
      }, {
        headers: { 'X-User-Role': session?.role }
      });
      
      setSuccessMessage(`Persona threshold updated to ${personaThreshold}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating persona threshold:', err);
      setError('Failed to update persona threshold');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const getModuleLabel = (moduleName) => {
    const labels = {
      dashboard: 'Dashboard',
      buyer_persona: 'Buyer Persona',
      daily_reflections: 'Daily Reflections',
      presentations: 'Presentations',
      reports: 'Reports'
    };
    return labels[moduleName] || moduleName;
  };

  const formatName = (name) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <p className="text-[#6C5F5F]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1F1A1A]">Admin Panel</h1>
          <p className="text-[#6C5F5F] mt-2">Manage user permissions and access control</p>
          
          {/* Debug Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Session Status:</strong> {session ? `✅ Logged in as ${session.username} (${session.role})` : '❌ No session found'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              <strong>Device:</strong> {navigator.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'} | 
              <strong> Browser:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  console.log('=== RESET BUTTON DEBUG ===');
                  console.log('Current session:', authService.getSession());
                  console.log('LocalStorage:', localStorage.getItem('mufe_auth_session'));
                  console.log('User agent:', navigator.userAgent);
                  console.log('Device type:', navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop');
                  setError('Check browser console for session debug info');
                  setTimeout(() => setError(''), 3000);
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Debug Session
              </button>
              <button
                onClick={() => {
                  const testReset = async () => {
                    console.log('=== DIRECT RESET TEST ===');
                    try {
                      const session = authService.getSession();
                      const response = await fetch('/api/admin/permissions/user1', {
                        method: 'DELETE',
                        headers: { 'X-User-Role': session?.role || 'superadmin' }
                      });
                      const result = await response.json();
                      console.log('Direct API test result:', result);
                      setSuccessMessage(`Direct API test: ${result.message || 'Success'}`);
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } catch (err) {
                      console.error('Direct API test failed:', err);
                      setError(`Direct API test failed: ${err.message}`);
                      setTimeout(() => setError(''), 3000);
                    }
                  };
                  testReset();
                }}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Test API Direct
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg font-semibold text-lg">
            ⚠️ Error: {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg font-semibold text-lg">
            ✅ Success: {successMessage}
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-[#E0AFA0]/30">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-[#A62639] border-b-2 border-[#A62639]'
                : 'text-[#6C5F5F] hover:text-[#A62639]'
            }`}
          >
            All Users
          </button>
          {selectedUser && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'permissions'
                  ? 'text-[#A62639] border-b-2 border-[#A62639]'
                  : 'text-[#6C5F5F] hover:text-[#A62639]'
              }`}
            >
              {selectedUser} Permissions
            </button>
          )}
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-[#FAF7F5]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Custom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Modules</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.username} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}>
                    <td className="px-6 py-4 text-sm font-medium text-[#1F1A1A]">{user.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.has_custom_permissions ? '✅' : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6C5F5F]">
                      {user.modules_enabled.length}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'superadmin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchUserPermissions(user.username)}
                            className="px-3 py-1 bg-[#A62639] text-white text-xs rounded hover:bg-[#8a1f2d]"
                          >
                            Edit
                          </button>
                          {user.has_custom_permissions && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Reset button clicked via onClick');
                                handleResetPermissions(user.username);
                              }}
                              onMouseDown={(e) => {
                                console.log('Reset button mousedown');
                              }}
                              onTouchStart={(e) => {
                                console.log('Reset button touchstart');
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors cursor-pointer select-none"
                              style={{ 
                                touchAction: 'manipulation',
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                              }}
                              data-testid={`reset-user-${user.username}`}
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && permissions && (
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1F1A1A]">{selectedUser}</h2>
                <p className="text-[#6C5F5F]">Role: {permissions.role}</p>
              </div>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(permissions.modules).map(([moduleName, modulePerms]) => (
                <div key={moduleName} className="border border-[#E0AFA0]/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#1F1A1A]">{getModuleLabel(moduleName)}</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-sm text-[#6C5F5F]">Enabled</span>
                      <input
                        type="checkbox"
                        checked={modulePerms.enabled}
                        onChange={() => handleToggleModule(moduleName)}
                        className="w-5 h-5 text-[#A62639] rounded"
                      />
                    </label>
                  </div>

                  {Object.keys(modulePerms.tabs).length > 0 && (
                    <div className="mb-4 pl-4 border-l-2 border-[#E0AFA0]/30">
                      <h4 className="text-sm font-semibold text-[#A62639] mb-3">Tabs</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(modulePerms.tabs).map(([tabName, enabled]) => (
                          <label key={tabName} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => handleToggleTab(moduleName, tabName)}
                              disabled={!modulePerms.enabled}
                              className="w-4 h-4 text-[#A62639] rounded"
                            />
                            <span className={modulePerms.enabled ? 'text-[#1F1A1A]' : 'text-gray-400'}>
                              {formatName(tabName)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(modulePerms.actions).length > 0 && (
                    <div className="pl-4 border-l-2 border-[#E0AFA0]/30">
                      <h4 className="text-sm font-semibold text-[#A62639] mb-3">Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(modulePerms.actions).map(([actionName, enabled]) => (
                          <label key={actionName} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => handleToggleAction(moduleName, actionName)}
                              disabled={!modulePerms.enabled}
                              className="w-4 h-4 text-[#A62639] rounded"
                            />
                            <span className={modulePerms.enabled ? 'text-[#1F1A1A]' : 'text-gray-400'}>
                              {formatName(actionName)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
