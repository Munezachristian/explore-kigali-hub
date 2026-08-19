import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? import.meta.env?.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;

export type AppRole = "admin" | "tour_manager" | "accountant" | "client";

/** A fresh client with no session — represents a public (anonymous) visitor. */
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Credentials for internal roles are supplied through env vars so that no
 * secrets live in the repo, e.g.:
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD
 *   TEST_TOUR_MANAGER_EMAIL / TEST_TOUR_MANAGER_PASSWORD
 *   TEST_ACCOUNTANT_EMAIL / TEST_ACCOUNTANT_PASSWORD
 *   TEST_CLIENT_EMAIL / TEST_CLIENT_PASSWORD
 */
export function credentialsFor(role: AppRole) {
  const prefix = `TEST_${role.toUpperCase()}`;
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  return email && password ? { email, password } : null;
}

export async function signedInClient(role: AppRole) {
  const creds = credentialsFor(role);
  if (!creds) return null;
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword(creds);
  if (error) throw new Error(`Could not sign in as ${role}: ${error.message}`);
  const { data } = await client.auth.getUser();
  return { client, userId: data.user?.id as string };
}

/** True when the failure is an RLS / permission denial rather than a bug. */
export function isAccessDenied(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "42501" ||
    code === "PGRST301" ||
    code === "PGRST116" ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("does not exist")
  );
}
