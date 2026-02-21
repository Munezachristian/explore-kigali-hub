import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Search, Filter, Star, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = ['All', 'Wildlife', 'Cultural', 'Adventure', 'Safari', 'Beach & Lake'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('packages').select('*').eq('availability', true);
      if (data) setPackages(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = packages
    .filter(p => category === 'All' || p.category === category)
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sort === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sort === 'name') return (a.title || '').localeCompare(b.title || '');
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-navy py-20 px-4">
        <div className="container-max mx-auto text-center">
          <div className="gold-divider mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Tour Packages</h1>
          <p className="font-body text-white/60 max-w-xl mx-auto mb-8">Discover handcrafted experiences across Rwanda and East Africa</p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search packages by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 font-body rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="section-padding">
        <div className="container-max mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-body text-sm font-medium transition-all ${
                    category === cat ? 'bg-gradient-navy text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-48 font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(o => (
                    <SelectItem key={o.value} value={o.value} className="font-body text-sm">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} packages found</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(pkg => (
                <Link to={`/packages/${pkg.id}`} key={pkg.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover-lift group block">
                  <div className="relative h-52 overflow-hidden">
                    <img src={pkg.images?.[0] || '/placeholder.svg'} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {pkg.category && <Badge className="absolute top-3 left-3 bg-gradient-gold text-navy border-0 font-body text-xs font-semibold">{pkg.category}</Badge>}
                    {pkg.discount > 0 && <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0 font-body text-xs">-{pkg.discount}%</Badge>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{pkg.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-body">
                      {pkg.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-accent" />{pkg.location}</span>}
                      {pkg.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-secondary" />{pkg.duration}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {pkg.discount > 0 && <span className="font-body text-xs text-muted-foreground line-through mr-2">${pkg.price}</span>}
                        <span className="font-display text-xl font-bold text-accent">
                          ${pkg.discount > 0 ? Math.round(pkg.price * (1 - pkg.discount / 100)) : pkg.price}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">/person</span>
                      </div>
                      <span className="text-primary font-body text-sm font-medium flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No packages found</h3>
              <p className="font-body text-muted-foreground text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Packages;
