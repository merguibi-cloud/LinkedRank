/**
 * Subscription Limits Service
 * Handles checking and enforcing plan limits for users
 */

import { getDb } from "../db";
import { users, userSubscriptions } from "../../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { SUBSCRIPTION_PLANS, getPlan } from "../stripe/products";

export interface UsageLimits {
  aiGenerationsPerMonth: number | null; // null = unlimited
  linkedinAccounts: number;
  teamMembers: number;
  hasAutoPublish: boolean;
  hasImageGeneration: boolean;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  hasPrioritySupport: boolean;
}

export interface UsageStats {
  aiGenerationsThisMonth: number;
  linkedinAccountsUsed: number;
  teamMembersUsed: number;
}

/**
 * Get user's current subscription plan
 */
export async function getUserPlan(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "starter";

  const [user] = await db
    .select({ subscriptionPlan: users.subscriptionPlan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.subscriptionPlan || "starter";
}

/**
 * Get limits for a specific plan
 */
export function getPlanLimits(planId: string): UsageLimits {
  const plan = getPlan(planId);
  if (!plan) {
    return SUBSCRIPTION_PLANS.starter.limits;
  }
  return plan.limits;
}

/**
 * Get user's current usage stats for the month
 */
export async function getUserUsageStats(userId: number): Promise<UsageStats> {
  const db = await getDb();
  if (!db) {
    return {
      aiGenerationsThisMonth: 0,
      linkedinAccountsUsed: 1,
      teamMembersUsed: 1,
    };
  }

  // Get the start of the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count AI generations this month from the auto_publish_queue table
  const [generationCount] = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM auto_publish_queue 
    WHERE userId = ${userId} 
    AND createdAt >= ${startOfMonth.toISOString().slice(0, 19).replace('T', ' ')}
  `);

  const aiGenerationsThisMonth = (generationCount as any)?.[0]?.count || 0;

  return {
    aiGenerationsThisMonth: Number(aiGenerationsThisMonth),
    linkedinAccountsUsed: 1, // For now, always 1
    teamMembersUsed: 1, // For now, always 1
  };
}

/**
 * Check if user can perform an action based on their plan
 */
export async function canUserPerformAction(
  userId: number,
  action: "ai_generation" | "auto_publish" | "image_generation" | "analytics" | "api_access"
): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: boolean }> {
  const planId = await getUserPlan(userId);
  const limits = getPlanLimits(planId);
  const usage = await getUserUsageStats(userId);

  switch (action) {
    case "ai_generation":
      if (limits.aiGenerationsPerMonth === null) {
        return { allowed: true };
      }
      if (usage.aiGenerationsThisMonth >= limits.aiGenerationsPerMonth) {
        return {
          allowed: false,
          reason: `Vous avez atteint votre limite de ${limits.aiGenerationsPerMonth} générations IA ce mois-ci.`,
          upgradeRequired: true,
        };
      }
      return { allowed: true };

    case "auto_publish":
      if (!limits.hasAutoPublish) {
        return {
          allowed: false,
          reason: "La publication automatique n'est pas disponible avec votre plan actuel.",
          upgradeRequired: true,
        };
      }
      return { allowed: true };

    case "image_generation":
      if (!limits.hasImageGeneration) {
        return {
          allowed: false,
          reason: "La génération d'images IA n'est pas disponible avec votre plan actuel.",
          upgradeRequired: true,
        };
      }
      return { allowed: true };

    case "analytics":
      if (!limits.hasAnalytics) {
        return {
          allowed: false,
          reason: "Les analytics avancés ne sont pas disponibles avec votre plan actuel.",
          upgradeRequired: true,
        };
      }
      return { allowed: true };

    case "api_access":
      if (!limits.hasApiAccess) {
        return {
          allowed: false,
          reason: "L'accès API n'est pas disponible avec votre plan actuel.",
          upgradeRequired: true,
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Increment usage counter for an action
 */
export async function incrementUsage(
  userId: number,
  action: "ai_generation"
): Promise<void> {
  // Usage is tracked via the auto_publish_queue table entries
  // No additional tracking needed for now
  console.log(`[SubscriptionLimits] Usage incremented for user ${userId}: ${action}`);
}

/**
 * Get remaining usage for a specific limit
 */
export async function getRemainingUsage(
  userId: number
): Promise<{
  aiGenerations: { used: number; limit: number | null; remaining: number | null };
  plan: string;
  planName: string;
}> {
  const planId = await getUserPlan(userId);
  const limits = getPlanLimits(planId);
  const usage = await getUserUsageStats(userId);
  const plan = getPlan(planId);

  const aiLimit = limits.aiGenerationsPerMonth;
  const aiUsed = usage.aiGenerationsThisMonth;

  return {
    aiGenerations: {
      used: aiUsed,
      limit: aiLimit,
      remaining: aiLimit === null ? null : Math.max(0, aiLimit - aiUsed),
    },
    plan: planId,
    planName: plan?.name || "Starter",
  };
}
