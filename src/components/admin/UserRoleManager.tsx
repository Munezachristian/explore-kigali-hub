import { useEffect, useState } from 'react';
import { Shield, Search, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const roles = ['admin', 'tour_manager', 'accountant', 'client'] as const;

const UserRoleManager = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New user form
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<string>('client');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ data: profs, error: e1 }, { data: rls, error: e2 }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
      ]);
      if (e1) throw e1;
      if (profs) setProfiles(profs);
      if (rls) {
        const map: Record<string, string> = {};
        rls.forEach(r => { map[r.user_id] = r.role; });
        setUserRoles(map);
      }
    } catch (err: any) {
      console.error('[Users] Fetch error:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    const existing = userRoles[userId];
    try {
      if (existing) {
        const { error } = await supabase.from('user_roles').update({ role: newRole as any, assigned_by: currentUser?.id }).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole as any, assigned_by: currentUser?.id });
        if (error) throw error;
      }
      toast({ title: 'Role updated' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const createUser = async () => {
    if (!newEmail || !newPassword || !newName) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      // Sign up the user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: { data: { full_name: newName } },
      });
      if (error) throw error;
      if (data.user) {
        // Set the role if not client
        if (newRole !== 'client') {
          await supabase.from('user_roles').upsert({ user_id: data.user.id, role: newRole as any, assigned_by: currentUser?.id }, { onConflict: 'user_id,role' });
        }
      }
      toast({ title: 'User created', description: `${newEmail} has been created with role ${newRole}` });
      setShowCreate(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('client');
      // Refresh after a short delay for profile trigger to fire
      setTimeout(fetchUsers, 1500);
    } catch (err: any) {
      console.error('[Users] Create error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const filtered = profiles.filter(p => !search || p.email?.toLowerCase().includes(search.toLowerCase()) || p.full_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span className="text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchUsers} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Users & Roles ({profiles.length})</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="w-4 h-4 mr-2" /> Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Full Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={createUser} disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="font-body pl-10" />
      </div>
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>{['User', 'Email', 'Current Role', 'Change Role', 'Joined'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><span className="font-display font-bold text-primary-foreground text-xs">{(p.full_name || p.email)?.[0]?.toUpperCase()}</span></div>
                      <span className="font-body text-sm font-medium text-foreground">{p.full_name || 'No name'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                      userRoles[p.id] === 'admin' ? 'bg-purple-100 text-purple-700' :
                      userRoles[p.id] === 'tour_manager' ? 'bg-teal-100 text-teal-700' :
                      userRoles[p.id] === 'accountant' ? 'bg-blue-100 text-blue-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Shield className="w-3 h-3" /> {userRoles[p.id] || 'client'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Select value={userRoles[p.id] || 'client'} onValueChange={v => changeRole(p.id, v)}>
                      <SelectTrigger className="w-36 font-body text-xs h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{roles.map(r => <SelectItem key={r} value={r} className="font-body text-xs">{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManager;
