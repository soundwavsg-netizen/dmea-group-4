import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, GripVertical, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import authService from '../services/authService';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState('data-input');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [mappings, setMappings] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const session = authService.getSession();

  const REQUIRED_MAPPINGS = [
    { key: 'platform', label: 'Platform' },
    { key: 'post_type', label: 'Post Type' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'shares', label: 'Shares' },
    { key: 'saves', label: 'Saves' },
    { key: 'views', label: 'Views' },
    { key: 'posting_date', label: 'Posting Date' },
    { key: 'sentiment', label: 'Sentiment' },
    { key: 'key_themes', label: 'Key Themes (optional)' }
  ];

  useEffect(() => {
    loadData();
    loadMappings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/dynamic-data/social_media`, {
        headers: { 'X-User-Name': session?.username }
      });
      setColumns(response.data.columns || []);
      setRows(response.data.rows || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async () => {
    try {
      const response = await axios.get(`${API}/api/column-mapping/social_media`, {
        headers: { 'X-User-Name': session?.username }
      });
      setMappings(response.data.mappings || {});
    } catch (error) {
      console.error('Error loading mappings:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/api/analytics/social_media`, {
        headers: { 'X-User-Name': session?.username }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const cols = Object.keys(results.data[0]);
            const rowsWithIds = results.data.map((row, idx) => ({
              id: `row-${Date.now()}-${idx}`,
              ...row
            }));
            setColumns(cols);
            setRows(rowsWithIds);
            toast.success(`Imported ${rowsWithIds.length} rows`);
          }
        },
        error: (error) => {
          toast.error('Failed to parse CSV file');
          console.error(error);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData && jsonData.length > 0) {
            const cols = Object.keys(jsonData[0]);
            const rowsWithIds = jsonData.map((row, idx) => ({
              id: `row-${Date.now()}-${idx}`,
              ...row
            }));
            setColumns(cols);
            setRows(rowsWithIds);
            toast.success(`Imported ${rowsWithIds.length} rows`);
          }
        } catch (error) {
          toast.error('Failed to parse Excel file');
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Invalid file format. Please upload CSV or XLS/XLSX.');
    }

    event.target.value = '';
  };

  const saveData = async () => {
    try {
      await axios.post(`${API}/api/dynamic-data/social_media`,
        { columns, rows, updated_at: new Date().toISOString() },
        { headers: { 'X-User-Name': session?.username } }
      );
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  const saveMappings = async () => {
    try {
      await axios.post(`${API}/api/column-mapping/social_media`,
        { mappings },
        { headers: { 'X-User-Name': session?.username } }
      );
      toast.success('Mappings saved successfully');
      loadAnalytics();
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast.error('Failed to save mappings');
    }
  };

  const addColumn = () => {
    const newColName = `Column ${columns.length + 1}`;
    setColumns([...columns, newColName]);
    setRows(rows.map(row => ({ ...row, [newColName]: '' })));
  };

  const renameColumn = (oldName, newName) => {
    if (!newName || newName === oldName) return;
    
    const newColumns = columns.map(col => col === oldName ? newName : col);
    const newRows = rows.map(row => {
      const newRow = { ...row };
      if (oldName in newRow) {
        newRow[newName] = newRow[oldName];
        delete newRow[oldName];
      }
      return newRow;
    });
    
    setColumns(newColumns);
    setRows(newRows);
    setEditingColumn(null);
    toast.success('Column renamed');
  };

  const deleteColumn = (colName) => {
    if (!window.confirm(`Delete column "${colName}"?`)) return;
    
    setColumns(columns.filter(col => col !== colName));
    setRows(rows.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    }));
    toast.success('Column deleted');
  };

  const addRow = () => {
    const newRow = { id: `row-${Date.now()}` };
    columns.forEach(col => {
      newRow[col] = '';
    });
    setRows([...rows, newRow]);
  };

  const updateCell = (rowId, colName, value) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, [colName]: value } : row
    ));
  };

  const deleteRow = (rowId) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const exportCSV = () => {
    if (rows.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csv = Papa.unparse(rows.map(row => {
      const cleanRow = { ...row };
      delete cleanRow.id;
      return cleanRow;
    }));

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-[#A62639] mb-2">Social Media Diagnostics</h1>
        <p className="text-[#6C5F5F] mb-8">Upload data, map columns, and analyze performance</p>

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
            onClick={() => setActiveTab('column-mapping')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'column-mapping'
                ? 'text-[#A62639] border-b-2 border-[#A62639]'
                : 'text-[#6C5F5F] hover:text-[#A62639]'
            }`}
          >
            Column Mapping
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              loadAnalytics();
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'text-[#A62639] border-b-2 border-[#A62639]'
                : 'text-[#6C5F5F] hover:text-[#A62639]'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Data Input Tab */}
        {activeTab === 'data-input' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Data Input</CardTitle>
                  <CardDescription>
                    Upload CSV/Excel or manually enter data. Columns are fully customizable.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload').click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV/Excel
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={exportCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={addColumn} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Column
                  </Button>
                  <Button onClick={addRow} size="sm" className="bg-[#A62639] hover:bg-[#8a1f2d]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                  <Button onClick={saveData} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-[#6C5F5F]">Loading...</div>
              ) : columns.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 mx-auto text-[#E0AFA0] mb-4" />
                  <p className="text-[#6C5F5F] mb-4">No data yet. Upload a CSV/Excel file or add columns manually.</p>
                  <Button onClick={() => document.getElementById('file-upload').click()} className="bg-[#A62639] hover:bg-[#8a1f2d]">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-[#FAF7F5]">
                      <tr>
                        {columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-2 text-left font-semibold border">
                            {editingColumn === col ? (
                              <div className="flex gap-2">
                                <Input
                                  value={newColumnName}
                                  onChange={(e) => setNewColumnName(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') renameColumn(col, newColumnName);
                                  }}
                                  className="h-8 text-xs"
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => renameColumn(col, newColumnName)} className="h-8 px-2">
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingColumn(null)} className="h-8 px-2">
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <span>{col}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingColumn(col);
                                      setNewColumnName(col);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteColumn(col)}
                                    className="h-6 w-6 p-0 text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-semibold border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-[#6C5F5F] border">
                            No rows yet. Click "Add Row" to start.
                          </td>
                        </tr>
                      ) : rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAF7F5]">
                          {columns.map((col, idx) => (
                            <td key={idx} className="px-3 py-2 border">
                              <Input
                                value={row[col] || ''}
                                onChange={(e) => updateCell(row.id, col, e.target.value)}
                                className="h-8 text-xs"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 border">
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
                  <div className="mt-4 text-sm text-[#6C5F5F]">
                    {rows.length} rows × {columns.length} columns
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Column Mapping Tab */}
        {activeTab === 'column-mapping' && (
          <Card>
            <CardHeader>
              <CardTitle>Column Mapping</CardTitle>
              <CardDescription>
                Map your uploaded columns to system fields for analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {columns.length === 0 ? (
                <div className="text-center py-12 text-[#6C5F5F]">
                  Please upload data first in the Data Input tab
                </div>
              ) : (
                <div className="space-y-4">
                  {REQUIRED_MAPPINGS.map((field) => (
                    <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                      <Label className="font-semibold">{field.label}:</Label>
                      <select
                        value={mappings[field.key] || ''}
                        onChange={(e) => setMappings({ ...mappings, [field.key]: e.target.value })}
                        className="col-span-2 px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Column --</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <Button onClick={saveMappings} className="w-full bg-[#A62639] hover:bg-[#8a1f2d] mt-6">
                    <Save className="w-4 h-4 mr-2" />
                    Save Mappings & Generate Analytics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Insights based on your mapped data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analytics ? (
                <div className="text-center py-12 text-[#6C5F5F]">
                  Loading analytics...
                </div>
              ) : analytics.error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{analytics.error}</p>
                  <p className="text-[#6C5F5F]">Please complete column mapping to generate analytics.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.total_posts}</div>
                        <div className="text-sm text-[#6C5F5F]">Total Posts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.total_likes?.toLocaleString()}</div>
                        <div className="text-sm text-[#6C5F5F]">Total Likes</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.avg_engagement_rate}%</div>
                        <div className="text-sm text-[#6C5F5F]">Avg Engagement Rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Platform Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analytics.platform_performance || {}).map(([platform, stats]) => (
                          <div key={platform} className="flex justify-between items-center p-3 bg-[#FAF7F5] rounded">
                            <span className="font-semibold">{platform}</span>
                            <span className="text-[#6C5F5F]">{stats.posts} posts | {stats.engagement} total engagement</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Pillars */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Pillar Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analytics.content_pillars || {}).map(([type, stats]) => (
                          <div key={type} className="flex justify-between items-center p-3 bg-[#FAF7F5] rounded">
                            <span className="font-semibold">{type}</span>
                            <span className="text-[#6C5F5F]">{stats.count} posts | Avg: {Math.round(stats.avg_engagement)} engagement</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sentiment */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {Object.entries(analytics.sentiment_distribution || {}).map(([sentiment, count]) => (
                          <div key={sentiment} className="flex-1 p-4 bg-[#FAF7F5] rounded text-center">
                            <div className="text-2xl font-bold text-[#A62639]">{count}</div>
                            <div className="text-sm text-[#6C5F5F]">{sentiment}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SocialMedia;
