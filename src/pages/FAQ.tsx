import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, HelpCircle, Plane, Shield, CreditCard, MapPin, Calendar, Users, Luggage, Camera, Heart, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQ = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqCategories = [
    { name: "General", icon: <HelpCircle className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
    { name: "Booking & Payment", icon: <CreditCard className="h-5 w-5" />, color: "bg-secondary/10 text-secondary" },
    { name: "Travel Requirements", icon: <Shield className="h-5 w-5" />, color: "bg-destructive/10 text-destructive" },
    { name: "Destinations", icon: <MapPin className="h-5 w-5" />, color: "bg-accent/10 text-accent" },
    { name: "Accommodation", icon: <Calendar className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
    { name: "Health & Safety", icon: <Heart className="h-5 w-5" />, color: "bg-secondary/10 text-secondary" },
  ];

  const faqData = [
    { category: "General", question: "What is Kigali Hub?", answer: "Kigali Hub is a premier tourism company based in Rwanda, specializing in creating unforgettable African travel experiences.", icon: <HelpCircle className="h-5 w-5" /> },
    { category: "General", question: "Which countries do you operate in?", answer: "We currently operate in 15+ African countries including Rwanda, Uganda, Kenya, Tanzania, Burundi, DRC, Ethiopia, and more.", icon: <HelpCircle className="h-5 w-5" /> },
    { category: "General", question: "How long have you been in business?", answer: "Kigali Hub was founded in 2014 and has been serving travelers for over 10 years.", icon: <HelpCircle className="h-5 w-5" /> },
    { category: "Booking & Payment", question: "How do I book a tour?", answer: "You can book through our website by selecting a package and clicking 'Book Now', or contact our team directly.", icon: <CreditCard className="h-5 w-5" /> },
    { category: "Booking & Payment", question: "What payment methods do you accept?", answer: "We accept cash, mobile money (MTN, Airtel), Visa, MasterCard, bank transfers, and international wire transfers.", icon: <CreditCard className="h-5 w-5" /> },
    { category: "Booking & Payment", question: "Do you require a deposit?", answer: "Yes, we typically require a 30% deposit to confirm your booking, with the remaining balance due 30 days before your trip.", icon: <CreditCard className="h-5 w-5" /> },
    { category: "Booking & Payment", question: "What is your cancellation policy?", answer: "Our cancellation policy varies by package type. Generally: 30+ days before: 10% fee, 15-29 days: 25% fee, 7-14 days: 50% fee, less than 7 days: 75% fee.", icon: <CreditCard className="h-5 w-5" /> },
    { category: "Travel Requirements", question: "Do I need a visa to visit Rwanda?", answer: "Visa requirements depend on your nationality. Many countries can get visa on arrival or e-visa online.", icon: <Shield className="h-5 w-5" /> },
    { category: "Travel Requirements", question: "What vaccinations are required?", answer: "Yellow fever vaccination is required for most travelers. We recommend consulting your doctor about other vaccinations.", icon: <Shield className="h-5 w-5" /> },
    { category: "Travel Requirements", question: "Do I need travel insurance?", answer: "Yes, travel insurance is mandatory for all our tours.", icon: <Shield className="h-5 w-5" /> },
    { category: "Destinations", question: "What is the best time to visit Rwanda?", answer: "The best time is during the dry seasons (June-September and December-February).", icon: <MapPin className="h-5 w-5" /> },
    { category: "Destinations", question: "Can you customize tours for groups?", answer: "Absolutely! We specialize in customizing tours for families, corporate groups, educational trips, and special interest groups.", icon: <MapPin className="h-5 w-5" /> },
    { category: "Destinations", question: "How safe are your destinations?", answer: "All our destinations are carefully selected for safety. Rwanda is considered one of Africa's safest countries.", icon: <MapPin className="h-5 w-5" /> },
    { category: "Accommodation", question: "What type of accommodation do you provide?", answer: "We offer a range from budget-friendly guesthouses to luxury lodges and 5-star hotels.", icon: <Calendar className="h-5 w-5" /> },
    { category: "Accommodation", question: "Can you accommodate dietary restrictions?", answer: "Yes, we can accommodate most dietary restrictions. Please inform us in advance.", icon: <Calendar className="h-5 w-5" /> },
    { category: "Health & Safety", question: "Is it safe to drink tap water?", answer: "We recommend drinking only bottled or purified water. Bottled water is provided during all our tours.", icon: <Heart className="h-5 w-5" /> },
    { category: "Health & Safety", question: "What about malaria and other diseases?", answer: "Malaria is present in some areas, so prophylaxis is recommended.", icon: <Heart className="h-5 w-5" /> },
    { category: "Health & Safety", question: "What if I have a medical emergency?", answer: "We have 24/7 emergency support and partnerships with reputable medical facilities.", icon: <Heart className="h-5 w-5" /> },
  ];

  const toggleExpanded = (index: number) => setExpandedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);

  const filteredFAQs = faqData.filter(item => item.question.toLowerCase().includes(searchTerm.toLowerCase()) || item.answer.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const groupedFAQs = filteredFAQs.reduce((acc, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {} as Record<string, typeof faqData>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative h-64 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-primary-foreground px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{t('faq.title') || 'Frequently Asked Questions'}</h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-primary-foreground/80">{t('faq.subtitle') || 'Find answers to common questions about our tours and services'}</p>
        </div>
      </section>

      <section className="container-max mx-auto px-4 md:px-8 py-8">
        <div className="max-w-2xl mx-auto"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" /><Input placeholder="Search for questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg" /></div></div>
      </section>

      <section className="container-max mx-auto px-4 md:px-8 pb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {faqCategories.map((category) => (
            <div key={category.name} className={`flex items-center gap-2 px-4 py-2 rounded-full ${category.color}`}>{category.icon}<span className="font-medium text-sm">{category.name}</span></div>
          ))}
        </div>
      </section>

      <section className="container-max mx-auto px-4 md:px-8 pb-20">
        {Object.keys(groupedFAQs).length === 0 ? (
          <div className="text-center py-20"><HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-xl font-semibold text-foreground mb-2">No questions found</h3><p className="text-muted-foreground">Try searching with different keywords</p></div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {Object.entries(groupedFAQs).map(([category, items]) => {
              const categoryInfo = faqCategories.find(c => c.name === category);
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4"><div className={`p-2 rounded-lg ${categoryInfo?.color}`}>{categoryInfo?.icon}</div><h2 className="font-display text-2xl font-bold">{category}</h2><Badge variant="secondary">{items.length} questions</Badge></div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const globalIndex = faqData.indexOf(item);
                      const isExpanded = expandedItems.includes(globalIndex);
                      return (
                        <Card key={globalIndex} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <Button variant="ghost" onClick={() => toggleExpanded(globalIndex)} className="w-full justify-between p-0 h-auto text-left">
                              <div className="flex items-center gap-3"><div className="p-1 rounded bg-primary/10 text-primary">{item.icon}</div><CardTitle className="text-lg text-foreground">{item.question}</CardTitle></div>
                              {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </Button>
                          </CardHeader>
                          {isExpanded && <CardContent className="pt-0"><p className="text-muted-foreground leading-relaxed">{item.answer}</p></CardContent>}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-primary py-16">
        <div className="container-max mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">Still Have Questions?</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">Can't find the answer you're looking for? Our team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild><Link to="/contact">Contact Support <HelpCircle className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild><a href="tel:+250788123456">Call Us <Phone className="h-4 w-4 ml-2" /></a></Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
