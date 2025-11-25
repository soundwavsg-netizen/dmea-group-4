import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const ManageInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/insights`, {
        headers: {
          'X-User-Role': session.role
        }
      });
      setInsights(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleDeleteClick = (insight) => {
    setInsightToDelete(insight);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!insightToDelete) return;

    try {
      await axios.delete(`${backendUrl}/api/insights/${insightToDelete.id}`, {
        headers: {
          'X-User-Role': session.role
        }
      });
      
      // Refresh the list
      await fetchInsights();
      setDeleteModalOpen(false);
      setInsightToDelete(null);
    } catch (err) {
      alert('Failed to delete insight: ' + (err.response?.data?.detail || err.message));
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setInsightToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return 'None';
    return arr.join(', ');
  };

  const formatMotivationsOrPains = (items) => {
    if (!items || items.length === 0) return 'None';
    return items.map(item => `${item.name} (${item.strength})`).join(', ');
  };

  const formatTopMotivationsOrPains = (items, max = 2) => {
    if (!items || items.length === 0) return 'None';
    // Sort by strength descending and take top N
    const sorted = [...items].sort((a, b) => b.strength - a.strength);
    const top = sorted.slice(0, max);
    return top.map(item => `${item.name} (${item.strength})`).join(', ');
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDemographics = (insight) => {
    return `${insight.age_group || 'N/A'} / ${insight.gender || 'N/A'} / ${insight.skin_type || 'N/A'}`;
  };

  const handleViewDetail = (insight) => {
    setSelectedInsight(insight);
    setDetailModalOpen(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedInsights = [...insights].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle null/undefined values
    if (!aVal && !bVal) return 0;
    if (!aVal) return sortDirection === 'asc' ? 1 : -1;
    if (!bVal) return sortDirection === 'asc' ? -1 : 1;

    // Date comparison
    if (sortField === 'created_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
          <p className="mt-4 text-[#6C5F5F]">Loading insights...</p>
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
            onClick={fetchInsights}
            className="px-6 py-2 bg-[#A62639] text-white rounded-full hover:bg-[#8E1F31]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5] overflow-x-hidden max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1F1A1A]">Manage Insights</h1>
          <p className="text-[#6C5F5F] mt-2">View and manage all user research insights</p>
          <p className="text-sm text-[#A62639] mt-1">Total Insights: {insights.length}</p>
        </div>

        {insights.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 p-12 shadow-sm text-center">
            <p className="text-[#6C5F5F]">No insights found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E0AFA0]/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-[#E0AFA0]/20 border-b border-[#E0AFA0]/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Document ID</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase cursor-pointer hover:bg-[#E0AFA0]/30 transition-colors"
                      onClick={() => handleSort('created_at')}
                      data-testid="sort-created-at"
                    >
                      <div className="flex items-center gap-1">
                        Created At
                        {sortField === 'created_at' && (
                          <span className="text-[#A62639]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase cursor-pointer hover:bg-[#E0AFA0]/30 transition-colors"
                      onClick={() => handleSort('created_by')}
                      data-testid="sort-created-by"
                    >
                      <div className="flex items-center gap-1">
                        Created By
                        {sortField === 'created_by' && (
                          <span className="text-[#A62639]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Research Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Demographics</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Quote</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Behaviours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Channels</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Intent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Influence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInsights.map((insight, index) => (
                    <tr 
                      key={insight.id} 
                      className={`border-b border-[#E0AFA0]/10 hover:bg-[#F8F6F5] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F5]/50'}`}
                    >
                      <td className="px-4 py-3 text-xs text-[#1F1A1A] font-mono">{insight.id.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{formatDate(insight.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A] font-medium">{insight.created_by || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{insight.platform}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{insight.research_method}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatDemographics(insight)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F] italic" title={insight.quote}>
                        {truncateText(insight.quote, 40)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{truncateText(insight.notes, 40)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.products)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.behaviours)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.channels)}</td>
                      <td className="px-4 py-3 text-xs text-[#A62639] font-semibold">{insight.purchase_intent}</td>
                      <td className="px-4 py-3 text-xs text-[#A62639] font-semibold">{insight.influencer_effect}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(insight)}
                            className="px-3 py-1 bg-[#A62639] text-white text-xs rounded hover:bg-[#8a1f2d] transition-colors"
                            data-testid={`view-insight-${insight.id}`}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteClick(insight)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            data-testid={`delete-insight-${insight.id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="delete-modal">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-[#1F1A1A] mb-4">Confirm Delete</h3>
              <p className="text-[#6C5F5F] mb-6">
                Are you sure you want to delete this insight?<br/>
                <span className="text-xs font-mono mt-2 block">ID: {insightToDelete?.id}</span>
                <span className="text-xs mt-1 block">Created by: {insightToDelete?.created_by || 'N/A'}</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  data-testid="confirm-delete"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-200 text-[#1F1A1A] rounded-lg hover:bg-gray-300 transition-colors"
                  data-testid="cancel-delete"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail View Modal */}
        {detailModalOpen && selectedInsight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="detail-modal">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[#1F1A1A]">Insight Details</h3>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="text-[#6C5F5F] hover:text-[#A62639] transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#6C5F5F]">ID:</span> <span className="font-mono text-xs">{selectedInsight.id}</span></div>
                    <div><span className="text-[#6C5F5F]">Created:</span> {formatDate(selectedInsight.created_at)}</div>
                    <div><span className="text-[#6C5F5F]">Created By:</span> {selectedInsight.created_by || 'N/A'}</div>
                    <div><span className="text-[#6C5F5F]">Platform:</span> {selectedInsight.platform}</div>
                    <div><span className="text-[#6C5F5F]">Research Method:</span> {selectedInsight.research_method}</div>
                  </div>
                </div>

                {/* Demographics */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Demographics</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#6C5F5F]">Age Group:</span> {selectedInsight.age_group}</div>
                    <div><span className="text-[#6C5F5F]">Gender:</span> {selectedInsight.gender}</div>
                    <div><span className="text-[#6C5F5F]">Skin Type:</span> {selectedInsight.skin_type}</div>
                    <div><span className="text-[#6C5F5F]">Skin Tone:</span> {selectedInsight.skin_tone}</div>
                    <div><span className="text-[#6C5F5F]">Lifestyle:</span> {selectedInsight.lifestyle}</div>
                  </div>
                </div>

                {/* Quote */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-[#A62639] mb-2">Quote</h4>
                  <p className="text-sm italic text-[#6C5F5F] bg-[#F8F6F5] p-4 rounded-lg">
                    "{selectedInsight.quote || 'No quote provided'}"
                  </p>
                </div>

                {/* Researcher Notes */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-[#A62639] mb-2">Researcher Notes</h4>
                  <p className="text-sm text-[#6C5F5F] bg-[#F8F6F5] p-4 rounded-lg whitespace-pre-wrap">
                    {selectedInsight.notes || 'No notes provided'}
                  </p>
                </div>

                {/* Motivations */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Motivations</h4>
                  <div className="space-y-1 text-sm">
                    {selectedInsight.motivations && selectedInsight.motivations.length > 0 ? (
                      selectedInsight.motivations.map((m, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                          <span>{m.name}</span>
                          <span className="font-semibold text-[#A62639]">{m.strength}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#6C5F5F]">None</p>
                    )}
                  </div>
                </div>

                {/* Pain Points */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Pain Points</h4>
                  <div className="space-y-1 text-sm">
                    {selectedInsight.pains && selectedInsight.pains.length > 0 ? (
                      selectedInsight.pains.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                          <span>{p.name}</span>
                          <span className="font-semibold text-[#A62639]">{p.strength}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#6C5F5F]">None</p>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Products Mentioned</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsight.products && selectedInsight.products.length > 0 ? (
                      selectedInsight.products.map((product, i) => (
                        <span key={i} className="px-3 py-1 bg-[#E0AFA0]/20 text-[#6C5F5F] rounded-full text-xs">
                          {product}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#6C5F5F]">None</p>
                    )}
                  </div>
                </div>

                {/* Behaviours */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Behaviours</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsight.behaviours && selectedInsight.behaviours.length > 0 ? (
                      selectedInsight.behaviours.map((behaviour, i) => (
                        <span key={i} className="px-3 py-1 bg-[#E0AFA0]/20 text-[#6C5F5F] rounded-full text-xs">
                          {behaviour}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#6C5F5F]">None</p>
                    )}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsight.channels && selectedInsight.channels.length > 0 ? (
                      selectedInsight.channels.map((channel, i) => (
                        <span key={i} className="px-3 py-1 bg-[#E0AFA0]/20 text-[#6C5F5F] rounded-full text-xs">
                          {channel}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#6C5F5F]">None</p>
                    )}
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h4 className="font-semibold text-[#A62639] mb-2">Scores</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                      <span>Purchase Intent:</span>
                      <span className="font-semibold text-[#A62639]">{selectedInsight.purchase_intent}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F8F6F5] px-3 py-2 rounded">
                      <span>Influencer Effect:</span>
                      <span className="font-semibold text-[#A62639]">{selectedInsight.influencer_effect}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-6 py-2 bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInsights;
