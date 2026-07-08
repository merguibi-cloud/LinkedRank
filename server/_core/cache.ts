interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCache(...keys: string[]): void {
  for (const k of keys) store.delete(k);
}
