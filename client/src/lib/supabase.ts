import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const PENDING_CONFIRMATION_EMAIL_KEY = "pendingConfirmationEmail";

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseKey);

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase non configuré : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requis");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
