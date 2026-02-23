import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Post-login landing: wait for auth + role to fully load, then redirect.
 *
 * Root cause of the original bug:
 *   - On mount, loading=true and role=null
 *   - The useEffect ran immediately and returned early due to `if (loading) return`
 *   - By the time loading became false and role arrived, the effect had already
 *     run and would NOT re-run unless its dependencies changed
 *   - Fix: include `loading` and `role` in the dependency array so the effect
 *     re-fires after auth state settles, and only redirect when loading===false
 */
const DashboardRedirect = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Do nothing while auth context is still initialising
    if (loading) return;

    // Auth resolved — no user, go home
    if (!user) {
      navigate('/');
      return;
    }

    // User is authenticated — redirect by role (default to client if role is null)
    const r = role ?? 'client';
    if (r === 'admin') navigate('/admin', { replace: true });
    else if (r === 'tour_manager') navigate('/manager', { replace: true });
    else if (r === 'accountant') navigate('/accountant', { replace: true });
    else navigate('/client', { replace: true });
  }, [loading, user, role, navigate]); // re-run whenever any of these change

  // Always show the spinner — the redirect fires as soon as auth resolves
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="font-body text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardRedirect;