import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Office Address",
      details: settings.address || "KN 4 Ave, Kigali, Rwanda",
      description: "Visit us at our main office in Kigali"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone Numbers",
      details: settings.contact_phone || "+250 788 123 456 | +250 733 987 654",
      description: "Available 24/7 for emergencies"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Addresses",
      details: settings.contact_email || "info@kigalihub.com | bookings@kigalihub.com",
      description: "We respond within 24 hours"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business Hours",
      details: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
      description: "Emergency support available 24/7"
    }
  ];

  const inquiryTypes = [
    "General Inquiry",
    "Booking Information",
    "Tour Customization",
    "Group Travel",
    "Partnership",
    "Emergency Support",
    "Feedback",
    "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-primary-foreground px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('contact.title') || 'Contact Us'}
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-primary-foreground/80">
            {t('contact.subtitle') || 'Get in touch with us for your African adventure'}
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="container-max mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-3 text-primary">
                  {info.icon}
                </div>
                <CardTitle className="text-lg">{info.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground mb-1">{info.details}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="container-max mx-auto px-4 md:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                    <p className="text-muted-foreground">Thank you for contacting us. We'll respond within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                        <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+250 788 123 456" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                        <select name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Select a subject</option>
                          {inquiryTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                      <Textarea name="message" value={formData.message} onChange={handleInputChange} required rows={6} placeholder="Tell us about your travel plans or questions..." />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>Send Message <Send className="h-4 w-4 ml-2" /></>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><span className="text-sm">+250 788 123 456</span></div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><span className="text-sm">info@kigalihub.com</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span className="text-sm">KN 4 Ave, Kigali</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow Us</CardTitle>
                <CardDescription>Stay connected for updates and travel inspiration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1"><Facebook className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="flex-1"><Instagram className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="flex-1"><Twitter className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="flex-1"><Globe className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader><CardTitle className="text-lg text-destructive">Emergency Contact</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-destructive/80 mb-3">For urgent assistance during your trip:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-destructive" /><span className="text-sm font-medium">+250 788 999 000</span></div>
                  <Badge variant="destructive" className="w-full justify-center">24/7 Available</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Have Questions?</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Check out our FAQ section for quick answers to common questions.</p>
                <Button asChild variant="outline" className="w-full"><Link to="/faq">View FAQ</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-muted py-16">
        <div className="container-max mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-muted-foreground">Visit our office in the heart of Kigali</p>
          </div>
          <div className="bg-card rounded-xl shadow-lg overflow-hidden h-96">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.openstreetmap.org/export/embed.html?bbox=29.35%2C-1.97%2C29.39%2C-1.93&layer=mapnik&marker=-1.9503%2C29.3730"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
