/**
 * Stripe Webhook Handler
 * 
 * This route MUST be registered with express.raw() middleware
 * BEFORE express.json() to ensure signature verification works.
 */

import { Router, Request, Response } from "express";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Stripe Webhook Endpoint
 * Route: POST /api/stripe/webhook
 */
router.post("/", async (req: Request, res: Response) => {
  if (!stripe) {
    console.error("[Webhook] Stripe not configured");
    return res.status(503).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).json({
      error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  // Get database connection
  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Webhook] Checkout session completed:", session.id);

        // Get user ID from metadata
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id || "pro";
        const customerId = session.customer as string;

        if (userId) {
          // Update user with Stripe customer ID and subscription plan
          await db
            .update(users)
            .set({
              stripeCustomerId: customerId,
              subscriptionPlan: planId as "starter" | "pro" | "business",
              subscriptionStatus: "active",
            })
            .where(eq(users.id, parseInt(userId)));

          console.log(`[Webhook] Updated user ${userId} with plan ${planId}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const planId = subscription.metadata?.plan_id || "pro";

        console.log(`[Webhook] Subscription ${event.type}:`, subscription.id);

        // Find user by Stripe customer ID and update
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user) {
          await db
            .update(users)
            .set({
              subscriptionPlan: planId as "starter" | "pro" | "business",
              subscriptionStatus: status,
            })
            .where(eq(users.id, user.id));

          console.log(`[Webhook] Updated user ${user.id} subscription status to ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        console.log("[Webhook] Subscription deleted:", subscription.id);

        // Find user and downgrade to starter
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user) {
          await db
            .update(users)
            .set({
              subscriptionPlan: "starter",
              subscriptionStatus: "canceled",
            })
            .where(eq(users.id, user.id));

          console.log(`[Webhook] Downgraded user ${user.id} to starter plan`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("[Webhook] Invoice paid:", invoice.id);
        // Could trigger email notification or update analytics
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        console.log("[Webhook] Invoice payment failed:", invoice.id);

        // Update subscription status
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (user) {
          await db
            .update(users)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(users.id, user.id));

          console.log(`[Webhook] Updated user ${user.id} status to past_due`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process webhook",
    });
  }
});

export default router;
