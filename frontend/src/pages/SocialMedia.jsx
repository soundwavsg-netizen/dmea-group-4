import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState('data-input');
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = authService.getSession();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/social-media-data`, {
        headers: { 'X-User-Name': session?.username }
      });
      setDataRows(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setDataRows([]);
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      platform: 'Instagram',
      postUrl: '',
      postType: 'Tutorial',
      caption: '',
      hashtags: '',
      postingDate: '',
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      views: 0,
      engagementRate: 0,
      sentiment: 'Neutral',
      keyThemes: [],
      notes: ''
    };
    setDataRows([...dataRows, newRow]);
  };

  const updateRow = (id, field, value) => {
    setDataRows(dataRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const deleteRow = (id) => {
    setDataRows(dataRows.filter(row => row.id !== id));
  };

  const saveData = async () => {
    try {
      await axios.post(`${API}/api/social-media-data`, 
        { data: dataRows },
        { headers: { 'X-User-Name': session?.username } }
      );
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  const exportCSV = () => {
    if (dataRows.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Platform', 'Post URL', 'Post Type', 'Caption', 'Hashtags', 'Posting Date', 
                     'Likes', 'Comments', 'Shares', 'Saves', 'Views', 'Engagement Rate (%)', 
                     'Sentiment', 'Key Themes', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => [
        row.platform, row.postUrl, row.postType, 
        `"${row.caption.replace(/"/g, '""')}"`,
        `"${row.hashtags.replace(/"/g, '""')}"`,
        row.postingDate, row.likes, row.comments, row.shares, row.saves, row.views,
        row.engagementRate, row.sentiment,
        `"${(row.keyThemes || []).join(';')}"`,
        `"${row.notes.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-[#A62639] mb-2">Social Media Diagnostics</h1>
        <p className="text-[#6C5F5F] mb-8">Manage and analyze social media performance data</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#E0AFA0]/30">
          <button
            onClick={() => setActiveTab('data-input')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'data-input'
                ? 'text-[#A62639] border-b-2 border-[#A62639]'
                : 'text-[#6C5F5F] hover:text-[#A62639]'
            }`}
          >
            Data Input
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'library'
                ? 'text-[#A62639] border-b-2 border-[#A62639]'
                : 'text-[#6C5F5F] hover:text-[#A62639]'
            }`}
          >
            Library
          </button>
        </div>

        {/* Data Input Tab */}
        {activeTab === 'data-input' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Social Media Performance Data</CardTitle>
                  <CardDescription>
                    Paste raw social media performance data provided by mentor. No scraping or automation needed.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={addNewRow} size="sm" className="bg-[#A62639] hover:bg-[#8a1f2d]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                  <Button onClick={saveData} size="sm" className="bg-green-600 hover:bg-green-700">
                    Save Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-[#6C5F5F]">Loading data...</div>
              ) : dataRows.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#6C5F5F] mb-4">No data entries yet. Click "Add Row" to start.</p>
                  <Button onClick={addNewRow} className="bg-[#A62639] hover:bg-[#8a1f2d]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Row
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[2000px] text-sm">
                    <thead className="bg-[#FAF7F5]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Platform</th>
                        <th className="px-3 py-2 text-left font-semibold">Post URL</th>
                        <th className="px-3 py-2 text-left font-semibold">Post Type</th>
                        <th className="px-3 py-2 text-left font-semibold">Caption</th>
                        <th className="px-3 py-2 text-left font-semibold">Hashtags</th>
                        <th className="px-3 py-2 text-left font-semibold">Date</th>
                        <th className="px-3 py-2 text-left font-semibold">Likes</th>
                        <th className="px-3 py-2 text-left font-semibold">Comments</th>
                        <th className="px-3 py-2 text-left font-semibold">Shares</th>
                        <th className="px-3 py-2 text-left font-semibold">Saves</th>
                        <th className="px-3 py-2 text-left font-semibold">Views</th>
                        <th className="px-3 py-2 text-left font-semibold">Eng. Rate (%)</th>
                        <th className="px-3 py-2 text-left font-semibold">Sentiment</th>
                        <th className="px-3 py-2 text-left font-semibold">Notes</th>
                        <th className="px-3 py-2 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((row, index) => (
                        <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}>
                          <td className="px-3 py-2">
                            <select
                              value={row.platform}
                              onChange={(e) => updateRow(row.id, 'platform', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              <option>TikTok</option>
                              <option>Instagram</option>
                              <option>Facebook</option>
                              <option>YouTube</option>
                              <option>Others</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={row.postUrl}
                              onChange={(e) => updateRow(row.id, 'postUrl', e.target.value)}
                              className="w-32 text-xs"
                              placeholder="URL"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.postType}
                              onChange={(e) => updateRow(row.id, 'postType', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              <option>Tutorial</option>
                              <option>UGC</option>
                              <option>Product Demo</option>
                              <option>Influencer</option>
                              <option>Before/After</option>
                              <option>Review</option>
                              <option>Others</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Textarea
                              value={row.caption}
                              onChange={(e) => updateRow(row.id, 'caption', e.target.value)}
                              className="w-40 text-xs"
                              rows={2}
                              placeholder="Caption"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Textarea
                              value={row.hashtags}
                              onChange={(e) => updateRow(row.id, 'hashtags', e.target.value)}
                              className="w-40 text-xs"
                              rows={2}
                              placeholder="#hashtags"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="date"
                              value={row.postingDate}
                              onChange={(e) => updateRow(row.id, 'postingDate', e.target.value)}
                              className="w-32 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.likes}
                              onChange={(e) => updateRow(row.id, 'likes', parseInt(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.comments}
                              onChange={(e) => updateRow(row.id, 'comments', parseInt(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.shares}
                              onChange={(e) => updateRow(row.id, 'shares', parseInt(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.saves}
                              onChange={(e) => updateRow(row.id, 'saves', parseInt(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              value={row.views}
                              onChange={(e) => updateRow(row.id, 'views', parseInt(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={row.engagementRate}
                              onChange={(e) => updateRow(row.id, 'engagementRate', parseFloat(e.target.value) || 0)}
                              className="w-20 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.sentiment}
                              onChange={(e) => updateRow(row.id, 'sentiment', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              <option>Positive</option>
                              <option>Neutral</option>
                              <option>Negative</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Textarea
                              value={row.notes}
                              onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                              className="w-32 text-xs"
                              rows={2}
                              placeholder="Notes"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              onClick={() => deleteRow(row.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Library Tab - Existing functionality placeholder */}
        {activeTab === 'library' && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[#6C5F5F] text-lg">Social Media Library will be available soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SocialMedia;
