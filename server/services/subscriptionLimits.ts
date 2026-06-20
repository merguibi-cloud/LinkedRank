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
  _userId: number,
  _action: "ai_generation" | "auto_publish" | "image_generation" | "analytics" | "api_access"
): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: boolean }> {
  // Abonnements désactivés — accès illimité pour tous
  return { allowed: true };
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
  const usage = await getUserUsageStats(userId);

  return {
    aiGenerations: {
      used: usage.aiGenerationsThisMonth,
      limit: null,
      remaining: null,
    },
    plan: "free",
    planName: "Gratuit",
  };
}
