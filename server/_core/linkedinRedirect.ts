import type { Request } from "express";
import { ENV } from "./env";

/**
 * Returns the OAuth redirect URI sent to LinkedIn.
 * Must match EXACTLY a URL registered in the LinkedIn Developer Portal.
 */
export function getLinkedInRedirectUri(req?: Request): string {
  if (process.env.LINKEDIN_REDIRECT_URI) {
    return process.env.LINKEDIN_REDIRECT_URI;
  }

  if (ENV.appUrl) {
    return `${ENV.appUrl.replace(/\/$/, "")}/api/linkedin/callback`;
  }

  if (req) {
    const protocol =
      (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim() ||
      req.protocol;
    const host =
      (req.headers["x-forwarded-host"] as string) || req.get("host");
    if (host) {
      return `${protocol}://${host}/api/linkedin/callback`;
    }
  }

  return "http://localhost:3000/api/linkedin/callback";
}
