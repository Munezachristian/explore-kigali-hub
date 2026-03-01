import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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

const AUTH_TIMEOUT_MS = 10000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const fetchUserRole = async (userId: string): Promise<AppRole> => {
    try {
      console.log('[Auth] Fetching role for user:', userId);
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
      if (error) {
        console.error('[Auth] Role fetch error:', error.message);
        return 'client';
      }
      console.log('[Auth] Role fetched:', data);
      return data || 'client';
    } catch (error) {
      console.error('[Auth] Role fetch exception:', error);
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
        await supabase.from('profiles').insert({
          id: userId,
          email: email,
          full_name: fullName || '',
        });
      }
    } catch (error) {
      console.error('[Auth] Profile ensure error:', error);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // Safety timeout: never stay loading forever
    const timeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('[Auth] Loading timeout reached, forcing loading=false');
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    // Set up auth state listener FIRST (per Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      console.log('[Auth] State change:', event);

      // Only set loading on meaningful events, NOT on TOKEN_REFRESHED
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(true);
          if (event === 'SIGNED_IN') {
            // Fire-and-forget profile creation to avoid blocking
            ensureProfileExists(session.user.id, session.user.email || '', session.user.user_metadata?.full_name);
          }
          const userRole = await fetchUserRole(session.user.id);
          if (mountedRef.current) {
            setRole(userRole);
            setLoading(false);
          }
        } else {
          setRole(null);
          setLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update session/user without touching loading state
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    // Then restore session
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('[Auth] Session recovery failed, signing out:', error.message);
          await supabase.auth.signOut();
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        if (mountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log('[Auth] Session restored for:', session.user.email);
            await ensureProfileExists(session.user.id, session.user.email || '', session.user.user_metadata?.full_name);
            const userRole = await fetchUserRole(session.user.id);
            if (mountedRef.current) {
              setRole(userRole);
            }
          } else {
            console.log('[Auth] No active session');
          }
        }
      } catch (error) {
        console.error('[Auth] Init exception:', error);
      } finally {
        if (mountedRef.current) {
          initializedRef.current = true;
          setLoading(false);
          console.log('[Auth] Initialization complete');
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Signing in:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) console.log('[Auth] Sign in success');
      else console.error('[Auth] Sign in error:', error.message);
      return { error };
    } catch (error) {
      console.error('[Auth] Sign in exception:', error);
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
      console.log('[Auth] Signing out');
      await supabase.auth.signOut();
      setRole(null);
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}
