import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const { language, setLanguage, t, languageOptions } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'tour_manager') return '/manager';
    if (role === 'accountant') return '/accountant';
    return '/client';
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/packages', label: t('nav.packages') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/internships', label: t('nav.internships') },
    { href: '/info', label: t('nav.info') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gradient-navy shadow-lg backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <span className="text-navy font-display font-bold text-lg">E</span>
            </div>
            <div>
              <span className="text-white font-display font-bold text-xl tracking-wide">ESA Tours</span>
              <div className="text-gold text-xs font-body tracking-widest uppercase opacity-80">Kigali • Rwanda</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-white/85 hover:text-gold font-body text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/8 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 font-body">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{languageOptions.find(l => l.code === language)?.flag}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`font-body text-sm ${language === lang.code ? 'text-gold font-medium' : ''}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10 gap-2 font-body">
                    <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                      <User className="w-4 h-4 text-navy" />
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="font-body">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive font-body">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="text-white hover:text-white hover:bg-white/10 font-body"
                >
                  {t('login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth?mode=register')}
                  className="bg-gradient-gold text-navy font-semibold hover:opacity-90 shadow-gold font-body border-0"
                >
                  {t('register')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-gradient-navy border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-white/85 hover:text-gold font-body text-sm font-medium px-4 py-3 rounded-lg hover:bg-white/8 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => { navigate(getDashboardPath()); setIsMobileOpen(false); }} className="text-white justify-start font-body">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> {t('dashboard')}
                  </Button>
                  <Button variant="ghost" onClick={signOut} className="text-destructive justify-start font-body">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate('/auth'); setIsMobileOpen(false); }} className="text-white justify-start font-body">
                    {t('login')}
                  </Button>
                  <Button onClick={() => { navigate('/auth?mode=register'); setIsMobileOpen(false); }} className="bg-gradient-gold text-navy font-semibold border-0 font-body">
                    {t('register')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
