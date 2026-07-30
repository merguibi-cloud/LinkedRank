import { createServerClient } from "@supabase/ssr";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import WebSocket from "ws";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export function isSupabaseConfigured() {
  return Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);
}

// Node < 22 has no native WebSocket, which the Supabase Realtime client requires at construction time.
const realtimeTransport = typeof globalThis.WebSocket === "undefined" ? WebSocket : undefined;

export function createSupabaseServerClient(req: Request, res: Response) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  return createServerClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    cookies: {
      getAll() {
        const parsed = parseCookieHeader(req.headers.cookie ?? "");
        return Object.entries(parsed).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookie(name, value, options);
        }
      },
    },
    realtime: realtimeTransport ? { transport: realtimeTransport as never } : undefined,
  });
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: string; message?: string };
  return (
    value.code === "refresh_token_not_found" ||
    /invalid refresh token|refresh token not found/i.test(value.message ?? "")
  );
}

export function clearSupabaseAuthCookies(req: Request, res: Response) {
  const parsed = parseCookieHeader(req.headers.cookie ?? "");
  for (const name of Object.keys(parsed)) {
    if (!name.startsWith("sb-") || !name.includes("-auth-token")) continue;
    res.clearCookie(name, {
      path: "/",
      sameSite: "lax",
      secure:
        req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        process.env.NODE_ENV === "production",
    });
  }
}

async function resolveLegacyUser(req: Request): Promise<User | null> {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

// Cache user resolution for 60 seconds to avoid hitting DB on every request.
// Key: supabase user id  →  { user, expiresAt }
const USER_CACHE_TTL_MS = 60_000;
const userCache = new Map<string, { user: User; expiresAt: number }>();

function getCachedUser(supabaseId: string): User | null {
  const entry = userCache.get(supabaseId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { userCache.delete(supabaseId); return null; }
  return entry.user;
}

function setCachedUser(supabaseId: string, user: User) {
  userCache.set(supabaseId, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  // Evict oldest entries if cache grows too large
  if (userCache.size > 500) {
    const oldest = userCache.keys().next().value;
    if (oldest) userCache.delete(oldest);
  }
}

export async function resolveAppUser(
  req: Request,
  res: Response
): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient(req, res);
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (supabaseUser) {
        const openId = `supabase:${supabaseUser.id}`;

        // Return cached user — skip DB entirely for hot requests
        const cached = getCachedUser(supabaseUser.id);
        if (cached) return cached;

        const name =
          (supabaseUser.user_metadata?.name as string | undefined) ??
          (supabaseUser.user_metadata?.full_name as string | undefined) ??
          null;
        const firstName =
          (supabaseUser.user_metadata?.first_name as string | undefined) ?? null;
        const lastName =
          (supabaseUser.user_metadata?.last_name as string | undefined) ?? null;
        const phoneNumber =
          (supabaseUser.user_metadata?.phone_number as string | undefined) ??
          supabaseUser.phone ??
          null;

        // upsert + read in parallel-ish: upsert first, then read back
        await upsertUser({
          openId,
          email: supabaseUser.email ?? null,
          name,
          firstName,
          lastName,
          phoneNumber,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
        });

        const user = (await getUserByOpenId(openId)) ?? null;
        if (user) setCachedUser(supabaseUser.id, user);
        return user;
      }
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        clearSupabaseAuthCookies(req, res);
      } else {
        console.warn("[Supabase] resolveAppUser failed, falling back to legacy session:", error);
      }
    }
  }

  return resolveLegacyUser(req);
}

export async function signOutSupabase(req: Request, res: Response) {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.signOut();
  } catch (error) {
    console.warn("[Supabase] signOut failed:", error);
  }
}
