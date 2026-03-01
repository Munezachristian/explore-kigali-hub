import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, FileText, Users, CheckCircle, XCircle, Eye, Download,
  Calendar, Phone, GraduationCap, Briefcase, ChevronLeft, ChevronRight, Clock, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  id: string;
  applicant_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  type: string;
  university: string | null;
  cover_letter: string | null;
  cv_url: string | null;
  status: string;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

const InternshipsManager = () => {
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  const internshipsPerPage = 10;
  const statuses = ['all', 'pending', 'reviewing', 'accepted', 'rejected'];

  useEffect(() => { fetchInternships(); }, []);

  useEffect(() => {
    let filtered = internships;
    if (statusFilter !== 'all') filtered = filtered.filter(i => i.status === statusFilter);
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.university || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredInternships(filtered);
    setCurrentPage(1);
  }, [internships, statusFilter, searchTerm]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInternships((data || []) as unknown as Internship[]);
    } catch (err: any) {
      console.error('[Internships] Fetch error:', err);
      setError(err.message || 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('internships')
        .update({ status: newStatus, reviewed_by: user?.id || null, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast({ title: 'Success', description: `Application ${newStatus} successfully` });
    } catch (err: any) {
      console.error('[Internships] Update error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
      reviewing: { color: 'bg-blue-100 text-blue-700', label: 'Reviewing' },
      accepted: { color: 'bg-emerald-100 text-emerald-700', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const totalPages = Math.ceil(filteredInternships.length / internshipsPerPage);
  const startIndex = (currentPage - 1) * internshipsPerPage;
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + internshipsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span className="text-muted-foreground">Loading internships...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchInternships} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Internships Management</h2>
          <p className="font-body text-muted-foreground">Manage internship applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total</p><p className="text-2xl font-bold">{internships.length}</p></div><FileText className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-600">{internships.filter(i => i.status === 'pending').length}</p></div><Clock className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Reviewing</p><p className="text-2xl font-bold text-blue-600">{internships.filter(i => i.status === 'reviewing').length}</p></div><Search className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Accepted</p><p className="text-2xl font-bold text-emerald-600">{internships.filter(i => i.status === 'accepted').length}</p></div><CheckCircle className="h-8 w-8 text-emerald-500" /></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search applications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(status => (
                <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {paginatedInternships.map((intern) => (
          <Card key={intern.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{intern.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{intern.email}</p>
                    {intern.phone && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {intern.phone}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(intern.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><GraduationCap className="h-4 w-4" /> Type</div>
                  <p className="font-medium capitalize">{intern.type}</p>
                  {intern.university && <p className="text-sm text-muted-foreground">{intern.university}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Briefcase className="h-4 w-4" /> Cover Letter</div>
                  <p className="text-sm line-clamp-2">{intern.cover_letter || 'N/A'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> Applied</div>
                  <p className="text-sm">{new Date(intern.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updated: {new Date(intern.updated_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInternship(intern)}><Eye className="h-4 w-4" /></Button>
                  {intern.cv_url && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(intern.cv_url!, '_blank')}><Download className="h-4 w-4" /></Button>
                  )}
                  {/* Show accept/reject for both pending and reviewing */}
                  {(intern.status === 'pending' || intern.status === 'reviewing') && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(intern.id, 'accepted')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Accept">
                        <CheckCircle className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(intern.id, 'rejected')} className="text-red-600 border-red-200 hover:bg-red-50" title="Reject">
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}>{page}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedInternship.full_name}</div>
                  <div><span className="font-medium">Email:</span> {selectedInternship.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedInternship.phone || 'N/A'}</div>
                  <div><span className="font-medium">Type:</span> <span className="capitalize">{selectedInternship.type}</span></div>
                  <div><span className="font-medium">University:</span> {selectedInternship.university || 'N/A'}</div>
                  <div><span className="font-medium">Status:</span> {getStatusBadge(selectedInternship.status)}</div>
                </div>
                {selectedInternship.cover_letter && (
                  <div>
                    <h4 className="font-medium mb-1">Cover Letter</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInternship.cover_letter}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Applied: {new Date(selectedInternship.created_at).toLocaleDateString()}</div>
                  <div>Updated: {new Date(selectedInternship.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedInternship(null)}>Close</Button>
                {(selectedInternship.status === 'pending' || selectedInternship.status === 'reviewing') && (
                  <>
                    <Button onClick={() => { updateStatus(selectedInternship.id, 'accepted'); setSelectedInternship(null); }} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-2" /> Accept
                    </Button>
                    <Button onClick={() => { updateStatus(selectedInternship.id, 'rejected'); setSelectedInternship(null); }} variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
                {selectedInternship.cv_url && (
                  <Button onClick={() => window.open(selectedInternship.cv_url!, '_blank')}>
                    <Download className="h-4 w-4 mr-2" /> Download CV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InternshipsManager;
