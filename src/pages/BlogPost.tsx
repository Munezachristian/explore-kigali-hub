import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Try finding by id or slug
        let { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id!)
          .maybeSingle();

        if (!data) {
          const res = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', id!)
            .maybeSingle();
          data = res.data;
          error = res.error;
        }

        if (error) throw error;
        setPost(data);

        // Fetch related posts
        if (data?.category) {
          const { data: related } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);
          setRelatedPosts(related || []);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const readingTime = (content: string) => {
    const words = content?.split(' ').length || 0;
    return Math.ceil(words / 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-max mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      {post.cover_image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
      )}

      <article className="container-max mx-auto px-4 md:px-8 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog</Link>
        </Button>

        {post.category && (
          <Badge className="bg-accent/15 text-accent border-0 mb-4">{post.category}</Badge>
        )}

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTime(post.content)} min read
          </span>
          {post.tags?.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {post.excerpt && (
          <p className="font-body text-lg text-muted-foreground mb-8 italic">{post.excerpt}</p>
        )}

        <div
          className="prose prose-lg max-w-none font-body text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="container-max mx-auto px-4 md:px-8 pb-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} to={`/blog/${rp.slug || rp.id}`} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {rp.cover_image && (
                  <img src={rp.cover_image} alt={rp.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground mb-2">{rp.title}</h3>
                  <p className="font-body text-sm text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
