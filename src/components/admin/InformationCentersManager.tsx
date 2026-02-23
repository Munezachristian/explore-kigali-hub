import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  Image as ImageIcon,
  Video,
  X,
  Save,
  Upload,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeForDb } from '@/lib/sanitize';
import { logAction } from '@/lib/systemLog';

interface InformationCenter {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  status: 'published' | 'unpublished' | 'deleted';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface InformationCenterMedia {
  id: string;
  information_center_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  is_primary: boolean | null;
  display_order: number | null;
  created_at: string;
}

const InformationCentersManager = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [centers, setCenters] = useState<InformationCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<InformationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<InformationCenter | null>(null);
  const [editingCenter, setEditingCenter] = useState<InformationCenter | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<InformationCenterMedia[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [newMediaUrls, setNewMediaUrls] = useState<string[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    let filtered = centers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(center => center.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCenters(filtered);
  }, [centers, statusFilter, searchTerm]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('information_centers')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCenters(data || []);
      setFilteredCenters(data || []);
    } catch (error: any) {
      console.error('Error fetching centers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch information centers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async (centerId: string) => {
    try {
      const { data, error } = await supabase
        .from('information_center_media')
        .select('*')
        .eq('information_center_id', centerId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching media:', error);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingCenter({
      id: '',
      name: '',
      description: '',
      address: '',
      latitude: -1.9441,
      longitude: 30.0619,
      phone: '',
      email: '',
      opening_hours: '',
      status: 'unpublished',
      created_at: '',
      updated_at: '',
      created_by: user?.id || null,
    });
    setMediaFiles([]);
    setNewMediaUrls([]);
    setMediaToDelete([]);
  };

  const handleEdit = async (center: InformationCenter) => {
    setEditingCenter(center);
    setIsCreating(false);
    await fetchMedia(center.id);
    setNewMediaUrls([]);
    setMediaToDelete([]);
  };

  const handleSave = async () => {
    if (!editingCenter) return;

    try {
      // Validate required fields
      if (!editingCenter.name || !editingCenter.address) {
        toast({
          title: 'Validation Error',
          description: 'Name and address are required',
          variant: 'destructive',
        });
        return;
      }

      if (!editingCenter.latitude || !editingCenter.longitude) {
        toast({
          title: 'Validation Error',
          description: 'Please set location coordinates on the map',
          variant: 'destructive',
        });
        return;
      }

      let centerId = editingCenter.id;

      if (isCreating) {
        // Create new center
        const { data, error } = await supabase
          .from('information_centers')
          .insert({
            name: sanitizeForDb(editingCenter.name),
            description: sanitizeForDb(editingCenter.description || ''),
            address: sanitizeForDb(editingCenter.address),
            latitude: editingCenter.latitude,
            longitude: editingCenter.longitude,
            phone: editingCenter.phone,
            email: editingCenter.email,
            opening_hours: editingCenter.opening_hours,
            status: editingCenter.status,
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (error) throw error;
        centerId = data.id;
        await logAction('information_center_created', { center_id: centerId, name: data.name }, role ?? null);
      } else {
        // Update existing center
        const { error } = await supabase
          .from('information_centers')
          .update({
            name: sanitizeForDb(editingCenter.name),
            description: sanitizeForDb(editingCenter.description || ''),
            address: sanitizeForDb(editingCenter.address),
            latitude: editingCenter.latitude,
            longitude: editingCenter.longitude,
            phone: editingCenter.phone,
            email: editingCenter.email,
            opening_hours: editingCenter.opening_hours,
            status: editingCenter.status,
          })
          .eq('id', editingCenter.id);

        if (error) throw error;
        await logAction('information_center_updated', { center_id: editingCenter.id, name: editingCenter.name }, role ?? null);
      }

      // Handle media uploads
      if (newMediaUrls.length > 0) {
        const mediaToInsert = newMediaUrls.map((url, index) => ({
          information_center_id: centerId,
          media_type: url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') ? 'video' : 'image',
          media_url: url,
          is_primary: index === 0,
          display_order: index,
        }));

        const { error: mediaError } = await supabase
          .from('information_center_media')
          .insert(mediaToInsert);

        if (mediaError) throw mediaError;
      }

      // Delete removed media
      if (mediaToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('information_center_media')
          .delete()
          .in('id', mediaToDelete);

        if (deleteError) throw deleteError;
      }

      toast({
        title: 'Success',
        description: isCreating ? 'Information center created successfully' : 'Information center updated successfully',
      });

      setEditingCenter(null);
      setIsCreating(false);
      setNewMediaUrls([]);
      setMediaToDelete([]);
      fetchCenters();
    } catch (error: any) {
      console.error('Error saving center:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save information center',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!centerToDelete) return;

    try {
      const centerName = centers.find(c => c.id === centerToDelete)?.name ?? 'Unknown';
      const { error } = await supabase
        .from('information_centers')
        .update({ status: 'deleted' })
        .eq('id', centerToDelete);

      if (error) throw error;
      await logAction('information_center_deleted', { center_id: centerToDelete, name: centerName }, role ?? null);

      toast({
        title: 'Success',
        description: 'Information center deleted successfully',
      });

      setDeleteDialogOpen(false);
      setCenterToDelete(null);
      fetchCenters();
    } catch (error: any) {
      console.error('Error deleting center:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete information center',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('information-center-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('information-center-media')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setNewMediaUrls([...newMediaUrls, ...uploadedUrls]);
      toast({
        title: 'Success',
        description: 'Files uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleVideoUrlAdd = (url: string) => {
    if (url.trim()) {
      setNewMediaUrls([...newMediaUrls, url.trim()]);
    }
  };

  const removeMedia = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewMediaUrls(newMediaUrls.filter((_, i) => i !== index));
    } else {
      const media = mediaFiles[index];
      setMediaToDelete([...mediaToDelete, media.id]);
      setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-emerald-100 text-emerald-700', label: 'Published' },
      unpublished: { color: 'bg-gray-100 text-gray-700', label: 'Unpublished' },
      deleted: { color: 'bg-red-100 text-red-700', label: 'Deleted' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpublished;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
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
          <h2 className="font-display text-2xl font-bold text-foreground">Information Centers Management</h2>
          <p className="font-body text-muted-foreground">Manage tourism information centers and locations</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Center
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Centers</p>
                <p className="text-2xl font-bold">{filteredCenters.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredCenters.filter(c => c.status === 'published').length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unpublished</p>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredCenters.filter(c => c.status === 'unpublished').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
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
                placeholder="Search centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Centers List */}
      <div className="space-y-4">
        {filteredCenters.map((center) => (
          <Card key={center.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{center.name}</h3>
                    {getStatusBadge(center.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{center.address}</span>
                  </div>
                  {center.description && (
                    <p className="text-gray-700 line-clamp-2 mb-2">{center.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {center.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {center.phone}
                      </div>
                    )}
                    {center.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {center.email}
                      </div>
                    )}
                    {center.opening_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {center.opening_hours}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCenter(center)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(center)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCenterToDelete(center.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Created: {new Date(center.created_at).toLocaleDateString()} | 
                Updated: {new Date(center.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCenter.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCenter(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {getStatusBadge(selectedCenter.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-gray-700 mt-1">{selectedCenter.description || 'No description'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-gray-700 mt-1">{selectedCenter.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Latitude</Label>
                    <p className="text-gray-700 mt-1">{selectedCenter.latitude}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Longitude</Label>
                    <p className="text-gray-700 mt-1">{selectedCenter.longitude}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCenter.phone && (
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-gray-700 mt-1">{selectedCenter.phone}</p>
                    </div>
                  )}
                  {selectedCenter.email && (
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-gray-700 mt-1">{selectedCenter.email}</p>
                    </div>
                  )}
                </div>
                {selectedCenter.opening_hours && (
                  <div>
                    <Label className="text-sm font-medium">Opening Hours</Label>
                    <p className="text-gray-700 mt-1">{selectedCenter.opening_hours}</p>
                  </div>
                )}
                <div className="pt-4">
                  <Button
                    onClick={() => openGoogleMaps(selectedCenter.latitude, selectedCenter.longitude)}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Directions on Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingCenter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isCreating ? 'Create New Information Center' : 'Edit Information Center'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingCenter(null);
                  setIsCreating(false);
                  setMediaFiles([]);
                  setNewMediaUrls([]);
                  setMediaToDelete([]);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={editingCenter.name}
                      onChange={(e) => setEditingCenter({...editingCenter, name: e.target.value})}
                      placeholder="Center name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editingCenter.status}
                      onChange={(e) => setEditingCenter({...editingCenter, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingCenter.description || ''}
                    onChange={(e) => setEditingCenter({...editingCenter, description: e.target.value})}
                    rows={4}
                    placeholder="Center description"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={editingCenter.address}
                    onChange={(e) => setEditingCenter({...editingCenter, address: e.target.value})}
                    placeholder="Physical address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={editingCenter.latitude}
                      onChange={(e) => setEditingCenter({...editingCenter, latitude: parseFloat(e.target.value) || 0})}
                      placeholder="-1.9441"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={editingCenter.longitude}
                      onChange={(e) => setEditingCenter({...editingCenter, longitude: parseFloat(e.target.value) || 0})}
                      placeholder="30.0619"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                  <strong>Tip:</strong> Use{' '}
                  <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">
                    Google Maps
                  </a>{' '}
                  to find coordinates. Right-click on a location and select coordinates.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editingCenter.phone || ''}
                      onChange={(e) => setEditingCenter({...editingCenter, phone: e.target.value})}
                      placeholder="+250 788 123 456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingCenter.email || ''}
                      onChange={(e) => setEditingCenter({...editingCenter, email: e.target.value})}
                      placeholder="info@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="opening_hours">Opening Hours</Label>
                  <Input
                    id="opening_hours"
                    value={editingCenter.opening_hours || ''}
                    onChange={(e) => setEditingCenter({...editingCenter, opening_hours: e.target.value})}
                    placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-4PM"
                  />
                </div>

                {/* Media Section */}
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Media</Label>
                  
                  {/* Existing Media */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm">Existing Media</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {mediaFiles.map((media, index) => (
                          <div key={media.id} className="relative group">
                            {media.media_type === 'image' ? (
                              <img
                                src={media.media_url}
                                alt={`Media ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              onClick={() => removeMedia(index, false)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Media */}
                  {newMediaUrls.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm">New Media</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {newMediaUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            {url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') ? (
                              <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`New media ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            )}
                            <button
                              onClick={() => removeMedia(index, true)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Controls */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm">Add Images</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploadingMedia}
                    />
                    
                    <div className="mt-2">
                      <Label className="text-sm">Add Video URL (YouTube, Vimeo, etc.)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleVideoUrlAdd((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value) {
                              handleVideoUrlAdd(input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setEditingCenter(null);
                    setIsCreating(false);
                    setMediaFiles([]);
                    setNewMediaUrls([]);
                    setMediaToDelete([]);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={uploadingMedia}>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Create' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the information center as deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setCenterToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InformationCentersManager;
