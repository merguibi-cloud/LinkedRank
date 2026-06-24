/**
 * Stripe Routes for Subscription Management
 */

import { Router, Request, Response } from "express";
import { stripe, isStripeConfigured } from "../stripe";
import { SUBSCRIPTION_PLANS } from "../stripe/products";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  type AuthenticatedRequest,
  requireAuth,
} from "../_core/authMiddleware";

const router = Router();

/**
 * Check Stripe configuration status
 */
router.get("/status", (req: Request, res: Response) => {
  res.json({
    configured: isStripeConfigured(),
    testMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? true,
  });
});

/**
 * Get available subscription plans
 */
router.get("/plans", (req: Request, res: Response) => {
  const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice / 100,
    yearlyPrice: plan.yearlyPrice / 100,
    trialDays: plan.trialDays,
    features: plan.features,
  }));

  res.json({ plans });
});

/**
 * Create a checkout session for subscription
 */
router.post(
  "/create-checkout-session",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const { user } = req as AuthenticatedRequest;
      const { planId, billingPeriod } = req.body;

      if (!planId || !billingPeriod) {
        return res
          .status(400)
          .json({ error: "Plan ID and billing period are required" });
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }

      if (plan.monthlyPrice === 0) {
        return res
          .status(400)
          .json({ error: "Cannot create checkout for free plan" });
      }

      const origin = req.headers.origin || "http://localhost:3000";

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: user.stripeCustomerId ?? undefined,
        customer_email: user.stripeCustomerId
          ? undefined
          : (user.email ?? undefined),
        client_reference_id: user.id.toString(),
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `LinkedRank ${plan.name}`,
                description: plan.description,
              },
              unit_amount:
                billingPeriod === "yearly"
                  ? plan.yearlyPrice
                  : plan.monthlyPrice,
              recurring: {
                interval: billingPeriod === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
          metadata: {
            plan_id: planId,
            billing_period: billingPeriod,
            user_id: user.id.toString(),
          },
        },
        metadata: {
          user_id: user.id.toString(),
          customer_email: user.email || "",
          customer_name: user.name || "",
          plan_id: planId,
          billing_period: billingPeriod,
        },
        success_url: `${origin}/dashboard?subscription=success&plan=${planId}`,
        cancel_url: `${origin}/pricing?subscription=cancelled`,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("[Stripe] Checkout session error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      });
    }
  }
);

/**
 * Create a customer portal session for managing subscription
 */
router.post(
  "/create-portal-session",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const { user } = req as AuthenticatedRequest;

      if (!user.stripeCustomerId) {
        return res
          .status(400)
          .json({ error: "No Stripe customer found for this account" });
      }

      const origin = req.headers.origin || "http://localhost:3000";

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${origin}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("[Stripe] Portal session error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create portal session",
      });
    }
  }
);

/**
 * Get user's current subscription status
 */
router.get(
  "/subscription",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      // Get user from database
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }
      const { userId } = req as AuthenticatedRequest;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If user has no Stripe customer ID, they're on free plan
      if (!user.stripeCustomerId) {
        return res.json({
          plan: "starter",
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      }

      // Get subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return res.json({
          plan: "starter",
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      }

      const subscription = subscriptions.data[0];
      const planId = subscription.metadata?.plan_id || "pro";

      res.json({
        plan: planId,
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end
          ? new Date(
              (subscription as any).current_period_end * 1000
            ).toISOString()
          : null,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        subscriptionId: subscription.id,
      });
    } catch (error) {
      console.error("[Stripe] Subscription status error:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get subscription status",
      });
    }
  }
);

export default router;
