import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

interface FinancialSummary {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  pendingPayments: number;
  confirmedPayments: number;
  cancelledBookings: number;
  completedBookings: number;
  monthlyRevenue: { name: string; revenue: number }[];
  paymentMethods: { name: string; value: number }[];
  recentTransactions: any[];
}

const COLORS = ['#0f766e', '#0284c7', '#d97706', '#7c3aed', '#db2777'];

const CustomTooltipRevenue = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-emerald-600 font-bold">${Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700">{payload[0].name}</p>
        <p className="text-gray-600">{payload[0].value} transactions</p>
        <p className="text-gray-500">{(payload[0].payload.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FinancialManager = () => {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    pendingPayments: 0,
    confirmedPayments: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    monthlyRevenue: [],
    paymentMethods: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7days':  startDate.setDate(now.getDate() - 7); break;
        case '30days': startDate.setDate(now.getDate() - 30); break;
        case '90days': startDate.setDate(now.getDate() - 90); break;
        case '1year':  startDate.setFullYear(now.getFullYear() - 1); break;
      }

      const [
        { data: confirmedPayments, error: paymentsError },
        { data: pendingPaymentsData, error: pendingError },
        { data: bookings, error: bookingsError },
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('status', 'confirmed')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('status', 'pending')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('bookings')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
      ]);

      if (paymentsError) throw paymentsError;
      if (pendingError) throw pendingError;
      if (bookingsError) throw bookingsError;

      const totalRevenue = confirmedPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const totalBookingsCount = bookings?.length || 0;
      const averageBookingValue = totalBookingsCount > 0 ? totalRevenue / totalBookingsCount : 0;
      const confirmedPaymentsCount = confirmedPayments?.length || 0;
      const pendingPaymentsCount = pendingPaymentsData?.length || 0;
      const completedBookingsCount = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelledBookingsCount = bookings?.filter(b => b.status === 'cancelled').length || 0;

      // Monthly revenue
      const monthlyData: Record<string, number> = {};
      confirmedPayments?.forEach((p: any) => {
        const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyData[month] = (monthlyData[month] || 0) + (p.amount || 0);
      });
      const monthlyRevenue = Object.entries(monthlyData).map(([name, revenue]) => ({ name, revenue }));

      // Payment methods
      const methodsData: Record<string, number> = {};
      confirmedPayments?.forEach((p: any) => {
        const method = p.method || 'Unknown';
        methodsData[method] = (methodsData[method] || 0) + 1;
      });
      const paymentMethods = Object.entries(methodsData).map(([name, value]) => ({ name, value }));

      // Enrich pie data with percent for tooltip
      const total = paymentMethods.reduce((s, m) => s + m.value, 0);
      const paymentMethodsWithPercent = paymentMethods.map(m => ({
        ...m,
        percent: total > 0 ? m.value / total : 0,
      }));

      setSummary({
        totalRevenue,
        totalBookings: totalBookingsCount,
        averageBookingValue,
        pendingPayments: pendingPaymentsCount,
        confirmedPayments: confirmedPaymentsCount,
        cancelledBookings: cancelledBookingsCount,
        completedBookings: completedBookingsCount,
        monthlyRevenue,
        paymentMethods: paymentMethodsWithPercent,
        recentTransactions: confirmedPayments?.slice(0, 10) || [],
      });
    } catch (error: any) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialReport = () => {
    const headers = ['Date', 'Amount', 'Method', 'Status', 'Reference'];
    const rows = summary.recentTransactions.map((t: any) => [
      new Date(t.created_at).toLocaleDateString(),
      t.amount || 0,
      t.method || 'Unknown',
      t.status || 'Unknown',
      t.transaction_id || 'N/A',
    ]);
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="font-body text-muted-foreground text-sm">Track revenue, payments, and financial performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchFinancialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportFinancialReport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="rounded-2xl shadow-card border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">${summary.totalRevenue.toLocaleString()}</p>
            <p className="font-body text-sm font-medium text-foreground mt-0.5">Total Revenue</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Confirmed payments only</p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="rounded-2xl shadow-card border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{summary.totalBookings}</p>
            <p className="font-body text-sm font-medium text-foreground mt-0.5">Total Bookings</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {summary.completedBookings} completed · {summary.cancelledBookings} cancelled
            </p>
          </CardContent>
        </Card>

        {/* Avg Booking Value */}
        <Card className="rounded-2xl shadow-card border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <ArrowDownRight className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">${Math.round(summary.averageBookingValue).toLocaleString()}</p>
            <p className="font-body text-sm font-medium text-foreground mt-0.5">Avg. Booking Value</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Revenue ÷ total bookings</p>
          </CardContent>
        </Card>

        {/* Payments Status */}
        <Card className="rounded-2xl shadow-card border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-md">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-500" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{summary.confirmedPayments}</p>
            <p className="font-body text-sm font-medium text-foreground mt-0.5">Confirmed Payments</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{summary.pendingPayments} still pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend - takes 2/3 width */}
        <Card className="lg:col-span-2 rounded-2xl shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-semibold">Revenue Trend</CardTitle>
            <CardDescription className="font-body text-sm">Monthly confirmed revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={summary.monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTooltipRevenue />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ fill: '#0f766e', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#0f766e', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground font-body text-sm">
                No revenue data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Donut - takes 1/3 width */}
        <Card className="rounded-2xl shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-semibold">Payment Methods</CardTitle>
            <CardDescription className="font-body text-sm">Distribution of payment types</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.paymentMethods.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={summary.paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {summary.paymentMethods.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipPie />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="mt-2 space-y-1.5">
                  {summary.paymentMethods.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-body text-xs text-foreground capitalize">{method.name}</span>
                      </div>
                      <span className="font-body text-xs font-semibold text-muted-foreground">{method.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground font-body text-sm">
                No payment data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="rounded-2xl shadow-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="font-body text-sm">Latest 10 confirmed payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground font-body text-sm py-8">No transactions found for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((transaction: any) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        ${(transaction.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs">
                          {transaction.method || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          transaction.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          transaction.status === 'pending'   ? 'bg-amber-100 text-amber-700' :
                                                               'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                        {transaction.transaction_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialManager;