import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, Save, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const session = authService.getSession();

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
    const newColName = `Extra Column ${columns.length - PRESET_COLUMNS.length + 1}`;
    setColumns([...columns, newColName]);
    setRows(rows.map(row => ({ ...row, [newColName]: '' })));
    toast.success('Extra column added');
  };

  const renameColumn = (oldName, newName) => {
    if (!newName || newName === oldName) return;
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
    const newRow = { id: `row-${Date.now()}` };
    columns.forEach(col => { newRow[col] = ''; });
    setRows([...rows, newRow]);
  };

  const updateCell = (rowId, colName, value) => {
    setRows(rows.map(row => row.id === rowId ? { ...row, [colName]: value } : row));
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
          <button onClick={() => setActiveTab('data-input')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'data-input' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Data Input</button>
          <button onClick={() => setActiveTab('column-mapping')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'column-mapping' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Column Mapping</button>
          <button onClick={() => { setActiveTab('analytics'); loadAnalytics(); }} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'analytics' ? 'text-[#A62639] border-b-2 border-[#A62639]' : 'text-[#6C5F5F] hover:text-[#A62639]'}`}>Analytics</button>
        </div>

        {activeTab === 'data-input' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div><CardTitle>Data Input</CardTitle><CardDescription>Upload CSV/Excel or manually enter data. Preset columns are protected.</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload').click()}><Upload className="w-4 h-4 mr-2" />Upload CSV/Excel</Button>
                  <input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                  <Button onClick={exportCSV} variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
                  <Button onClick={addColumn} size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Add Column</Button>
                  <Button onClick={addRow} size="sm" className="bg-[#A62639] hover:bg-[#8a1f2d]"><Plus className="w-4 h-4 mr-2" />Add Row</Button>
                  <Button onClick={saveData} size="sm" className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Save</Button>
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
                <Button onClick={saveMappings} className="w-full bg-[#A62639] hover:bg-[#8a1f2d] mt-6"><Save className="w-4 h-4 mr-2" />Save Mappings & Generate Analytics</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader><CardTitle>Analytics Dashboard</CardTitle></CardHeader>
            <CardContent>
              {!analytics ? (<div className="text-center py-12 text-[#6C5F5F]">Loading...</div>) : analytics.error ? (<div className="text-center py-12"><p className="text-red-600 mb-4">{analytics.error}</p></div>) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.total_keywords}</div><div className="text-sm text-[#6C5F5F]">Total Keywords</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.total_search_volume?.toLocaleString()}</div><div className="text-sm text-[#6C5F5F]">Total Volume</div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-[#A62639]">{analytics.overview?.avg_keyword_difficulty?.toFixed(1)}</div><div className="text-sm text-[#6C5F5F]">Avg Difficulty</div></CardContent></Card>
                  </div>
                  <Card><CardHeader><CardTitle>Top Opportunities</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><thead className="bg-[#FAF7F5]"><tr><th className="px-4 py-2 text-left">Keyword</th><th className="px-4 py-2 text-left">Volume</th><th className="px-4 py-2 text-left">Difficulty</th><th className="px-4 py-2 text-left">Score</th></tr></thead><tbody>{(analytics.top_opportunities || []).slice(0, 10).map((opp, idx) => (<tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F5]/30'}><td className="px-4 py-2">{opp.keyword}</td><td className="px-4 py-2">{opp.search_volume?.toLocaleString()}</td><td className="px-4 py-2">{opp.keyword_difficulty}</td><td className="px-4 py-2 font-semibold text-[#A62639]">{opp.opportunity_score}</td></tr>))}</tbody></table></CardContent></Card>
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
