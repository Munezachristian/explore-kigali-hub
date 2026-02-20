import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, CalendarCheck, FileText, LogOut, LayoutDashboard, BookOpen, Image, Users, ChevronRight, TrendingUp, Clock, Menu, X, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SectionPlaceholder = ({ section }: { section: string }) => (
  <div className="bg-card rounded-2xl shadow-card p-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Settings className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground mb-2 capitalize">{section.replace('-', ' ')} Module</h3>
    <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">This module is ready for your content.</p>
  </div>
);

const ManagerDashboard = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ packages: 0, pendingBookings: 0, pendingInternships: 0, activePackages: 0 });

  useEffect(() => {
    if (!user || role !== 'tour_manager') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, role, navigate]);

  const fetchStats = async () => {
    const [{ count: pkgCount }, { count: pendingBk }, { count: intCount }, { count: activePkg }] = await Promise.all([
      supabase.from('packages').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('internships').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('packages').select('*', { count: 'exact', head: true }).eq('availability', true),
    ]);
    setStats({ packages: pkgCount || 0, pendingBookings: pendingBk || 0, pendingInternships: intCount || 0, activePackages: activePkg || 0 });
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'packages', icon: Package, label: 'Packages' },
    { id: 'bookings', icon: CalendarCheck, label: 'Bookings', badge: stats.pendingBookings },
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'blog', icon: BookOpen, label: 'Blog' },
    { id: 'gallery', icon: Image, label: 'Gallery' },
    { id: 'internships', icon: FileText, label: 'Internships', badge: stats.pendingInternships },
    { id: 'info', icon: Settings, label: 'Info Center' },
  ];

  const statCards = [
    { label: 'Active Packages', value: stats.activePackages, icon: Package, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Available tours' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'Need approval' },
    { label: 'Total Packages', value: stats.packages, icon: TrendingUp, gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600', sub: 'All packages' },
    { label: 'Pending Internships', value: stats.pendingInternships, icon: FileText, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', sub: 'To review' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}
        style={{ background: 'hsl(175 55% 18%)' }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
                <span className="text-navy font-display font-bold">E</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-base">ESA Tours</div>
                <div className="font-body text-gold text-xs">Tour Manager</div>
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
              <Badge className="bg-teal-400/20 text-teal-300 border-0 text-[10px] font-body mt-0.5">Tour Manager</Badge>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-body text-sm ${activeSection === id ? 'bg-gradient-gold text-navy font-semibold' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge ? <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-red-500 text-white">{badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
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
              <h1 className="font-display font-bold text-foreground text-xl capitalize">{activeSection.replace('-', ' ')}</h1>
              <p className="font-body text-muted-foreground text-xs">Tour Manager Portal</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex">
            <Link to="/">← View Site</Link>
          </Button>
        </header>

        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, gradient, sub }) => (
                  <div key={label} className="bg-card rounded-2xl p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground mb-0.5">{value}</div>
                    <div className="font-body text-sm font-medium text-foreground">{label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Manage Packages', icon: Package, section: 'packages', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
                  { label: 'Review Bookings', icon: CalendarCheck, section: 'bookings', gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
                  { label: 'Review Internships', icon: FileText, section: 'internships', gradient: 'bg-gradient-to-br from-purple-500 to-violet-600' },
                  { label: 'Manage Gallery', icon: Image, section: 'gallery', gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
                ].map(({ label, icon: Icon, section, gradient }) => (
                  <button key={label} onClick={() => setActiveSection(section)}
                    className="bg-card rounded-xl p-4 shadow-card hover-lift flex items-center gap-3 text-left">
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
          {activeSection !== 'dashboard' && <SectionPlaceholder section={activeSection} />}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
