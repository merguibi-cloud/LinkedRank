export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = (redirect = "/dashboard") =>
  `/login?redirect=${encodeURIComponent(redirect)}`;

export const getSignupUrl = (redirect = "/onboarding?new=1") =>
  `/signup?redirect=${encodeURIComponent(redirect)}`;

export const getLinkedInConnectUrl = (redirect = "/dashboard") =>
  `/api/linkedin/auth?redirect=${encodeURIComponent(redirect)}`;
