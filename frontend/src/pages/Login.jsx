import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = authService.login(username, password);
      
      // Redirect to home page for all users
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F8F6F5] to-[#F3ECE7] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#A62639] mb-2">
              MUFE Group 4
            </h1>
            <p className="text-[#6C5F5F] text-sm">
              User Research + Persona Generator
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-[#1F1A1A] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E0AFA0] focus:outline-none focus:ring-2 focus:ring-[#A62639] text-[#1F1A1A]"
                placeholder="Enter your username"
                required
                data-testid="login-username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#1F1A1A] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E0AFA0] focus:outline-none focus:ring-2 focus:ring-[#A62639] text-[#1F1A1A]"
                placeholder="Enter your password"
                required
                data-testid="login-password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A62639] text-white py-3 rounded-lg font-semibold hover:bg-[#8E1F31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#E0AFA0]/30">
            <p className="text-xs text-[#6C5F5F] text-center mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-xs text-[#6C5F5F]">
              <div className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                <span>Admin:</span>
                <span className="font-mono">admin / admin888</span>
              </div>
              <div className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                <span>User 1:</span>
                <span className="font-mono">user1 / mufe123</span>
              </div>
              <div className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                <span>User 2:</span>
                <span className="font-mono">user2 / team2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
