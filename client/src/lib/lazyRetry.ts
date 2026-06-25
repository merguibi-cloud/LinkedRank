import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RETRY_KEY = "vite-lazy-retry";

/**
 * Lazy import with one automatic reload if Vite HMR left a stale module (dev).
 */
export function lazyRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      const alreadyRetried = sessionStorage.getItem(RETRY_KEY) === "1";
      if (!alreadyRetried) {
        sessionStorage.setItem(RETRY_KEY, "1");
        window.location.reload();
        return new Promise(() => {
          /* reload in progress */
        });
      }
      sessionStorage.removeItem(RETRY_KEY);
      throw error;
    }
  });
}
