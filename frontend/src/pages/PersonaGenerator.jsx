import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PersonaGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API}/personas/generate`);
      setResult(response.data);
      
      if (response.data.success) {
        setTimeout(() => {
          navigate('/personas');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate personas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-50">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="80" id="dots" patternTransform="scale(1) rotate(0)" patternUnits="userSpaceOnUse" width="80">
              <rect fill="transparent" height="100%" width="100%" x="0" y="0"></rect>
              <circle cx="40" cy="40" r="2" fill="#E0AFA0" opacity="0.5"></circle>
            </pattern>
          </defs>
          <rect fill="url(#dots)" height="800%" width="800%"></rect>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative flex flex-col items-center">
            {/* Decorative Icon */}
            <div className="hidden lg:block absolute -top-12 -left-20">
              <svg className="w-12 h-12 text-[#E0AFA0] transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>

            <div className="flex max-w-xl flex-col gap-4">
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#1F1A1A] md:text-6xl">
                Create Your Personas
              </h1>
              <p className="text-lg leading-relaxed text-[#6C5F5F]">
                Turn your research into actionable user personas with a single click.
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-md">
                {error}
              </div>
            )}

            {result && !result.success && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 max-w-md">
                {result.message}
              </div>
            )}

            {result && result.success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 max-w-md">
                ✓ {result.message}! Redirecting to personas...
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-[#A62639] text-white text-base font-bold shadow-lg shadow-[#A62639]/30 transition-all hover:bg-[#8E1F31] hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="generate-personas-btn"
              >
                <span className="truncate">{loading ? 'Generating...' : 'Generate Personas'}</span>
              </button>
            </div>

            {/* Decorative Icon */}
            <div className="hidden lg:block absolute -bottom-16 -right-24">
              <svg className="w-12 h-12 text-[#E0AFA0] transform rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>

            <p className="mt-6 cursor-pointer text-sm underline underline-offset-4 text-[#6C5F5F] hover:text-[#A62639] transition-colors">
              What data is used for generation?
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PersonaGenerator;
