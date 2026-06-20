import type { Request } from "express";
import { ENV } from "./env";

export function getOAuthRedirectUri(req?: Request): string {
  if (ENV.appUrl) {
    return `${ENV.appUrl.replace(/\/$/, "")}/api/oauth/callback`;
  }

  if (req) {
    const protocol =
      (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim() ||
      req.protocol;
    const host =
      (req.headers["x-forwarded-host"] as string) || req.get("host");
    if (host) {
      return `${protocol}://${host}/api/oauth/callback`;
    }
  }

  return "http://localhost:3000/api/oauth/callback";
}
