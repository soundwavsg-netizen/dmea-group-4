import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import authService from '../services/authService';
import importantLinksService from '../services/importantLinksService';

const ImportantLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon: 'link'
  });

  const isSuperAdmin = authService.isSuperAdmin();

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await importantLinksService.getAllLinks();
      setLinks(data);
    } catch (error) {
      console.error('Error loading links:', error);
      toast.error('Failed to load important links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!formData.title || !formData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await importantLinksService.createLink(formData);
      toast.success('Link added successfully');
      setIsAddModalOpen(false);
      setFormData({ title: '', url: '', description: '', icon: 'link' });
      loadLinks();
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    }
  };

  const handleEditLink = async () => {
    if (!formData.title || !formData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await importantLinksService.updateLink(selectedLink.id, formData);
      toast.success('Link updated successfully');
      setIsEditModalOpen(false);
      setSelectedLink(null);
      setFormData({ title: '', url: '', description: '', icon: 'link' });
      loadLinks();
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    }
  };

  const handleDeleteLink = async () => {
    try {
      await importantLinksService.deleteLink(selectedLink.id);
      toast.success('Link deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedLink(null);
      loadLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const openEditModal = (link) => {
    setSelectedLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      icon: link.icon || 'link'
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (link) => {
    setSelectedLink(link);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A62639] mx-auto"></div>
          <p className="mt-4 text-[#6C5F5F]">Loading important links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F5] to-[#F1D6CD] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1F1A1A]" data-testid="important-links-title">
              Important Links
            </h1>
            <p className="text-[#6C5F5F] mt-1">Quick access to essential resources</p>
          </div>
          {isSuperAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#A62639] hover:bg-[#8a1f2d] text-white"
              data-testid="add-link-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          )}
        </div>

        {/* Links Grid */}
        {links.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <LinkIcon className="w-16 h-16 mx-auto text-[#E0AFA0] mb-4" />
              <h3 className="text-xl font-semibold text-[#1F1A1A] mb-2">No links yet</h3>
              <p className="text-[#6C5F5F] mb-4">
                {isSuperAdmin
                  ? 'Add your first important link to get started'
                  : 'No important links have been added yet'}
              </p>
              {isSuperAdmin && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#A62639] hover:bg-[#8a1f2d] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Card
                key={link.id}
                className="hover:shadow-lg transition-shadow border-[#E0AFA0]/30"
                data-testid={`link-card-${link.id}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-[#1F1A1A] text-lg flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-[#A62639]" />
                        {link.title}
                      </CardTitle>
                      {link.description && (
                        <CardDescription className="mt-2 text-[#6C5F5F]">
                          {link.description}
                        </CardDescription>
                      )}
                    </div>
                    {isSuperAdmin && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(link)}
                          className="h-8 w-8 p-0 text-[#A62639] hover:bg-[#F1D6CD]"
                          data-testid={`edit-link-${link.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(link)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          data-testid={`delete-link-${link.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#1769AA] hover:text-[#134f7a] font-medium transition-colors"
                    data-testid={`open-link-${link.id}`}
                  >
                    Open Link
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-xs text-[#6C5F5F] mt-3">
                    Added by {link.createdBy} • {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Link Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent data-testid="add-link-modal">
            <DialogHeader>
              <DialogTitle>Add Important Link</DialogTitle>
              <DialogDescription>
                Add a new link to share with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Project Documentation"
                  data-testid="link-title-input"
                />
              </div>
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  data-testid="link-url-input"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this link"
                  rows={3}
                  data-testid="link-description-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ title: '', url: '', description: '', icon: 'link' });
                }}
                data-testid="cancel-add-link"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                className="bg-[#A62639] hover:bg-[#8a1f2d] text-white"
                data-testid="confirm-add-link"
              >
                Add Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Link Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent data-testid="edit-link-modal">
            <DialogHeader>
              <DialogTitle>Edit Link</DialogTitle>
              <DialogDescription>
                Update the link details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="edit-link-title-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-url">URL *</Label>
                <Input
                  id="edit-url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  data-testid="edit-link-url-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  data-testid="edit-link-description-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLink(null);
                  setFormData({ title: '', url: '', description: '', icon: 'link' });
                }}
                data-testid="cancel-edit-link"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditLink}
                className="bg-[#A62639] hover:bg-[#8a1f2d] text-white"
                data-testid="confirm-edit-link"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent data-testid="delete-link-modal">
            <DialogHeader>
              <DialogTitle>Delete Link</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedLink?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedLink(null);
                }}
                data-testid="cancel-delete-link"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteLink}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="confirm-delete-link"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ImportantLinks;
