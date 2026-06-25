import { getLinkedInConnectUrl, getOnboardingRedirectUrl } from "@/const";
import { PROFILE_ONBOARDING_KEY } from "@/lib/gettingStartedJourney";
import type { trpc } from "@/lib/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

const LINKEDIN_CONNECT_PROMPTED_KEY = "linkedin-connect-prompted";

type LinkedInStatusResponse = { connected?: boolean };

/**
 * Routes a freshly authenticated user through any first-time steps —
 * profile onboarding, then connecting LinkedIn — before letting them reach
 * their intended destination. Onboarding completion is checked server-side,
 * but explicitly skipping it also sets PROFILE_ONBOARDING_KEY so a user who
 * chose not to answer the questions isn't routed back there on every future
 * login. The LinkedIn-connect prompt is a one-time nudge (localStorage):
 * we mark it shown up front so skipping it, or any failure checking status,
 * never forces it again.
 */
export async function resolvePostAuthRedirect(
  redirect: string,
  utils: TrpcUtils
): Promise<string> {
  if (localStorage.getItem(PROFILE_ONBOARDING_KEY) !== "true") {
    try {
      const status = await utils.onboarding.getStatus.fetch();
      if (!status?.completed) {
        return getOnboardingRedirectUrl(redirect);
      }
    } catch {
      // Onboarding status couldn't be checked — don't block the user on it.
    }
  }

  if (localStorage.getItem(LINKEDIN_CONNECT_PROMPTED_KEY)) {
    return redirect;
  }
  localStorage.setItem(LINKEDIN_CONNECT_PROMPTED_KEY, "1");

  try {
    const response = await fetch("/api/linkedin/status", {
      credentials: "include",
    });
    if (!response.ok) return redirect;

    const linkedinStatus: LinkedInStatusResponse = await response.json();
    if (linkedinStatus.connected) return redirect;
  } catch {
    return redirect;
  }

  return getLinkedInConnectUrl(redirect, true);
}
