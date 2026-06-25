import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const PENDING_CONFIRMATION_EMAIL_KEY = "pendingConfirmationEmail";

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseKey);

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase non configuré : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requis");
  }

  // Multiple GoTrueClient instances on the same localStorage session cause
  // competing token-refresh timers and redundant auth-state-change events
  // (Supabase warns about this directly) — keep a single shared client.
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return client;
}
