import React, { useState, useEffect } from 'react';
import { GripVertical, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import moduleOrderService from '../services/moduleOrderService';

const ModuleOrderManager = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const MODULE_LABELS = {
    dashboard: '🏠 Dashboard',
    buyer_persona: '👥 Buyer Persona',
    daily_reflections: '📝 Daily Reflections',
    presentations: '📊 Presentations',
    seo_content: '🔍 SEO & Content',
    social_media: '📱 Social Media Diagnostics',
    analytics: '📊 Search Marketing Diagnostics',
    final_capstone: '🎓 Final Capstone',
    shared_folder: '📁 Shared Folder',
    important_links: '🔗 Important Links'
  };

  useEffect(() => {
    loadModuleOrder();
  }, []);

  const loadModuleOrder = async () => {
    try {
      setLoading(true);
      const order = await moduleOrderService.getOrder();
      setModules(order);
    } catch (error) {
      console.error('Error loading module order:', error);
      toast.error('Failed to load module order');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newModules = [...modules];
    const draggedModule = newModules[draggedIndex];
    
    // Remove from old position
    newModules.splice(draggedIndex, 1);
    // Insert at new position
    newModules.splice(index, 0, draggedModule);
    
    setModules(newModules);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await moduleOrderService.updateOrder(modules);
      toast.success('Module order saved successfully! Refresh to see changes.');
    } catch (error) {
      console.error('Error saving module order:', error);
      toast.error('Failed to save module order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-[#6C5F5F]">Loading module order...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#1F1A1A]">Module Order</CardTitle>
        <CardDescription>
          Drag and drop to reorder sidebar modules. Dashboard will always appear first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-6">
          {modules.map((moduleKey, index) => (
            <div
              key={moduleKey}
              draggable={moduleKey !== 'dashboard'}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-all ${
                moduleKey === 'dashboard' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-move hover:border-[#A62639] hover:shadow-md'
              } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
              data-testid={`module-order-${moduleKey}`}
            >
              {moduleKey !== 'dashboard' && (
                <GripVertical className="w-5 h-5 text-[#6C5F5F]" />
              )}
              <span className="flex-1 font-medium text-[#1F1A1A]">
                {MODULE_LABELS[moduleKey] || moduleKey}
              </span>
              {moduleKey === 'dashboard' && (
                <span className="text-xs text-[#6C5F5F] bg-[#F1D6CD] px-2 py-1 rounded">
                  Fixed Position
                </span>
              )}
            </div>
          ))}
        </div>
        
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#A62639] hover:bg-[#8a1f2d] text-white"
          data-testid="save-module-order"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Module Order'}
        </Button>
        
        <p className="text-xs text-[#6C5F5F] mt-3 text-center">
          Note: Changes will apply to all users. Refresh the page to see the new order.
        </p>
      </CardContent>
    </Card>
  );
};

export default ModuleOrderManager;
