/** Routes où la barre de navigation mobile basse est masquée (layout sidebar ou écrans auth). */
const MOBILE_NAV_HIDDEN_PATHS = ["/onboarding", "/login", "/signup"] as const;

/** Routes utilisant DashboardLayout (sidebar) — pas de double navigation. */
const DASHBOARD_LAYOUT_PATHS = [
  "/mes-outils",
  "/agents-dashboard",
  "/challenges",
  "/calendar",
  "/voice",
  "/rewards",
  "/linkedin-settings",
  "/gamification",
  "/missions",
  "/engagement",
  "/analytics",
  "/focus",
  "/coaching",
  "/marketing",
  "/templates",
  "/referral",
  "/meet-the-agents",
  "/carousels",
  "/collaboration",
  "/settings",
  "/ab-testing",
  "/notifications",
  "/media-library",
] as const;

function matchesPath(pathname: string, base: string): boolean {
  if (pathname === base) return true;
  if (base !== "/" && pathname.startsWith(`${base}/`)) return true;
  return false;
}

export function shouldShowMobileNav(pathname: string): boolean {
  if (MOBILE_NAV_HIDDEN_PATHS.some((p) => matchesPath(pathname, p))) {
    return false;
  }
  const sorted = [...DASHBOARD_LAYOUT_PATHS].sort((a, b) => b.length - a.length);
  if (sorted.some((p) => matchesPath(pathname, p))) {
    return false;
  }
  return true;
}
