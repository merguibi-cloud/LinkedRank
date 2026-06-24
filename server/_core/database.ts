import postgres, { type Options } from "postgres";

/** Options requises pour Supabase PgBouncer (pooler transaction, port 6543). */
export const POSTGRES_POOL_OPTIONS: Options<Record<string, never>> = {
  prepare: false,
  max: process.env.NODE_ENV === "production" ? 5 : 3,
  idle_timeout: 20,
  connect_timeout: 15,
  max_lifetime: 60 * 30,
};

/** Options pour scripts CLI ponctuels (une seule connexion, fermeture explicite). */
export const POSTGRES_SCRIPT_OPTIONS: Options<Record<string, never>> = {
  prepare: false,
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
};

export function getDatabaseUrl(options?: { direct?: boolean }): string {
  if (options?.direct) {
    return (
      process.env.DATABASE_DIRECT_URL ??
      process.env.DATABASE_URL ??
      ""
    );
  }
  return process.env.DATABASE_URL ?? "";
}

export function createPostgresClient(
  url?: string,
  overrides?: Partial<Options<Record<string, never>>>
) {
  const connectionString = url ?? getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }

  return postgres(connectionString, {
    ...POSTGRES_POOL_OPTIONS,
    ...overrides,
  });
}

export function createScriptPostgresClient(url?: string) {
  const connectionString =
    url ?? getDatabaseUrl({ direct: true }) ?? getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }

  return postgres(connectionString, POSTGRES_SCRIPT_OPTIONS);
}
