import { useEffect, useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const [{ data: profs }, { data: rls }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
    ]);
    if (profs) setProfiles(profs);
    if (rls) {
      const map: Record<string, string> = {};
      rls.forEach(r => { map[r.user_id] = r.role; });
      setUserRoles(map);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    // Upsert role
    const existing = userRoles[userId];
    if (existing) {
      const { error } = await supabase.from('user_roles').update({ role: newRole as any, assigned_by: currentUser?.id }).eq('user_id', userId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole as any, assigned_by: currentUser?.id });
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'Role updated' });
    fetchUsers();
  };

  const filtered = profiles.filter(p => !search || p.email?.toLowerCase().includes(search.toLowerCase()) || p.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Users & Roles ({profiles.length})</h2>
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
                      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shrink-0"><span className="font-display font-bold text-navy text-xs">{(p.full_name || p.email)?.[0]?.toUpperCase()}</span></div>
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
