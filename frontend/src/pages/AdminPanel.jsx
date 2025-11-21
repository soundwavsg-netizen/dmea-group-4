import React, { useState } from 'react';
import featureFlagService from '../services/featureFlagService';

const AdminPanel = () => {
  const [flags, setFlags] = useState(featureFlagService.getFlags());
  const [message, setMessage] = useState('');

  const handleToggle = (featureName) => {
    featureFlagService.toggleFeature(featureName);
    setFlags(featureFlagService.getFlags());
    setMessage(`Feature "${featureName}" ${flags[featureName] ? 'disabled' : 'enabled'}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all feature flags to defaults?')) {
      featureFlagService.resetToDefaults();
      setFlags(featureFlagService.getFlags());
      setMessage('All flags reset to defaults');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
      
      <div className="min-h-screen w-full bg-[#F8F6F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#A62639] mb-2">Admin Panel</h1>
            <p className="text-[#6C5F5F]">Manage feature flags and system settings</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}

          {/* Feature Flags Section */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E0AFA0]/50 p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1F1A1A]">Feature Flags</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#6C5F5F] text-white rounded-lg text-sm font-semibold hover:bg-[#5A4F4F] transition-colors"
              >
                Reset to Defaults
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#F8F6F5] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#1F1A1A] capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-[#6C5F5F]">
                      {value ? 'Visible to Admins' : 'Hidden from Admins'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-[#A62639]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E0AFA0]/50 p-8">
            <h2 className="text-2xl font-bold text-[#1F1A1A] mb-6">System Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6C5F5F]">Project:</span>
                <span className="font-mono text-[#1F1A1A]">DMEA Group 4 - User Research Portal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C5F5F]">Firebase Project:</span>
                <span className="font-mono text-[#1F1A1A]">dmea-group-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C5F5F]">Version:</span>
                <span className="font-mono text-[#1F1A1A]">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminPanel;
