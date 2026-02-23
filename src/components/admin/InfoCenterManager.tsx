import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MessageSquare,
  Info,
  AlertTriangle,
  CheckCircle,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Save,
  X
} from 'lucide-react';

interface InfoItem {
  id: string;
  category: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author?: string;
}

const InfoCenterManager = () => {
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);
  const [filteredInfoItems, setFilteredInfoItems] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('general');
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null);
  const [editingItem, setEditingItem] = useState<InfoItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const categories = ['all', 'general', 'travel-tips', 'health-safety', 'destinations', 'requirements', 'weather', 'culture'];
  const statuses = ['all', 'draft', 'published', 'archived'];
  const priorities = ['low', 'medium', 'high'];

  // Static data for demonstration
  const staticInfoItems: InfoItem[] = [
    {
      id: '1',
      category: 'general',
      title: 'Welcome to Kigali Hub',
      content: 'Essential information for travelers planning their African adventure with Kigali Hub. Learn about our services, booking process, and what to expect.',
      priority: 'high',
      status: 'published',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      author: 'Admin'
    },
    {
      id: '2',
      category: 'travel-tips',
      title: 'Packing Essentials for African Safari',
      content: 'Comprehensive guide on what to pack for your African safari adventure. Includes clothing recommendations, equipment, and personal items.',
      priority: 'medium',
      status: 'published',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-16T09:15:00Z',
      author: 'Admin'
    },
    {
      id: '3',
      category: 'health-safety',
      title: 'Vaccination Requirements',
      content: 'Important information about required and recommended vaccinations for travel to African countries. Includes health insurance recommendations.',
      priority: 'high',
      status: 'published',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-12T16:45:00Z',
      author: 'Admin'
    },
    {
      id: '4',
      category: 'destinations',
      title: 'Best Time to Visit Rwanda',
      content: 'Seasonal guide for visiting Rwanda. Information about weather patterns, wildlife viewing opportunities, and peak tourist seasons.',
      priority: 'medium',
      status: 'draft',
      created_at: '2024-01-08T11:30:00Z',
      updated_at: '2024-01-08T11:30:00Z',
      author: 'Admin'
    }
  ];

  useEffect(() => {
    fetchInfoItems();
  }, []);

  useEffect(() => {
    let filtered = infoItems;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInfoItems(filtered);
  }, [infoItems, categoryFilter, statusFilter, searchTerm]);

  const fetchInfoItems = async () => {
    try {
      // Using static data since database might not be fully set up
      setInfoItems(staticInfoItems);
      setFilteredInfoItems(staticInfoItems);
    } catch (error) {
      console.error('Error fetching info items:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInfoItem = async (newItem: Omit<InfoItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const item: InfoItem = {
        ...newItem,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Admin'
      };
      setInfoItems(prev => [...prev, item]);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating info item:', error);
    }
  };

  const updateInfoItem = async (updatedItem: InfoItem) => {
    try {
      setInfoItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, updated_at: new Date().toISOString() }
            : item
        )
      );
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating info item:', error);
    }
  };

  const deleteInfoItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this information item?')) {
      try {
        setInfoItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting info item:', error);
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
      medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-700', label: 'High' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      published: { color: 'bg-emerald-100 text-emerald-700', label: 'Published' },
      archived: { color: 'bg-blue-100 text-blue-700', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: <Info className="h-4 w-4" />,
      'travel-tips': <Globe className="h-4 w-4" />,
      'health-safety': <AlertTriangle className="h-4 w-4" />,
      destinations: <MapPin className="h-4 w-4" />,
      requirements: <CheckCircle className="h-4 w-4" />,
      weather: <Calendar className="h-4 w-4" />,
      culture: <MessageSquare className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Info className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Info Center Management</h2>
          <p className="font-body text-muted-foreground">Manage travel information and guides</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Info
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{filteredInfoItems.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredInfoItems.filter(i => i.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredInfoItems.filter(i => i.status === 'draft').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredInfoItems.filter(i => i.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search information..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace('-', ' ').charAt(0).toUpperCase() + category.replace('-', ' ').slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Items List */}
      <div className="space-y-4">
        {filteredInfoItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.category.replace('-', ' ').charAt(0).toUpperCase() + item.category.replace('-', ' ').slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(item.priority)}
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">
                {item.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                  <span>By {item.author}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteInfoItem(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedItem.category)}
                {selectedItem.title}
              </CardTitle>
              <div className="flex gap-2">
                {getPriorityBadge(selectedItem.priority)}
                {getStatusBadge(selectedItem.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Category:</span> {selectedItem.category}
                  </div>
                  <div>
                    <span className="font-medium">Author:</span> {selectedItem.author}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedItem.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedItem.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setSelectedItem(null);
                  setEditingItem(selectedItem);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(editingItem || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New Information' : 'Edit Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={editingItem?.title || ''}
                    onChange={(e) => setEditingItem(editingItem ? {...editingItem, title: e.target.value} : null)}
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingItem?.category || ''}
                    onChange={(e) => setEditingItem(editingItem ? {...editingItem, category: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>
                        {category.replace('-', ' ').charAt(0).toUpperCase() + category.replace('-', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <Textarea
                    value={editingItem?.content || ''}
                    onChange={(e) => setEditingItem(editingItem ? {...editingItem, content: e.target.value} : null)}
                    rows={8}
                    placeholder="Enter content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={editingItem?.priority || ''}
                      onChange={(e) => setEditingItem(editingItem ? {...editingItem, priority: e.target.value as InfoItem['priority']} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={editingItem?.status || ''}
                      onChange={(e) => setEditingItem(editingItem ? {...editingItem, status: e.target.value as InfoItem['status']} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {statuses.filter(s => s !== 'all').map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (isCreating && editingItem) {
                    createInfoItem(editingItem);
                  } else if (editingItem) {
                    updateInfoItem(editingItem);
                  }
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InfoCenterManager;
