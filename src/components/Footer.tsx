import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-gradient-navy text-white">
      {/* Newsletter bar */}
      <div className="border-b border-white/10">
        <div className="container-max mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-white/60 font-body text-sm">Get exclusive deals and travel inspiration</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-w-[260px] font-body"
                required
              />
              <Button type="submit" className="bg-gradient-gold text-navy font-semibold border-0 shadow-gold hover:opacity-90 font-body">
                <Send className="w-4 h-4 mr-1" /> Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-max mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {settings.system_logo ? (
                <img src={settings.system_logo} alt={settings.system_name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center">
                  <span className="text-navy font-display font-bold text-lg">E</span>
                </div>
              )}
              <div>
                <span className="text-white font-display font-bold text-xl">{settings.system_name}</span>
                <div className="text-gold text-xs tracking-widest uppercase opacity-80">Kigali • Rwanda</div>
              </div>
            </div>
            <p className="text-white/60 font-body text-sm leading-relaxed mb-6">
              {settings.system_description || 'Your premier gateway to authentic African tourism experiences. We craft unforgettable journeys across Rwanda and East Africa.'}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Twitter, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gold hover:text-navy flex items-center justify-center transition-all duration-200 text-white/70 hover:text-navy"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/packages', label: 'Tour Packages' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/blog', label: 'Travel Blog' },
                { to: '/internships', label: 'Internships' },
                { to: '/info', label: 'Info Center' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-gold font-body text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Destinations</h4>
            <ul className="space-y-2.5">
              {['Volcanoes National Park', 'Kigali City', 'Nyungwe Forest', 'Lake Kivu', 'Akagera National Park', 'East Africa Safari'].map((dest) => (
                <li key={dest}>
                  <Link to="/packages" className="text-white/60 hover:text-gold font-body text-sm transition-colors">
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 font-body text-sm">Kigali, Rwanda<br />KG 123 Street</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+250788000000" className="text-white/60 hover:text-gold font-body text-sm transition-colors">
                  +250 788 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:info@esatours.rw" className="text-white/60 hover:text-gold font-body text-sm transition-colors">
                  info@esatours.rw
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-max mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/40 font-body text-xs">
            © {new Date().getFullYear()} ESA Tours. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-white/70 font-body text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
