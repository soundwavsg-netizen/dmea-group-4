import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const EditReflectionModal = ({ isOpen, onClose, reflection, onSuccess }) => {
  const [formData, setFormData] = useState({
    topic: '',
    key_takeaways: '',
    growth_challenge: '',
    immediate_action: '',
    personal_application: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  // Populate form when reflection changes
  useEffect(() => {
    if (reflection) {
      setFormData({
        topic: reflection.topic || '',
        key_takeaways: reflection.key_takeaways || '',
        growth_challenge: reflection.growth_challenge || '',
        immediate_action: reflection.immediate_action || '',
        personal_application: reflection.personal_application || ''
      });
    }
  }, [reflection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reflection) return;

    setError(null);
    setSaving(true);

    try {
      await axios.put(`${backendUrl}/api/daily-reflections/${reflection.id}`, formData, {
        headers: {
          'X-User-Name': session.username || session.email
        }
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update reflection');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !reflection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Edit Reflection
          </h2>
          <p className="text-sm text-[#6C5F5F] mt-1">
            Created by {reflection.created_by} on {new Date(reflection.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="edit-topic-input"
            />
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Key Takeaways <span className="text-red-500">*</span>
            </label>
            <textarea
              name="key_takeaways"
              value={formData.key_takeaways}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="edit-key-takeaways-input"
            />
          </div>

          {/* Growth Challenge */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Problem-Solving & Growth <span className="text-red-500">*</span>
            </label>
            <textarea
              name="growth_challenge"
              value={formData.growth_challenge}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="edit-growth-challenge-input"
            />
          </div>

          {/* Immediate Action */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Immediate Action (Next 30 Days) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="immediate_action"
              value={formData.immediate_action}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="edit-immediate-action-input"
            />
          </div>

          {/* Personal Application */}
          <div>
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              Personal Application <span className="text-red-500">*</span>
            </label>
            <textarea
              name="personal_application"
              value={formData.personal_application}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A62639] focus:border-transparent"
              data-testid="edit-personal-application-input"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-[#6C5F5F] rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              data-testid="edit-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="update-btn"
            >
              {saving ? 'Updating...' : 'Update Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReflectionModal;