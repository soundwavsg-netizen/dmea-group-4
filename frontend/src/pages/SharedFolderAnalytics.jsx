import React, { useState, useEffect } from 'react';
import { FileText, HardDrive, Users, TrendingUp, Download, FolderOpen } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SharedFolderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const session = authService.getSession();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/admin/shared-folder-analytics`, {
        headers: {
          'X-User-Name': session.username,
          'X-User-Role': session.role
        }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F5] flex items-center justify-center">
        <p className="text-[#6C5F5F]">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-[#A62639] text-white rounded-lg hover:bg-[#8a1f2d]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-[#F8F6F5] py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1F1A1A] font-display">Shared Folder Analytics</h1>
          <p className="text-[#6C5F5F] mt-2">Overview of file usage and activity</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Files */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#1769AA]/10 rounded-lg">
                <FileText className="text-[#1769AA]" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1F1A1A]">{analytics.totalFiles}</h3>
            <p className="text-sm text-[#6C5F5F] mt-1">Total Files</p>
          </div>

          {/* Total Storage */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#2E7D32]/10 rounded-lg">
                <HardDrive className="text-[#2E7D32]" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1F1A1A]">{formatBytes(analytics.totalStorageBytes)}</h3>
            <p className="text-sm text-[#6C5F5F] mt-1">Total Storage Used</p>
          </div>

          {/* Folders */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#B26A00]/10 rounded-lg">
                <FolderOpen className="text-[#B26A00]" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1F1A1A]">{analytics.filesByFolder.length}</h3>
            <p className="text-sm text-[#6C5F5F] mt-1">Active Folders</p>
          </div>

          {/* Contributors */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#A62639]/10 rounded-lg">
                <Users className="text-[#A62639]" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1F1A1A]">{analytics.uploadsByUser.length}</h3>
            <p className="text-sm text-[#6C5F5F] mt-1">Contributors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Files by Folder */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1F1A1A] font-display">Files per Folder</h2>
              <FolderOpen className="text-[#6C5F5F]" size={20} />
            </div>
            
            {analytics.filesByFolder.length === 0 ? (
              <p className="text-[#6C5F5F] text-center py-8">No folders with files yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.filesByFolder.slice(0, 10).map((folder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#FAF7F5] rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1F1A1A]">{folder.folderName}</p>
                      <p className="text-xs text-[#6C5F5F] mt-1">{formatBytes(folder.totalSize)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A62639]"
                          style={{
                            width: `${(folder.fileCount / analytics.totalFiles) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-[#1F1A1A] w-12 text-right">
                        {folder.fileCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploads by User */}
          <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1F1A1A] font-display">Top Contributors</h2>
              <TrendingUp className="text-[#6C5F5F]" size={20} />
            </div>
            
            {analytics.uploadsByUser.length === 0 ? (
              <p className="text-[#6C5F5F] text-center py-8">No uploads yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.uploadsByUser.slice(0, 10).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#FAF7F5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A62639] flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F1A1A]">{user.uploaderName}</p>
                        <p className="text-xs text-[#6C5F5F]">{formatBytes(user.totalSize)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#1F1A1A]">
                      {user.fileCount} {user.fileCount === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Downloaded Files */}
        <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1F1A1A] font-display">Most Downloaded Files</h2>
            <Download className="text-[#6C5F5F]" size={20} />
          </div>
          
          {analytics.mostDownloadedFiles.length === 0 ? (
            <p className="text-[#6C5F5F] text-center py-8">No downloads tracked yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAF7F5] border-b border-[#E0AFA0]/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1F1A1A] uppercase">Uploader</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#1F1A1A] uppercase">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostDownloadedFiles.map((file, index) => (
                    <tr key={index} className="border-b border-[#E0AFA0]/20 hover:bg-[#FAF7F5] transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 rounded-full bg-[#A62639] flex items-center justify-center text-white text-xs font-semibold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1F1A1A]">{file.fileName}</td>
                      <td className="px-4 py-3 text-sm text-[#6C5F5F]">{file.uploaderName}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1F1A1A] text-right">{file.downloadCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Timeline */}
        <div className="bg-white rounded-xl border border-[#E0AFA0]/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1F1A1A] font-display">Upload Timeline</h2>
            <TrendingUp className="text-[#6C5F5F]" size={20} />
          </div>
          
          {analytics.uploadTimeline.length === 0 ? (
            <p className="text-[#6C5F5F] text-center py-8">No upload history yet</p>
          ) : (
            <div className="space-y-2">
              {analytics.uploadTimeline.slice(-12).map((period, index) => {
                const maxCount = Math.max(...analytics.uploadTimeline.map(p => p.fileCount));
                const percentage = (period.fileCount / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-[#6C5F5F] w-20 font-mono">{period.period}</span>
                    <div className="flex-1 h-8 bg-[#FAF7F5] rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-[#A62639] transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-[#1F1A1A]">
                        {period.fileCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedFolderAnalytics;
