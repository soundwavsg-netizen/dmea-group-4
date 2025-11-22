import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import InfoTooltip from '../components/InfoTooltip';
import PlatformWeightTable from '../components/PlatformWeightTable';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#A62639', '#E0AFA0', '#2E7D32', '#1769AA', '#B26A00'];

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/report`);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
          <p className="mt-4 text-[#6C5F5F]">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReport}
            className="px-6 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.total_insights === 0) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-[#1F1A1A] mb-4">No Insights Yet</h2>
            <p className="text-[#6C5F5F] mb-6">Start by adding your first user research insight.</p>
            <button
              onClick={() => navigate('/add-insight')}
              className="px-6 py-3 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
              data-testid="add-insight-btn"
            >
              Add Insight
            </button>
          </div>
        </div>
    );
  }

  // Prepare chart data
  const motivationsChartData = reportData.top_motivations.slice(0, 5).map(m => ({
    name: m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name,
    score: Math.round(m.score),
    frequency: m.frequency
  }));

  const painsChartData = reportData.top_pains.slice(0, 5).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    score: Math.round(p.score),
    frequency: p.frequency
  }));

  const channelsChartData = Object.entries(reportData.top_channels).slice(0, 5).map(([name, value]) => ({
    name,
    value
  }));

  const ageDistributionData = Object.entries(reportData.demographics.age_groups).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5] overflow-x-hidden max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1F1A1A]">Research Report</h1>
            <p className="text-[#6C5F5F] mt-2">Insights summary from {reportData.total_insights} research entries</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-insight')}
              className="px-4 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31] transition-colors"
              data-testid="add-more-btn"
            >
              Add More
            </button>
            <button
              onClick={() => navigate('/persona-generator')}
              className="px-4 py-2 border-2 border-[#A62639] text-[#A62639] rounded-full hover:bg-[#A62639] hover:text-white transition-colors"
              data-testid="generate-personas-btn"
            >
              Generate Personas
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <p className="text-sm text-[#6C5F5F] mb-2">Total Insights</p>
            <p className="text-3xl font-bold text-[#A62639]">{reportData.total_insights}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <div className="flex items-center mb-2">
              <p className="text-sm text-[#6C5F5F]">Avg Purchase Intent</p>
              <InfoTooltip 
                content={`Average normalized intent across all entries.
Slider (0–100) → (0–5).`}
                title="Purchase Intent"
              />
            </div>
            <p className="text-3xl font-bold text-[#A62639]">{Math.round(reportData.avg_purchase_intent)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <div className="flex items-center mb-2">
              <p className="text-sm text-[#6C5F5F]">Avg Influencer Effect</p>
              <InfoTooltip 
                content={`Average normalized influencer score.
Slider (0–100) → (0–5).`}
                title="Influencer Effect"
              />
            </div>
            <p className="text-3xl font-bold text-[#A62639]">{Math.round(reportData.avg_influencer_effect)}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <p className="text-sm text-[#6C5F5F] mb-2">Top Motivation</p>
            <p className="text-lg font-bold text-[#1F1A1A]">{reportData.top_motivations[0]?.name || 'N/A'}</p>
          </div>
        </div>

        {/* How Personas Are Formed */}
        <div className="bg-gradient-to-r from-[#E0AFA0]/20 to-[#F8F6F5] rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm mb-6">
          <div className="flex items-center">
            <h3 className="text-xl font-bold text-[#1F1A1A]">ℹ️ How Personas Are Formed</h3>
            <InfoTooltip 
              content={`Personas are generated when:
• ≥ 20% of insights share similar motivations/pains
• AND at least 2 weighted scores ≥ 40

Weighted Score = frequency × normalized strength × platform weight

Normalization: strength slider 0–100 → 0–5.`}
              title="How Personas Are Formed"
            />
          </div>
          <p className="text-sm text-[#6C5F5F] mt-2">
            Personas are created automatically when at least 20% of insights share similar traits and have weighted scores above 40.
          </p>
        </div>

        {/* Platform Weight Table REMOVED - moved to Persona Generator page */}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Top Motivations */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-[#1F1A1A]">Top Motivations</h3>
              <InfoTooltip 
                content={`Raw Score = sum of normalized strength across all insights.
(Strength slider ÷ 20 → converted to 0–5 scale)

Example:
If 3 insights selected "Full Coverage" with strengths 100, 40, 80:
Raw Score = (100/20) + (40/20) + (80/20) = 5 + 2 + 4 = 11`}
                title="Motivations"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={motivationsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0AFA0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#A62639" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Pain Points */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-[#1F1A1A]">Top Pain Points</h3>
              <InfoTooltip 
                content={`Raw Score = sum of normalized strength across all insights.
(Strength slider ÷ 20 → converted to 0–5 scale)

Example:
If 3 insights selected "Oily Skin" with strengths 100, 60, 80:
Raw Score = (100/20) + (60/20) + (80/20) = 5 + 3 + 4 = 12`}
                title="Pain Points"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={painsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0AFA0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#E0AFA0" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1F1A1A] mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Channels */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-[#1F1A1A]">Top Channels</h3>
              <InfoTooltip 
                content="Based on frequency of channels selected in insights."
                title="Channels"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0AFA0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behaviours List */}
        <div className="mt-6 bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-bold text-[#1F1A1A]">Top Behaviours</h3>
            <InfoTooltip 
              content="Based on the frequency of behaviour mentions across insights."
              title="Behaviours"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportData.top_behaviours).slice(0, 9).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center p-3 bg-[#F8F6F5] rounded-lg">
                <span className="text-sm text-[#1F1A1A]">{name}</span>
                <span className="text-sm font-bold text-[#A62639]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="mt-6 bg-white rounded-xl border border-[#E0AFA0]/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1F1A1A] mb-4">Products Mentioned</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(reportData.top_products).map(([name, count]) => (
              <div key={name} className="px-4 py-2 bg-[#E0AFA0]/20 rounded-full border border-[#E0AFA0]">
                <span className="text-sm text-[#1F1A1A] font-medium">{name}</span>
                <span className="ml-2 text-sm text-[#A62639] font-bold">({count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
