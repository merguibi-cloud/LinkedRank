import type { NextFunction, Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { resolveAppUser } from "./supabase";

export type AuthenticatedRequest = Request & {
  userId: number;
  user: User;
};

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await resolveAppUser(req, res);
    if (!user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}
