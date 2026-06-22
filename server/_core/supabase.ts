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

async function resolveLegacyUser(req: Request): Promise<User | null> {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

export async function resolveAppUser(
  req: Request,
  res: Response
): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient(req, res);
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        const openId = `supabase:${supabaseUser.id}`;
        const name =
          (supabaseUser.user_metadata?.name as string | undefined) ??
          (supabaseUser.user_metadata?.full_name as string | undefined) ??
          null;

        await upsertUser({
          openId,
          email: supabaseUser.email ?? null,
          name,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
        });

        return (await getUserByOpenId(openId)) ?? null;
      }
    } catch (error) {
      console.warn("[Supabase] resolveAppUser failed, falling back to legacy session:", error);
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
