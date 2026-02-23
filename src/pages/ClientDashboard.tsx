import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, CalendarCheck, Heart, Star, LogOut, Menu, X, LayoutDashboard, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLanguageSwitch } from '@/components/DashboardLanguageSwitch';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(175,55%,28%)', 'hsl(40,90%,52%)', 'hsl(215,60%,18%)', 'hsl(0,72%,51%)'];

const ClientDashboard = () => {
  const { user, role, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ bookings: 0, saved: 0, completed: 0, pending: 0 });
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [savedPackages, setSavedPackages] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (role === 'admin' || role === 'tour_manager' || role === 'accountant') {
      navigate(role === 'admin' ? '/admin' : role === 'tour_manager' ? '/manager' : '/accountant');
      return;
    }
    fetchData();
  }, [user, role, navigate]);

  const fetchData = async () => {
    if (!user) return;
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, packages(title, price)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    if (bookings) {
      setMyBookings(bookings);
      const pending = bookings.filter(b => b.status === 'pending').length;
      const completed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
      setStats({
        bookings: bookings.length,
        saved: 0,
        completed,
        pending,
      });
      const byMonth: Record<string, number> = {};
      bookings.forEach(b => {
        const m = new Date(b.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        byMonth[m] = (byMonth[m] || 0) + 1;
      });
      setChartData(Object.entries(byMonth).map(([name, count]) => ({ name, count })));
      const statusMap: Record<string, number> = {};
      bookings.forEach(b => { statusMap[b.status] = (statusMap[b.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));
    }

    const { data: saved } = await supabase
      .from('saved_packages')
      .select('id, package_id')
      .eq('user_id', user.id);
    if (saved) {
      setStats(prev => ({ ...prev, saved: saved.length }));
      setSavedPackages(saved);
    }
  };

  const statCards = [
    { label: 'My Bookings', value: stats.bookings, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'All time' },
    { label: 'Pending', value: stats.pending, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Awaiting confirmation' },
    { label: 'Completed', value: stats.completed, icon: Package, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: 'Confirmed/Completed' },
    { label: 'Saved Packages', value: stats.saved, icon: Heart, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', sub: 'Wishlist' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`} style={{ background: 'hsl(175 55% 18%)' }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
                <span className="text-navy font-display font-bold">E</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-base">ESA Tours</div>
                <div className="font-body text-gold text-xs">My Dashboard</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/8">
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-navy text-sm">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-body text-white text-sm font-medium truncate">{user?.email}</div>
              <Badge className="bg-teal-400/20 text-teal-300 border-0 text-[10px] font-body mt-0.5">Client</Badge>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <button
            onClick={() => { setActiveSection('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-body text-sm ${activeSection === 'dashboard' ? 'bg-gradient-gold text-navy font-semibold' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Dashboard</span>
          </button>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm">
            <LogOut className="w-4 h-4" /> {t('dash.signOut')}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-foreground text-xl">Dashboard</h1>
              <p className="font-body text-muted-foreground text-xs">Your tours and bookings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DashboardLanguageSwitch />
            <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex">
              <Link to="/packages">Browse Packages</Link>
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, gradient, sub }) => (
                <div key={label} className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground mb-0.5">{value}</div>
                  <div className="font-body text-sm font-medium text-foreground">{label}</div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Bookings Over Time</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(175,55%,28%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground font-body text-sm text-center py-8">No booking data yet</p>
                )}
              </div>
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Booking Status</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground font-body text-sm text-center py-8">No booking data yet</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-semibold text-foreground">My Recent Bookings</h2>
                <Button asChild variant="ghost" size="sm" className="font-body text-xs">
                  <Link to="/packages">Book a tour</Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                {myBookings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground font-body">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No bookings yet. <Link to="/packages" className="text-primary hover:underline">Explore packages</Link></p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {['Package', 'Travelers', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {myBookings.slice(0, 10).map(b => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-body text-sm text-foreground font-medium">{(b.packages as any)?.title || 'N/A'}</td>
                          <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{b.num_travelers}</td>
                          <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${b.total_amount || 0}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5">
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/packages/${b.package_id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
