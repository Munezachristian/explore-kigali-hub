import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

export function SeoHead() {
  const { settings } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => {
    const title = settings.seo_title || settings.system_name || 'Explore Kigali Hub';
    const description = settings.seo_description || settings.system_description || '';
    const keywords = settings.seo_keywords || '';
    const ogImage = settings.seo_og_image || settings.hero_background_image || '';
    const twitterHandle = settings.seo_twitter_handle || '';
    const canonical = baseUrl + pathname;

    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    if (ogImage) setMeta('og:image', ogImage.startsWith('http') ? ogImage : baseUrl + ogImage, true);
    setMeta('og:url', canonical, true);
    if (twitterHandle) setMeta('twitter:site', twitterHandle);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage.startsWith('http') ? ogImage : baseUrl + ogImage);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [settings, pathname]);

  return null;
}
