import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  Save
} from 'lucide-react';
import { DataTable } from './DataTable';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Booking {
  id: string;
  client_id: string;
  package_id: string;
  num_travelers: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  travel_date: string;
  notes?: string;
  updated_at: string;
  packages?: {
    title: string;
    duration: number;
    price: number;
  };
  profiles?: {
    email: string;
    full_name: string;
  };
}

const BookingsManager = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [manualBookingForm, setManualBookingForm] = useState({
    client_email: '',
    client_name: '',
    package_id: '',
    num_travelers: 1,
    travel_date: '',
    notes: '',
    total_amount: 0
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'manual',
    status: 'confirmed',
    transaction_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('id, title, price, duration')
        .eq('availability', true)
        .order('title');
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load packages for manual booking',
        variant: 'destructive',
      });
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          packages!inner(title, duration, price)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const baseBookings = bookingsData || [];

      // Manually join client profiles since there's no direct FK between bookings and profiles
      const clientIds = Array.from(
        new Set(
          baseBookings
            .map((b: any) => b.client_id)
            .filter((id: string | null) => !!id)
        )
      );

      let profilesById: Record<string, { full_name: string; email: string }> = {};
      if (clientIds.length > 0) {
        const { data: profileRows, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', clientIds as string[]);

        if (!profilesError && profileRows) {
          profilesById = profileRows.reduce((acc: Record<string, any>, p: any) => {
            acc[p.id] = { full_name: p.full_name, email: p.email };
            return acc;
          }, {});
        }
      }

      const enriched = baseBookings.map((b: any) => ({
        ...b,
        profiles: b.client_id ? profilesById[b.client_id] || null : null,
      }));

      setBookings(enriched);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch bookings',
        variant: 'destructive',
      });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );

      toast({
        title: 'Success',
        description: `Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!bookingToDelete) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingToDelete);
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });

      setDeleteDialogOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  const createManualBooking = async () => {
    try {
      // First, get or create client profile
      let clientId = null;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', manualBookingForm.client_email)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profileData) {
        clientId = profileData.id;
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: manualBookingForm.client_email,
            full_name: manualBookingForm.client_name,
            id: crypto.randomUUID()
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        clientId = newProfile.id;
      }

      // Create the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: clientId,
          package_id: manualBookingForm.package_id,
          num_travelers: manualBookingForm.num_travelers,
          total_amount: manualBookingForm.total_amount,
          travel_date: manualBookingForm.travel_date,
          notes: manualBookingForm.notes,
          status: 'confirmed'
        });

      if (bookingError) throw bookingError;

      toast({
        title: 'Success',
        description: 'Manual booking created successfully',
      });

      setShowManualBooking(false);
      setManualBookingForm({
        client_email: '',
        client_name: '',
        package_id: '',
        num_travelers: 1,
        travel_date: '',
        notes: '',
        total_amount: 0
      });
      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manual booking',
        variant: 'destructive',
      });
    }
  };

  const recordPayment = async () => {
    if (!selectedBookingForPayment) return;

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: selectedBookingForPayment.id,
          amount: paymentForm.amount,
          method: paymentForm.method,
          status: paymentForm.status,
          transaction_id: paymentForm.transaction_id,
          notes: paymentForm.notes,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      setShowPaymentForm(false);
      setPaymentForm({
        amount: 0,
        method: 'manual',
        status: 'confirmed',
        transaction_id: '',
        notes: ''
      });
      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', label: 'Pending' },
      confirmed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', label: 'Confirmed' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Cancelled' },
      completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (booking: Booking) => (
        <div>
          <p className="font-medium">{booking.profiles?.full_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'package',
      header: 'Package',
      render: (booking: Booking) => (
        <div>
          <p className="font-medium">{booking.packages?.title || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{booking.packages?.duration} days</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'travelers',
      header: 'Travelers',
      render: (booking: Booking) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {booking.num_travelers}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (booking: Booking) => (
        <span className="font-medium">${booking.total_amount.toLocaleString()}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking: Booking) => getStatusBadge(booking.status),
      sortable: true,
    },
    {
      key: 'travel_date',
      header: 'Travel Date',
      render: (booking: Booking) => (
        <span>{new Date(booking.travel_date).toLocaleDateString()}</span>
      ),
      sortable: true,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (booking: Booking) => (
        <span className="text-sm text-muted-foreground">
          {new Date(booking.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ];

  const handleExport = (data: Booking[]) => {
    const headers = ['Customer', 'Email', 'Package', 'Travelers', 'Amount', 'Status', 'Travel Date', 'Created'];
    const rows = data.map((booking) => [
      booking.profiles?.full_name || 'N/A',
      booking.profiles?.email || 'N/A',
      booking.packages?.title || 'N/A',
      booking.num_travelers,
      booking.total_amount,
      booking.status,
      new Date(booking.travel_date).toLocaleDateString(),
      new Date(booking.created_at).toLocaleDateString(),
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actions = (booking: Booking) => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedBooking(booking)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedBookingForPayment(booking);
          setPaymentForm({
            ...paymentForm,
            amount: booking.total_amount
          });
          setShowPaymentForm(true);
        }}
        className="text-green-600 hover:text-green-700 dark:text-green-400"
        title="Record Payment"
      >
        <DollarSign className="h-4 w-4" />
      </Button>
      {booking.status === 'pending' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
            className="text-green-600 hover:text-green-700 dark:text-green-400"
            title="Confirm Booking"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            title="Cancel Booking"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setBookingToDelete(booking.id);
          setDeleteDialogOpen(true);
        }}
        className="text-red-600 hover:text-red-700 dark:text-red-400"
        title="Delete Booking"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Bookings Management</h2>
          <p className="font-body text-muted-foreground">Manage tour bookings and reservations</p>
        </div>
        <Button onClick={() => setShowManualBooking(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Manual Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount}
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
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {confirmedCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            View and manage all tour bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={bookings}
            columns={columns}
            searchKeys={['profiles', 'packages', 'status']}
            searchPlaceholder="Search bookings by customer, package, or status..."
            onExport={handleExport}
            pageSize={10}
            actions={actions}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBooking.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedBooking.packages?.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.packages?.duration} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Travelers</p>
                  <p className="font-medium">{selectedBooking.num_travelers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">${selectedBooking.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Travel Date</p>
                  <p className="font-medium">{new Date(selectedBooking.travel_date).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this booking. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setBookingToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual Booking Modal */}
      {showManualBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Manual Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={manualBookingForm.client_name}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, client_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={manualBookingForm.client_email}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, client_email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="package_id">Package</Label>
                  <Select value={manualBookingForm.package_id} onValueChange={(value) => setManualBookingForm({...manualBookingForm, package_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.title} - ${Number(pkg.price).toLocaleString()}{pkg.duration ? ` (${pkg.duration})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="num_travelers">Number of Travelers</Label>
                  <Input
                    id="num_travelers"
                    type="number"
                    min="1"
                    value={manualBookingForm.num_travelers}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, num_travelers: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="travel_date">Travel Date</Label>
                  <Input
                    id="travel_date"
                    type="date"
                    value={manualBookingForm.travel_date}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, travel_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualBookingForm.total_amount}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, total_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={manualBookingForm.notes}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Additional notes about this booking..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowManualBooking(false)}>
                  Cancel
                </Button>
                <Button onClick={createManualBooking}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentForm && selectedBookingForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>
                Booking for {selectedBookingForPayment.profiles?.full_name || 'Unknown'} - {selectedBookingForPayment.packages?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment_amount">Amount</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({...paymentForm, method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={paymentForm.status} onValueChange={(value) => setPaymentForm({...paymentForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  value={paymentForm.transaction_id}
                  onChange={(e) => setPaymentForm({...paymentForm, transaction_id: e.target.value})}
                  placeholder="Optional transaction reference"
                />
              </div>
              <div>
                <Label htmlFor="payment_notes">Notes</Label>
                <Textarea
                  id="payment_notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Additional notes about this payment..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
                <Button onClick={recordPayment}>
                  <Save className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingsManager;
