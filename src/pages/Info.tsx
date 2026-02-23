import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard, 
  Shield, 
  Plane, 
  Camera, 
  Heart,
  Sun,
  Cloud,
  Thermometer,
  Umbrella,
  Info as InfoIcon,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Info = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  const generalInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Location",
      content: "Kigali, Rwanda - The Heart of Africa"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Emergency Contact",
      content: "+250 788 123 456 (24/7 Support)"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business Hours",
      content: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed"
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Payment Methods",
      content: "Cash, Mobile Money, Visa, MasterCard, Bank Transfer"
    }
  ];

  const travelTips = [
    {
      category: "Before You Travel",
      tips: [
        "Ensure your passport is valid for at least 6 months",
        "Check visa requirements for your nationality",
        "Get travel insurance that covers medical emergencies",
        "Book accommodations in advance during peak season",
        "Learn basic Kinyarwanda phrases"
      ]
    },
    {
      category: "Health & Safety",
      tips: [
        "Consult your doctor about necessary vaccinations",
        "Bring mosquito repellent and anti-malaria medication",
        "Drink only bottled or purified water",
        "Keep emergency contacts handy",
        "Register with your embassy upon arrival"
      ]
    },
    {
      category: "Cultural Etiquette",
      tips: [
        "Dress modestly, especially when visiting religious sites",
        "Ask permission before photographing people",
        "Use your right hand for eating and greeting",
        "Remove shoes when entering someone's home",
        "Learn traditional greetings and customs"
      ]
    }
  ];

  const weatherInfo = [
    {
      season: "Dry Season (June - September)",
      temperature: "15-25°C",
      description: "Best time for wildlife viewing and gorilla trekking",
      icon: <Sun className="h-8 w-8 text-yellow-500" />
    },
    {
      season: "Short Rainy Season (October - December)",
      temperature: "16-24°C",
      description: "Lush landscapes, fewer crowds, good for photography",
      icon: <Cloud className="h-8 w-8 text-gray-500" />
    },
    {
      season: "Long Rainy Season (March - May)",
      temperature: "17-23°C",
      description: "Heavy rains, challenging for some activities but very green",
      icon: <Umbrella className="h-8 w-8 text-blue-500" />
    }
  ];

  const whatToBring = [
    {
      category: "Essentials",
      items: [
        "Passport and visa documents",
        "Travel insurance documents",
        "Cash in local currency",
        "Prescription medications",
        "Adapters and chargers"
      ]
    },
    {
      category: "Clothing",
      items: [
        "Lightweight, breathable clothing",
        "Long-sleeved shirts and pants",
        "Rain jacket or poncho",
        "Comfortable walking shoes",
        "Hat and sunglasses"
      ]
    },
    {
      category: "Equipment",
      items: [
        "Camera with zoom lens",
        "Binoculars for wildlife viewing",
        "Power bank for devices",
        "Flashlight or headlamp",
        "Water bottle"
      ]
    }
  ];

  const faqItems = [
    {
      question: "Do I need a visa to visit Rwanda?",
      answer: "Visa requirements vary by nationality. Many countries can get visa on arrival or e-visa online. Check with Rwandan immigration for specific requirements."
    },
    {
      question: "Is Rwanda safe for tourists?",
      answer: "Rwanda is considered one of the safest countries in Africa. The country is politically stable with low crime rates. Standard travel precautions are recommended."
    },
    {
      question: "What currency is used?",
      answer: "Rwandan Franc (RWF). US Dollars are widely accepted in tourist areas. Credit cards are accepted in hotels and larger establishments."
    },
    {
      question: "What languages are spoken?",
      answer: "Kinyarwanda, English, French, and Swahili are official languages. English is widely spoken in tourist areas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-navy flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('info.title') || 'Travel Information'}
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-white/80">
            {t('info.subtitle') || 'Everything you need to know for your African adventure'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-max mx-auto px-4 md:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:flex">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="tips">Travel Tips</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="packing">What to Bring</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                      {info.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{info.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick FAQ */}
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold mb-6">Quick FAQ</h2>
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-start gap-2 text-lg">
                        <InfoIcon className="h-5 w-5 text-sky-600 mt-1 flex-shrink-0" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {travelTips.map((category, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-sky-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Important Alerts */}
            <div className="mt-8">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-5 w-5" />
                    Important Travel Advisory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li>• Always carry a copy of your passport and visa</li>
                    <li>• Register with your embassy upon arrival</li>
                    <li>• Keep emergency contacts readily accessible</li>
                    <li>• Follow local customs and regulations</li>
                    <li>• Stay informed about current travel advisories</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weather" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {weatherInfo.map((season, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {season.icon}
                    </div>
                    <CardTitle className="text-lg">{season.season}</CardTitle>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Thermometer className="h-4 w-4" />
                      {season.temperature}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{season.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weather Tips */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold mb-6">Weather Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dry Season Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Best wildlife viewing opportunities</li>
                      <li>• Ideal for gorilla trekking</li>
                      <li>• Clear skies for photography</li>
                      <li>• Comfortable temperatures</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rainy Season Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Lush, green landscapes</li>
                      <li>• Fewer tourists</li>
                      <li>• Better prices</li>
                      <li>• Excellent bird watching</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="packing" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {whatToBring.map((category, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-sky-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Recommendations */}
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-sky-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Special Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">For Wildlife Enthusiasts</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Binoculars (8x42 or 10x42 recommended)</li>
                        <li>• Camera with telephoto lens</li>
                        <li>• Neutral-colored clothing</li>
                        <li>• Insect repellent with DEET</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">For Cultural Experiences</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Modest clothing for village visits</li>
                        <li>• Small gifts for local communities</li>
                        <li>• Notebook for cultural observations</li>
                        <li>• Respectful attitude and patience</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
};

export default Info;
