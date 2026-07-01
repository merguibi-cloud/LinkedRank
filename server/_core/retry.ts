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
