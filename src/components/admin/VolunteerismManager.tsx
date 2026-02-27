import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Plus, Edit, Trash2, Save, X, Search, MapPin, Calendar, Users, HandHeart, Upload, Image as ImageIcon
} from 'lucide-react';

interface VolunteerActivity {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  max_volunteers: number | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  location: '',
  start_date: '',
  end_date: '',
  max_volunteers: '',
  is_published: true,
};

const VolunteerismManager = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<VolunteerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('volunteerism_activities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Validation', description: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      location: form.location || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      max_volunteers: form.max_volunteers ? parseInt(form.max_volunteers) : null,
      is_published: form.is_published,
      created_by: user?.id || null,
    };

    if (editingId) {
      const { error } = await supabase.from('volunteerism_activities').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Activity updated successfully' });
        resetForm();
        fetchItems();
      }
    } else {
      const { error } = await supabase.from('volunteerism_activities').insert(payload);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Activity created successfully' });
        resetForm();
        fetchItems();
      }
    }
    setSaving(false);
  };

  const handleEdit = (item: VolunteerActivity) => {
    setEditingId(item.id);
    setIsCreating(false);
    setForm({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url || '',
      location: item.location || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      max_volunteers: item.max_volunteers?.toString() || '',
      is_published: item.is_published,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    const { error } = await supabase.from('volunteerism_activities').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Activity deleted successfully' });
      fetchItems();
    }
  };

  const togglePublished = async (item: VolunteerActivity) => {
    const { error } = await supabase
      .from('volunteerism_activities')
      .update({ is_published: !item.is_published })
      .eq('id', item.id);
    if (!error) fetchItems();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsCreating(false);
  };

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedCount = items.filter((i) => i.is_published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Volunteerism Activities</h2>
          <p className="font-body text-muted-foreground text-sm">
            Manage volunteer opportunities &mdash; {items.length} total, {publishedCount} published
          </p>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingId(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingId) && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">
              {editingId ? 'Edit Activity' : 'Create New Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Activity title"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Kigali, Rwanda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the volunteer activity"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Volunteers</Label>
                <Input
                  type="number"
                  value={form.max_volunteers}
                  onChange={(e) => setForm({ ...form, max_volunteers: e.target.value })}
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to upload images (multiple allowed)'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    setUploading(true);
                    for (const file of Array.from(files)) {
                      const ext = file.name.split('.').pop();
                      const path = `volunteerism/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                      const { error } = await supabase.storage.from('activity-images').upload(path, file);
                      if (error) {
                        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
                      } else {
                        const { data: urlData } = supabase.storage.from('activity-images').getPublicUrl(path);
                        setForm(f => ({ ...f, image_url: urlData.publicUrl }));
                        toast({ title: 'Uploaded', description: file.name });
                      }
                    }
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                />
              </div>
            </div>

            {form.image_url && (
              <div className="flex items-center gap-3">
                <div className="w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, image_url: '' })} className="text-destructive">
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_published}
                onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
              />
              <Label>Published</Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
          <span className="text-muted-foreground font-body">Loading activities...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HandHeart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-body">No volunteer activities found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {item.image_url ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <HandHeart className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-semibold text-foreground truncate">{item.title}</h3>
                      <Badge variant={item.is_published ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground font-body line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-body flex-wrap">
                      {item.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                      )}
                      {item.start_date && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{item.start_date}{item.end_date ? ` → ${item.end_date}` : ''}</span>
                      )}
                      {item.max_volunteers && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />Max {item.max_volunteers}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => togglePublished(item)} title={item.is_published ? 'Unpublish' : 'Publish'}>
                      <HandHeart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerismManager;
