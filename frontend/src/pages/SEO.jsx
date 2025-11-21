import React from 'react';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const SEO = () => {
  const navigate = useNavigate();

  const modules = [
    { title: 'SEO Audit', path: '/seo/audit', icon: '🔍', desc: 'Analyze current website performance' },
    { title: 'Keywords', path: '/seo/keywords', icon: '🔑', desc: 'Research and track keywords' },
    { title: 'Content', path: '/seo/content', icon: '📝', desc: 'Manage content strategy' },
    { title: 'Strategy', path: '/seo/strategy', icon: '📊', desc: 'Plan SEO campaigns' }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-[#F8F6F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2">SEO & Content</h1>
          <p className="text-[#6C5F5F] mb-8">Manage search engine optimization and content strategy</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-xl border border-[#E0AFA0]/50 p-8 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h2 className="text-2xl font-bold text-[#1F1A1A] mb-2">{module.title}</h2>
                <p className="text-[#6C5F5F]">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SEO;
