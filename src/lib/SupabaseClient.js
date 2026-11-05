import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** False when the env vars are missing or malformed. The app then runs in demo mode. */
export const isSupabaseConfigured = Boolean(anonKey && url && isHttpUrl(url));

export const isDemoMode = !isSupabaseConfigured;

/** Null in demo mode, so callers must check isSupabaseConfigured first. */
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
