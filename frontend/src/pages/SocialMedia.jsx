import React from 'react';
import Navigation from '../components/Navigation';

const SocialMedia = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-[#F8F6F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2">Social Media Library</h1>
          <p className="text-[#6C5F5F] mb-8">Manage social media content</p>
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-12 text-center">
            <p className="text-[#6C5F5F] text-lg">This module will be available soon.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialMedia;
