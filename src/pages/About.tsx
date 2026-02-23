import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Award, 
  Globe, 
  Heart, 
  Target, 
  Lightbulb,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  const teamData = [
    {
      name: "John Mugisha",
      role: "Founder & CEO",
      bio: "With over 15 years in African tourism, John founded Kigali Hub to share Rwanda's beauty with the world.",
      image: "/placeholder-avatar.jpg",
      expertise: ["Business Strategy", "Tour Operations", "Customer Relations"]
    },
    {
      name: "Sarah Uwimana",
      role: "Operations Manager",
      bio: "Sarah ensures smooth operations and exceptional experiences for all our clients across African destinations.",
      image: "/placeholder-avatar.jpg",
      expertise: ["Operations", "Quality Control", "Team Management"]
    },
    {
      name: "Eric Niyonzima",
      role: "Lead Tour Guide",
      bio: "Eric is an expert guide with deep knowledge of Rwandan history, culture, and natural attractions.",
      image: "/placeholder-avatar.jpg",
      expertise: ["Wildlife", "History", "Cultural Tours"]
    },
    {
      name: "Grace Mukamana",
      role: "Customer Relations",
      bio: "Grace is dedicated to ensuring every client has a memorable and seamless travel experience.",
      image: "/placeholder-avatar.jpg",
      expertise: ["Customer Service", "Booking Management", "Support"]
    }
  ];

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const missionValues = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion for Africa",
      description: "We are deeply passionate about showcasing the beauty, culture, and diversity of African destinations to the world."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Excellence in Service",
      description: "We strive to deliver exceptional travel experiences that exceed our clients' expectations and create lasting memories."
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation & Creativity",
      description: "We continuously innovate our tour packages and services to provide unique and authentic African travel experiences."
    }
  ];

  const achievements = [
    { number: "10+", label: "Years of Experience" },
    { number: "5,000+", label: "Happy Travelers" },
    { number: "15+", label: "African Countries" },
    { number: "50+", label: "Tour Packages" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Support Available" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
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
            {t('about.title') || 'About Kigali Hub'}
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-white/80">
            {t('about.subtitle') || 'Your trusted partner for unforgettable African adventures'}
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="container-max mx-auto px-4 md:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2014, Kigali Hub began as a small tour company with a big dream: 
                to showcase the incredible beauty and diversity of Rwanda and Africa to the world. 
                What started with just two guides and a handful of clients has grown into one of 
                the region's most trusted tourism companies.
              </p>
              <p>
                Our journey has been driven by a passion for authentic travel experiences and a 
                deep love for Africa's rich cultural heritage, stunning landscapes, and warm hospitality. 
                We believe that travel should be more than just sightseeing – it should be about 
                creating meaningful connections and lasting memories.
              </p>
              <p>
                Today, we're proud to have served thousands of travelers from around the globe, 
                helping them discover the magic of Africa through carefully crafted tours that 
                combine adventure, culture, and comfort.
              </p>
            </div>
            <Button className="mt-6" asChild>
              <a href="#team">
                Meet Our Team <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/placeholder-about.jpg"
              alt="Kigali Hub team and clients"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <Badge className="bg-white/20 text-white mb-2">Since 2014</Badge>
              <h3 className="text-2xl font-bold">10+ Years of Excellence</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-white py-16">
        <div className="container-max mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Our Mission & Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are guided by a strong set of principles that shape everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {missionValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4 text-sky-600">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="container-max mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">Our Achievements</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Numbers that speak to our commitment and success
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl p-6 mb-3">
                <div className="text-2xl md:text-3xl font-bold">{achievement.number}</div>
              </div>
              <p className="text-sm text-gray-600">{achievement.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-gray-50 py-16">
        <div className="container-max mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind your unforgettable African experiences
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-sky-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-max mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">Why Choose Kigali Hub?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We go above and beyond to make your African adventure truly special
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Award-Winning Service</h3>
              <p className="text-sm text-gray-600">
                Recognized for excellence in African tourism and customer service
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Expert Local Guides</h3>
              <p className="text-sm text-gray-600">
                Knowledgeable guides who bring destinations to life with stories and insights
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                <Globe className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sustainable Tourism</h3>
              <p className="text-sm text-gray-600">
                Committed to responsible travel that benefits local communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 py-16">
        <div className="container-max mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to Start Your African Adventure?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have discovered the magic of Africa with Kigali Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/packages">
                Explore Packages <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sky-600" asChild>
              <Link to="/contact">
                Contact Us <Mail className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
