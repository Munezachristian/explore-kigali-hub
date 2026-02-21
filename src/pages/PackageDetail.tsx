import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Check, Calendar, Users, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PackageDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [booking, setBooking] = useState({ travel_date: '', num_travelers: 1, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from('packages').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('package_id', id).eq('is_approved', true),
      ]);
      if (p) setPkg(p);
      if (r) setReviews(r);
      setLoading(false);

      if (user) {
        const { data: s } = await supabase.from('saved_packages').select('id').eq('user_id', user.id).eq('package_id', id).maybeSingle();
        if (s) setSaved(true);
      }
    };
    if (id) fetchData();
  }, [id, user]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/auth'); return; }
    setSubmitting(true);
    const price = pkg.discount > 0 ? Math.round(pkg.price * (1 - pkg.discount / 100)) : pkg.price;
    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      package_id: id,
      travel_date: booking.travel_date,
      num_travelers: booking.num_travelers,
      total_amount: price * booking.num_travelers,
      notes: booking.notes,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking submitted!', description: 'We will confirm your booking shortly.' });
      setBooking({ travel_date: '', num_travelers: 1, notes: '' });
    }
  };

  const toggleSave = async () => {
    if (!user) { navigate('/auth'); return; }
    if (saved) {
      await supabase.from('saved_packages').delete().eq('user_id', user.id).eq('package_id', id);
      setSaved(false);
    } else {
      await supabase.from('saved_packages').insert({ user_id: user.id, package_id: id });
      setSaved(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="section-padding container-max mx-auto"><div className="h-96 bg-muted rounded-2xl animate-pulse" /></div></div>;
  if (!pkg) return <div className="min-h-screen bg-background"><Navbar /><div className="section-padding container-max mx-auto text-center"><h2 className="font-display text-2xl text-foreground">Package not found</h2><Button asChild className="mt-4"><Link to="/packages">Back to Packages</Link></Button></div></div>;

  const finalPrice = pkg.discount > 0 ? Math.round(pkg.price * (1 - pkg.discount / 100)) : pkg.price;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="section-padding">
        <div className="container-max mx-auto">
          <Link to="/packages" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images & details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="relative rounded-2xl overflow-hidden h-[400px]">
                <img src={pkg.images?.[activeImage] || '/placeholder.svg'} alt={pkg.title} className="w-full h-full object-cover" />
                <button onClick={toggleSave} className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${saved ? 'bg-destructive text-destructive-foreground' : 'glass text-white hover:bg-white/20'}`}>
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
              {(pkg.images?.length || 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {pkg.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === activeImage ? 'border-accent' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Details */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {pkg.category && <Badge className="bg-accent/15 text-accent border-0 font-body text-xs">{pkg.category}</Badge>}
                  {avgRating && (
                    <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-accent text-accent" /> {avgRating} ({reviews.length} reviews)
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{pkg.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-body mb-6">
                  {pkg.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" />{pkg.location}</span>}
                  {pkg.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-secondary" />{pkg.duration}</span>}
                </div>
                <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{pkg.description}</div>
              </div>

              {/* Features */}
              {pkg.features?.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">What's Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pkg.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 font-body text-sm text-foreground">
                        <Check className="w-4 h-4 text-secondary shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <div key={r.id} className="bg-card rounded-xl p-4 shadow-card">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                            <span className="font-display font-bold text-navy text-xs">{r.reviewer_name?.[0] || '?'}</span>
                          </div>
                          <span className="font-body text-sm font-medium text-foreground">{r.reviewer_name || 'Anonymous'}</span>
                          <div className="flex gap-0.5 ml-auto">
                            {[...Array(r.rating || 5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                          </div>
                        </div>
                        <p className="font-body text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Booking sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24 space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    {pkg.discount > 0 && <span className="font-body text-sm text-muted-foreground line-through">${pkg.price}</span>}
                    <span className="font-display text-3xl font-bold text-accent">${finalPrice}</span>
                    <span className="font-body text-sm text-muted-foreground">/person</span>
                  </div>
                  {pkg.discount > 0 && <Badge className="bg-destructive/15 text-destructive border-0 font-body text-xs">{pkg.discount}% off</Badge>}
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label className="font-body text-sm">Travel Date</Label>
                    <Input type="date" required value={booking.travel_date} onChange={e => setBooking(b => ({ ...b, travel_date: e.target.value }))} className="font-body mt-1" min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Number of Travelers</Label>
                    <Input type="number" required min={1} max={50} value={booking.num_travelers} onChange={e => setBooking(b => ({ ...b, num_travelers: parseInt(e.target.value) || 1 }))} className="font-body mt-1" />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Special Requests</Label>
                    <Textarea placeholder="Any special requirements..." value={booking.notes} onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))} className="font-body mt-1" maxLength={500} />
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex justify-between font-body text-sm text-muted-foreground mb-1">
                      <span>${finalPrice} × {booking.num_travelers} traveler{booking.num_travelers > 1 ? 's' : ''}</span>
                      <span className="font-semibold text-foreground">${finalPrice * booking.num_travelers}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-body font-semibold text-foreground">Total</span>
                      <span className="font-display text-xl font-bold text-accent">${finalPrice * booking.num_travelers}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body h-12">
                    {submitting ? 'Submitting...' : user ? 'Book Now' : 'Sign in to Book'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PackageDetail;
