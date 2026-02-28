import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'tour_manager' | 'accountant' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<AppRole> => {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'client';
      }
      
      return data || 'client';
    } catch (error) {
      console.error('Exception fetching user role:', error);
      return 'client';
    }
  };

  const ensureProfileExists = async (userId: string, email: string, fullName?: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: fullName || '',
          });
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Clear invalid session (e.g. expired refresh token)
          console.warn('Session recovery failed, signing out:', error.message);
          await supabase.auth.signOut();
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await ensureProfileExists(session.user.id, session.user.email || '', session.user.user_metadata?.full_name);
            const userRole = await fetchUserRole(session.user.id);
            setRole(userRole);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setLoading(true);
        if (event === 'SIGNED_IN') {
          await ensureProfileExists(session.user.id, session.user.email || '', session.user.user_metadata?.full_name);
        }
        
        try {
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('client');
        } finally {
          setLoading(false);
        }
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      role, 
      loading, 
      signOut, 
      signIn, 
      signUp 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
