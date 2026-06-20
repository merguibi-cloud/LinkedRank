import type { NextFunction, Request, Response } from "express";
import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase";

/**
 * Rafraîchit la session Supabase sur chaque requête (équivalent du middleware Next.js).
 */
export async function supabaseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!isSupabaseConfigured()) {
    return next();
  }

  try {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.getUser();
  } catch (error) {
    console.warn("[Supabase] Session refresh failed:", error);
  }

  next();
}
