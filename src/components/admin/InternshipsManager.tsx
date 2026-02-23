import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Edit,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Internship {
  id: string;
  applicant_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  type: 'student' | 'professional';
  university: string | null;
  cover_letter: string | null;
  cv_url?: string | null;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

const InternshipsManager = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);

  const internshipsPerPage = 10;
  const statuses = ['all', 'pending', 'reviewing', 'accepted', 'rejected'];

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    let filtered = internships;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(internship => internship.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(internship =>
        internship.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.field_of_study.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInternships(filtered);
    setCurrentPage(1);
  }, [internships, statusFilter, searchTerm]);

  const fetchInternships = async () => {
    try {
      const { data: internshipsData, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching internships:', error);
        setInternships([]);
        setFilteredInternships([]);
      } else {
        setInternships(internshipsData || []);
        setFilteredInternships(internshipsData || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      setInternships([]);
      setFilteredInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const updateInternshipStatus = async (internshipId: string, newStatus: Internship['status']) => {
    try {
      const { error } = await supabase
        .from('internships')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', internshipId);
      
      if (error) throw error;
      
      setInternships(prev => 
        prev.map(internship => 
          internship.id === internshipId 
            ? { ...internship, status: newStatus }
            : internship
        )
      );

    } catch (error) {
      console.error('Error updating internship status:', error);
      alert('Error updating internship status. Please try again.');
    }
  };

  const approveInternship = async (internshipId: string) => {
    const confirmed = window.confirm('Are you sure you want to approve this internship application? This will send an acceptance email to the applicant.');
    if (confirmed) {
      await updateInternshipStatus(internshipId, 'accepted');
    }
  };

  const rejectInternship = async (internshipId: string) => {
    const reason = prompt('Please provide a reason for rejecting this application (this will be included in the rejection email):');
    if (reason) {
      await updateInternshipStatus(internshipId, 'rejected');
      // In a real app, you would save the rejection reason and include it in the email
    }
  };

  const updateInternship = async (updatedInternship: Internship) => {
    try {
      setInternships(prev => 
        prev.map(internship => 
          internship.id === updatedInternship.id ? updatedInternship : internship
        )
      );
      setEditingInternship(null);
    } catch (error) {
      console.error('Error updating internship:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
      reviewing: { color: 'bg-blue-100 text-blue-700', label: 'Reviewing' },
      accepted: { color: 'bg-emerald-100 text-emerald-700', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const totalPages = Math.ceil(filteredInternships.length / internshipsPerPage);
  const startIndex = (currentPage - 1) * internshipsPerPage;
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + internshipsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h2 className="font-display text-2xl font-bold text-foreground">Internships Management</h2>
          <p className="font-body text-muted-foreground">Manage internship applications and candidates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{filteredInternships.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredInternships.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredInternships.filter(i => i.status === 'under_review').length}
                </p>
              </div>
              <Search className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredInternships.filter(i => i.status === 'accepted').length}
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {paginatedInternships.map((internship) => (
          <Card key={internship.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {internship.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">{internship.email}</p>
                    {internship.phone && (
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {internship.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(internship.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <GraduationCap className="h-4 w-4" />
                    Type
                  </div>
                  <p className="font-medium capitalize">{internship.type}</p>
                  {internship.university && (
                    <p className="text-sm text-gray-600">{internship.university}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </div>
                  <p className="text-sm">{internship.cover_letter}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Applicant
                  </div>
                  <p className="text-sm">{internship.applicant_id || 'Guest applicant'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Motivation:</p>
                <p className="text-sm text-gray-700 italic">{internship.motivation}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Applied: {new Date(internship.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(internship.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInternship(internship)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingInternship(internship)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {internship.resume_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(internship.resume_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {internship.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateInternshipStatus(internship.id, 'under_review')}
                      className="text-blue-600"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                  {internship.status === 'under_review' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => approveInternship(internship.id)}
                        className="text-green-600"
                        title="Accept Application"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectInternship(internship.id)}
                        className="text-red-600"
                        title="Reject Application"
                      >
                        <XCircle className="h-4 w-4" />
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
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

      {/* View Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Internship Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedInternship.full_name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span> {selectedInternship.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedInternship.phone}
                    </div>
                    <div>
                      <span className="font-medium">Country:</span> {selectedInternship.country}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {getStatusBadge(selectedInternship.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <p className="text-sm capitalize">{selectedInternship.type}</p>
                  {selectedInternship.university && (
                    <p className="text-sm">{selectedInternship.university}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Cover Letter</h4>
                  <p className="text-sm">{selectedInternship.cover_letter}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Motivation</h4>
                  <p className="text-sm italic">{selectedInternship.motivation}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Availability</h4>
                  <p className="text-sm">{selectedInternship.availability}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Applied:</span> {new Date(selectedInternship.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedInternship.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedInternship(null)}>
                  Close
                </Button>
                {selectedInternship.resume_url && (
                  <Button onClick={() => window.open(selectedInternship.resume_url, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      value={editingInternship.first_name}
                      onChange={(e) => setEditingInternship({...editingInternship, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      value={editingInternship.last_name}
                      onChange={(e) => setEditingInternship({...editingInternship, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    value={editingInternship.email}
                    onChange={(e) => setEditingInternship({...editingInternship, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={editingInternship.phone}
                    onChange={(e) => setEditingInternship({...editingInternship, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Education Level</label>
                  <select
                    value={editingInternship.education_level}
                    onChange={(e) => setEditingInternship({...editingInternship, education_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Field of Study</label>
                  <Input
                    value={editingInternship.field_of_study}
                    onChange={(e) => setEditingInternship({...editingInternship, field_of_study: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience</label>
                  <Textarea
                    value={editingInternship.experience}
                    onChange={(e) => setEditingInternship({...editingInternship, experience: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Motivation</label>
                  <Textarea
                    value={editingInternship.motivation}
                    onChange={(e) => setEditingInternship({...editingInternship, motivation: e.target.value})}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Availability</label>
                  <Input
                    value={editingInternship.availability}
                    onChange={(e) => setEditingInternship({...editingInternship, availability: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={editingInternship.status}
                    onChange={(e) => setEditingInternship({...editingInternship, status: e.target.value as Internship['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setEditingInternship(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateInternship(editingInternship)}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InternshipsManager;
