import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Navigation
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface InformationCenter {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InformationCenterMedia {
  id: string;
  information_center_id: string;
  media_type: string;
  media_url: string;
  is_primary: boolean | null;
  display_order: number | null;
}

function CenterCard({
  center,
  images,
  slideshowInterval,
  onNavigate,
  onDirections,
}: {
  center: InformationCenter;
  images: InformationCenterMedia[];
  slideshowInterval: number;
  onNavigate: () => void;
  onDirections: (e: React.MouseEvent) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % count);
    }, slideshowInterval);
    return () => clearInterval(id);
  }, [count, slideshowInterval]);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden" onClick={onNavigate}>
      <div className="relative aspect-video bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex].media_url}
              alt={`${center.name} - Image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="flex-1">{center.name}</span>
          <MapPin className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {center.address}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {center.description && (
          <p className="text-gray-700 line-clamp-3 mb-4">{center.description}</p>
        )}
        <div className="space-y-2 mb-4">
          {center.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {center.phone}
            </div>
          )}
          {center.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {center.email}
            </div>
          )}
          {center.opening_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {center.opening_hours}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onDirections}>
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onNavigate(); }}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const InformationCenters = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [centers, setCenters] = useState<InformationCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<InformationCenter[]>([]);
  const [mediaByCenter, setMediaByCenter] = useState<Record<string, InformationCenterMedia[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    let filtered = centers;

    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCenters(filtered);
  }, [centers, searchTerm]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('information_centers')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const centerList = data || [];
      setCenters(centerList);
      setFilteredCenters(centerList);

      if (centerList.length > 0) {
        const ids = centerList.map((c: InformationCenter) => c.id);
        const { data: mediaData, error: mediaError } = await supabase
          .from('information_center_media')
          .select('*')
          .in('information_center_id', ids)
          .eq('media_type', 'image')
          .order('display_order', { ascending: true });
        
        if (!mediaError && mediaData) {
          const map: Record<string, InformationCenterMedia[]> = {};
          mediaData.forEach((m: InformationCenterMedia) => {
            if (!map[m.information_center_id]) map[m.information_center_id] = [];
            map[m.information_center_id].push(m);
          });
          setMediaByCenter(map);
        }
      }
    } catch (error: any) {
      console.error('Error fetching centers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load information centers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const SLIDESHOW_INTERVAL_MS = 5000;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Tourism Information Centers
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-white/80">
            Find tourism information centers near you
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-max mx-auto px-4 md:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search information centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Centers Grid */}
        {filteredCenters.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-gray-600 mb-2">
              No information centers found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Check back later for new centers'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <CenterCard
                key={center.id}
                center={center}
                images={mediaByCenter[center.id] ?? []}
                slideshowInterval={SLIDESHOW_INTERVAL_MS}
                onNavigate={() => navigate(`/information-centers/${center.id}`)}
                onDirections={(e) => {
                  e.stopPropagation();
                  openGoogleMaps(center.latitude, center.longitude);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default InformationCenters;
