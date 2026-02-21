import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const galleryCategories = ['Nature', 'Wildlife', 'Culture', 'Adventure', 'Cities', 'Hotels'];

const GalleryManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', media_url: '', media_type: 'image', is_featured: false });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const uploadMedia = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('package-images').upload(path, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('package-images').getPublicUrl(path);
    setForm(f => ({ ...f, media_url: publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.media_url) { toast({ title: 'Please upload or enter a media URL', variant: 'destructive' }); return; }
    const { error } = await supabase.from('gallery').insert(form);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Added to gallery' }); setShowForm(false); setForm({ title: '', description: '', category: '', media_url: '', media_type: 'image', is_featured: false }); fetchGallery(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    toast({ title: 'Deleted' }); fetchGallery();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Gallery ({items.length})</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body text-sm"><Plus className="w-4 h-4 mr-1" /> Add Media</Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Add New Media</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="font-body mt-1" /></div>
            <div>
              <Label className="font-body text-sm">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{galleryCategories.map(c => <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4"><Label className="font-body text-sm">Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="font-body mt-1" /></div>
          <div className="mt-4">
            <Label className="font-body text-sm">Upload Image</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors" onClick={() => document.getElementById('gallery-upload')?.click()}>
              {form.media_url ? <img src={form.media_url} alt="" className="max-h-32 mx-auto rounded-lg" /> : <><Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="font-body text-sm text-muted-foreground">Click to upload</p></>}
              <input id="gallery-upload" type="file" accept="image/*,video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadMedia(e.target.files[0]); }} />
            </div>
            {uploading && <p className="font-body text-xs text-muted-foreground mt-1">Uploading...</p>}
          </div>
          <div className="flex items-center gap-3 mt-4"><Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} /><Label className="font-body text-sm">Featured</Label></div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSave} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body">Add to Gallery</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative rounded-xl overflow-hidden group aspect-square">
            <img src={item.media_url} alt={item.title || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              {item.title && <span className="font-body text-white text-sm font-medium text-center">{item.title}</span>}
              {item.is_featured && <Star className="w-4 h-4 text-gold fill-gold" />}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="font-body text-xs h-7"><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManager;
