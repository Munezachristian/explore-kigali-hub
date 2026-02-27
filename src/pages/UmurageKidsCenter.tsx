import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';

interface KidsItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
}

const categories = ['all', 'general', 'education', 'arts', 'sports', 'health', 'events'];

const UmurageKidsCenter = () => {
  const [items, setItems] = useState<KidsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('umurage_kids_center')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-navy py-20 px-4">
        <div className="container-max mx-auto text-center">
          <div className="gold-divider mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Umurage Kids Center
          </h1>
          <p className="font-body text-white/60 max-w-xl mx-auto">
            Empowering the next generation through education, arts, sports, and community
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 px-4 border-b border-border">
        <div className="container-max mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-body transition-colors capitalize ${
                filter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-max mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Items Found</h2>
              <p className="font-body text-muted-foreground">Check back soon for new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <Card key={item.id} className="overflow-hidden hover-lift rounded-2xl shadow-card">
                  {item.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-gold flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white/60" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                      {item.category && (
                        <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="font-body text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UmurageKidsCenter;
