import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';
import authService from '../services/authService';
import AddReflectionModal from '../components/AddReflectionModal';
import EditReflectionModal from '../components/EditReflectionModal';
import ViewReflectionModal from '../components/ViewReflectionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const DailyReflections = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();

  const fetchReflections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/daily-reflections`, {
        headers: {
          'X-User-Role': session.role,
          'X-User-Permissions': session.permissions?.daily_reflections ? 'daily_reflections' : ''
        }
      });
      setReflections(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch reflections');
      console.error('Error fetching reflections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleEditClick = (reflection) => {
    setSelectedReflection(reflection);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (reflection) => {
    setSelectedReflection(reflection);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReflection) return;

    try {
      await axios.delete(`${backendUrl}/api/daily-reflections/${selectedReflection.id}`, {
        headers: {
          'X-User-Role': session.role,
          'X-User-Permissions': session.permissions?.daily_reflections ? 'daily_reflections' : ''
        }
      });
      
      await fetchReflections();
      setDeleteModalOpen(false);
      setSelectedReflection(null);
    } catch (err) {
      alert('Failed to delete reflection: ' + (err.response?.data?.detail || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReflections = [...reflections].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (!aVal && !bVal) return 0;
    if (!aVal) return sortDirection === 'asc' ? 1 : -1;
    if (!bVal) return sortDirection === 'asc' ? -1 : 1;

    if (sortField === 'created_at' || sortField === 'updated_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-[#F8F6F5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Daily Reflections
          </h1>
          <p className="text-[#6C5F5F] text-lg">
            Track learning, insights, and personal growth.
          </p>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-3 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-all shadow-md"
            data-testid="add-reflection-btn"
          >
            <span className="text-xl">+</span>
            Add New Reflection
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639]"></div>
            <p className="mt-4 text-[#6C5F5F]">Loading reflections...</p>
          </div>
        ) : (
          /* Reflections Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#FAF7F5]">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-[#333333] cursor-pointer hover:bg-[#F0EBE9]"
                      onClick={() => handleSort('topic')}
                    >
                      <div className="flex items-center gap-2">
                        Topic
                        {sortField === 'topic' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-[#333333] cursor-pointer hover:bg-[#F0EBE9]"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Created Date
                        {sortField === 'created_at' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-[#333333] cursor-pointer hover:bg-[#F0EBE9]"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center gap-2">
                        Last Updated
                        {sortField === 'updated_at' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedReflections.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[#6C5F5F]">
                        No reflections yet. Click "Add New Reflection" to get started!
                      </td>
                    </tr>
                  ) : (
                    sortedReflections.map((reflection) => (
                      <tr key={reflection.id} className="hover:bg-[#FAF7F5] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#333333]">
                            {reflection.topic}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6C5F5F]">
                          {formatDate(reflection.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6C5F5F]">
                          {formatDate(reflection.updated_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(reflection)}
                              className="px-3 py-1.5 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg text-sm font-medium hover:bg-[#E0AFA0]/30 transition-colors"
                              data-testid={`edit-reflection-${reflection.id}`}
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(reflection)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                              data-testid={`delete-reflection-${reflection.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {sortedReflections.length > 0 && (
              <div className="px-6 py-4 bg-[#FAF7F5] border-t border-gray-200">
                <p className="text-sm text-[#6C5F5F]">
                  Showing {sortedReflections.length} reflection{sortedReflections.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddReflectionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchReflections}
      />

      <EditReflectionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReflection(null);
        }}
        reflection={selectedReflection}
        onSuccess={fetchReflections}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedReflection(null);
        }}
        onConfirm={confirmDelete}
        itemName={selectedReflection?.topic || 'this reflection'}
      />
    </div>
  );
};

export default DailyReflections;
