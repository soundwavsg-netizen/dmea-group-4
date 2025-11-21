import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AGE_GROUPS = ['13-17', '18-24', '25-32', '33-40', '41+', 'Unknown'];
const GENDERS = ['Female', 'Male', 'Nonbinary', 'Not Mentioned'];
const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Unknown'];
const SKIN_TONES = ['Fair', 'Medium', 'Tan', 'Deep', 'Unknown'];
const LIFESTYLES = ['Student', 'Young Working Adult', 'Professional/Manager', 'Stay-home Parent', 'Freelancer/Creative', 'Unknown'];
const PLATFORMS = ['TikTok', 'Instagram', 'Xiaohongshu 小红书', 'YouTube', 'Lazada Review', 'Shopee Review', 'Sephora Review', 'Reddit', 'FB Group', 'Blog/Article', 'Other'];
const METHODS = ['User Interview', 'Contextual Inquiry', 'Fly-on-the-wall', 'Secondary Research', 'Unstructured Observation'];
const PRODUCTS = ['Foundation', 'Concealer', 'Lipstick', 'Powder', 'Primer', 'Blush', 'Setting Spray', 'Others'];
const MOTIVATIONS = ['Natural finish', 'Full coverage', 'Long-lasting', 'Sweat/humidity-proof', 'Quick routine', 'Camera-ready', 'Flawless base', 'Affordable', 'Influencer recommended', 'Easy shade match', 'Lightweight feel', 'Glowy/luminous', 'Buildable coverage'];
const PAIN_POINTS = ['Shade mismatch', 'Oxidation', 'Cakey finish', 'Not long-lasting', 'Melts in humidity', 'Too expensive', 'Irritates skin', 'Hard to blend', 'Not enough coverage', 'Settles into lines', 'Sticky feel', 'Feels heavy', 'Hard to remove'];
const BEHAVIOURS = ['Watches TikTok GRWM', 'Watches review videos', 'Follows MUAs', 'Searches for dupes', 'Compares brands', 'Impulse shopper', 'Research-heavy', 'Buys only during sales', 'Doesn\'t trust influencers'];
const CHANNELS = ['TikTok', 'Instagram', 'Xiaohongshu', 'YouTube', 'LazMall', 'Shopee', 'Sephora', 'Reddit', 'Google'];

