import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { resolveAppUser } from "./supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const CONTEXT_TIMEOUT_MS = 10_000;

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await Promise.race([
      resolveAppUser(opts.req, opts.res),
      // Throw on timeout so tRPC returns 500 → client retries instead of
      // treating null as "logged out". Supabase auth errors (invalid token,
      // etc.) are caught below and mapped to user=null (genuinely signed out).
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error("CONTEXT_TIMEOUT"), { isContextTimeout: true })),
          CONTEXT_TIMEOUT_MS
        )
      ),
    ]);
  } catch (err: unknown) {
    if ((err as { isContextTimeout?: boolean }).isContextTimeout) throw err;
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
