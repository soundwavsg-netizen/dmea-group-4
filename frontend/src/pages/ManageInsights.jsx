import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const ManageInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState(null);

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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Created At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Created By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Research Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Demographics</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Motivations</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Pain Points</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Behaviours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Channels</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Purchase Intent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Influencer Effect</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.map((insight, index) => (
                    <tr 
                      key={insight.id} 
                      className={`border-b border-[#E0AFA0]/10 hover:bg-[#F8F6F5] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F5]/50'}`}
                    >
                      <td className="px-4 py-3 text-xs text-[#1F1A1A] font-mono">{insight.id.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{formatDate(insight.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A] font-medium">{insight.created_by || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{insight.platform}</td>
                      <td className="px-4 py-3 text-xs text-[#1F1A1A]">{insight.research_method}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">
                        <div>{insight.age_group}</div>
                        <div>{insight.gender}</div>
                        <div>{insight.skin_type}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.products)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatMotivationsOrPains(insight.motivations)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatMotivationsOrPains(insight.pains)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.behaviours)}</td>
                      <td className="px-4 py-3 text-xs text-[#6C5F5F]">{formatArray(insight.channels)}</td>
                      <td className="px-4 py-3 text-xs text-[#A62639] font-semibold">{insight.purchase_intent}</td>
                      <td className="px-4 py-3 text-xs text-[#A62639] font-semibold">{insight.influencer_effect}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteClick(insight)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          data-testid={`delete-insight-${insight.id}`}
                        >
                          Delete
                        </button>
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
      </div>
    </div>
  );
};

export default ManageInsights;
