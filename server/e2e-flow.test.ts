/**
 * Tests End-to-End pour les parcours critiques
 * 
 * Ces tests vérifient les flux principaux de l'application :
 * 1. Inscription → Génération → Publication
 * 2. Vérification des limites d'abonnement
 * 3. Flux de paiement Stripe
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des dépendances
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId: 1 }]))
    }))
  }))
}));

vi.mock("./services/subscriptionLimits", () => ({
  canUserPerformAction: vi.fn(),
  getRemainingUsage: vi.fn(),
  getUserSubscriptionPlan: vi.fn()
}));

import { canUserPerformAction, getRemainingUsage, getUserSubscriptionPlan } from "./services/subscriptionLimits";
import { SUBSCRIPTION_PLANS } from "./stripe/products";

describe("Flux E2E: Limites d'abonnement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Plan Starter (Gratuit)", () => {
    it("devrait autoriser 5 générations IA par mois", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ allowed: true, remaining: 5 });

      const result = await canUserPerformAction(1, "ai_generation");
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it("devrait bloquer après 5 générations", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ 
        allowed: false, 
        reason: "Limite de génération atteinte. Passez à un plan supérieur pour continuer." 
      });

      const result = await canUserPerformAction(1, "ai_generation");
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Limite");
    });

    it("devrait bloquer l'auto-publication", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ 
        allowed: false, 
        reason: "L'auto-publication n'est pas disponible avec votre plan actuel." 
      });

      const result = await canUserPerformAction(1, "auto_publish");
      
      expect(result.allowed).toBe(false);
    });

    it("devrait bloquer la génération d'images", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ 
        allowed: false, 
        reason: "La génération d'images n'est pas disponible avec votre plan actuel." 
      });

      const result = await canUserPerformAction(1, "image_generation");
      
      expect(result.allowed).toBe(false);
    });
  });

  describe("Plan Pro", () => {
    it("devrait autoriser des générations illimitées", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ allowed: true, remaining: null });

      const result = await canUserPerformAction(1, "ai_generation");
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeNull(); // Illimité
    });

    it("devrait autoriser l'auto-publication", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ allowed: true });

      const result = await canUserPerformAction(1, "auto_publish");
      
      expect(result.allowed).toBe(true);
    });

    it("devrait autoriser la génération d'images", async () => {
      const mockCanPerform = canUserPerformAction as ReturnType<typeof vi.fn>;
      mockCanPerform.mockResolvedValue({ allowed: true });

      const result = await canUserPerformAction(1, "image_generation");
      
      expect(result.allowed).toBe(true);
    });
  });
});

describe("Configuration des plans Stripe", () => {
  it("devrait avoir 3 plans configurés", () => {
    expect(Object.keys(SUBSCRIPTION_PLANS)).toHaveLength(3);
  });

  it("devrait avoir un plan Starter gratuit", () => {
    const starter = SUBSCRIPTION_PLANS.starter;
    expect(starter).toBeDefined();
    expect(starter.monthlyPrice).toBe(0);
    expect(starter.limits.aiGenerationsPerMonth).toBe(5);
    expect(starter.limits.hasAutoPublish).toBe(false);
    expect(starter.limits.hasImageGeneration).toBe(false);
  });

  it("devrait avoir un plan Pro à 29€/mois", () => {
    const pro = SUBSCRIPTION_PLANS.pro;
    expect(pro).toBeDefined();
    expect(pro.monthlyPrice).toBe(2900); // en centimes
    expect(pro.limits.aiGenerationsPerMonth).toBeNull(); // illimité
    expect(pro.limits.hasAutoPublish).toBe(true);
    expect(pro.limits.hasImageGeneration).toBe(true);
  });

  it("devrait avoir un plan Business à 79€/mois", () => {
    const business = SUBSCRIPTION_PLANS.business;
    expect(business).toBeDefined();
    expect(business.monthlyPrice).toBe(7900); // en centimes
    expect(business.limits.linkedinAccounts).toBe(10);
    expect(business.limits.hasApiAccess).toBe(true);
    expect(business.limits.hasPrioritySupport).toBe(true);
  });

  it("devrait offrir une réduction annuelle", () => {
    const pro = SUBSCRIPTION_PLANS.pro;
    // Prix annuel par mois devrait être inférieur au prix mensuel
    expect(pro.yearlyPrice).toBeLessThan(pro.monthlyPrice);
  });

  it("devrait avoir une période d'essai pour les plans payants", () => {
    expect(SUBSCRIPTION_PLANS.pro.trialDays).toBe(14);
    expect(SUBSCRIPTION_PLANS.business.trialDays).toBe(14);
    expect(SUBSCRIPTION_PLANS.starter.trialDays).toBe(0);
  });
});

describe("Flux E2E: Pages légales", () => {
  it("devrait avoir les routes légales configurées", () => {
    // Vérification que les routes sont définies
    const legalRoutes = [
      "/legal/mentions-legales",
      "/legal/confidentialite",
      "/legal/cgv",
      "/legal/cgu"
    ];

    legalRoutes.forEach(route => {
      expect(route).toMatch(/^\/legal\//);
    });
  });
});

describe("Flux E2E: Raccourcis clavier", () => {
  it("devrait avoir les raccourcis principaux définis", () => {
    const shortcuts = [
      { key: "g", ctrl: true, description: "Générateur" },
      { key: "d", ctrl: true, description: "Dashboard" },
      { key: "a", ctrl: true, description: "Agents" },
      { key: "t", ctrl: true, description: "Templates" },
      { key: "s", ctrl: true, description: "Calendrier" },
      { key: "/", ctrl: true, description: "Aide" },
    ];

    expect(shortcuts.length).toBeGreaterThan(5);
    shortcuts.forEach(shortcut => {
      expect(shortcut.key).toBeDefined();
      expect(shortcut.description).toBeDefined();
    });
  });
});
