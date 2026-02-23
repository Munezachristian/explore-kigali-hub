import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const baseRoutes = ['/', '/packages', '/gallery', '/blog', '/internships', '/about', '/contact', '/faq', '/testimonials', '/information-centers', '/auth'];

const Sitemap = () => {
  const [xml, setXml] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [infoCenters, setInfoCenters] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: pkgs }, { data: posts }, { data: centers }] = await Promise.all([
        supabase.from('packages').select('id, updated_at').eq('availability', true),
        supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
        supabase.from('information_centers').select('id, updated_at'),
      ]);
      if (pkgs) setPackages(pkgs);
      if (posts) setBlogPosts(posts);
      if (centers) setInfoCenters(centers);
    };
    load();
  }, []);

  useEffect(() => {
    const origin = window.location.origin;
    const lastmod = new Date().toISOString().split('T')[0];
    const entries: { loc: string; lastmod?: string }[] = baseRoutes.map(r => ({ loc: origin + r, lastmod }));

    packages.forEach(p => entries.push({ loc: `${origin}/packages/${p.id}`, lastmod: p.updated_at?.split('T')[0] }));
    blogPosts.forEach(p => entries.push({ loc: `${origin}/blog/${p.slug}`, lastmod: p.updated_at?.split('T')[0] }));
    infoCenters.forEach(c => entries.push({ loc: `${origin}/information-centers/${c.id}`, lastmod: c.updated_at?.split('T')[0] }));

    const urlEntries = entries.map(e => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n');
    setXml(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`);
  }, [packages, blogPosts, infoCenters]);

  const downloadSitemap = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="section-padding">
        <div className="container-max mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Sitemap</h1>
          <p className="font-body text-muted-foreground mb-6">
            Search engines use this to discover your pages. Add <code className="bg-muted px-1 rounded">/sitemap.xml</code> to your
            robots.txt or submit to Google Search Console.
          </p>
          <Button onClick={downloadSitemap} className="mb-6">
            <Download className="h-4 w-4 mr-2" />
            Download sitemap.xml
          </Button>
          <pre className="bg-muted p-4 rounded-xl overflow-x-auto text-xs font-mono text-foreground">
            {xml || 'Loading...'}
          </pre>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Sitemap;
