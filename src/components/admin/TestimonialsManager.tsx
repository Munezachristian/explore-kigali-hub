import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Testimonial {
  id: string;
  client_id: string;
  client_name: string;
  client_avatar: string;
  content: string;
  created_at: string;
  rating: number;
  is_approved: boolean;
  package_id: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const testimonialsPerPage = 10;
  const ratings = [5, 4, 3, 2, 1];
  const statuses = ['all', 'approved', 'pending'];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    let filtered = testimonials;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(testimonial => 
        statusFilter === 'approved' ? testimonial.is_approved : !testimonial.is_approved
      );
    }

    if (ratingFilter !== null) {
      filtered = filtered.filter(testimonial => testimonial.rating === ratingFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(testimonial =>
        testimonial.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  }, [testimonials, statusFilter, ratingFilter, searchTerm]);

  const fetchTestimonials = async () => {
    try {
      const { data: testimonialsData, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
        setFilteredTestimonials([]);
      } else {
        setTestimonials(testimonialsData || []);
        setFilteredTestimonials(testimonialsData || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
      setFilteredTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonialStatus = async (testimonialId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: approved })
        .eq('id', testimonialId);
      
      if (error) throw error;
      
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === testimonialId 
            ? { ...testimonial, is_approved: approved }
            : testimonial
        )
      );
    } catch (error) {
      console.error('Error updating testimonial status:', error);
    }
  };

  const updateTestimonial = async (updatedTestimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          client_name: updatedTestimonial.client_name,
          content: updatedTestimonial.content,
          rating: updatedTestimonial.rating,
          is_approved: updatedTestimonial.is_approved
        })
        .eq('id', updatedTestimonial.id);
      
      if (error) throw error;
      
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === updatedTestimonial.id ? updatedTestimonial : testimonial
        )
      );
      setEditingTestimonial(null);
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Delete this testimonial?')) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);
      
      if (error) throw error;
      
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
      setFilteredTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
      approved: { color: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);
  const startIndex = (currentPage - 1) * testimonialsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + testimonialsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Testimonials ({testimonials.length})</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground">{filteredTestimonials.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {testimonials.filter(t => !t.is_approved).length}
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
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {testimonials.filter(t => t.is_approved).length}
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
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={ratingFilter || ''}
                onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Ratings</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating} Stars</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <div className="space-y-4">
        {paginatedTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{testimonial.client_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  {getStatusBadge(testimonial.is_approved ? 'approved' : 'pending')}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {renderStars(testimonial.rating ?? 0)}
              </div>

              <p className="text-gray-700 line-clamp-3 mb-4">
                {testimonial.content}
              </p>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTestimonial(testimonial)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTestimonial(testimonial)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTestimonial(testimonial.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
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
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Testimonial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTestimonial.client_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Rating:</span>
                    <div className="flex">
                      {renderStars(selectedTestimonial.rating ?? 0)}
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedTestimonial.is_approved ? 'approved' : 'pending')}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {new Date(selectedTestimonial.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-gray-700">
                  {selectedTestimonial.content}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    updateTestimonialStatus(selectedTestimonial.id, !selectedTestimonial.is_approved);
                    setSelectedTestimonial(null);
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateTestimonialStatus(selectedTestimonial.id, false);
                    setSelectedTestimonial(null);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 mt-4 px-6 pb-6">
              <Button variant="outline" onClick={() => setSelectedTestimonial(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Testimonial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={editingTestimonial.client_name}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, client_name: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, rating: parseInt(e.target.value)})}
                    className="w-full"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={editingTestimonial.content}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, content: e.target.value})}
                    rows={4}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingTestimonial.is_approved}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, is_approved: e.target.checked})}
                    />
                    <span className="text-sm font-medium">Approved</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => updateTestimonial(editingTestimonial)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingTestimonial(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
