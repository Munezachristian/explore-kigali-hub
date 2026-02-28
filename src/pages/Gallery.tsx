import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, Download, Heart, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = ['All', 'Wildlife', 'Cultural', 'Adventure', 'Safari', 'Beach & Lake', 'City Tours', 'Mountains'];

const Gallery = () => {
  const { t } = useLanguage();
  const [gallery, setGallery] = useState<any[]>([]);
  const [filteredGallery, setFilteredGallery] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setGallery(data || []);
        setFilteredGallery(data || []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    let filtered = gallery;
    if (selectedCategory !== 'All') filtered = filtered.filter(item => item.category === selectedCategory);
    if (searchTerm) filtered = filtered.filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredGallery(filtered);
  }, [gallery, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative h-64 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-primary-foreground px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{t('gallery.title') || 'Gallery'}</h1>
          <p className="font-body text-lg max-w-2xl mx-auto text-primary-foreground/80">{t('gallery.subtitle') || 'Explore our collection of stunning African destinations and experiences'}</p>
        </div>
      </section>

      <section className="container-max mx-auto px-4 md:px-8 py-8">
        <div className="bg-card rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder={t('gallery.search') || 'Search images...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category)} className="text-sm">{category}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-max mx-auto px-4 md:px-8 pb-20">
        {filteredGallery.length === 0 ? (
          <div className="text-center py-20"><p className="text-muted-foreground text-lg">{t('gallery.noResults') || 'No images found matching your criteria'}</p></div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}>
            {filteredGallery.map((item) => (
              <div key={item.id} className="bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative aspect-square group">
                      <img src={item.image_url || '/placeholder-image.jpg'} alt={item.title || 'Gallery image'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="secondary"><Heart className="h-4 w-4" /></Button>
                          <Button size="sm" variant="secondary"><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2"><Badge variant="secondary">{item.category}</Badge></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-6 p-6">
                    <div className="relative w-48 h-48 flex-shrink-0">
                      <img src={item.image_url || '/placeholder-image.jpg'} alt={item.title || 'Gallery image'} className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute top-2 right-2"><Badge variant="secondary">{item.category}</Badge></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />View</Button>
                        <Button size="sm" variant="outline"><Heart className="h-4 w-4 mr-1" />Like</Button>
                        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Download</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
