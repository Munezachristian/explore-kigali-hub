import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, Users, ChevronRight, Shield, Award, Globe2, Headphones, Phone, Mail, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-rwanda.jpg';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stats = [
  { label: 'Happy Travelers', value: '2,500+' },
  { label: 'Tour Packages', value: '50+' },
  { label: 'Years Experience', value: '10+' },
  { label: 'African Countries', value: '8' },
];

const features = [
  { icon: Shield, title: 'Safe & Secure', desc: 'Licensed and insured for your peace of mind' },
  { icon: Award, title: 'Award Winning', desc: 'Recognized for excellence in African tourism' },
  { icon: Globe2, title: 'Multilingual', desc: 'Service in EN, FR, Kinyarwanda & Kiswahili' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock assistance during your trip' },
];

const categories = ['All', 'Wildlife', 'Cultural', 'Adventure', 'Safari', 'Beach & Lake'];

const Index = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [packages, setPackages] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [infoCenters, setInfoCenters] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('key, value').limit(1);
        if (error) console.error('Supabase connection error:', error);
      } catch (e) {
        console.error('Connection test failed:', e);
      }
    };
    
    const fetchData = async () => {
      try {
        const [{ data: pkgs, error: pkgError }, { data: testi, error: testiError }, { data: blogs, error: blogError }, { data: gal, error: galError }, { data: centers, error: centersError }] = await Promise.all([
          supabase.from('packages').select('*').eq('availability', true).order('is_featured', { ascending: false }).limit(6),
          supabase.from('testimonials').select('*').eq('is_approved', true).limit(4),
          supabase.from('blog_posts').select('*').eq('status', 'published').limit(3),
          supabase.from('gallery').select('*').limit(6),
          supabase.from('information_centers').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(6),
        ]);
        
        if (pkgs) setPackages(pkgs);
        if (testi) setTestimonials(testi);
        if (blogs) setBlogPosts(blogs);
        if (gal) setGallery(gal);
        if (centers) setInfoCenters(centers);
      } catch (e) {
        console.error('Error loading homepage data:', e);
      }
    };
    
    testConnection();
    fetchData();
  }, []);

  const filteredPackages = activeCategory === 'All'
    ? packages
    : packages.filter(p => p.category === activeCategory);

  const heroType = settings.hero_background_type || 'image';
  const sliderImages = settings.hero_slider_images && settings.hero_slider_images.length
    ? settings.hero_slider_images
    : (settings.hero_background_image ? [settings.hero_background_image] : []);
  const [sliderIndex, setSliderIndex] = useState(0);
  const replayVideo = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    v.currentTime = 0;
    v.play?.();
  }, []);

  useEffect(() => {
    if (heroType !== 'slider' || sliderImages.length <= 1) return;
    const id = setInterval(() => setSliderIndex(i => (i + 1) % sliderImages.length), 5000);
    return () => clearInterval(id);
  }, [heroType, sliderImages.length]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 w-full h-full min-h-[100dvh]">
          {heroType === 'video' && settings.hero_background_video ? (
            <video
              className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onEnded={replayVideo}
            >
              <source src={settings.hero_background_video} type="video/mp4" />
            </video>
          ) : heroType === 'slider' && sliderImages.length > 0 ? (
            sliderImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={`absolute inset-0 w-full h-full min-w-full min-h-full object-cover transition-opacity duration-700 ${i === sliderIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              />
            ))
          ) : (
            <img
              src={sliderImages[0] || settings.hero_background_image || heroImage}
              alt="Rwanda landscape"
              className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gold/40 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-white/90 font-body text-sm tracking-wide">Premium African Tourism Since 2014</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {(settings.hero_title || t('hero.title')).split(' ').map((word, i) => (
              <span key={i} className={i >= 1 && i <= 2 ? 'text-gradient-gold' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="font-body text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {settings.hero_subtitle || settings.hero_description || 'Experience the Land of a Thousand Hills — from gorilla trekking in Volcanoes National Park to the shores of Lake Kivu. Your extraordinary African journey begins here.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              asChild
              size="lg"
              className="bg-gradient-gold text-navy font-semibold text-base px-8 py-4 h-auto border-0 shadow-gold hover:opacity-90 font-body"
            >
              <Link to={settings.hero_button_link || '/packages'}>
                {settings.hero_button_text || t('hero.cta')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="glass border-white/30 text-white hover:bg-white/15 text-base px-8 py-4 h-auto font-body"
            >
              <Link to="/auth?mode=register">
                {t('hero.book')}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {stats.map(({ label, value }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <div className="font-display text-2xl font-bold text-gold">{value}</div>
                <div className="font-body text-xs text-white/65 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 bg-gold rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-muted/30">
        <div className="container-max mx-auto">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Why Choose ESA Tours?</h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">Rwanda's most trusted tourism company, delivering extraordinary experiences since 2014</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl p-6 shadow-card hover-lift text-center group">
                <div className="w-14 h-14 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-gold">
                  <Icon className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="section-padding">
        <div className="container-max mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="gold-divider mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{t('packages.title')}</h2>
              <p className="font-body text-muted-foreground">Handcrafted experiences across Rwanda and East Africa</p>
            </div>
            <Link to="/packages" className="text-primary hover:text-accent font-body text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
              View All Packages <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-body text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-navy text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredPackages.length > 0 ? filteredPackages : packages).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} t={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">No packages available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gradient-navy">
        <div className="container-max mx-auto">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{t('testimonials.title')}</h2>
            <p className="font-body text-white/60 max-w-xl mx-auto">Real experiences from our satisfied travelers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t_) => (
              <div key={t_.id} className="glass rounded-2xl p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(t_.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-body text-white/80 text-sm leading-relaxed mb-4 italic">"{t_.content}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
                    <span className="font-display font-bold text-navy text-sm">{t_.client_name?.[0]}</span>
                  </div>
                  <div>
                    <div className="font-body font-semibold text-white text-sm">{t_.client_name}</div>
                    <div className="font-body text-white/50 text-xs">Verified Traveler</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="section-padding">
        <div className="container-max mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="gold-divider mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{t('gallery.title')}</h2>
              <p className="font-body text-muted-foreground">Moments from our incredible journeys</p>
            </div>
            <Link to="/gallery" className="text-primary hover:text-accent font-body text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
              View Full Gallery <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.slice(0, 6).map((item, i) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                    i === 0 ? 'md:row-span-2' : ''
                  }`}
                  style={{ height: i === 0 ? '400px' : '188px' }}
                >
                  <img
                    src={item.media_url}
                    alt={item.title || 'Gallery'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-body text-white font-medium text-sm">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">Gallery images coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-max mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="gold-divider mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{t('blog.title')}</h2>
              <p className="font-body text-muted-foreground">Stories and tips from our travel experts</p>
            </div>
            <Link to="/blog" className="text-primary hover:text-accent font-body text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
              View All Articles <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover-lift group">
                  {post.cover_image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <Badge className="bg-accent/15 text-accent border-0 font-body text-xs mb-3">
                        {post.category}
                      </Badge>
                    )}
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-accent font-body text-sm font-medium transition-colors"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">Blog posts coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Information Centers Section */}
      {infoCenters.length > 0 && (
        <section className="section-padding">
          <div className="container-max mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="gold-divider mb-4" />
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Information Centers</h2>
                <p className="font-body text-muted-foreground">Discover tourist information centers across Rwanda</p>
              </div>
              <Link to="/information-centers" className="text-primary hover:text-accent font-body text-sm font-medium flex items-center gap-1 transition-colors shrink-0">
                View All Centers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {infoCenters.slice(0, 6).map((center) => (
                <div key={center.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover-lift group">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                    {center.latitude && center.longitude ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-primary/40" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">
                      {center.name}
                    </h3>
                    {center.description && (
                      <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">{center.description}</p>
                    )}
                    {center.address && (
                      <div className="flex items-start gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <p className="font-body text-xs text-muted-foreground">{center.address}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" className="bg-gradient-navy text-white hover:opacity-90 border-0 font-body flex-1">
                        <Link to={`/information-centers/${center.id}`}>View Details</Link>
                      </Button>
                      {center.latitude && center.longitude && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-body"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`, '_blank')}
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden bg-gradient-teal">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container-max mx-auto text-center relative z-10">
          <div className="gold-divider mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready for Your African Adventure?
          </h2>
          <p className="font-body text-white/70 text-lg max-w-xl mx-auto mb-8">
            Join thousands of travelers who have discovered the magic of Rwanda with ESA Tours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 px-8 font-body">
              <Link to="/packages">Browse Packages <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 font-body">
              <Link to="/internships">Apply for Internship</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-max mx-auto">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Find Us</h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">Visit our main office or explore our locations on the map</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=KN+4+Ave,+Kigali,+Rwanda&zoom=15`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Map unavailable</p>
                    <p className="text-sm text-gray-500">KN 4 Ave, Kigali, Rwanda</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gradient-navy">
                <h3 className="font-display text-lg font-semibold text-white mb-2">Main Office</h3>
                <p className="text-white/80 text-sm">{settings.address || "KN 4 Ave, Kigali, Rwanda"}</p>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{settings.contact_phone || "+250 788 123 456"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{settings.contact_email || "info@kigalihub.com"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Get Directions</h3>
              <p className="font-body text-muted-foreground mb-4">Click below to get directions to our office via Google Maps</p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=KN+4+Ave,+Kigali,+Rwanda', '_blank')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open(`tel:${settings.contact_phone || '+250788123456'}`, '_blank')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${settings.contact_email || 'info@kigalihub.com'}`, '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const PackageCard = ({ pkg, t }: { pkg: any; t: (key: string) => string }) => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card hover-lift group">
    <div className="relative h-52 overflow-hidden">
      <img
        src={pkg.images?.[0] || '/placeholder.svg'}
        alt={pkg.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      {pkg.category && (
        <Badge className="absolute top-3 left-3 bg-gradient-gold text-navy border-0 font-body text-xs font-semibold shadow">
          {pkg.category}
        </Badge>
      )}
      {pkg.is_featured && (
        <Badge className="absolute top-3 right-3 bg-gradient-navy text-white border-0 font-body text-xs font-semibold shadow">
          ⭐ Featured
        </Badge>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">{pkg.title}</h3>
      <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-body">
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent" />{pkg.location}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent" />{pkg.duration}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-body text-xs text-muted-foreground">{t('packages.from')}</div>
          <div className="font-display font-bold text-xl text-primary">${pkg.price?.toLocaleString()}</div>
        </div>
        <Button asChild size="sm" className="bg-gradient-navy text-white hover:opacity-90 border-0 font-body">
          <Link to={`/packages/${pkg.id}`}>Book Now</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default Index;
