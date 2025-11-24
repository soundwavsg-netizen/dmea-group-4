import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const ChangePasswordModal = ({ isOpen, onClose, username }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  // List of accounts that cannot change password
  const LOCKED_ACCOUNTS = ['user1', 'user2', 'admin', 'admin2'];

  const isAccountLocked = LOCKED_ACCOUNTS.includes(username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${backendUrl}/api/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: {
          'X-User-Name': session.username || session.email
        }
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (isAccountLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Change Password
          </h2>
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              Password change is not allowed for demo account: <strong>{username}</strong>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full px-6 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Change Password
          </h2>
          <p className="text-sm text-[#6C5F5F] mt-1">
            Account: {username}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Password changed successfully!
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="current-password-input"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="new-password-input"
            />
            <p className="text-xs text-[#6C5F5F] mt-1">Minimum 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="confirm-password-input"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-[#6C5F5F] rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="change-password-submit"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
