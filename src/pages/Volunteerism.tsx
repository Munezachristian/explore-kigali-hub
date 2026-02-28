import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Users, HandHeart } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  max_volunteers: number | null;
}

const Volunteerism = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('volunteerism_activities')
        .select('*')
        .eq('is_published', true)
        .order('start_date', { ascending: true });
      setActivities(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary py-20 px-4">
        <div className="container-max mx-auto text-center">
          <div className="gold-divider mx-auto mb-4" />
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Volunteerism Activities
          </h1>
          <p className="font-body text-white/60 max-w-xl mx-auto">
            Make a difference — join our community volunteer programs across Rwanda
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-max mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16">
              <HandHeart className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Activities Yet</h2>
              <p className="font-body text-muted-foreground">Check back soon for upcoming volunteer opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden hover-lift rounded-2xl shadow-card">
                  {activity.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-secondary flex items-center justify-center">
                      <HandHeart className="w-12 h-12 text-white/60" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-foreground">{activity.title}</h3>
                    {activity.description && (
                      <p className="font-body text-sm text-muted-foreground line-clamp-3">{activity.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-secondary" />
                          {activity.location}
                        </span>
                      )}
                      {activity.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-accent" />
                          {new Date(activity.start_date).toLocaleDateString()}
                          {activity.end_date && ` — ${new Date(activity.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                      {activity.max_volunteers && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {activity.max_volunteers} volunteers
                        </Badge>
                      )}
                    </div>
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

export default Volunteerism;
