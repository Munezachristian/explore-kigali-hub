import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'esa_ad_dismissed';

interface Ad {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  media_type: 'image' | 'video';
  link_url: string;
  show_after_seconds: number;
  start_date: string | null;
  end_date: string | null;
  show_once_per_session: boolean;
}

export function AdvertisementPopup() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);
  const [timerReady, setTimerReady] = useState(false);

  const dismiss = useCallback(() => {
    if (!ad) return;
    setVisible(false);
    if (ad.show_once_per_session) {
      try {
        const dismissed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        if (!dismissed.includes(ad.id)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, ad.id]));
        }
      } catch {}
    }
  }, [ad]);

  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      if (!ad?.link_url) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-ad-close]')) return;
      window.location.href = ad.link_url;
    },
    [ad]
  );

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const run = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('advertisements' as any)
        .select('id, title, description, image_url, media_type, link_url, show_after_seconds, start_date, end_date, show_once_per_session')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!mounted || error || !data?.length) return;

      let candidates = (data as unknown as Ad[]).filter((a) => a.image_url);
      if (candidates.length > 0) {
        candidates = candidates.filter((a) => {
          if (a.start_date && now < a.start_date) return false;
          if (a.end_date && now > a.end_date) return false;
          if (a.show_once_per_session) {
            try {
              const dismissed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
              if (dismissed.includes(a.id)) return false;
            } catch {}
          }
          return true;
        });
      }

      const chosen = candidates[0];
      if (!chosen || !mounted) return;

      setAd(chosen);
      const delay = Math.max(0, chosen.show_after_seconds) * 1000;
      if (delay === 0) {
        setTimerReady(true);
        setVisible(true);
      } else {
        timer = setTimeout(() => {
          if (mounted) {
            setTimerReady(true);
            setVisible(true);
          }
        }, delay);
      }
    };

    run();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (timerReady && ad) setVisible(true);
  }, [timerReady, ad]);

  if (!visible || !ad) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
      <div
        className="relative bg-card rounded-2xl shadow-xl max-w-lg w-full overflow-hidden cursor-pointer"
        onClick={handleContentClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (ad?.link_url) window.location.href = ad.link_url;
          }
        }}
      >
        <button
          type="button"
          data-ad-close
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="aspect-video bg-muted">
          {(ad.media_type || 'image') === 'video' ? (
            <video
              src={ad.image_url!}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={ad.image_url!}
              alt={ad.title || 'Advertisement'}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {(ad.title || ad.description) && (
          <div className="p-4">
            {ad.title && (
              <h3 className="font-display font-semibold text-foreground mb-1">{ad.title}</h3>
            )}
            {ad.description && (
              <p className="font-body text-sm text-muted-foreground">{ad.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
