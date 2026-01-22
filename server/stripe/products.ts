/**
 * Stripe Products and Pricing Configuration
 * 
 * This file defines all subscription plans and their features.
 * Products and prices are created in Stripe Dashboard or via API.
 */

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents per month (billed annually)
  trialDays: number;
  features: PlanFeature[];
  limits: {
    aiGenerationsPerMonth: number | null; // null = unlimited
    linkedinAccounts: number;
    teamMembers: number;
    hasAutoPublish: boolean;
    hasImageGeneration: boolean;
    hasAnalytics: boolean;
    hasApiAccess: boolean;
    hasWhiteLabel: boolean;
    hasPrioritySupport: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Parfait pour découvrir la plateforme",
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialDays: 0,
    features: [
      { text: "Accès aux classements France", included: true },
      { text: "5 générations IA par mois", included: true },
      { text: "Aperçu des top créateurs", included: true },
      { text: "Guides et ressources basiques", included: true },
      { text: "Publication LinkedIn manuelle", included: true },
      { text: "Classement mondial complet", included: false },
      { text: "Publication automatique", included: false },
      { text: "Génération d'images IA", included: false },
      { text: "Analytics avancés", included: false },
      { text: "Support prioritaire", included: false },
    ],
    limits: {
      aiGenerationsPerMonth: 5,
      linkedinAccounts: 1,
      teamMembers: 1,
      hasAutoPublish: false,
      hasImageGeneration: false,
      hasAnalytics: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
      hasPrioritySupport: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Pour les créateurs sérieux",
    monthlyPrice: 2900, // 29€
    yearlyPrice: 1900, // 19€/month billed annually
    trialDays: 14,
    features: [
      { text: "Tout du plan Starter", included: true },
      { text: "Générations IA illimitées", included: true, highlight: true },
      { text: "Classement mondial complet", included: true },
      { text: "Publication automatique", included: true, highlight: true },
      { text: "Génération d'images IA", included: true, highlight: true },
      { text: "Planification des posts", included: true },
      { text: "Analytics de performance", included: true },
      { text: "Export des données", included: true },
      { text: "Support par email", included: true },
      { text: "API Access", included: false },
    ],
    limits: {
      aiGenerationsPerMonth: null, // unlimited
      linkedinAccounts: 1,
      teamMembers: 1,
      hasAutoPublish: true,
      hasImageGeneration: true,
      hasAnalytics: true,
      hasApiAccess: false,
      hasWhiteLabel: false,
      hasPrioritySupport: false,
    },
  },
  business: {
    id: "business",
    name: "Business",
    description: "Pour les équipes et agences",
    monthlyPrice: 7900, // 79€
    yearlyPrice: 5900, // 59€/month billed annually
    trialDays: 14,
    features: [
      { text: "Tout du plan Pro", included: true },
      { text: "Jusqu'à 10 comptes LinkedIn", included: true, highlight: true },
      { text: "Gestion d'équipe", included: true, highlight: true },
      { text: "API Access complet", included: true },
      { text: "Webhooks personnalisés", included: true },
      { text: "Analytics multi-comptes", included: true },
      { text: "White-label disponible", included: true },
      { text: "Onboarding personnalisé", included: true },
      { text: "Support prioritaire 24/7", included: true, highlight: true },
      { text: "Account manager dédié", included: true },
    ],
    limits: {
      aiGenerationsPerMonth: null, // unlimited
      linkedinAccounts: 10,
      teamMembers: 10,
      hasAutoPublish: true,
      hasImageGeneration: true,
      hasAnalytics: true,
      hasApiAccess: true,
      hasWhiteLabel: true,
      hasPrioritySupport: true,
    },
  },
};

/**
 * Get plan by ID
 */
export function getPlan(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS[planId];
}

/**
 * Get all plans as array
 */
export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Check if a feature is available for a plan
 */
export function hasFeature(planId: string, feature: keyof SubscriptionPlan["limits"]): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  
  const value = plan.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return value !== null;
}

/**
 * Get the price in cents for a billing period
 */
export function getPriceInCents(planId: string, billingPeriod: "monthly" | "yearly"): number {
  const plan = getPlan(planId);
  if (!plan) return 0;
  
  if (billingPeriod === "yearly") {
    return plan.yearlyPrice * 12; // Total annual price
  }
  return plan.monthlyPrice;
}
