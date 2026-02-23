import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeForDb } from '@/lib/sanitize';

const categories = ['Wildlife', 'Cultural', 'Adventure', 'Safari', 'Beach & Lake'];

const emptyPkg = { title: '', description: '', location: '', duration: '', price: 0, discount: 0, category: '', availability: true, is_featured: false, features: [] as string[], images: [] as string[] };

const PackageManager = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPkg);
  const [featureInput, setFeatureInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    const { data } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (data) setPackages(data);
  };

  const openCreate = () => { setEditing(null); setForm(emptyPkg); setShowForm(true); };
  const openEdit = (pkg: any) => { setEditing(pkg); setForm({ ...emptyPkg, ...pkg, features: pkg.features || [], images: pkg.images || [] }); setShowForm(true); };

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
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-body text-sm font-medium text-foreground">{p.title}</td>
                  <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.category || 'N/A'}</td>
                  <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${p.price}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{p.availability ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-5 py-3.5 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageManager;
