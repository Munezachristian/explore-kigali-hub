import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Upload, Star, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const galleryCategories = ['Nature', 'Wildlife', 'Culture', 'Adventure', 'Cities', 'Hotels'];

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  media_url: string;
  media_type: 'image' | 'video';
  is_featured: boolean;
  created_at: string;
}

interface UploadItem {
  file: File;
  preview: string;
  title: string;
  description: string;
  category: string;
  is_featured: boolean;
}

const GalleryManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data) setItems(data as unknown as GalleryItem[]);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({ title: 'Error loading gallery', variant: 'destructive' });
    }
  };

  const handleFileSelect = (files: FileList) => {
    const newUploadItems: UploadItem[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0],
      description: '',
      category: '',
      is_featured: false
    }));
    
    setUploadItems(prev => [...prev, ...newUploadItems]);
  };

  const removeUploadItem = (index: number) => {
    setUploadItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newItems;
    });
  };

  const updateUploadItem = (index: number, field: keyof UploadItem, value: any) => {
    setUploadItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const uploadMultipleMedia = async () => {
    if (uploadItems.length === 0) {
      toast({ title: 'Please select files to upload', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = uploadItems.map(async (uploadItem, index) => {
        const file = uploadItem.file;
        const ext = file.name.split('.').pop();
        const path = `gallery/${Date.now()}_${index}.${ext}`;
        
        const { error } = await supabase.storage.from('gallery-images').upload(path, file);
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path);
        
        return {
          title: uploadItem.title,
          description: uploadItem.description,
          category: uploadItem.category,
          media_url: publicUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'image',
          is_featured: uploadItem.is_featured
        };
      });

      const uploadedItems = await Promise.all(uploadPromises);
      
      // Insert all items into database
      const { error } = await supabase.from('gallery').insert(uploadedItems);
      if (error) throw error;

      // Clean up object URLs
      uploadItems.forEach(item => URL.revokeObjectURL(item.preview));
      
      toast({ 
        title: 'Success!', 
        description: `${uploadedItems.length} items uploaded to gallery` 
      });
      
      setUploadItems([]);
      setShowForm(false);
      fetchGallery();
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({ 
        title: 'Upload failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      // Get the item to delete the file from storage
      const item = items.find(i => i.id === id);
      if (item?.media_url) {
        const fileName = item.media_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('gallery-images').remove([`gallery/${fileName}`]);
        }
      }
      
      await supabase.from('gallery').delete().eq('id', id);
      toast({ title: 'Item deleted successfully' });
      fetchGallery();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ title: 'Error deleting item', variant: 'destructive' });
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;
      
      const { error } = await supabase
        .from('gallery')
        .update({ is_featured: !item.is_featured })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({ title: `Item ${!item.is_featured ? 'featured' : 'unfeatured'} successfully` });
      fetchGallery();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({ title: 'Error updating item', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Gallery ({items.length})</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body text-sm">
          <Plus className="w-4 h-4 mr-1" /> Add Media
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Add New Media</h3>
              <button onClick={() => {
                setShowForm(false);
                // Clean up object URLs
                uploadItems.forEach(item => URL.revokeObjectURL(item.preview));
                setUploadItems([]);
              }}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <Label className="font-body text-sm mb-2 block">Upload Images/Videos</Label>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => document.getElementById('gallery-upload')?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-body text-lg text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Multiple images and videos supported (Max 10MB per file)
                </p>
                <input 
                  id="gallery-upload" 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleFileSelect(e.target.files);
                    }
                  }} 
                />
              </div>
            </div>

            {/* Upload Items Preview */}
            {uploadItems.length > 0 && (
              <div className="mb-6">
                <Label className="font-body text-sm mb-2 block">Files to Upload ({uploadItems.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadItems.map((uploadItem, index) => (
                    <div key={index} className="border rounded-lg p-3 relative">
                      <button
                        onClick={() => removeUploadItem(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      <div className="aspect-square mb-3 rounded overflow-hidden bg-gray-100">
                        {uploadItem.file.type.startsWith('video/') ? (
                          <video 
                            src={uploadItem.preview} 
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img 
                            src={uploadItem.preview} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          value={uploadItem.title}
                          onChange={(e) => updateUploadItem(index, 'title', e.target.value)}
                          placeholder="Title"
                          className="text-sm"
                        />
                        <Input
                          value={uploadItem.description}
                          onChange={(e) => updateUploadItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="text-sm"
                        />
                        <Select 
                          value={uploadItem.category} 
                          onValueChange={(v) => updateUploadItem(index, 'category', v)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {galleryCategories.map(c => (
                              <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-2">
                          <Switch 
                            checked={uploadItem.is_featured} 
                            onCheckedChange={(v) => updateUploadItem(index, 'is_featured', v)} 
                          />
                          <Label className="text-sm">Featured</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={uploadMultipleMedia} 
                disabled={uploading || uploadItems.length === 0}
                className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body"
              >
                {uploading ? 'Uploading...' : `Upload ${uploadItems.length} Items`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  uploadItems.forEach(item => URL.revokeObjectURL(item.preview));
                  setUploadItems([]);
                }} 
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative rounded-xl overflow-hidden group aspect-square">
            {item.media_type === 'video' ? (
              <video 
                src={item.media_url} 
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <img 
                src={item.media_url} 
                alt={item.title || ''} 
                className="w-full h-full object-cover" 
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              {item.title && (
                <span className="font-body text-white text-sm font-medium text-center">{item.title}</span>
              )}
              <div className="flex items-center gap-2">
                {item.is_featured && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toggleFeatured(item.id)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-body text-xs"
                >
                  {item.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(item.id)} 
                  className="font-body text-xs h-7"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No items in gallery</h3>
          <p className="text-gray-500 mb-4">Upload your first images or videos to get started</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
