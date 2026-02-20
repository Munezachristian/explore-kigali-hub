import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package, CalendarCheck, FileText, MessageSquare, Settings, LogOut,
  TrendingUp, Clock, Star, ChevronRight, Menu, X, Users, BookOpen,
  Image, Bell, LayoutDashboard, DollarSign, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface Stats {
  packages: number;
  bookings: number;
  revenue: number;
  internships: number;
  testimonials: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SectionPlaceholder = ({ section }: { section: string }) => (
  <div className="bg-card rounded-2xl shadow-card p-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Settings className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground mb-2 capitalize">{section.replace('-', ' ')} Module</h3>
    <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
      This module is ready for your content. Full CRUD functionality will be available here.
    </p>
  </div>
);

const AdminDashboard = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ packages: 0, bookings: 0, revenue: 0, internships: 0, testimonials: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, role, navigate]);

  const fetchStats = async () => {
    const [{ count: pkgCount }, { count: bkCount }, { data: payments }, { count: intCount }, { count: testiCount }] = await Promise.all([
      supabase.from('packages').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'confirmed'),
      supabase.from('internships').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    ]);
    const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    setStats({ packages: pkgCount || 0, bookings: bkCount || 0, revenue, internships: intCount || 0, testimonials: testiCount || 0 });

    const { data: bks } = await supabase.from('bookings').select('*, packages(title)').order('created_at', { ascending: false }).limit(5);
    if (bks) setRecentBookings(bks);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'packages', icon: Package, label: 'Packages' },
    { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
    { id: 'users', icon: Users, label: 'Users & Roles' },
    { id: 'blog', icon: BookOpen, label: 'Blog' },
    { id: 'gallery', icon: Image, label: 'Gallery' },
    { id: 'testimonials', icon: Star, label: 'Testimonials', badge: stats.testimonials },
    { id: 'internships', icon: FileText, label: 'Internships', badge: stats.internships },
    { id: 'info', icon: MessageSquare, label: 'Info Center' },
    { id: 'logs', icon: Bell, label: 'System Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: 'Confirmed payments' },
    { label: 'Total Bookings', value: stats.bookings, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'All time' },
    { label: 'Tour Packages', value: stats.packages, icon: Package, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Active listings' },
    { label: 'Pending Reviews', value: stats.testimonials, icon: Star, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', sub: 'Awaiting approval' },
  ];

  const quickActions = [
    { label: 'Add New Package', icon: Package, section: 'packages', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { label: 'Review Testimonials', icon: Star, section: 'testimonials', gradient: 'bg-gradient-to-br from-purple-500 to-violet-600' },
    { label: 'View System Logs', icon: Bell, section: 'logs', gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-navy flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
                <span className="text-navy font-display font-bold">E</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-base">ESA Tours</div>
                <div className="font-body text-gold text-xs">Admin Panel</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/8">
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-navy text-sm">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-body text-white text-sm font-medium truncate">{user?.email}</div>
              <Badge className="bg-gold/20 text-gold border-0 text-[10px] font-body mt-0.5">Super Admin</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-body text-sm ${
                activeSection === id
                  ? 'bg-gradient-gold text-navy font-semibold shadow-gold'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge ? (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeSection === id ? 'bg-navy text-white' : 'bg-red-500 text-white'}`}>
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-foreground text-xl capitalize">{activeSection.replace('-', ' ')}</h1>
              <p className="font-body text-muted-foreground text-xs">ESA Tours Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex">
              <Link to="/">← View Site</Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, gradient, sub }) => (
                  <div key={label} className="bg-card rounded-2xl p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground mb-0.5">{value}</div>
                    <div className="font-body text-sm font-medium text-foreground">{label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent bookings */}
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-semibold text-foreground">Recent Bookings</h2>
                  <button onClick={() => setActiveSection('bookings')} className="text-xs text-primary hover:text-accent font-body flex items-center gap-1">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {['Package', 'Travelers', 'Amount', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentBookings.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-muted-foreground font-body text-sm">No bookings yet</td></tr>
                      ) : recentBookings.map(b => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-body text-sm text-foreground font-medium">{(b.packages as any)?.title || 'N/A'}</td>
                          <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{b.num_travelers}</td>
                          <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${b.total_amount || 0}</td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">
                            {new Date(b.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map(({ label, icon: Icon, section, gradient }) => (
                  <button
                    key={label}
                    onClick={() => setActiveSection(section)}
                    className="bg-card rounded-xl p-4 shadow-card hover-lift flex items-center gap-3 text-left"
                  >
                    <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-body text-sm font-semibold text-foreground">{label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection !== 'dashboard' && (
            <SectionPlaceholder section={activeSection} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
