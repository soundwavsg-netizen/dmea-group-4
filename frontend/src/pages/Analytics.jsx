import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, Save, X, BarChart3, TrendingUp, AlertCircle, Target, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import authService from '../services/authService';
import { usePermissions } from '../hooks/usePermissions';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// PRESET COLUMNS - NEVER DELETE THESE
const PRESET_COLUMNS = [
  'Keyword',
  'Search Volume',
  'Keyword Difficulty',
  'Competition Level',
  'Intent',
  'Brand Ranking',
  'Competitor Ranking',
  'Notes'
];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('data-input');
  const [columns, setColumns] = useState(PRESET_COLUMNS);
  const [rows, setRows] = useState([]);
  const [mappings, setMappings] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const session = authService.getSession();
  
  // Permission management
  const { canViewTab, canPerformAction, isSuperadmin, loading: permissionsLoading } = usePermissions('search_marketing_diagnostics');
  
  const CHART_COLORS = ['#A62639', '#E0AFA0', '#2E7D32', '#1769AA', '#B26A00'];

  const REQUIRED_MAPPINGS = [
    { key: 'keyword', label: 'Keyword' },
    { key: 'search_volume', label: 'Search Volume' },
    { key: 'keyword_difficulty', label: 'Keyword Difficulty' },
    { key: 'competition_level', label: 'Competition Level' },
    { key: 'intent', label: 'Intent' },
    { key: 'brand_ranking', label: 'Brand Ranking (optional)' },
    { key: 'competitor_ranking', label: 'Competitor Ranking (optional)' }
  ];

  useEffect(() => {
    loadData();
    loadMappings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/dynamic-data/search_marketing`, {
        headers: { 'X-User-Name': session?.username }
      });
      
      const savedColumns = response.data.columns || [];
      const savedRows = response.data.rows || [];
      
      if (savedColumns.length > 0) {
        const extraColumns = savedColumns.filter(col => !PRESET_COLUMNS.includes(col));
        setColumns([...PRESET_COLUMNS, ...extraColumns]);
      } else {
        setColumns(PRESET_COLUMNS);
      }
      
      setRows(savedRows);
    } catch (error) {
      console.error('Error loading data:', error);
      setColumns(PRESET_COLUMNS);
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async () => {
    try {
      const response = await axios.get(`${API}/api/column-mapping/search_marketing`, {
        headers: { 'X-User-Name': session?.username }
      });
      setMappings(response.data.mappings || {});
    } catch (error) {
      console.error('Error loading mappings:', error);
    }
  };

  const analyzeData = async () => {
    try {
      setAnalyzing(true);
      toast.info('Running analytics engine...');
      
      // Step 1: Run analytics
      const analyticsResponse = await axios.get(`${API}/api/analytics/search_marketing`, {
        headers: { 'X-User-Name': session?.username }
      });
      
      if (analyticsResponse.data.error) {
        toast.error(analyticsResponse.data.error);
        return;
      }
      
      setAnalytics(analyticsResponse.data);
      
      // Step 2: Generate insights
      const insightsResponse = await axios.post(`${API}/api/generate-insights/search_marketing`,
        analyticsResponse.data,
        { headers: { 'X-User-Name': session?.username } }
      );
      
      setInsights(insightsResponse.data);
      toast.success('Analytics complete!');
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast.error('Failed to analyze data');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/api/analytics/search_marketing`, {
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

    const processUploadedData = (jsonData) => {
      if (!jsonData || jsonData.length === 0) {
        toast.error('No data found in file');
        return;
      }

      const uploadedColumns = Object.keys(jsonData[0]);
      const newColumns = uploadedColumns.filter(col => !columns.includes(col));
      const mergedColumns = [...columns, ...newColumns];
      
      const newRows = jsonData.map((row, idx) => {
        const newRow = { id: `row-${Date.now()}-${idx}` };
        mergedColumns.forEach(col => {
          const matchingKey = uploadedColumns.find(uCol => 
            uCol.toLowerCase() === col.toLowerCase()
          );
          newRow[col] = matchingKey ? row[matchingKey] : '';
        });
        return newRow;
      });
      
      setColumns(mergedColumns);
      setRows([...rows, ...newRows]);
      toast.success(`Imported ${newRows.length} rows. Added ${newColumns.length} new columns.`);
    };

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => processUploadedData(results.data),
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
          processUploadedData(jsonData);
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
      await axios.post(`${API}/api/dynamic-data/search_marketing`,
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
      await axios.post(`${API}/api/column-mapping/search_marketing`,
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
    if (!canPerformAction('add_column')) {
      toast.error('You do not have permission to add columns', {
        description: 'Contact your administrator to request access'
      });
      return;
    }
    const newColName = `Extra Column ${columns.length - PRESET_COLUMNS.length + 1}`;
    setColumns([...columns, newColName]);
    setRows(rows.map(row => ({ ...row, [newColName]: '' })));
    toast.success('Extra column added');
  };

  const renameColumn = (oldName, newName) => {
    if (!newName || newName === oldName) return;
    
    // Check permission
    if (!canPerformAction('rename_column')) {
      toast.error('You do not have permission to rename columns', {
        description: 'Contact your administrator to request access'
      });
      setEditingColumn(null);
      return;
    }
    if (PRESET_COLUMNS.includes(oldName)) {
      toast.error('Cannot rename preset columns');
      setEditingColumn(null);
      return;
    }
    
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
    // Check permission
    if (!canPerformAction('delete_column')) {
      toast.error('You do not have permission to delete columns', {
        description: 'Contact your administrator to request access'
      });
      return;
    }
    if (PRESET_COLUMNS.includes(colName)) {
      toast.error('Cannot delete preset columns');
      return;
    }
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
    if (!canPerformAction('add_row')) {
      toast.error('You do not have permission to add rows', {
        description: 'Contact your administrator to request access'
      });
      return;
    }
    const newRow = { id: `row-${Date.now()}` };
    columns.forEach(col => { newRow[col] = ''; });
    setRows([...rows, newRow]);
  };

  const updateCell = (rowId, colName, value) => {
    setRows(rows.map(row => row.id === rowId ? { ...row, [colName]: value } : row));
  };

  const deleteRow = (rowId) => {
    if (!canPerformAction('delete_row')) {
      toast.error('You do not have permission to delete rows', {
        description: 'Contact your administrator to request access'
      });
      return;
    }
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
    a.download = `search-marketing-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  const isPresetColumn = (colName) => PRESET_COLUMNS.includes(colName);

  return (
    <div className="min-h-screen w-full bg-[#F8F6F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-[#A62639] mb-2">Search Marketing Diagnostics</h1>
        <p className="text-[#6C5F5F] mb-8">Upload data, map columns, and analyze keyword opportunities</p>

        <div className="flex gap-4 mb-6 border-b border-[#E0AFA0]/30">
          {canViewTab('data_input') && (
            <button onClick={() => setActiveTab('data-input')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'data-input' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Data Input</button>
          )}
          {canViewTab('column_mapping') && (
            <button onClick={() => setActiveTab('column-mapping')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'column-mapping' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Column Mapping</button>
          )}
          {canViewTab('dashboard') && (
            <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'dashboard' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Dashboard</button>
          )}
          {canViewTab('insight_summary') && (
            <button onClick={() => setActiveTab('insight-summary')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'insight-summary' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Insight Summary</button>
          )}
        </div>

        {activeTab === 'data-input' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div><CardTitle>Data Input</CardTitle><CardDescription>Upload CSV/Excel or manually enter data. Preset columns are protected.</CardDescription></div>
                <div className="flex gap-2">
                  {canPerformAction('upload_csv') && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload').click()}><Upload className="w-4 h-4 mr-2" />Upload CSV/Excel</Button>
                      <input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                    </>
                  )}
                  <Button onClick={exportCSV} variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
                  {canPerformAction('add_column') && (
                    <Button onClick={addColumn} size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Column</Button>
                  )}
                  {canPerformAction('add_row') && (
                    <Button onClick={addRow} size="sm" className="bg-[#A62639] hover:bg-[#8a1f2d]"><Plus className="w-4 h-4 mr-2" />Add Row</Button>
                  )}
                  {canPerformAction('save_data') && (
                    <Button onClick={saveData} size="sm" className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Save</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (<div className="text-center py-8 text-[#6C5F5F]">Loading...</div>) : rows.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 mx-auto text-[#E0AFA0] mb-4" />
                  <p className="text-[#6C5F5F] mb-4">No data yet. Upload a CSV/Excel file or click "Add Row" to start.</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => document.getElementById('file-upload').click()} className="bg-[#A62639] hover:bg-[#8a1f2d]"><Upload className="w-4 h-4 mr-2" />Upload File</Button>
                    <Button onClick={addRow} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Row Manually</Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-[#FAF7F5]">
                      <tr>
                        {columns.map((col, idx) => (
                          <th key={idx} className={`px-3 py-2 text-left font-semibold border ${isPresetColumn(col) ? 'bg-blue-50' : ''}`}>
                            {editingColumn === col && !isPresetColumn(col) ? (
                              <div className="flex gap-2">
                                <Input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} onKeyPress={(e) => {if(e.key==='Enter') renameColumn(col, newColumnName);}} className="h-8 text-xs" autoFocus />
                                <Button size="sm" onClick={() => renameColumn(col, newColumnName)} className="h-8 px-2"><Save className="w-3 h-3" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingColumn(null)} className="h-8 px-2"><X className="w-3 h-3" /></Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <span className="flex items-center gap-2">{col}{isPresetColumn(col) && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Preset</span>}</span>
                                {!isPresetColumn(col) && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingColumn(col); setNewColumnName(col); }} className="h-6 w-6 p-0"><Edit2 className="w-3 h-3" /></Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteColumn(col)} className="h-6 w-6 p-0 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-semibold border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAF7F5]">
                          {columns.map((col, idx) => (<td key={idx} className="px-3 py-2 border"><Input value={row[col] || ''} onChange={(e) => updateCell(row.id, col, e.target.value)} className="h-8 text-xs" /></td>))}
                          <td className="px-3 py-2 border"><Button onClick={() => deleteRow(row.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-[#6C5F5F]">{rows.length} rows × {columns.length} columns ({PRESET_COLUMNS.length} preset, {columns.length - PRESET_COLUMNS.length} extra)</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'column-mapping' && (
          <Card>
            <CardHeader><CardTitle>Column Mapping</CardTitle><CardDescription>Map columns to analytics fields (only preset columns shown)</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {REQUIRED_MAPPINGS.map((field) => (
                  <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                    <Label className="font-semibold">{field.label}:</Label>
                    <select value={mappings[field.key] || ''} onChange={(e) => setMappings({ ...mappings, [field.key]: e.target.value })} className="col-span-2 px-3 py-2 border rounded">
                      <option value="">-- Select Column --</option>
                      {PRESET_COLUMNS.map((col) => (<option key={col} value={col}>{col}</option>))}
                    </select>
                  </div>
                ))}
                <Button 
                  onClick={saveMappings} 
                  disabled={!canPerformAction('perform_mapping')}
                  className="w-full bg-[#A62639] hover:bg-[#8a1f2d] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!canPerformAction('perform_mapping') && <Lock className="w-4 h-4 mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Mappings & Generate Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'dashboard' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Search Marketing Dashboard</CardTitle>
                  <CardDescription>Run analytics to identify keyword opportunities</CardDescription>
                </div>
                <Button 
                  onClick={analyzeData} 
                  disabled={analyzing || rows.length === 0 || !canPerformAction('analyze_data')}
                  className="bg-[#A62639] hover:bg-[#8a1f2d] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="analyze-data-button"
                >
                  {!canPerformAction('analyze_data') ? <Lock className="w-4 h-4 mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  {analyzing ? 'Analyzing...' : 'Analyze Data'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!analytics ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-[#E0AFA0] mb-4" />
                  <p className="text-[#6C5F5F] mb-4">Click "Analyze Data" to discover keyword opportunities.</p>
                </div>
              ) : analytics.error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <p className="text-red-600 mb-4">{analytics.error}</p>
                  {analytics.warnings && analytics.warnings.length > 0 && (
                    <div className="mt-4 text-left max-w-2xl mx-auto">
                      {analytics.warnings.map((warning, idx) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-2">
                          <p className="font-semibold text-yellow-800">{warning.message}</p>
                          {warning.details && warning.details.length > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-yellow-700">View problematic rows</summary>
                              <div className="mt-2 text-xs text-yellow-700 space-y-1">
                                {warning.details.map((detail, dIdx) => (
                                  <div key={dIdx} className="pl-2">Row {detail.row}: {detail.keyword} ({detail.issues})</div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Data Quality Warnings */}
                  {analytics.warnings && analytics.warnings.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4" data-testid="data-quality-warning">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-yellow-800">Data Quality Warning</h3>
                          {analytics.warnings.map((warning, idx) => (
                            <div key={idx} className="mt-2">
                              <p className="text-sm text-yellow-700">{warning.message}</p>
                              {warning.details && warning.details.length > 0 && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800">View affected rows</summary>
                                  <div className="mt-2 bg-white rounded p-3 text-xs text-yellow-800 max-h-40 overflow-y-auto">
                                    {warning.details.map((detail, dIdx) => (
                                      <div key={dIdx} className="py-1 border-b border-yellow-100 last:border-0">
                                        <span className="font-semibold">Row {detail.row}:</span> {detail.keyword}
                                        <span className="text-red-600 ml-2">({detail.issues})</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Overview Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-[#A62639]">{analytics.overview?.total_keywords}</div><div className="text-sm text-[#6C5F5F]">Total Keywords</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-[#A62639]">{analytics.overview?.total_search_volume?.toLocaleString()}</div><div className="text-sm text-[#6C5F5F]">Total Volume</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-[#A62639]">{analytics.overview?.avg_keyword_difficulty?.toFixed(1)}</div><div className="text-sm text-[#6C5F5F]">Avg Difficulty</div></CardContent></Card>
                  </div>

                  {/* Intent Funnel */}
                  {analytics.intent_funnel && analytics.intent_funnel.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Intent Funnel</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.intent_funnel}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2DE" />
                            <XAxis dataKey="intent" tick={{ fontSize: 12, fill: '#6C5F5F' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#6C5F5F' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#A62639" name="Keyword Count" />
                            <Bar dataKey="avg_volume" fill="#E0AFA0" name="Avg Volume" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top 10 Keywords */}
                  {analytics.top_keywords && analytics.top_keywords.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Top 10 Keyword Opportunities</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-[#FAF7F5]">
                              <tr>
                                <th className="px-4 py-2 text-left">Keyword</th>
                                <th className="px-4 py-2 text-left">Intent</th>
                                <th className="px-4 py-2 text-right">Volume</th>
                                <th className="px-4 py-2 text-right">Difficulty</th>
                                <th className="px-4 py-2 text-right">Score</th>
                                <th className="px-4 py-2 text-left">Suggestion</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.top_keywords.map((kw, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}>
                                  <td className="px-4 py-2 font-medium">{kw.keyword}</td>
                                  <td className="px-4 py-2"><Badge variant="outline">{kw.intent}</Badge></td>
                                  <td className="px-4 py-2 text-right">{kw.volume?.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-right">{kw.difficulty}</td>
                                  <td className="px-4 py-2 text-right font-semibold text-[#A62639]">{kw.opportunity_score}</td>
                                  <td className="px-4 py-2 text-xs text-[#6C5F5F] italic">{kw.content_suggestion}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Content Gaps */}
                  {analytics.content_gaps && analytics.content_gaps.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Content Gap Analysis</CardTitle><CardDescription>Keywords where competitors rank but you don't</CardDescription></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-[#FAF7F5]">
                              <tr>
                                <th className="px-4 py-2 text-left">Keyword</th>
                                <th className="px-4 py-2 text-left">Competitor Rank</th>
                                <th className="px-4 py-2 text-right">Volume</th>
                                <th className="px-4 py-2 text-right">Difficulty</th>
                                <th className="px-4 py-2 text-right">Opportunity Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.content_gaps.slice(0, 10).map((gap, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}>
                                  <td className="px-4 py-2 font-medium">{gap.keyword}</td>
                                  <td className="px-4 py-2">{gap.competitor_rank}</td>
                                  <td className="px-4 py-2 text-right">{gap.volume?.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-right">{gap.difficulty}</td>
                                  <td className="px-4 py-2 text-right font-semibold text-[#A62639]">{gap.opportunity_score}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Difficulty Distribution */}
                  {analytics.difficulty_distribution && (
                    <Card>
                      <CardHeader><CardTitle>Keyword Difficulty Distribution</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={Object.entries(analytics.difficulty_distribution).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(analytics.difficulty_distribution).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'insight-summary' && (
          <Card>
            <CardHeader><CardTitle>Insight Summary</CardTitle><CardDescription>Automated insights and keyword strategy</CardDescription></CardHeader>
            <CardContent>
              {!insights ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto text-[#E0AFA0] mb-4" />
                  <p className="text-[#6C5F5F]">Run analytics first to generate insights.</p>
                </div>
              ) : insights.error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{insights.error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Insights */}
                  {insights.top_insights && insights.top_insights.length > 0 && (
                    <Card className="border-[#A62639]">
                      <CardHeader className="bg-[#FAF7F5]"><CardTitle className="text-[#A62639]">Key Insights</CardTitle></CardHeader>
                      <CardContent className="pt-6">
                        <ul className="space-y-3">
                          {insights.top_insights.map((insight, idx) => (
                            <li key={idx} className="flex gap-3">
                              <Badge className="bg-[#A62639] text-white shrink-0">{idx + 1}</Badge>
                              <p className="text-[#6C5F5F]">{insight}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Keyword Opportunities */}
                  {insights.keyword_opportunities && insights.keyword_opportunities.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Keyword Opportunities</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.keyword_opportunities.slice(0, 5).map((kw, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:bg-[#FAF7F5] transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-[#A62639]">{kw.keyword}</p>
                                <Badge className="bg-[#2E7D32] text-white">{kw.opportunity_score}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm text-[#6C5F5F] mb-2">
                                <span>Volume: {kw.volume?.toLocaleString()}</span>
                                <span>Difficulty: {kw.difficulty}</span>
                                <span>Intent: {kw.intent}</span>
                              </div>
                              <p className="text-sm text-[#6C5F5F] italic">{kw.content_suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strategic Recommendations */}
                  {insights.strategic_recommendations && insights.strategic_recommendations.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Strategic Recommendations</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.strategic_recommendations.map((rec, idx) => (
                            <div key={idx} className="p-4 border rounded-lg hover:bg-[#FAF7F5] transition-colors">
                              <div className="flex items-start gap-3">
                                <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>{rec.priority}</Badge>
                                <div className="flex-1">
                                  <p className="font-medium text-[#A62639]">{rec.action}</p>
                                  <p className="text-sm text-[#6C5F5F] mt-1">Expected Impact: {rec.expected_impact}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Priority Actions */}
                  {insights.priority_actions && insights.priority_actions.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>Priority Actions</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {insights.priority_actions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAF7F5] rounded">
                              <div className="w-8 h-8 rounded-full bg-[#A62639] text-white flex items-center justify-center font-bold text-sm">{action.priority}</div>
                              <p className="flex-1 text-[#6C5F5F]">{action.action}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
