export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    attempts = 3,
    baseDelayMs = 1000,
    shouldRetry = (_err: unknown): boolean => true,
  }: {
    attempts?: number;
    baseDelayMs?: number;
    shouldRetry?: (err: unknown) => boolean;
  } = {}
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1 || !shouldRetry(err)) throw err;
      await new Promise<void>(r => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw new Error("unreachable");
}

export function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|fetch failed|ECONNREFUSED/i.test(err.message);
}

// ---------------------------------------------------------------------------
// Circuit breaker — per-instance in-memory (Vercel serverless: each warm
// instance tracks its own state; at scale all instances trip within seconds).
// ---------------------------------------------------------------------------

type BreakerState = "closed" | "open" | "half_open";

interface Breaker {
  state: BreakerState;
  failures: number;
  lastFailureAt: number;
  openedAt: number;
}

const breakers = new Map<string, Breaker>();

function getBreaker(key: string): Breaker {
  let b = breakers.get(key);
  if (!b) {
    b = { state: "closed", failures: 0, lastFailureAt: 0, openedAt: 0 };
    breakers.set(key, b);
  }
  return b;
}

export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  {
    failureThreshold = 5,
    cooldownMs = 30_000,
    windowMs = 60_000,
  }: { failureThreshold?: number; cooldownMs?: number; windowMs?: number } = {}
): Promise<T> {
  const b = getBreaker(key);
  const now = Date.now();

  if (b.state === "open") {
    if (now - b.openedAt < cooldownMs) {
      throw new Error(
        `Service temporairement indisponible. Réessayez dans ${Math.ceil((cooldownMs - (now - b.openedAt)) / 1000)}s.`
      );
    }
    b.state = "half_open";
  }

  // Reset stale failure count outside the tracking window
  if (b.state === "closed" && b.failures > 0 && now - b.lastFailureAt > windowMs) {
    b.failures = 0;
  }

  try {
    const result = await fn();
    if (b.state === "half_open") {
      b.state = "closed";
      b.failures = 0;
      console.info(`[circuit] "${key}" closed — provider recovered`);
    }
    return result;
  } catch (err) {
    b.failures += 1;
    b.lastFailureAt = now;
    if (b.state === "half_open" || b.failures >= failureThreshold) {
      b.state = "open";
      b.openedAt = now;
      console.error(`[circuit] "${key}" opened after ${b.failures} failure(s)`);
    }
    throw err;
  }
}
