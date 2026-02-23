import { supabase } from '@/integrations/supabase/client';

/** Inserts an audit log entry into system_logs. Call only when user is authenticated. */
export async function logAction(
  action: string,
  details: Record<string, unknown> | string,
  userRole?: string | null
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);

    await supabase.from('system_logs').insert({
      user_id: user?.id ?? null,
      user_role: userRole ?? null,
      action,
      details: detailsStr,
      ip_address: null, // Client cannot reliably get IP; use Edge Function if needed
    });
  } catch (err) {
    console.warn('Failed to write system log:', err);
  }
}
