import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Package, CalendarCheck, FileText, MessageSquare, Settings, LogOut,
  TrendingUp, Star, Menu, X, Users, BookOpen,
  Image, Bell, LayoutDashboard, DollarSign, MapPin, Megaphone, Heart, HandHeart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DashboardLanguageSwitch } from '@/components/DashboardLanguageSwitch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PackageManager from '@/components/admin/PackageManager';
import UserRoleManager from '@/components/admin/UserRoleManager';
import BlogEditor from '@/components/admin/BlogEditor';
import GalleryManager from '@/components/admin/GalleryManager';
import BookingsManager from '@/components/admin/BookingsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import InternshipsManager from '@/components/admin/InternshipsManager';
import InfoCenterManager from '@/components/admin/InfoCenterManager';
import InformationCentersManager from '@/components/admin/InformationCentersManager';
import SystemLogs from '@/components/admin/SystemLogs';
import SettingsManager from '@/components/admin/Settings';
import FinancialManager from '@/components/admin/FinancialManager';
import AdvertisementsManager from '@/components/admin/AdvertisementsManager';
import UmurageKidsCenterManager from '@/components/admin/UmurageKidsCenterManager';
import VolunteerismManager from '@/components/admin/VolunteerismManager';

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

const AdminDashboard = () => {
  const { user, role, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ packages: 0, bookings: 0, revenue: 0, internships: 0, testimonials: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [bookingChartData, setBookingChartData] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, role, navigate]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const [{ count: pkgCount }, { count: bkCount }, { data: payments }, { count: intCount }, { count: testiCount }] = await Promise.all([
        supabase.from('packages').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount, created_at').eq('status', 'confirmed'),
        supabase.from('internships').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      ]);
      const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      setStats({ packages: pkgCount || 0, bookings: bkCount || 0, revenue, internships: intCount || 0, testimonials: testiCount || 0 });

      const { data: bks } = await supabase.from('bookings').select('*, packages(title)').order('created_at', { ascending: false }).limit(5);
      if (bks) setRecentBookings(bks);

      const { data: allBookings } = await supabase.from('bookings').select('created_at').order('created_at', { ascending: false }).limit(200);
      if (allBookings?.length) {
        const byMonth: Record<string, number> = {};
        allBookings.forEach((b: any) => {
          const m = new Date(b.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
          byMonth[m] = (byMonth[m] || 0) + 1;
        });
        setBookingChartData(Object.entries(byMonth).map(([name, count]) => ({ name, count })));
      }

      if (payments?.length) {
        const byMonth: Record<string, number> = {};
        payments.forEach((p: any) => {
          const m = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
          byMonth[m] = (byMonth[m] || 0) + (p.amount || 0);
        });
        setRevenueChartData(Object.entries(byMonth).map(([name, revenue]) => ({ name, revenue })));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'packages', icon: Package, label: 'Packages' },
    { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
    { id: 'financial', icon: DollarSign, label: 'Financial' },
    { id: 'users', icon: Users, label: 'Users & Roles' },
    { id: 'blog', icon: BookOpen, label: 'Blog' },
    { id: 'gallery', icon: Image, label: 'Gallery' },
    { id: 'testimonials', icon: Star, label: 'Testimonials', badge: stats.testimonials },
    { id: 'internships', icon: FileText, label: 'Internships', badge: stats.internships },
    { id: 'info', icon: MessageSquare, label: 'Info Center' },
    { id: 'information-centers', icon: MapPin, label: 'Information Centers' },
    { id: 'advertisements', icon: Megaphone, label: 'Advertisements' },
    { id: 'kids-center', icon: Heart, label: 'Umurage Kids Center' },
    { id: 'volunteerism', icon: HandHeart, label: 'Volunteerism' },
    { id: 'logs', icon: Bell, label: 'System Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: 'Confirmed payments' },
    { label: 'Total Bookings', value: stats.bookings, icon: CalendarCheck, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'All time' },
    { label: 'Tour Packages', value: stats.packages, icon: Package, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Active listings' },
    { label: 'Pending Reviews', value: stats.testimonials, icon: Star, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600', sub: 'Awaiting approval' },
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
            {t('dash.signOut')}
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
            <DashboardLanguageSwitch />
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex">
              <Link to="/">← {t('dash.viewSite')}</Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  <span className="text-muted-foreground">Loading dashboard data...</span>
                </div>
              ) : (
                <>
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

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bookings Chart */}
                    <div className="bg-card rounded-2xl shadow-card p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Bookings Over Time</h3>
                      {bookingChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={bookingChartData}>
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

                    {/* Revenue Chart */}
                    <div className="bg-card rounded-2xl shadow-card p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue Over Time</h3>
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={revenueChartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill="hsl(45,93%,47%)" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground font-body text-sm text-center py-8">No revenue data yet</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  {recentBookings.length > 0 && (
                    <div className="bg-card rounded-2xl shadow-card p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Package</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentBookings.map((booking) => (
                              <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                <td className="py-2.5 px-3 text-foreground">{booking.packages?.title ?? 'N/A'}</td>
                                <td className="py-2.5 px-3">
                                  <StatusBadge status={booking.status} />
                                </td>
                                <td className="py-2.5 px-3 text-muted-foreground">
                                  {new Date(booking.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'packages' && <PackageManager />}
          {activeSection === 'bookings' && <BookingsManager />}
          {activeSection === 'financial' && <FinancialManager />}
          {activeSection === 'users' && <UserRoleManager />}
          {activeSection === 'blog' && <BlogEditor />}
          {activeSection === 'gallery' && <GalleryManager />}
          {activeSection === 'testimonials' && <TestimonialsManager />}
          {activeSection === 'internships' && <InternshipsManager />}
          {activeSection === 'info' && <InfoCenterManager />}
          {activeSection === 'information-centers' && <InformationCentersManager />}
          {activeSection === 'advertisements' && <AdvertisementsManager />}
          {activeSection === 'kids-center' && <UmurageKidsCenterManager />}
          {activeSection === 'volunteerism' && <VolunteerismManager />}
          {activeSection === 'logs' && <SystemLogs />}
          {activeSection === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

