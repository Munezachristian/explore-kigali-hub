import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Clock, CreditCard, FileText, LogOut, Menu, X, LayoutDashboard, CalendarCheck, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['hsl(175,55%,28%)', 'hsl(40,90%,52%)', 'hsl(215,60%,18%)', 'hsl(0,72%,51%)'];

const AccountantDashboard = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ totalRevenue: 0, pendingPayments: 0, confirmedPayments: 0, totalBookings: 0 });
  const [payments, setPayments] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (!user || role !== 'accountant') { navigate('/'); return; }
    fetchData();
  }, [user, role, navigate]);

  const fetchData = async () => {
    const { data: allPayments } = await supabase.from('payments').select('*, bookings(*, packages(title))').order('created_at', { ascending: false });
    if (allPayments) {
      setPayments(allPayments);
      const confirmed = allPayments.filter(p => p.status === 'confirmed');
      const pending = allPayments.filter(p => p.status === 'pending');
      const totalRev = confirmed.reduce((s, p) => s + (p.amount || 0), 0);
      setStats({ totalRevenue: totalRev, pendingPayments: pending.length, confirmedPayments: confirmed.length, totalBookings: allPayments.length });

      // Monthly data
      const months: Record<string, number> = {};
      confirmed.forEach(p => {
        const m = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        months[m] = (months[m] || 0) + (p.amount || 0);
      });
      setMonthlyData(Object.entries(months).map(([name, revenue]) => ({ name, revenue })));

      // Status data
      const statusMap: Record<string, number> = {};
      allPayments.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));
    }
  };

  const confirmPayment = async (paymentId: string) => {
    const { error } = await supabase.from('payments').update({ status: 'confirmed', confirmed_by: user!.id }).eq('id', paymentId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Payment confirmed' }); fetchData(); }
  };

  const exportCSV = () => {
    const headers = 'Date,Amount,Status,Method,Transaction Ref\n';
    const rows = payments.map(p => `${new Date(p.created_at).toLocaleDateString()},${p.amount},${p.status},${p.payment_method || 'N/A'},${p.transaction_ref || 'N/A'}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'payments', icon: CreditCard, label: 'Payments', badge: stats.pendingPayments },
    { id: 'reports', icon: FileText, label: 'Reports' },
  ];

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: 'Confirmed' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Awaiting confirmation' },
    { label: 'Confirmed', value: stats.confirmedPayments, icon: CheckCircle, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'Completed' },
    { label: 'Total Transactions', value: stats.totalBookings, icon: TrendingUp, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', sub: 'All time' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`} style={{ background: 'hsl(215 60% 14%)' }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold"><span className="text-navy font-display font-bold">E</span></div>
              <div><div className="font-display font-bold text-white text-base">ESA Tours</div><div className="font-body text-gold text-xs">Finance Panel</div></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/8">
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shrink-0"><span className="font-display font-bold text-navy text-sm">{user?.email?.[0]?.toUpperCase()}</span></div>
            <div className="min-w-0"><div className="font-body text-white text-sm font-medium truncate">{user?.email}</div><Badge className="bg-blue-400/20 text-blue-300 border-0 text-[10px] font-body mt-0.5">Accountant</Badge></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-body text-sm ${activeSection === id ? 'bg-gradient-gold text-navy font-semibold shadow-gold' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              <Icon className="w-4 h-4 shrink-0" /><span className="flex-1 text-left">{label}</span>
              {badge ? <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-red-500 text-white">{badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><Menu className="w-5 h-5" /></button>
            <div><h1 className="font-display font-bold text-foreground text-xl capitalize">{activeSection}</h1><p className="font-body text-muted-foreground text-xs">Financial Management</p></div>
          </div>
          <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex"><Link to="/">← View Site</Link></Button>
        </header>

        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, gradient, sub }) => (
                  <div key={label} className="bg-card rounded-2xl p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shadow-md`}><Icon className="w-5 h-5 text-white" /></div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground mb-0.5">{value}</div>
                    <div className="font-body text-sm font-medium text-foreground">{label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Monthly Revenue</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(175,55%,28%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Payment Status</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-semibold text-foreground">All Payments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>{['Package', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground font-body text-sm">No payments found</td></tr>
                    ) : payments.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-body text-sm text-foreground">{(p.bookings as any)?.packages?.title || 'N/A'}</td>
                        <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${p.amount}</td>
                        <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.payment_method || 'N/A'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          {p.status === 'pending' && (
                            <Button size="sm" onClick={() => confirmPayment(p.id)} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 font-body text-xs h-8">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">Revenue Trend</h3>
                  <Button onClick={exportCSV} variant="outline" size="sm" className="font-body text-xs"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(175,55%,28%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</div>
                    <div className="font-body text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{stats.confirmedPayments}</div>
                    <div className="font-body text-sm text-muted-foreground">Confirmed Payments</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{stats.pendingPayments}</div>
                    <div className="font-body text-sm text-muted-foreground">Pending Payments</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
