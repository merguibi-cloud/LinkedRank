export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const DEFAULT_AUTH_REDIRECT = "/dashboard";
export const ONBOARDING_PATH = "/onboarding";

export const getCurrentPathWithSearch = () =>
  `${window.location.pathname}${window.location.search}`;

export const sanitizeInternalRedirect = (
  redirect: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
) => {
  if (!redirect) return fallback;

  try {
    const decoded = decodeURIComponent(redirect).trim();
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (
      decoded.includes("\\") ||
      decoded.includes("\n") ||
      decoded.includes("\r")
    ) {
      return fallback;
    }

    return decoded;
  } catch {
    return fallback;
  }
};

export function ensureOnboardingUrl(redirect?: string | null): string {
  return sanitizeInternalRedirect(redirect, ONBOARDING_PATH);
}

/** @deprecated Utiliser ensureOnboardingUrl */
export function ensureVoiceOnboardingUrl(redirect?: string | null): string {
  return ensureOnboardingUrl(redirect);
}

export const getLoginUrl = (redirect = DEFAULT_AUTH_REDIRECT) =>
  `/login?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect))}`;

export const getSignupUrl = (redirect = ONBOARDING_PATH) =>
  `/signup?redirect=${encodeURIComponent(ensureOnboardingUrl(redirect))}`;

export const getLinkedInConnectUrl = (redirect = DEFAULT_AUTH_REDIRECT) =>
  `/linkedin/connect?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect))}`;

export const getLinkedInAuthApiUrl = (redirect = DEFAULT_AUTH_REDIRECT) =>
  `/api/linkedin/auth?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect))}`;
