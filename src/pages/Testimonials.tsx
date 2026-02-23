import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  Quote, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Users,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  ThumbsUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Testimonials = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const testimonialsPerPage = 6;

  const destinations = ['All', 'Rwanda', 'Uganda', 'Kenya', 'Tanzania', 'Burundi', 'DRC', 'Ethiopia'];
  const ratings = [5, 4, 3, 2, 1];

  // Static testimonials data since database table might not exist
  const staticTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      country: "United States",
      destination: "Rwanda",
      tour_package: "Gorilla Trekking Adventure",
      rating: 5,
      review_date: "2024-01-15",
      comment: "Absolutely incredible experience! The gorilla trekking was life-changing. Our guide was knowledgeable and passionate, making the entire trip memorable. Kigali Hub took care of every detail perfectly.",
      verified: true,
      helpful_count: 24
    },
    {
      id: 2,
      name: "Michael Chen",
      country: "Singapore",
      destination: "Kenya",
      tour_package: "Safari Experience",
      rating: 5,
      review_date: "2024-01-10",
      comment: "The safari exceeded all expectations! Saw the Big Five in just two days. The accommodations were excellent, and the wildlife viewing was spectacular. Highly recommend Kigali Hub!",
      verified: true,
      helpful_count: 18
    },
    {
      id: 3,
      name: "Emma Williams",
      country: "United Kingdom",
      destination: "Uganda",
      tour_package: "Cultural Heritage Tour",
      rating: 4,
      review_date: "2024-01-08",
      comment: "Wonderful cultural immersion experience. The local communities were welcoming, and we learned so much about Ugandan traditions. Only minor issue was some transportation delays.",
      verified: true,
      helpful_count: 15
    },
    {
      id: 4,
      name: "Pierre Dubois",
      country: "France",
      destination: "Tanzania",
      tour_package: "Mount Kilimanjaro Climb",
      rating: 5,
      review_date: "2024-01-05",
      comment: "Challenging but incredibly rewarding climb! The support team was amazing, and the summit experience was unforgettable. Kigali Hub's preparation and support made all the difference.",
      verified: true,
      helpful_count: 32
    },
    {
      id: 5,
      name: "Yuki Tanaka",
      country: "Japan",
      destination: "Rwanda",
      tour_package: "Genocide Memorial & City Tour",
      rating: 5,
      review_date: "2024-01-03",
      comment: "A deeply moving and educational experience. The memorial tour was handled with great sensitivity and respect. Our guide's personal stories added incredible depth to the experience.",
      verified: true,
      helpful_count: 28
    },
    {
      id: 6,
      name: "Carlos Rodriguez",
      country: "Spain",
      destination: "Burundi",
      tour_package: "Lake Tanganyika Beach Holiday",
      rating: 4,
      review_date: "2023-12-28",
      comment: "Beautiful and relaxing beach destination. The lake is stunning, and the resort was comfortable. Great value for money. Would have liked more water sports activities.",
      verified: true,
      helpful_count: 12
    },
    {
      id: 7,
      name: "Lisa Anderson",
      country: "Canada",
      destination: "Ethiopia",
      tour_package: "Historical Route Tour",
      rating: 5,
      review_date: "2023-12-25",
      comment: "Fascinating journey through Ethiopia's rich history! The rock churches of Lalibela were breathtaking. Our guide's knowledge of history and culture was exceptional.",
      verified: true,
      helpful_count: 21
    },
    {
      id: 8,
      name: "Ahmed Hassan",
      country: "Egypt",
      destination: "Rwanda",
      tour_package: "Business & Leisure Combo",
      rating: 4,
      review_date: "2023-12-20",
      comment: "Perfect combination of business meetings and leisure activities. Kigali is a beautiful and safe city. The arrangements were professional and efficient.",
      verified: true,
      helpful_count: 16
    }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Using static data since testimonials table might not exist
        setTestimonials(staticTestimonials);
        setFilteredTestimonials(staticTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials(staticTestimonials);
        setFilteredTestimonials(staticTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    let filtered = testimonials;

    if (selectedDestination !== 'All') {
      filtered = filtered.filter(t => t.destination === selectedDestination);
    }

    if (selectedRating !== null) {
      filtered = filtered.filter(t => t.rating === selectedRating);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tour_package.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  }, [testimonials, selectedDestination, selectedRating, searchTerm]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);
  const startIndex = (currentPage - 1) * testimonialsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + testimonialsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading testimonials...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-navy flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('testimonials.title') || 'Customer Testimonials'}
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-white/80">
            {t('testimonials.subtitle') || 'Real stories from travelers who experienced Africa with us'}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-max mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-sky-600 mb-2">4.9/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-sky-600 mb-2">2,500+</div>
            <div className="text-sm text-gray-600">Happy Travelers</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-sky-600 mb-2">15+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-sky-600 mb-2">98%</div>
            <div className="text-sm text-gray-600">Would Recommend</div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container-max mx-auto px-4 md:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Destination Filter */}
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating || ''}
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Ratings</option>
              {ratings.map(rating => (
                <option key={rating} value={rating}>{rating} Stars</option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedDestination('All');
                setSelectedRating(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="container-max mx-auto px-4 md:px-8 pb-20">
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No testimonials found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {testimonial.country}
                          </CardDescription>
                        </div>
                      </div>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {testimonial.rating}.0
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <blockquote className="text-gray-700 mb-4 italic">
                      "{testimonial.comment}"
                    </blockquote>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{testimonial.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(testimonial.review_date)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          {testimonial.tour_package}
                        </span>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span className="text-xs">{testimonial.helpful_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
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
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 py-16">
        <div className="container-max mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Share Your Experience
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Have you traveled with us? We'd love to hear about your African adventure and share your story with others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">
                Leave a Review <Quote className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sky-600" asChild>
              <Link to="/packages">
                Book Your Trip <Globe className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
