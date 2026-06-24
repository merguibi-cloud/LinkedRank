export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const DEFAULT_AUTH_REDIRECT = "/dashboard";

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

export const getLoginUrl = (redirect = "/dashboard") =>
  `/login?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect))}`;

export const getSignupUrl = (redirect = "/onboarding?new=1") =>
  `/signup?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect, "/onboarding?new=1"))}`;

export const getLinkedInConnectUrl = (redirect = "/dashboard") =>
  `/api/linkedin/auth?redirect=${encodeURIComponent(sanitizeInternalRedirect(redirect))}`;
