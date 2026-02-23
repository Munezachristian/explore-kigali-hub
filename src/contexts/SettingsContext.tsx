import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSettings {
  system_name: string;
  system_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  system_logo: string;
  favicon: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_background_image: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_background_type: 'image' | 'video' | 'slider';
  hero_background_video: string;
  hero_slider_images: string[];
  maintenance_mode: boolean;
  allow_registrations: boolean;
  session_timeout: number;
  internship_open: boolean;
  internship_price: number;
  internship_benefits: string;
  booking_confirmation_fee: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  seo_twitter_handle: string;
}

const defaultSettings: SystemSettings = {
  system_name: 'Kigali Hub',
  system_description: 'Your premier African tourism partner',
  contact_email: 'info@kigalihub.com',
  contact_phone: '+250 788 123 456',
  address: 'KN 4 Ave, Kigali, Rwanda',
  currency: 'RWF',
  primary_color: '#1e3a5f',
  secondary_color: '#2d5a4e',
  accent_color: '#f5a623',
  system_logo: '',
  favicon: '',
  hero_title: 'Discover the Heart of Africa',
  hero_subtitle: 'Experience unforgettable adventures in Rwanda',
  hero_description: "Join us for an extraordinary journey through Rwanda's stunning landscapes, rich culture, and incredible wildlife.",
  hero_background_image: '',
  hero_button_text: 'Explore Packages',
  hero_button_link: '/packages',
  hero_background_type: 'image',
  hero_background_video: '',
  hero_slider_images: [],
  maintenance_mode: false,
  allow_registrations: true,
  session_timeout: 24,
  internship_open: true,
  internship_price: 0,
  internship_benefits: '',
  booking_confirmation_fee: 0,
  seo_title: 'Explore Kigali Hub',
  seo_description: 'Your premier African tourism partner',
  seo_keywords: '',
  seo_og_image: '',
  seo_twitter_handle: '',
};

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'system_name', 'system_description', 'contact_email', 'contact_phone', 'address', 'currency',
          'primary_color', 'secondary_color', 'accent_color', 'system_logo', 'favicon',
          'hero_title', 'hero_subtitle', 'hero_description', 'hero_background_image',
          'hero_button_text', 'hero_button_link', 'hero_background_type', 'hero_background_video', 'hero_slider_images',
          'maintenance_mode', 'allow_registrations', 'session_timeout',
          'internship_open', 'internship_price', 'internship_benefits', 'booking_confirmation_fee',
          'seo_title', 'seo_description', 'seo_keywords', 'seo_og_image', 'seo_twitter_handle'
        ]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((row: { key: string; value: string | null }) => {
        settingsMap[row.key] = row.value ?? '';
      });

      let sliderImages: string[] = [];
      if (settingsMap.hero_slider_images) {
        try {
          const parsed = JSON.parse(settingsMap.hero_slider_images);
          if (Array.isArray(parsed)) {
            sliderImages = parsed.filter((x: any) => typeof x === 'string');
          }
        } catch {
          sliderImages = [];
        }
      }

      setSettings({
        system_name: settingsMap.system_name || defaultSettings.system_name,
        system_description: settingsMap.system_description || defaultSettings.system_description,
        contact_email: settingsMap.contact_email || defaultSettings.contact_email,
        contact_phone: settingsMap.contact_phone || defaultSettings.contact_phone,
        address: settingsMap.address || defaultSettings.address,
        currency: settingsMap.currency || defaultSettings.currency,
        primary_color: settingsMap.primary_color || defaultSettings.primary_color,
        secondary_color: settingsMap.secondary_color || defaultSettings.secondary_color,
        accent_color: settingsMap.accent_color || defaultSettings.accent_color,
        system_logo: settingsMap.system_logo || defaultSettings.system_logo,
        favicon: settingsMap.favicon || defaultSettings.favicon,
        hero_title: settingsMap.hero_title || defaultSettings.hero_title,
        hero_subtitle: settingsMap.hero_subtitle || defaultSettings.hero_subtitle,
        hero_description: settingsMap.hero_description || defaultSettings.hero_description,
        hero_background_image: settingsMap.hero_background_image || defaultSettings.hero_background_image,
        hero_button_text: settingsMap.hero_button_text || defaultSettings.hero_button_text,
        hero_button_link: settingsMap.hero_button_link || defaultSettings.hero_button_link,
        hero_background_type: (settingsMap.hero_background_type as any) || defaultSettings.hero_background_type,
        hero_background_video: settingsMap.hero_background_video || defaultSettings.hero_background_video,
        hero_slider_images: sliderImages.length ? sliderImages : defaultSettings.hero_slider_images,
        maintenance_mode: settingsMap.maintenance_mode === 'true',
        allow_registrations: settingsMap.allow_registrations !== 'false',
        session_timeout: parseInt(settingsMap.session_timeout || '24', 10) || 24,
        internship_open: settingsMap.internship_open !== 'false',
        internship_price: parseFloat(settingsMap.internship_price || '0') || 0,
        internship_benefits: settingsMap.internship_benefits || '',
        booking_confirmation_fee: parseFloat(settingsMap.booking_confirmation_fee || '0') || 0,
        seo_title: settingsMap.seo_title || defaultSettings.seo_title,
        seo_description: settingsMap.seo_description || defaultSettings.seo_description,
        seo_keywords: settingsMap.seo_keywords || '',
        seo_og_image: settingsMap.seo_og_image || '',
        seo_twitter_handle: settingsMap.seo_twitter_handle || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(defaultSettings);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update favicon when settings change
  useEffect(() => {
    if (typeof document === 'undefined' || !settings.favicon) return;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.favicon;
  }, [settings.favicon]);

  // Apply dynamic brand colors from settings to CSS variables (used site-wide)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const hexToHsl = (hex: string): string | null => {
      const clean = hex.replace('#', '');
      if (![3, 6].includes(clean.length)) return null;
      const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
      const r = parseInt(full.substring(0, 2), 16) / 255;
      const g = parseInt(full.substring(2, 4), 16) / 255;
      const b = parseInt(full.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      const l = (max + min) / 2;
      const d = max - min;
      if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
      }
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const root = document.documentElement;
    const primaryHsl = hexToHsl(settings.primary_color);
    const secondaryHsl = hexToHsl(settings.secondary_color);
    const accentHsl = hexToHsl(settings.accent_color);

    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--navy', primaryHsl);
      const parts = primaryHsl.split(/[\s%]+/).filter(Boolean);
      const h = parseInt(parts[0] || '215', 10);
      root.style.setProperty('--gradient-navy', `linear-gradient(135deg, hsl(${primaryHsl}), hsl(${h} 70% 10%))`);
    }
    if (secondaryHsl) {
      root.style.setProperty('--secondary', secondaryHsl);
      root.style.setProperty('--teal', secondaryHsl);
    }
    if (accentHsl) {
      root.style.setProperty('--accent', accentHsl);
      root.style.setProperty('--gold', accentHsl);
      const parts = accentHsl.split(/[\s%]+/).filter(Boolean);
      const h = parseInt(parts[0] || '40', 10);
      root.style.setProperty('--gradient-gold', `linear-gradient(135deg, hsl(${accentHsl}), hsl(${h} 85% 42%))`);
    }
  }, [settings.primary_color, settings.secondary_color, settings.accent_color]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
