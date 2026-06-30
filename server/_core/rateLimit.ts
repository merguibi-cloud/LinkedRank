import { and, eq, gte, count, lt } from "drizzle-orm";
import { getDb } from "../db";
import { rateLimitHits } from "../../drizzle/schema";

export type RateLimitBucket = "ai_generation" | "linkedin_publish";

const BUCKET_LIMITS: Record<RateLimitBucket, { limit: number; windowMs: number }> = {
  // Generous enough for a real session (batch-generating several posts),
  // tight enough to stop a runaway loop or bot — there is no other usage
  // cap right now (subscription quotas are disabled, see subscriptionLimits.ts).
  ai_generation: { limit: 15, windowMs: 10 * 60 * 1000 },
  linkedin_publish: { limit: 10, windowMs: 10 * 60 * 1000 },
};

// Opportunistic cleanup so the table doesn't grow unbounded; cheap and safe
// to run on a fraction of calls rather than on a separate cron.
const CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CLEANUP_SAMPLE_RATE = 0.02;

/**
 * Enforces a per-user sliding-window rate limit, backed by Postgres so it
 * holds across all concurrent serverless instances (an in-memory counter
 * would only throttle requests landing on the same warm instance).
 */
export async function checkRateLimit(
  userId: number,
  bucket: RateLimitBucket,
  weight = 1
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const db = await getDb();
  if (!db) return { allowed: true };

  const { limit, windowMs } = BUCKET_LIMITS[bucket];
  const windowStart = new Date(Date.now() - windowMs);

  const [row] = await db
    .select({ count: count() })
    .from(rateLimitHits)
    .where(
      and(
        eq(rateLimitHits.userId, userId),
        eq(rateLimitHits.bucket, bucket),
        gte(rateLimitHits.createdAt, windowStart)
      )
    );

  if (Number(row?.count ?? 0) + weight > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  await db.insert(rateLimitHits).values(
    Array.from({ length: weight }, () => ({ userId, bucket }))
  );

  if (Math.random() < CLEANUP_SAMPLE_RATE) {
    try {
      await db
        .delete(rateLimitHits)
        .where(lt(rateLimitHits.createdAt, new Date(Date.now() - CLEANUP_MAX_AGE_MS)));
    } catch (err) {
      console.error("[rateLimit] cleanup failed:", err);
    }
  }

  return { allowed: true };
}
