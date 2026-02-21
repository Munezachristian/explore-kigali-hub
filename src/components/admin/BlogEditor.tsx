import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const blogCategories = ['Travel Tips', 'Destinations', 'Culture', 'Wildlife', 'News'];

const emptyPost = { title: '', slug: '', content: '', excerpt: '', category: '', cover_image: '', status: 'draft', seo_title: '', seo_description: '', tags: [] as string[] };

const BlogEditor = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openCreate = () => { setEditing(null); setForm(emptyPost); setShowForm(true); };
  const openEdit = (post: any) => { setEditing(post); setForm({ ...emptyPost, ...post, tags: post.tags || [] }); setShowForm(true); };

  const addTag = () => { if (tagInput.trim()) { setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] })); setTagInput(''); } };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    const payload = { ...form, slug, author_id: user?.id, published_at: form.status === 'published' ? new Date().toISOString() : null };

    if (editing) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Post updated' });
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Post created' });
    }
    setSaving(false); setShowForm(false); fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    toast({ title: 'Post deleted' }); fetchPosts();
  };

  const toggleStatus = async (post: any) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await supabase.from('blog_posts').update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }).eq('id', post.id);
    fetchPosts();
  };

  if (showForm) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">{editing ? 'Edit Post' : 'New Post'}</h2>
          <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">Title *</Label><Input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) })); }} className="font-body mt-1" /></div>
            <div><Label className="font-body text-sm">Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="font-body mt-1" /></div>
          </div>
          <div><Label className="font-body text-sm">Excerpt</Label><Input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="font-body mt-1" /></div>
          <div><Label className="font-body text-sm">Content</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="font-body mt-1 min-h-[250px]" placeholder="Write your article content here..." /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="font-body text-sm">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{blogCategories.map(c => <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-body text-sm">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="font-body mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="font-body">Draft</SelectItem>
                  <SelectItem value="published" className="font-body">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="font-body text-sm">Cover Image URL</Label><Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} className="font-body mt-1" placeholder="https://..." /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="font-body text-sm">SEO Title</Label><Input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} className="font-body mt-1" maxLength={60} /></div>
            <div><Label className="font-body text-sm">SEO Description</Label><Input value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} className="font-body mt-1" maxLength={160} /></div>
          </div>
          <div>
            <Label className="font-body text-sm">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." className="font-body" />
              <Button type="button" variant="outline" onClick={addTag} className="font-body shrink-0">Add</Button>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {form.tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-accent/15 text-accent px-2.5 py-1 rounded-full font-body text-xs">{t} <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter((_, j) => j !== i) }))}><X className="w-3 h-3" /></button></span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body">{saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Blog Posts ({posts.length})</h2>
        <Button onClick={openCreate} className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body text-sm"><Plus className="w-4 h-4 mr-1" /> New Post</Button>
      </div>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>{['Title', 'Category', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-body text-sm font-medium text-foreground">{p.title}</td>
                  <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.category || 'N/A'}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                  <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)} className="h-8 w-8 p-0">{p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
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

export default BlogEditor;
