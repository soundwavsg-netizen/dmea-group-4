import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import permissionsService from '../services/permissionsService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Personas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [personas, setPersonas] = useState([]);
  const [editingPersona, setEditingPersona] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  
  const session = authService.getSession();
  const isSuperAdmin = authService.isSuperAdmin();

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const session = authService.getSession();
      const response = await axios.get(`${API}/personas`, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      
      // Sort personas: Star persona first, then by TCSS (highest first)
      const sortedPersonas = response.data.sort((a, b) => {
        // Star persona always first
        if (a.is_star_persona && !b.is_star_persona) return -1;
        if (!a.is_star_persona && b.is_star_persona) return 1;
        
        // Then sort by TCSS (higher first)
        return (b.tcss || 0) - (a.tcss || 0);
      });
      
      setPersonas(sortedPersonas);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (persona) => {
    setEditingPersona(persona.id);
    setEditedData({
      name: persona.name,
      summary_description: persona.summary_description,
      buying_trigger: persona.buying_trigger,
      dominant_motivations: persona.dominant_motivations.join(', '),
      dominant_pain_points: persona.dominant_pain_points.join(', '),
      behaviour_patterns: persona.behaviour_patterns.join(', '),
      channel_preference: persona.channel_preference.join(', '),
      top_products: persona.top_products.join(', '),
      representative_quotes: persona.representative_quotes.join(' | '),
      persona_animated_image_url: persona.persona_animated_image_url
    });
  };

  const handleCancelEdit = () => {
    setEditingPersona(null);
    setEditedData({});
  };

  const handleSave = async (personaId) => {
    try {
      setSaving(true);
      
      // Convert comma-separated strings back to arrays
      const updates = {
        name: editedData.name,
        summary_description: editedData.summary_description,
        buying_trigger: editedData.buying_trigger,
        dominant_motivations: editedData.dominant_motivations.split(',').map(s => s.trim()).filter(s => s),
        dominant_pain_points: editedData.dominant_pain_points.split(',').map(s => s.trim()).filter(s => s),
        behaviour_patterns: editedData.behaviour_patterns.split(',').map(s => s.trim()).filter(s => s),
        channel_preference: editedData.channel_preference.split(',').map(s => s.trim()).filter(s => s),
        top_products: editedData.top_products.split(',').map(s => s.trim()).filter(s => s),
        representative_quotes: editedData.representative_quotes.split('|').map(s => s.trim()).filter(s => s),
        persona_animated_image_url: editedData.persona_animated_image_url
      };

      await axios.put(`${API}/personas/${personaId}`, updates, {
        headers: {
          'X-User-Role': session.role
        }
      });

      // Refresh personas
      await fetchPersonas();
      setEditingPersona(null);
      setEditedData({});
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
          <p className="mt-4 text-[#6C5F5F]">Loading personas...</p>
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
              onClick={fetchPersonas}
              className="px-6 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  if (personas.length === 0) {
    return (
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
    );
  }

  return (
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
          {personas.map((persona, index) => {
            const isBestPersona = index === 0; // First persona after sorting is the best
            return (
              <div
                key={persona.id}
                className={`flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden transition-all hover:shadow-2xl ${
                  isBestPersona 
                    ? 'border-[#FFB6C1] shadow-[0_0_25px_rgba(255,182,193,0.6)] ring-2 ring-[#FFB6C1]/40' 
                    : 'border border-[#E0AFA0]'
                }`}
                data-testid={isBestPersona ? 'best-persona' : `persona-card-${index}`}
              >
              {/* Best Persona Badge */}
              {isBestPersona && (
                <div className="bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] px-4 py-2 text-center">
                  <p className="text-white text-xs font-bold tracking-wide drop-shadow-md">
                    ⭐ BEST PERSONA - Largest User Group
                  </p>
                </div>
              )}
              <div className="p-6 md:p-8">
                {/* Edit Buttons - Show only if user has permission */}
                {(isSuperAdmin || permissionsService.canPerformAction('buyer_persona', 'edit_persona')) && (
                  <div className="flex justify-end gap-2 mb-4">
                    {editingPersona === persona.id ? (
                      <>
                        <button
                          onClick={() => handleSave(persona.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          data-testid="save-persona-btn"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm font-medium"
                          data-testid="cancel-edit-persona-btn"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(persona)}
                        className="px-4 py-2 bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d] transition-colors text-sm font-medium"
                        data-testid="edit-persona-btn"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <img 
                    src={persona.persona_animated_image_url} 
                    alt={persona.name}
                    className="w-24 h-24 rounded-full flex-shrink-0"
                  />
                  <div className="flex flex-col gap-2 pt-2 flex-1">
                    {editingPersona === persona.id ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="text-3xl font-bold text-[#1F1A1A] border-b-2 border-[#A62639] focus:outline-none bg-transparent"
                      />
                    ) : (
                      <h2 className="text-3xl font-bold text-[#1F1A1A]">{persona.name}</h2>
                    )}
                    {editingPersona === persona.id ? (
                      <textarea
                        value={editedData.representative_quotes}
                        onChange={(e) => handleFieldChange('representative_quotes', e.target.value)}
                        placeholder="Pipe-separated quotes: Quote 1 | Quote 2"
                        rows={2}
                        className="text-base italic text-[#6C5F5F] p-2 border-2 border-[#A62639] rounded-lg focus:outline-none resize-none"
                      />
                    ) : (
                      persona.representative_quotes && persona.representative_quotes.length > 0 && (
                        <p className="text-base italic text-[#6C5F5F]">"{persona.representative_quotes[0]}"</p>
                      )
                    )}
                  </div>
                </div>

                {/* Summary Description */}
                {editingPersona === persona.id ? (
                  <textarea
                    value={editedData.summary_description}
                    onChange={(e) => handleFieldChange('summary_description', e.target.value)}
                    rows={3}
                    className="w-full text-base leading-relaxed text-[#1F1A1A] mb-6 p-3 border-2 border-[#A62639] rounded-lg focus:outline-none resize-none"
                  />
                ) : (
                  <p className="text-base leading-relaxed text-[#1F1A1A] mb-6">
                    {persona.summary_description}
                  </p>
                )}

                {/* Demographics */}
                <div className="mb-6 p-4 bg-[#F8F6F5] rounded-lg">
                  <h3 className="text-sm font-bold text-[#A62639] mb-2">Demographics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[#6C5F5F]">Age:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographic_profile?.age_group || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[#6C5F5F]">Gender:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographic_profile?.gender || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[#6C5F5F]">Skin Type:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographic_profile?.skin_type || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[#6C5F5F]">Tone:</span>
                      <span className="ml-2 text-[#1F1A1A] font-medium">{persona.demographic_profile?.tone || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="pt-6 grid grid-cols-1 gap-5">
                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">✨</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1F1A1A] mb-2">Dominant Motivations</p>
                      {editingPersona === persona.id ? (
                        <input
                          type="text"
                          value={editedData.dominant_motivations}
                          onChange={(e) => handleFieldChange('dominant_motivations', e.target.value)}
                          placeholder="Comma-separated motivations"
                          className="w-full text-sm p-2 border-2 border-[#A62639] rounded-lg focus:outline-none"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {persona.dominant_motivations && persona.dominant_motivations.slice(0, 5).map((motivation, i) => (
                            <span key={i} className="px-3 py-1 bg-[#A62639]/10 text-[#A62639] rounded-full text-xs font-medium">
                              {motivation}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">😟</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1F1A1A] mb-2">Pain Points</p>
                      {editingPersona === persona.id ? (
                        <input
                          type="text"
                          value={editedData.dominant_pain_points}
                          onChange={(e) => handleFieldChange('dominant_pain_points', e.target.value)}
                          placeholder="Comma-separated pain points"
                          className="w-full text-sm p-2 border-2 border-[#A62639] rounded-lg focus:outline-none"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {persona.dominant_pain_points && persona.dominant_pain_points.slice(0, 5).map((pain, i) => (
                            <span key={i} className="px-3 py-1 bg-[#E0AFA0]/20 text-[#6C5F5F] rounded-full text-xs font-medium">
                              {pain}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">🛍️</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1F1A1A] mb-2">Behaviours</p>
                      {editingPersona === persona.id ? (
                        <input
                          type="text"
                          value={editedData.behaviour_patterns}
                          onChange={(e) => handleFieldChange('behaviour_patterns', e.target.value)}
                          placeholder="Comma-separated behaviours"
                          className="w-full text-sm p-2 border-2 border-[#A62639] rounded-lg focus:outline-none"
                        />
                      ) : (
                        <p className="text-sm text-[#6C5F5F]">
                          {persona.behaviour_patterns && persona.behaviour_patterns.length > 0 ? persona.behaviour_patterns.join(', ') : 'None identified'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="text-[#E0AFA0] text-2xl">📱</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1F1A1A] mb-2">Preferred Channels</p>
                      {editingPersona === persona.id ? (
                        <input
                          type="text"
                          value={editedData.channel_preference}
                          onChange={(e) => handleFieldChange('channel_preference', e.target.value)}
                          placeholder="Comma-separated channels"
                          className="w-full text-sm p-2 border-2 border-[#A62639] rounded-lg focus:outline-none"
                        />
                      ) : (
                        <p className="text-sm text-[#6C5F5F]">
                          {persona.channel_preference && persona.channel_preference.length > 0 ? persona.channel_preference.join(', ') : 'None identified'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buying Behavior */}
                <div className="mt-6 pt-6 border-t border-[#E0AFA0]/30 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#A62639] mb-1">
                      Purchase Intent: <span className="uppercase">{persona.intent_category}</span>
                    </p>
                    {editingPersona === persona.id ? (
                      <textarea
                        value={editedData.buying_trigger}
                        onChange={(e) => handleFieldChange('buying_trigger', e.target.value)}
                        rows={2}
                        className="w-full text-sm text-[#6C5F5F] p-2 border-2 border-[#A62639] rounded-lg focus:outline-none resize-none"
                      />
                    ) : (
                      <p className="text-sm text-[#6C5F5F]">{persona.buying_trigger}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#A62639] mb-1">
                      Social Media Influence: <span className="uppercase">{persona.influence_category}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#A62639] mb-1">Based on {persona.insight_count} insights</p>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Personas;