const AddInsight = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    age_group: '',
    gender: '',
    skin_type: '',
    skin_tone: '',
    lifestyle: '',
    platform: '',
    research_method: '',
    products: [],
    motivations: [],
    pains: [],
    behaviours: [],
    channels: [],
    purchase_intent: 50,
    influencer_effect: 50,
    quote: '',
    notes: ''
  });

  const [motivationStrengths, setMotivationStrengths] = useState({});
  const [painStrengths, setPainStrengths] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build motivations array with strengths
      const motivations = formData.motivations.map(name => ({
        name,
        strength: motivationStrengths[name] || 50
      }));

      // Build pains array with strengths
      const pains = formData.pains.map(name => ({
        name,
        strength: painStrengths[name] || 50
      }));

      const payload = {
        ...formData,
        motivations,
        pains
      };

      await axios.post(`${API}/insights`, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/report');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit insight');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5]">
      <div className="max-w-[960px] mx-auto px-4 sm:px-8 md:px-20 lg:px-40 py-5">
        <main className="flex-1 py-8 sm:py-12">
          <div className="flex flex-wrap justify-between gap-4 p-4 mb-8">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-[#1F1A1A] text-4xl sm:text-5xl font-bold leading-tight">Add New Insight</p>
              <p className="text-[#6C5F5F] text-base font-normal leading-normal">
                Fill in the details below to add a new user research insight.
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✓ Insight added successfully! Redirecting to report...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-4">
            {/* User Profile */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group" open>
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">👤</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">User Profile</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Age Group *</p>
                    <select
                      required
                      value={formData.age_group}
                      onChange={(e) => setFormData({...formData, age_group: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="age-group-select"
                    >
                      <option value="">Select Age Group</option>
                      {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Gender *</p>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="gender-select"
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map(gender => <option key={gender} value={gender}>{gender}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Skin Type *</p>
                    <select
                      required
                      value={formData.skin_type}
                      onChange={(e) => setFormData({...formData, skin_type: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="skin-type-select"
                    >
                      <option value="">Select Skin Type</option>
                      {SKIN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Skin Tone *</p>
                    <select
                      required
                      value={formData.skin_tone}
                      onChange={(e) => setFormData({...formData, skin_tone: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="skin-tone-select"
                    >
                      <option value="">Select Skin Tone</option>
                      {SKIN_TONES.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                    </select>
                  </label>
                </div>
                <label className="flex flex-col">
                  <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Lifestyle *</p>
                  <select
                    required
                    value={formData.lifestyle}
                    onChange={(e) => setFormData({...formData, lifestyle: e.target.value})}
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                    data-testid="lifestyle-select"
                  >
                    <option value="">Select Lifestyle</option>
                    {LIFESTYLES.map(lifestyle => <option key={lifestyle} value={lifestyle}>{lifestyle}</option>)}
                  </select>
                </label>
              </div>
            </details>

            {/* Source Details */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">🔍</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Source Details</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Platform *</p>
                    <select
                      required
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="platform-select"
                    >
                      <option value="">Select Platform</option>
                      {PLATFORMS.map(platform => <option key={platform} value={platform}>{platform}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Research Method *</p>
                    <select
                      required
                      value={formData.research_method}
                      onChange={(e) => setFormData({...formData, research_method: e.target.value})}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white h-12 px-4 text-base font-normal leading-normal"
                      data-testid="method-select"
                    >
                      <option value="">Select Method</option>
                      {METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </details>

            {/* Products */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">💄</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Products Mentioned</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {PRODUCTS.map(product => (
                    <button
                      key={product}
                      type="button"
                      onClick={() => toggleArrayItem('products', product)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.products.includes(product)
                          ? 'bg-[#A62639] text-white'
                          : 'bg-white border border-[#E0AFA0] text-[#6C5F5F] hover:border-[#A62639]'
                      }`}
                      data-testid={`product-${product}`}
                    >
                      {product}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {/* Motivations */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">❤️</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Motivations</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.map(motivation => (
                    <button
                      key={motivation}
                      type="button"
                      onClick={() => toggleArrayItem('motivations', motivation)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.motivations.includes(motivation)
                          ? 'bg-[#A62639] text-white'
                          : 'bg-white border border-[#E0AFA0] text-[#6C5F5F] hover:border-[#A62639]'
                      }`}
                      data-testid={`motivation-${motivation}`}
                    >
                      {motivation}
                    </button>
                  ))}
                </div>
                {formData.motivations.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm text-[#6C5F5F]">Set strength for each selected motivation:</p>
                    {formData.motivations.map(motivation => (
                      <div key={motivation} className="flex items-center gap-4">
                        <label className="min-w-[200px] text-sm text-[#1F1A1A]">{motivation}</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={motivationStrengths[motivation] || 50}
                          onChange={(e) => setMotivationStrengths({...motivationStrengths, [motivation]: parseInt(e.target.value)})}
                          className="flex-1 h-2 bg-[#E0AFA0]/30 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="min-w-[40px] text-sm text-[#1F1A1A] font-medium">{motivationStrengths[motivation] || 50}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>

            {/* Pain Points */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">😞</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Pain Points</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PAIN_POINTS.map(pain => (
                    <button
                      key={pain}
                      type="button"
                      onClick={() => toggleArrayItem('pains', pain)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.pains.includes(pain)
                          ? 'bg-[#A62639] text-white'
                          : 'bg-white border border-[#E0AFA0] text-[#6C5F5F] hover:border-[#A62639]'
                      }`}
                      data-testid={`pain-${pain}`}
                    >
                      {pain}
                    </button>
                  ))}
                </div>
                {formData.pains.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm text-[#6C5F5F]">Set strength for each selected pain point:</p>
                    {formData.pains.map(pain => (
                      <div key={pain} className="flex items-center gap-4">
                        <label className="min-w-[200px] text-sm text-[#1F1A1A]">{pain}</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={painStrengths[pain] || 50}
                          onChange={(e) => setPainStrengths({...painStrengths, [pain]: parseInt(e.target.value)})}
                          className="flex-1 h-2 bg-[#E0AFA0]/30 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="min-w-[40px] text-sm text-[#1F1A1A] font-medium">{painStrengths[pain] || 50}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>

            {/* Behaviours */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">✓</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Behaviours</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {BEHAVIOURS.map(behaviour => (
                    <button
                      key={behaviour}
                      type="button"
                      onClick={() => toggleArrayItem('behaviours', behaviour)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.behaviours.includes(behaviour)
                          ? 'bg-[#A62639] text-white'
                          : 'bg-white border border-[#E0AFA0] text-[#6C5F5F] hover:border-[#A62639]'
                      }`}
                      data-testid={`behaviour-${behaviour}`}
                    >
                      {behaviour}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {/* Channels */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">🌐</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Channels</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleArrayItem('channels', channel)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.channels.includes(channel)
                          ? 'bg-[#A62639] text-white'
                          : 'bg-white border border-[#E0AFA0] text-[#6C5F5F] hover:border-[#A62639]'
                      }`}
                      data-testid={`channel-${channel}`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
            </details>

            {/* Purchase Intent & Influencer Effect */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">📈</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Purchase Intent & Influencer Effect</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-4 space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#1F1A1A] text-sm font-medium">Purchase Intent: {formData.purchase_intent}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.purchase_intent}
                    onChange={(e) => setFormData({...formData, purchase_intent: parseInt(e.target.value)})}
                    className="w-full h-2 bg-[#E0AFA0]/30 rounded-full appearance-none cursor-pointer"
                    data-testid="purchase-intent-slider"
                  />
                  <div className="flex justify-between text-xs text-[#6C5F5F]"><span>Low</span><span>High</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#1F1A1A] text-sm font-medium">Influencer Effect: {formData.influencer_effect}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.influencer_effect}
                    onChange={(e) => setFormData({...formData, influencer_effect: parseInt(e.target.value)})}
                    className="w-full h-2 bg-[#E0AFA0]/30 rounded-full appearance-none cursor-pointer"
                    data-testid="influencer-effect-slider"
                  />
                  <div className="flex justify-between text-xs text-[#6C5F5F]"><span>Low</span><span>High</span></div>
                </div>
              </div>
            </details>

            {/* Qualitative Notes */}
            <details className="flex flex-col rounded-lg border border-[#E0AFA0]/50 bg-white/50 px-5 py-2 group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none">
                <div className="flex items-center gap-4">
                  <span className="text-[#A62639]">💬</span>
                  <p className="text-[#1F1A1A] text-lg font-bold leading-normal">Qualitative Notes</p>
                </div>
                <span className="text-[#6C5F5F] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pb-4 pt-4 space-y-6">
                <label className="flex flex-col">
                  <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Direct Quote</p>
                  <textarea
                    value={formData.quote}
                    onChange={(e) => setFormData({...formData, quote: e.target.value})}
                    className="flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white min-h-[100px] p-4 text-base font-normal leading-normal"
                    placeholder="I'm looking for a foundation that feels weightless but still gives me good coverage..."
                    data-testid="quote-textarea"
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-[#1F1A1A] text-sm font-medium leading-normal pb-2">Researcher's Notes</p>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-md text-[#1F1A1A] focus:outline-0 focus:ring-2 focus:ring-[#A62639] border border-[#E0AFA0] bg-white min-h-[100px] p-4 text-base font-normal leading-normal"
                    placeholder="User expressed a clear preference for products that offer a 'natural' or 'skin-like' finish. Mentioned trying three different brands this year..."
                    data-testid="notes-textarea"
                  />
                </label>
              </div>
            </details>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end p-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-full border-2 border-[#A62639] text-[#A62639] font-semibold hover:bg-[#A62639]/10 transition-colors"
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-[#A62639] text-white font-semibold hover:bg-[#8E1F31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-insight-btn"
              >
                {loading ? 'Submitting...' : 'Submit Insight'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddInsight;
