import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Personas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/personas`);
      setPersonas(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
            <p className="mt-4 text-[#6C5F5F]">Loading personas...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPersonas}
              className="px-6 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  if (personas.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-[#1F1A1A] mb-4">No Personas Yet</h2>
            <p className="text-[#6C5F5F] mb-6">Generate personas from your research insights.</p>
            <button
              onClick={() => navigate('/persona-generator')}
              className="px-6 py-3 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
              data-testid="generate-btn"
            >
              Generate Personas
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-[#F8F6F5]" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e0afa0\' fill-opacity=\'0.05\'%3E%3Cpath opacity=\'.5\' d=\'M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-10 md:py-16">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-4 mb-12">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A62639] tracking-tight">Meet Your Personas</h1>
            <p className="text-base font-normal leading-normal text-[#6C5F5F]">
              Generated from your latest research insights
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 border-2 border-[#A62639] text-[#A62639] rounded-full hover:bg-[#A62639] hover:text-white transition-colors"
              data-testid="view-report-btn"
            >
              View Report
            </button>
            <button
              onClick={() => navigate('/persona-generator')}
              className="px-4 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31] transition-colors"
              data-testid="regenerate-btn"
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {personas.map((persona, index) => (
            <div
              key={persona.id}
              className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border border-[#E0AFA0] overflow-hidden transition-all hover:shadow-2xl"
              data-testid={`persona-card-${index}`}
            >
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#A62639] to-[#E0AFA0] rounded-full flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold">
                    {persona.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-2 pt-2 flex-1">
                    <h2 className="text-3xl font-bold text-[#1F1A1A]">{persona.name}</h2>
                    {persona.quotes && persona.quotes.length > 0 && (
                      <p className="text-base italic text-[#6C5F5F]">"{persona.quotes[0]}"</p>
                    )}
                  </div>
                </div>

                {/* Background */}
                <p className="text-base leading-relaxed text-[#1F1A1A] mb-6">
                  {persona.background}
                </p>

                {/* Demographics */}
                <div className="mb-6 p-4 bg-[#F8F6F5] rounded-lg">
                  <h3 className="text-sm font-bold text-[#A62639] mb-2">Demographics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#6C5F5F]">Age:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographics.age}</span>
                    </div>
                    <div>
                      <span className="text-[#6C5F5F]">Skin Type:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographics.skin_type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#6C5F5F]">Lifestyle:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographics.lifestyle}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="pt-6 grid grid-cols-1 gap-5">
                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">✨</span>
                    <div>
                      <p className="text-sm font-bold text-[#1F1A1A]">Motivations</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {persona.motivations.slice(0, 5).map((motivation, i) => (
                          <span key={i} className="px-3 py-1 bg-[#A62639]/10 text-[#A62639] rounded-full text-xs font-medium">
                            {motivation}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">😟</span>
                    <div>
                      <p className="text-sm font-bold text-[#1F1A1A]">Pain Points</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {persona.pains.slice(0, 5).map((pain, i) => (
                          <span key={i} className="px-3 py-1 bg-[#E0AFA0]/20 text-[#6C5F5F] rounded-full text-xs font-medium">
                            {pain}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">📱</span>
                    <div>
                      <p className="text-sm font-bold text-[#1F1A1A]">Preferred Channels</p>
                      <p className="text-sm text-[#6C5F5F] mt-1">{persona.channels.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Summaries */}
                {(persona.intent_summary || persona.influence_summary) && (
                  <div className="mt-6 pt-6 border-t border-[#E0AFA0]/30 space-y-3">
                    {persona.intent_summary && (
                      <div>
                        <p className="text-xs font-bold text-[#A62639] mb-1">Purchase Behavior</p>
                        <p className="text-sm text-[#6C5F5F]">{persona.intent_summary}</p>
                      </div>
                    )}
                    {persona.influence_summary && (
                      <div>
                        <p className="text-xs font-bold text-[#A62639] mb-1">Social Media Influence</p>
                        <p className="text-sm text-[#6C5F5F]">{persona.influence_summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Personas;
