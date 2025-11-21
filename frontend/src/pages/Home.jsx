import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-gradient-to-br from-[#F8F6F5] to-[#F3ECE7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#E0AFA0]/30 to-[#F8F6F5] my-10">
          <div className="relative py-20 md:py-32">
            <div className="flex flex-col gap-10 px-4 items-center text-center">
              <div className="flex flex-col gap-4 max-w-3xl">
                <h1 className="text-[#A62639] text-5xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
                  Unlock Deeper User Understanding
                </h1>
                <p className="text-[#6C5F5F] text-lg font-normal leading-normal md:text-xl">
                  Streamline your user research data collection and generate insightful, data-driven personas with ease.
                </p>
              </div>
              <button
                onClick={() => navigate('/add-insight')}
                data-testid="add-first-insight-btn"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#A62639] text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
              >
                <span className="truncate">Add Your First Insight</span>
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="flex flex-col gap-10 px-4 py-10">
          <div className="flex flex-col gap-4 text-center items-center">
            <h1 className="text-[#1F1A1A] tracking-tight text-4xl font-bold leading-tight md:text-5xl max-w-2xl">
              How It Works
            </h1>
            <p className="text-[#6C5F5F] text-base font-normal leading-normal max-w-2xl">
              A simple, elegant solution for your user research workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-0">
            <div className="flex flex-1 gap-4 rounded-xl border border-[#E0AFA0]/50 bg-white/50 p-6 flex-col items-center text-center backdrop-blur-sm hover:shadow-lg transition-shadow">
              <div className="text-[#A62639] bg-[#E0AFA0]/20 p-4 rounded-full">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[#1F1A1A] text-xl font-bold leading-tight">Collect Insights</h2>
                <p className="text-[#6C5F5F] text-sm font-normal leading-normal">
                  Easily add, categorize, and tag qualitative data from your user interviews and research sessions.
                </p>
              </div>
            </div>

            <div className="flex flex-1 gap-4 rounded-xl border border-[#E0AFA0]/50 bg-white/50 p-6 flex-col items-center text-center backdrop-blur-sm hover:shadow-lg transition-shadow">
              <div className="text-[#A62639] bg-[#E0AFA0]/20 p-4 rounded-full">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[#1F1A1A] text-xl font-bold leading-tight">Visualize Data</h2>
                <p className="text-[#6C5F5F] text-sm font-normal leading-normal">
                  Our interactive dashboard helps you identify key patterns and trends across all your collected insights.
                </p>
              </div>
            </div>

            <div className="flex flex-1 gap-4 rounded-xl border border-[#E0AFA0]/50 bg-white/50 p-6 flex-col items-center text-center backdrop-blur-sm hover:shadow-lg transition-shadow">
              <div className="text-[#A62639] bg-[#E0AFA0]/20 p-4 rounded-full">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[#1F1A1A] text-xl font-bold leading-tight">Generate Personas</h2>
                <p className="text-[#6C5F5F] text-sm font-normal leading-normal">
                  Automatically create detailed, shareable personas based on your analyzed research data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className="rounded-xl bg-[#E0AFA0]/30 p-10 md:p-16">
            <div className="flex flex-col justify-center gap-8 px-4 text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                <h1 className="text-[#1F1A1A] tracking-tight text-4xl font-bold leading-tight md:text-5xl max-w-2xl">
                  Ready to Build Better Personas?
                </h1>
                <p className="text-[#6C5F5F] text-lg font-normal leading-normal max-w-xl">
                  Start by adding your first piece of user research and transform data into understanding.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/add-insight')}
                  data-testid="get-started-btn"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#A62639] text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
                >
                  <span className="truncate">Get Started</span>
                </button>
                <button
                  onClick={() => navigate('/report')}
                  data-testid="view-report-btn"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-white border-2 border-[#A62639] text-[#A62639] text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
                >
                  <span className="truncate">View Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
