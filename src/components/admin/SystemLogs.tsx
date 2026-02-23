import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Info,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  module: string;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: any;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const logsPerPage = 20;
  const levels = ['all', 'info', 'warning', 'error', 'success'];
  const modules = ['all', 'auth', 'bookings', 'packages', 'users', 'payments', 'admin', 'api'];
  const dateFilters = ['all', 'today', 'yesterday', 'last-7-days', 'last-30-days'];

  // Static data for demonstration
  const staticLogs: SystemLog[] = [
    {
      id: '1',
      level: 'info',
      message: 'User logged in successfully',
      module: 'auth',
      user_id: 'user123',
      user_email: 'admin@example.com',
      ip_address: '192.168.1.1',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      level: 'success',
      message: 'New booking created for package "Gorilla Trekking Adventure"',
      module: 'bookings',
      user_id: 'user456',
      user_email: 'customer@example.com',
      ip_address: '192.168.1.2',
      created_at: '2024-01-15T10:25:00Z'
    },
    {
      id: '3',
      level: 'warning',
      message: 'Failed login attempt - invalid credentials',
      module: 'auth',
      user_id: null,
      user_email: 'unknown@example.com',
      ip_address: '192.168.1.3',
      created_at: '2024-01-15T10:20:00Z'
    },
    {
      id: '4',
      level: 'error',
      message: 'Payment processing failed for booking #1234',
      module: 'payments',
      user_id: 'user789',
      user_email: 'customer2@example.com',
      ip_address: '192.168.1.4',
      created_at: '2024-01-15T10:15:00Z',
      metadata: { error_code: 'PAYMENT_DECLINED', amount: 1200 }
    },
    {
      id: '5',
      level: 'info',
      message: 'Admin user accessed dashboard',
      module: 'admin',
      user_id: 'admin123',
      user_email: 'admin@example.com',
      ip_address: '192.168.1.1',
      created_at: '2024-01-15T10:10:00Z'
    },
    {
      id: '6',
      level: 'success',
      message: 'Package "Safari Experience" updated successfully',
      module: 'packages',
      user_id: 'admin123',
      user_email: 'admin@example.com',
      ip_address: '192.168.1.1',
      created_at: '2024-01-15T10:05:00Z'
    },
    {
      id: '7',
      level: 'warning',
      message: 'High memory usage detected on server',
      module: 'system',
      user_id: null,
      ip_address: '192.168.1.100',
      created_at: '2024-01-15T10:00:00Z',
      metadata: { memory_usage: '85%', cpu_usage: '45%' }
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          filterDate.setDate(now.getDate() - 1);
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'last-7-days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last-30-days':
          filterDate.setDate(now.getDate() - 30);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, levelFilter, moduleFilter, dateFilter, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to prevent performance issues
      
      if (error) throw error;
      
      // Transform database logs to match interface, being tolerant of non-JSON details
      const transformedLogs = (data || []).map((log: any) => {
        let metadata: any = null;
        if (log.details) {
          if (typeof log.details === 'object') {
            metadata = log.details;
          } else {
            const text = String(log.details).trim();
            if (text.startsWith('{') || text.startsWith('[')) {
              try {
                metadata = JSON.parse(text);
              } catch {
                metadata = text;
              }
            } else {
              metadata = text;
            }
          }
        }

        return {
          id: log.id,
          level: (log.action?.toLowerCase().includes('error') ? 'error' :
                  log.action?.toLowerCase().includes('warning') ? 'warning' :
                  log.action?.toLowerCase().includes('success') ? 'success' : 'info') as 'info' | 'warning' | 'error' | 'success',
          message: log.action || 'System action',
          module: log.user_role || 'system',
          user_id: log.user_id,
          user_email: null, // Would need a join with profiles/auth.users
          ip_address: log.ip_address,
          user_agent: null,
          created_at: log.created_at,
          metadata,
        };
      });
      
      setLogs(transformedLogs);
      setFilteredLogs(transformedLogs);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      // Fallback to empty array if table doesn't exist yet
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      info: { color: 'bg-blue-100 text-blue-700', icon: Info, label: 'Info' },
      warning: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, label: 'Warning' },
      error: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Error' },
      success: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Success' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.info;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const exportLogs = () => {
    const headers = ['Level', 'Message', 'Module', 'User', 'IP Address', 'Time'];
    const rows = filteredLogs.map((log) => [
      log.level,
      log.message,
      log.module,
      log.user_email || 'System',
      log.ip_address || 'N/A',
      new Date(log.created_at).toLocaleString(),
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshLogs = () => {
    setLoading(true);
    fetchLogs();
  };

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">System Logs</h2>
          <p className="font-body text-muted-foreground">Monitor system activity and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.level === 'error').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredLogs.filter(l => l.level === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredLogs.filter(l => l.level === 'success').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {modules.map(module => (
                  <option key={module} value={module}>
                    {module === 'all' ? 'All Modules' : module.charAt(0).toUpperCase() + module.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {dateFilters.map(filter => (
                  <option key={filter} value={filter}>
                    {filter === 'all' ? 'All Time' : filter.replace('-', ' ').charAt(0).toUpperCase() + filter.replace('-', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            Showing {paginatedLogs.length} of {filteredLogs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Message</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Module</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">User</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {getLevelBadge(log.level)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{log.message}</p>
                        {log.metadata && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{log.module}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {log.user_email ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{log.user_email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{log.ip_address || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-sm text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
