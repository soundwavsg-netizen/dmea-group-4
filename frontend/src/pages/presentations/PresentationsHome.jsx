import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, GitBranch, ArrowRight, Plus, Video, Trash2 } from 'lucide-react';
import axios from 'axios';
import authService from '../../services/authService';
import AddPresentationModal from '../../components/AddPresentationModal';
import PresentationViewerModal from '../../components/PresentationViewerModal';

const PresentationsHome = () => {
  const [customPresentations, setCustomPresentations] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const session = authService.getSession();
  const isSuperAdmin = authService.isSuperAdmin();

  const presentations = [
    {
      id: 1,
      title: 'Friendly Persona Brief',
      description: 'An accessible introduction to our persona generation process, perfect for stakeholders and non-technical team members.',
      slides: 4,
      icon: FileText,
      path: '/presentations/friendly-brief',
      color: 'from-[#A62639] to-[#8a1f2d]'
    },
    {
      id: 2,
      title: 'Cluster & Persona Technical Slides',
      description: 'Deep dive into the technical methodology, algorithms, and data science behind our insight-to-persona pipeline.',
      slides: 5,
      icon: GitBranch,
      path: '/presentations/clustering-technical',
      color: 'from-[#E0AFA0] to-[#d4a090]'
    }
  ];

  // Fetch custom presentations
  useEffect(() => {
    fetchCustomPresentations();
  }, []);

  const fetchCustomPresentations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/presentations`, {
        headers: {
          'X-User-Name': session?.username || session?.email
        }
      });
      setCustomPresentations(response.data.presentations || []);
    } catch (error) {
      console.error('Error fetching custom presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (presentationId) => {
    if (!window.confirm('Are you sure you want to delete this presentation?')) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/presentations/${presentationId}`, {
        headers: {
          'X-User-Role': session?.role
        }
      });
      fetchCustomPresentations();
    } catch (error) {
      alert('Failed to delete presentation');
      console.error('Error deleting presentation:', error);
    }
  };

  const handleViewPresentation = (presentation) => {
    setSelectedPresentation(presentation);
    setViewerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Presentations
              </h1>
              <p className="text-xl text-[#6C5F5F] max-w-3xl">
                Comprehensive presentation decks explaining our user research and persona generation methodology
              </p>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#A62639] text-white rounded-lg font-semibold hover:bg-[#8a1f2d] transition-colors shadow-lg"
              data-testid="add-presentation-btn"
            >
              <Plus size={20} />
              Add Presentation
            </button>
          </div>
        </div>

        {/* All Presentations Grid - Custom + Default */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Custom User Presentations */}
          {customPresentations.map((presentation, index) => {
            const Icon = presentation.file_type === 'video' ? Video : FileText;
            const colors = [
              'from-[#A62639] to-[#8a1f2d]',
              'from-[#E0AFA0] to-[#d4a090]',
              'from-[#6C5F5F] to-[#5a4f4f]',
              'from-[#8B4513] to-[#6e3610]'
            ];
            const color = colors[index % colors.length];
            
            return (
              <div
                key={presentation.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative"
              >
                {/* Color Header */}
                <div className={`h-32 bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                  <Icon className="w-20 h-20 text-white z-10" strokeWidth={1.5} />
                  
                  {/* Delete button for superadmin */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(presentation.id)}
                      className="absolute top-3 right-3 text-white hover:text-red-200 transition-colors p-2 hover:bg-white/20 rounded-lg z-20"
                      data-testid={`delete-presentation-${presentation.id}`}
                      title="Delete presentation"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <button
                  onClick={() => handleViewPresentation(presentation)}
                  className="block p-8 w-full text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-[#333333] group-hover:text-[#A62639] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {presentation.name}
                    </h3>
                    <span className="flex-shrink-0 px-3 py-1 bg-[#E0AFA0]/20 text-[#A62639] text-xs font-semibold rounded-full">
                      Custom
                    </span>
                  </div>

                  <p className="text-[#6C5F5F] leading-relaxed mb-6">
                    {presentation.description}
                  </p>

                  <div className="flex items-center text-[#A62639] font-semibold group-hover:gap-3 transition-all">
                    <span>View {presentation.file_type === 'video' ? 'Video' : 'Presentation'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            );
          })}

          {/* Default Presentations */}
          {presentations.map((presentation) => {
            const Icon = presentation.icon;
            return (
              <Link
                key={presentation.id}
                to={presentation.path}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                data-testid={`presentation-card-${presentation.id}`}
              >
                {/* Color Header */}
                <div className={`h-32 bg-gradient-to-br ${presentation.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                  <Icon className="w-20 h-20 text-white z-10" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-[#333333] group-hover:text-[#A62639] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {presentation.title}
                    </h3>
                    <span className="flex-shrink-0 px-3 py-1 bg-[#E0AFA0]/20 text-[#A62639] text-sm font-semibold rounded-full">
                      {presentation.slides} slides
                    </span>
                  </div>

                  <p className="text-[#6C5F5F] leading-relaxed mb-6">
                    {presentation.description}
                  </p>

                  <div className="flex items-center text-[#A62639] font-semibold group-hover:gap-3 transition-all">
                    <span>View Presentation</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#333333] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            About These Presentations
          </h2>
          <div className="space-y-4 text-[#6C5F5F]">
            <p>
              These presentation decks provide comprehensive insights into our persona generation methodology. Each deck is designed for different audiences and use cases:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#A62639] mt-1">•</span>
                <span><strong>Friendly Persona Brief:</strong> Perfect for client presentations, stakeholder briefings, and team onboarding. Uses accessible language and focuses on practical outcomes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A62639] mt-1">•</span>
                <span><strong>Technical Slides:</strong> Ideal for data science teams, technical audits, and methodology documentation. Includes algorithmic details and mathematical foundations.</span>
              </li>
            </ul>
            <p className="text-sm italic border-l-4 border-[#E0AFA0] pl-4 mt-6">
              All presentations feature internal pagination for easy navigation. Use the Previous/Next buttons at the bottom of each deck to move between slides.
            </p>
          </div>
        </div>
      </div>

      {/* Add Presentation Modal */}
      <AddPresentationModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCustomPresentations}
      />

      {/* Presentation Viewer Modal */}
      <PresentationViewerModal
        isOpen={viewerModalOpen}
        onClose={() => {
          setViewerModalOpen(false);
          setSelectedPresentation(null);
        }}
        presentation={selectedPresentation}
      />
    </div>
  );
};

export default PresentationsHome;
