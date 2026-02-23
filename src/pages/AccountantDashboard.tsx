import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, TrendingUp, Clock, CreditCard, FileText, LogOut, Menu, X, LayoutDashboard, CalendarCheck, Download, CheckCircle, Plus, TrendingDown, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardLanguageSwitch } from '@/components/DashboardLanguageSwitch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['hsl(175,55%,28%)', 'hsl(40,90%,52%)', 'hsl(215,60%,18%)', 'hsl(0,72%,51%)'];

const AccountantDashboard = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, totalIncomes: 0, pendingPayments: 0, confirmedPayments: 0, totalBookings: 0 });
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [salaryConfigs, setSalaryConfigs] = useState<any[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<any[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: '', description: '' });
  const [incomeForm, setIncomeForm] = useState({ amount: '', source: '', description: '' });
  const [salaryForm, setSalaryForm] = useState({ user_id: '', amount: '', paid_date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    if (!user || role !== 'accountant') { navigate('/'); return; }
    fetchData();
  }, [user, role, navigate]);

  const fetchData = async () => {
    const [
      { data: allPayments },
      { data: exp },
      { data: inc },
      { data: salaryCfg },
      { data: salaryPym },
      { data: bks },
      { data: profs },
    ] = await Promise.all([
      supabase.from('payments').select('*, bookings(*, packages(title))').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('incomes').select('*, bookings(*, packages(title))').order('created_at', { ascending: false }),
      supabase.from('user_salary_config').select('*'),
      supabase.from('salary_payments').select('*').order('paid_date', { ascending: false }),
      supabase.from('bookings').select('*, packages(title)').eq('status', 'confirmed').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email'),
    ]);

    if (allPayments) {
      setPayments(allPayments);
      const confirmed = allPayments.filter(p => p.status === 'confirmed');
      const pending = allPayments.filter(p => p.status === 'pending');
      const totalRev = confirmed.reduce((s, p) => s + (p.amount || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue: totalRev, pendingPayments: pending.length, confirmedPayments: confirmed.length, totalBookings: allPayments.length }));
      const months: Record<string, number> = {};
      confirmed.forEach((p: any) => {
        const m = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        months[m] = (months[m] || 0) + (p.amount || 0);
      });
      setMonthlyData(Object.entries(months).map(([name, revenue]) => ({ name, revenue })));
      const statusMap: Record<string, number> = {};
      allPayments.forEach((p: any) => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));
    }
    if (exp) {
      setExpenses(exp);
      const total = exp.reduce((s: number, e: any) => s + (e.amount || 0), 0);
      setStats(prev => ({ ...prev, totalExpenses: total }));
    }
    if (inc) {
      setIncomes(inc);
      const total = inc.reduce((s: number, i: any) => s + (i.amount || 0), 0);
      setStats(prev => ({ ...prev, totalIncomes: total }));
    }
    if (salaryCfg) setSalaryConfigs(salaryCfg);
    if (salaryPym) setSalaryPayments(salaryPym);
    if (bks) setConfirmedBookings(bks);
    if (profs) setProfiles(profs);
  };

  const confirmPayment = async (paymentId: string) => {
    const { error } = await supabase.from('payments').update({ status: 'confirmed', confirmed_by: user!.id }).eq('id', paymentId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { toast({ title: t('dash.payments') || 'Payment confirmed' }); fetchData(); }
  };

  const recordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: 'Invalid amount', variant: 'destructive' }); return; }
    const { error } = await supabase.from('expenses').insert({
      amount: amt,
      category: expenseForm.category || null,
      description: expenseForm.description || null,
      recorded_by: user!.id,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Expense recorded' }); setShowExpenseModal(false); setExpenseForm({ amount: '', category: '', description: '' }); fetchData(); }
  };

  const recordIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeForm.amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: 'Invalid amount', variant: 'destructive' }); return; }
    const { error } = await supabase.from('incomes').insert({
      amount: amt,
      source: incomeForm.source || null,
      description: incomeForm.description || null,
      recorded_by: user!.id,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Income recorded' }); setShowIncomeModal(false); setIncomeForm({ amount: '', source: '', description: '' }); fetchData(); }
  };

  const saveSalaryConfig = async (userId: string, amount: number) => {
    const existing = salaryConfigs.find(c => c.user_id === userId);
    const payload = { user_id: userId, salary_amount: amount, effective_from: new Date().toISOString().split('T')[0] };
    const { error } = existing
      ? await supabase.from('user_salary_config').update(payload).eq('user_id', userId)
      : await supabase.from('user_salary_config').insert(payload);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salary saved' }); fetchData(); }
  };

  const paySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(salaryForm.amount);
    if (isNaN(amt) || amt <= 0 || !salaryForm.user_id) { toast({ title: 'Invalid data', variant: 'destructive' }); return; }
    const { error } = await supabase.from('salary_payments').insert({
      user_id: salaryForm.user_id,
      amount: amt,
      paid_date: salaryForm.paid_date,
      notes: salaryForm.notes || null,
      recorded_by: user!.id,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Salary payment recorded' }); setShowSalaryModal(false); setSalaryForm({ user_id: '', amount: '', paid_date: new Date().toISOString().split('T')[0], notes: '' }); fetchData(); }
  };

  const exportCSV = () => {
    const lines = ['Type,Date,Amount,Details\n'];
    payments.forEach((p: any) => lines.push(`Payment,${new Date(p.created_at).toLocaleDateString()},${p.amount},${(p.bookings as any)?.packages?.title || ''}\n`));
    expenses.forEach((e: any) => lines.push(`Expense,${new Date(e.created_at).toLocaleDateString()},${e.amount},${e.category || e.description || ''}\n`));
    incomes.forEach((i: any) => lines.push(`Income,${new Date(i.created_at).toLocaleDateString()},${i.amount},${i.source || i.description || ''}\n`));
    salaryPayments.forEach((s: any) => lines.push(`Salary,${s.paid_date},${s.amount},${(s.profiles as any)?.full_name || ''}\n`));
    const blob = new Blob([lines.join('')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'payments', icon: CreditCard, label: t('dash.payments'), badge: stats.pendingPayments },
    { id: 'expenses', icon: TrendingDown, label: t('dash.expenses') },
    { id: 'incomes', icon: TrendingUp, label: t('dash.incomes') },
    { id: 'salaries', icon: Wallet, label: t('dash.salaries') },
    { id: 'bookings', icon: CalendarCheck, label: t('dash.confirmedBookings') },
    { id: 'reports', icon: FileText, label: t('dash.reports') },
  ];

  const statCards = [
    { label: t('dash.totalRevenue'), value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', sub: 'Confirmed' },
    { label: t('dash.pendingPayments'), value: stats.pendingPayments, icon: Clock, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', sub: 'Awaiting' },
    { label: 'Expenses', value: `$${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, gradient: 'bg-gradient-to-br from-red-500 to-rose-600', sub: 'Total' },
    { label: 'Incomes', value: `$${stats.totalIncomes.toLocaleString()}`, icon: TrendingUp, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', sub: 'Recorded' },
  ];

  const getSalaryForUser = (userId: string) => salaryConfigs.find(c => c.user_id === userId)?.salary_amount ?? 0;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`} style={{ background: 'hsl(215 60% 14%)' }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold"><span className="text-navy font-display font-bold">E</span></div>
              <div><div className="font-display font-bold text-white text-base">ESA Tours</div><div className="font-body text-gold text-xs">{t('dashboard')} Finance</div></div>
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
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm"><LogOut className="w-4 h-4" /> {t('dash.signOut')}</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><Menu className="w-5 h-5" /></button>
            <div><h1 className="font-display font-bold text-foreground text-xl capitalize">{activeSection}</h1><p className="font-body text-muted-foreground text-xs">{t('dashboard')} Finance</p></div>
          </div>
          <div className="flex items-center gap-2">
            <DashboardLanguageSwitch />
            <Button asChild variant="outline" size="sm" className="font-body text-xs hidden sm:flex"><Link to="/">← {t('dash.viewSite')}</Link></Button>
          </div>
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
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">{t('dash.totalRevenue')} Trend</h3>
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
                <h2 className="font-display font-semibold text-foreground">{t('dash.payments')} / Payment History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>{['Package', 'Amount', 'Method', 'Ref', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground font-body text-sm">No payments</td></tr>
                    ) : payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-body text-sm text-foreground">{(p.bookings as any)?.packages?.title || 'N/A'}</td>
                        <td className="px-5 py-3.5 font-body text-sm font-semibold text-foreground">${p.amount}</td>
                        <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.payment_method || 'N/A'}</td>
                        <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{p.transaction_ref || '-'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-3.5 font-body text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          {p.status === 'pending' && (
                            <Button size="sm" onClick={() => confirmPayment(p.id)} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 font-body text-xs h-8"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'expenses' && (
            <div className="space-y-4">
              <Button onClick={() => setShowExpenseModal(true)}><Plus className="w-4 h-4 mr-2" />{t('dash.recordExpense')}</Button>
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr>{['Date', 'Amount', 'Category', 'Description'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {expenses.map((e: any) => (
                      <tr key={e.id}><td className="px-5 py-3 font-body text-sm">{new Date(e.created_at).toLocaleDateString()}</td><td className="px-5 py-3 font-semibold text-red-600">-${e.amount}</td><td className="px-5 py-3 font-body text-sm">{e.category || '-'}</td><td className="px-5 py-3 font-body text-sm">{e.description || '-'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'incomes' && (
            <div className="space-y-4">
              <Button onClick={() => setShowIncomeModal(true)}><Plus className="w-4 h-4 mr-2" />{t('dash.recordIncome')}</Button>
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr>{['Date', 'Amount', 'Source', 'Description'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {incomes.map((i: any) => (
                      <tr key={i.id}><td className="px-5 py-3 font-body text-sm">{new Date(i.created_at).toLocaleDateString()}</td><td className="px-5 py-3 font-semibold text-emerald-600">+${i.amount}</td><td className="px-5 py-3 font-body text-sm">{i.source || '-'}</td><td className="px-5 py-3 font-body text-sm">{i.description || '-'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'salaries' && (
            <div className="space-y-4">
              <Button onClick={() => setShowSalaryModal(true)}><Plus className="w-4 h-4 mr-2" />{t('dash.paySalary')}</Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">Users & Salary Config</h3>
                  <div className="space-y-2">
                    {profiles.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50">
                        <div><span className="font-body text-sm font-medium">{p.full_name || p.email}</span></div>
                        <Input type="number" placeholder="Salary" className="w-24 h-8 text-sm" defaultValue={getSalaryForUser(p.id)} onBlur={(ev) => { const v = parseFloat(ev.target.value); if (!isNaN(v)) saveSalaryConfig(p.id, v); }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">Salary Payment History</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {salaryPayments.map((s: any) => (
                      <div key={s.id} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                        <span>{profiles.find((p: any) => p.id === s.user_id)?.full_name || profiles.find((p: any) => p.id === s.user_id)?.email || s.user_id}</span>
                        <span>${s.amount} - {s.paid_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bookings' && (
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display font-semibold text-foreground">{t('dash.confirmedBookings')}</h2>
                <p className="font-body text-xs text-muted-foreground">Track confirmed bookings for payment</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>{['Package', 'Travel Date', 'Travelers', 'Amount', 'Created'].map(h => <th key={h} className="text-left px-5 py-3 font-body text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {confirmedBookings.map((b: any) => (
                      <tr key={b.id}><td className="px-5 py-3 font-body text-sm">{(b.packages as any)?.title}</td><td className="px-5 py-3">{b.travel_date}</td><td className="px-5 py-3">{b.num_travelers}</td><td className="px-5 py-3 font-semibold">${b.total_amount}</td><td className="px-5 py-3 text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td></tr>
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
                  <LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="revenue" stroke="hsl(175,55%,28%)" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">{t('dash.recordExpense')}</h3>
            <form onSubmit={recordExpense} className="space-y-4">
              <div><Label>Amount</Label><Input type="number" step="0.01" required value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Category</Label><Input value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Office" /></div>
              <div><Label>Description</Label><Input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => setShowExpenseModal(false)}>Cancel</Button></div>
            </form>
          </div>
        </div>
      )}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">{t('dash.recordIncome')}</h3>
            <form onSubmit={recordIncome} className="space-y-4">
              <div><Label>Amount</Label><Input type="number" step="0.01" required value={incomeForm.amount} onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Source</Label><Input value={incomeForm.source} onChange={e => setIncomeForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Tour booking" /></div>
              <div><Label>Description</Label><Input value={incomeForm.description} onChange={e => setIncomeForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => setShowIncomeModal(false)}>Cancel</Button></div>
            </form>
          </div>
        </div>
      )}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">{t('dash.paySalary')}</h3>
            <form onSubmit={paySalary} className="space-y-4">
              <div><Label>User</Label><select required value={salaryForm.user_id} onChange={e => setSalaryForm(f => ({ ...f, user_id: e.target.value }))} className="w-full border rounded px-3 py-2">
                <option value="">Select user</option>
                {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
              </select></div>
              <div><Label>Amount</Label><Input type="number" step="0.01" required value={salaryForm.amount} onChange={e => setSalaryForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Paid Date</Label><Input type="date" required value={salaryForm.paid_date} onChange={e => setSalaryForm(f => ({ ...f, paid_date: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input value={salaryForm.notes} onChange={e => setSalaryForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="flex gap-2"><Button type="submit">Record Payment</Button><Button type="button" variant="outline" onClick={() => setShowSalaryModal(false)}>Cancel</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
