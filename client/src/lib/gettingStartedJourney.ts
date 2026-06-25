export type JourneyStepId =
  | "account"
  | "profile"
  | "linkedin"
  | "get-started";

export type JourneyStep = {
  id: JourneyStepId;
  number: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  secondaryAction?: { href: string; cta: string };
};

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "account",
    number: 1,
    title: "Créer votre compte",
    description: "Inscription gratuite, sans carte bancaire.",
    href: "/signup",
    cta: "Créer un compte",
  },
  {
    id: "profile",
    number: 2,
    title: "Décrire votre activité",
    description: "Quelques clics — l'IA analyse et personnalise votre contenu.",
    href: "/onboarding",
    cta: "Configurer mon profil",
  },
  {
    id: "linkedin",
    number: 3,
    title: "Connecter LinkedIn",
    description: "Liez votre compte pour publier directement.",
    href: "/linkedin/connect?redirect=/dashboard",
    cta: "Connecter LinkedIn",
  },
  {
    id: "get-started",
    number: 4,
    title: "Lancez-vous",
    description: "Créez un post maintenant ou automatisez vos publications.",
    href: "/generate?guided=1",
    cta: "Créer un post",
    secondaryAction: {
      href: "/auto-publish?guided=1",
      cta: "Automatiser",
    },
  },
];

export const JOURNEY_DISMISSED_KEY = "linkedagents_journey_dismissed";
export const PROFILE_ONBOARDING_KEY = "linkedrank_profile_onboarding_completed";

export function isGuidedMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("guided") === "1";
}

export function journeyStepForPath(pathname: string): JourneyStepId | null {
  if (pathname.startsWith("/generate")) return "get-started";
  if (pathname.startsWith("/auto-publish")) return "get-started";
  if (pathname.startsWith("/onboarding")) return "profile";
  if (pathname.startsWith("/linkedin")) return "linkedin";
  return null;
}
