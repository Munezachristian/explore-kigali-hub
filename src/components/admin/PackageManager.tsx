import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, MapPin, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeForDb } from '@/lib/sanitize';

const categories = ['Wildlife', 'Cultural', 'Adventure', 'Safari', 'Beach & Lake'];

const emptyPkg = { title: '', description: '', location: '', duration: '', price: 0, discount: 0, category: '', availability: true, is_featured: false, features: [] as string[], images: [] as string[] };

interface ItineraryItem {
  id?: string;
  package_id: string;
  day_number: number;
  title: string;
  description: string;
  location: string;
  display_order: number;
}

const emptyItinerary: Omit<ItineraryItem, 'package_id'> = {
  day_number: 1, title: '', description: '', location: '', display_order: 0,
};

/* ── Itinerary Sub-Manager ─────────────────────────────── */
const ItineraryManager = ({ packageId, packageTitle }: { packageId: string; packageTitle: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<ItineraryItem, 'package_id'> & { id?: string }>(emptyItinerary);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItineraries(); }, [packageId]);

  const fetchItineraries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('package_itineraries')
      .select('*')
      .eq('package_id', packageId)
      .order('day_number', { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      package_id: packageId,
      day_number: form.day_number,
      title: sanitizeForDb(form.title),
      description: sanitizeForDb(form.description || ''),
      location: sanitizeForDb(form.location || ''),
      display_order: form.display_order,
    };

    if (editingId) {
      const { error } = await supabase.from('package_itineraries').update(payload).eq('id', editingId);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Itinerary updated' });
    } else {
      const { error } = await supabase.from('package_itineraries').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Itinerary added' });
    }
    setSaving(false);
    resetForm();
    fetchItineraries();
  };

  const handleEdit = (item: ItineraryItem) => {
    setEditingId(item.id || null);
    setForm({ day_number: item.day_number, title: item.title, description: item.description || '', location: item.location || '', display_order: item.display_order, id: item.id });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this itinerary day?')) return;
    const { error } = await supabase.from('package_itineraries').delete().eq('id', id);
    if (!error) { toast({ title: 'Deleted' }); fetchItineraries(); }
  };

  const resetForm = () => { setForm(emptyItinerary); setEditingId(null); setShowForm(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Itinerary for "{packageTitle}"
        </h3>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setForm({ ...emptyItinerary, day_number: items.length + 1, display_order: items.length }); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Day
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-body">Day Number *</Label>
                <Input type="number" min={1} value={form.day_number} onChange={e => setForm(f => ({ ...f, day_number: parseInt(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-body">Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Arrival & City Tour" />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-body">Location</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Kigali" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-body">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What happens on this day..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground font-body">Loading itinerary...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-4 text-center">No itinerary days added yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-display font-bold text-sm">
                {item.day_number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-foreground text-sm">{item.title}</div>
                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mt-0.5">
                    <MapPin className="h-3 w-3" /> {item.location}
                  </div>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Package Manager ───────────────────────────────────── */
const PackageManager = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPkg);
  const [featureInput, setFeatureInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itineraryPackageId, setItineraryPackageId] = useState<string | null>(null);
  const [itineraryPackageTitle, setItineraryPackageTitle] = useState('');

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    const { data } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (data) setPackages(data);
  };

  const openCreate = () => { setEditing(null); setForm(emptyPkg); setShowForm(true); setItineraryPackageId(null); };
  const openEdit = (pkg: any) => { setEditing(pkg); setForm({ ...emptyPkg, ...pkg, features: pkg.features || [], images: pkg.images || [] }); setShowForm(true); setItineraryPackageId(null); };

  const openItinerary = (pkg: any) => {
    setItineraryPackageId(itineraryPackageId === pkg.id ? null : pkg.id);
    setItineraryPackageTitle(pkg.title);
    setShowForm(false);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('package-images').upload(path, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('package-images').getPublicUrl(path);
    setForm(f => ({ ...f, images: [...f.images, publicUrl] }));
    setUploading(false);
  };

  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      title: sanitizeForDb(form.title),
      description: sanitizeForDb(form.description || ''),
      location: sanitizeForDb(form.location || ''),
      duration: sanitizeForDb(form.duration || ''),
      price: form.price,
      discount: form.discount,
      category: sanitizeForDb(form.category || ''),
      availability: form.availability,
      is_featured: form.is_featured,
      features: form.features.map(f => sanitizeForDb(f)),
      images: form.images
    };

    if (editing) {
      const { error } = await supabase.from('packages').update(payload).eq('id', editing.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Package updated' });
    } else {
      const { error } = await supabase.from('packages').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Package created' });
    }
    setSaving(false); setShowForm(false); fetchPackages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Package deleted' }); fetchPackages(); }
  };

  if (showForm) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">{editing ? 'Edit Package' : 'New Package'}</h2>
          <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="font-body mt-1" /></div>
            <div><Label className="font-body text-sm">Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="font-body mt-1" /></div>
          </div>
          <div><Label className="font-body text-sm">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="font-body mt-1 min-h-[100px]" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Label className="font-body text-sm">Duration</Label><Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="font-body mt-1" placeholder="e.g. 3 Days" /></div>
            <div><Label className="font-body text-sm">Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} className="font-body mt-1" /></div>
            <div><Label className="font-body text-sm">Discount (%)</Label><Input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))} className="font-body mt-1" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="font-body text-sm">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6"><Switch checked={form.availability} onCheckedChange={v => setForm(f => ({ ...f, availability: v }))} /><Label className="font-body text-sm">Available</Label></div>
            <div className="flex items-center gap-3 pt-6"><Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} /><Label className="font-body text-sm">Featured</Label></div>
          </div>

          {/* Images */}
          <div>
            <Label className="font-body text-sm">Images</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X className="w-4 h-4 text-white" /></button>
                </div>
              ))}
              <label className="w-20 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
              </label>
            </div>
            {uploading && <p className="font-body text-xs text-muted-foreground mt-1">Uploading...</p>}
          </div>

          {/* Features */}
          <div>
            <Label className="font-body text-sm">Features</Label>
            <div className="flex gap-2 mt-1">
              <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Add feature..." className="font-body" />
              <Button type="button" variant="outline" onClick={addFeature} className="font-body shrink-0">Add</Button>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {form.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full font-body text-xs text-foreground">
                  {f} <button onClick={() => setForm(fm => ({ ...fm, features: fm.features.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body">{saving ? 'Saving...' : editing ? 'Update Package' : 'Create Package'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Packages ({packages.length})</h2>
        <Button onClick={openCreate} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body text-sm"><Plus className="w-4 h-4 mr-1" /> New Package</Button>
      </div>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>{['Title', 'Category', 'Price', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packages.map(p => (
                <>
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-body text-sm font-medium text-foreground">{p.title}</td>
                    <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.category || 'N/A'}</td>
                    <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${p.price}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{p.availability ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-3.5 flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openItinerary(p)} className="h-8 w-8 p-0" title="Manage itinerary">
                        {itineraryPackageId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                  {itineraryPackageId === p.id && (
                    <tr key={`${p.id}-itinerary`}>
                      <td colSpan={5} className="px-5 py-4 bg-muted/20">
                        <ItineraryManager packageId={p.id} packageTitle={p.title} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;
