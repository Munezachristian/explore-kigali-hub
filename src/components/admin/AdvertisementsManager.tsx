import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, X, Image as ImageIcon, Upload, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BUCKET = 'advertisement-media';

interface Advertisement {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  media_type: 'image' | 'video';
  link_url: string;
  show_after_seconds: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  show_once_per_session: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  link_url: '',
  media_type: 'image' as 'image' | 'video',
  show_after_seconds: 0,
  start_date: '',
  end_date: '',
  is_active: true,
  show_once_per_session: true,
  display_order: 0,
};

const AdvertisementsManager = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements' as any)
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setList((data as unknown as Advertisement[]) || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error loading advertisements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!uploadFile) return form.image_url || null;
    const ext = uploadFile.name.split('.').pop() || (uploadFile.type.startsWith('video/') ? 'mp4' : 'jpg');
    const path = `media/${Date.now()}_${uploadFile.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return publicUrl;
  };

  const save = async () => {
    const hasMedia = uploadFile || (form.image_url && form.image_url.trim());
    if (!hasMedia || !form.link_url.trim()) {
      toast({ title: 'Upload an image or video, and set the redirect link', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      let mediaUrl = form.image_url.trim();
      let mediaType = form.media_type;
      if (uploadFile) {
        mediaUrl = (await uploadMedia()) || '';
        mediaType = uploadFile.type.startsWith('video/') ? 'video' : 'image';
      }
      const payload = {
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        image_url: mediaUrl || null,
        media_type: mediaType,
        link_url: form.link_url.trim(),
        show_after_seconds: Math.max(0, form.show_after_seconds),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        is_active: form.is_active,
        show_once_per_session: form.show_once_per_session,
        display_order: form.display_order,
      };
      if (editing) {
        const { error } = await supabase.from('advertisements' as any).update(payload).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Advertisement updated' });
      } else {
        const { error } = await supabase.from('advertisements' as any).insert(payload);
        if (error) throw error;
        toast({ title: 'Advertisement created' });
      }
      setEditing(null);
      setForm(emptyForm);
      setUploadFile(null);
      fetchList();
    } catch (e: any) {
      toast({ title: 'Error saving', description: e?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this advertisement?')) return;
    try {
      const { error } = await supabase.from('advertisements' as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Advertisement deleted' });
      if (editing?.id === id) {
        setEditing(null);
        setForm(emptyForm);
        setUploadFile(null);
      }
      fetchList();
    } catch (e: any) {
      toast({ title: 'Error deleting', description: e?.message, variant: 'destructive' });
    }
  };

  const startEdit = (row: Advertisement) => {
    setEditing(row);
    setForm({
      title: row.title || '',
      description: row.description || '',
      image_url: row.image_url || '',
      link_url: row.link_url,
      media_type: row.media_type || 'image',
      show_after_seconds: row.show_after_seconds,
      start_date: row.start_date ? row.start_date.slice(0, 16) : '',
      end_date: row.end_date ? row.end_date.slice(0, 16) : '',
      is_active: row.is_active,
      show_once_per_session: row.show_once_per_session,
      display_order: row.display_order,
    });
    setUploadFile(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) {
      toast({ title: 'Please choose an image or video file', variant: 'destructive' });
      return;
    }
    setUploadFile(file);
    setForm((f) => ({ ...f, media_type: isVideo ? 'video' : 'image' }));
    e.target.value = '';
  };

  const previewUrl = uploadFile ? URL.createObjectURL(uploadFile) : (form.image_url || null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advertisements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload an image or video, set description and redirect link. Visitors see the popup after the delay you set.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title (optional)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Summer Sale"
              />
            </div>
            <div>
              <Label>Show after (seconds)</Label>
              <Input
                type="number"
                min={0}
                value={form.show_after_seconds}
                onChange={(e) => setForm({ ...form, show_after_seconds: parseInt(e.target.value, 10) || 0 })}
                placeholder="0 = immediately"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Image or video *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload image or video
                </Button>
                {uploadFile && (
                  <span className="text-sm text-muted-foreground">
                    {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              {previewUrl && (
                <div className="mt-2 rounded-lg border overflow-hidden bg-muted max-w-sm">
                  {form.media_type === 'video' ? (
                    <video src={previewUrl} controls className="w-full max-h-48 object-contain" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain" />
                  )}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Redirect link (when user clicks the ad) *</Label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <Label>Short description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief text shown below the media"
                rows={2}
              />
            </div>
            <div>
              <Label>Start date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>End date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.show_once_per_session}
                  onCheckedChange={(v) => setForm({ ...form, show_once_per_session: v })}
                />
                <Label>Show once per session</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={uploading}>
                {uploading ? 'Saving…' : editing ? 'Update' : 'Create'} Advertisement
              </Button>
              {editing && (
                <Button variant="outline" onClick={() => { setEditing(null); setForm(emptyForm); setUploadFile(null); }}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Existing advertisements</Label>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : list.length === 0 ? (
              <p className="text-muted-foreground text-sm">No advertisements yet. Create one above.</p>
            ) : (
              <ul className="space-y-2">
                {list.map((ad) => (
                  <li key={ad.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="w-14 h-14 rounded overflow-hidden bg-muted shrink-0">
                      {ad.image_url ? (
                        ad.media_type === 'video' ? (
                          <video src={ad.image_url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {ad.media_type === 'video' ? <Video className="w-6 h-6 text-muted-foreground" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{ad.title || 'No title'}</div>
                      <div className="text-xs text-muted-foreground truncate">{ad.link_url}</div>
                      <div className="text-xs">Show after {ad.show_after_seconds}s · {ad.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(ad)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => remove(ad.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvertisementsManager;
