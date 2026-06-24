export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const VOICE_ONBOARDING_PATH = "/onboarding?new=1";

/** Garantit le paramètre `new=1` pour lancer l'agent vocal après inscription. */
export function ensureVoiceOnboardingUrl(redirect?: string | null): string {
  const target = redirect?.trim() || VOICE_ONBOARDING_PATH;

  if (typeof window === "undefined") {
    return target.includes("/onboarding") ? VOICE_ONBOARDING_PATH : target;
  }

  const url = new URL(target, window.location.origin);
  if (url.pathname === "/onboarding") {
    url.searchParams.set("new", "1");
  }
  return `${url.pathname}${url.search}`;
}

export const getLoginUrl = (redirect = "/dashboard") =>
  `/login?redirect=${encodeURIComponent(redirect)}`;

export const getSignupUrl = (redirect = VOICE_ONBOARDING_PATH) =>
  `/signup?redirect=${encodeURIComponent(ensureVoiceOnboardingUrl(redirect))}`;

export const getLinkedInConnectUrl = (redirect = "/dashboard") =>
  `/linkedin/connect?redirect=${encodeURIComponent(redirect)}`;

export const getLinkedInAuthApiUrl = (redirect = "/dashboard") =>
  `/api/linkedin/auth?redirect=${encodeURIComponent(redirect)}`;
