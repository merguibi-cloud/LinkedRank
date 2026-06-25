import { createApiApp } from "./httpApi";

let cached: Awaited<ReturnType<typeof createApiApp>> | null = null;

export async function getExpressApp() {
  if (!cached) {
    cached = await createApiApp();
  }
  return cached;
}
