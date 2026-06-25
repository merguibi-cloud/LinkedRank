const LINKEDIN_OAUTH_FLOW_KEY = "linkedin_oauth_flow";

export function markLinkedInOAuthFlow() {
  sessionStorage.setItem(LINKEDIN_OAUTH_FLOW_KEY, "1");
}

export function clearLinkedInOAuthFlow() {
  sessionStorage.removeItem(LINKEDIN_OAUTH_FLOW_KEY);
}

export function isLinkedInOAuthFlow() {
  return sessionStorage.getItem(LINKEDIN_OAUTH_FLOW_KEY) === "1";
}
