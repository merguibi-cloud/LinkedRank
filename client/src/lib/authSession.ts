import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import type { trpc } from "@/lib/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

const AUTH_SYNC_ATTEMPTS = 12;
const AUTH_SYNC_DELAY_MS = 250;

export async function waitForAuthenticatedUser(
  utils: TrpcUtils
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return false;
  }

  for (let attempt = 0; attempt < AUTH_SYNC_ATTEMPTS; attempt++) {
    await utils.auth.me.invalidate();
    const user = await utils.auth.me.fetch();
    if (user) return true;
    await new Promise((resolve) => setTimeout(resolve, AUTH_SYNC_DELAY_MS));
  }

  return false;
}

export async function refreshAuthSession(utils: TrpcUtils): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.getSession();
  }
  await utils.auth.me.invalidate();
  await utils.auth.me.fetch();
}
