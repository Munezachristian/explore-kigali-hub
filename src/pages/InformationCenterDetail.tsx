import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ArrowLeft,
  Navigation,
  ExternalLink,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

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
  status: 'published' | 'unpublished' | 'deleted';
  created_at: string;
  updated_at: string;
}

interface InformationCenterMedia {
  id: string;
  information_center_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  is_primary: boolean | null;
  display_order: number | null;
}

const InformationCenterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [center, setCenter] = useState<InformationCenter | null>(null);
  const [media, setMedia] = useState<InformationCenterMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const SLIDESHOW_INTERVAL_MS = 5000;

  useEffect(() => {
    if (id) {
      fetchCenter();
      fetchMedia();
    }
  }, [id]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('information_centers')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: 'Not Found',
          description: 'Information center not found',
          variant: 'destructive',
        });
        navigate('/information-centers');
        return;
      }
      
      setCenter(data);
    } catch (error: any) {
      console.error('Error fetching center:', error);
      toast({
        title: 'Error',
        description: 'Failed to load information center',
        variant: 'destructive',
      });
      navigate('/information-centers');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('information_center_media')
        .select('*')
        .eq('information_center_id', id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setMedia(data || []);
    } catch (error: any) {
      console.error('Error fetching media:', error);
    }
  };

  const openGoogleMaps = () => {
    if (!center) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`, '_blank');
  };

  const getGoogleMapsEmbedUrl = () => {
    if (!center) return '';
    return `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDummyKey'}&q=${center.latitude},${center.longitude}`;
  };

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  // Auto-slideshow for image gallery (loop enabled in Carousel opts)
  useEffect(() => {
    if (!carouselApi || images.length <= 1) return;
    const id = setInterval(() => carouselApi.scrollNext(), SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [carouselApi, images.length, SLIDESHOW_INTERVAL_MS]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!center) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-navy flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-white hover:bg-white/20"
            onClick={() => navigate('/information-centers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {center.name}
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-white/80">
            {center.address}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-max mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: true }}>
                    <CarouselContent>
                      {images.map((img, index) => (
                        <CarouselItem key={img.id}>
                          <div className="relative aspect-video w-full">
                            <img
                              src={img.media_url}
                              alt={`${center.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious />
                        <CarouselNext />
                      </>
                    )}
                  </Carousel>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {center.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{center.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videos.map((video) => {
                    // Extract YouTube video ID
                    let embedUrl = video.media_url;
                    if (video.media_url.includes('youtube.com/watch')) {
                      const videoId = video.media_url.split('v=')[1]?.split('&')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (video.media_url.includes('youtu.be/')) {
                      const videoId = video.media_url.split('youtu.be/')[1]?.split('?')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (video.media_url.includes('vimeo.com/')) {
                      const videoId = video.media_url.split('vimeo.com/')[1]?.split('?')[0];
                      embedUrl = `https://player.vimeo.com/video/${videoId}`;
                    }

                    return (
                      <div key={video.id} className="relative aspect-video w-full">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${center.latitude},${center.longitude}&zoom=15`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Map unavailable</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Coordinates: {center.latitude}, {center.longitude}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={openGoogleMaps} className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions on Google Maps
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {center.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <a href={`tel:${center.phone}`} className="text-gray-700 hover:text-sky-600">
                        {center.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {center.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <a href={`mailto:${center.email}`} className="text-gray-700 hover:text-sky-600 break-all">
                        {center.email}
                      </a>
                    </div>
                  </div>
                )}

                {center.opening_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Opening Hours</p>
                      <p className="text-gray-700">{center.opening_hours}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-700">{center.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={openGoogleMaps} className="w-full" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                {center.phone && (
                  <Button
                    asChild
                    className="w-full"
                    variant="outline"
                  >
                    <a href={`tel:${center.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
                {center.email && (
                  <Button
                    asChild
                    className="w-full"
                    variant="outline"
                  >
                    <a href={`mailto:${center.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InformationCenterDetail;
