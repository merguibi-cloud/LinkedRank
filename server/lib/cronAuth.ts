/**
 * Vérifie l'authentification des jobs cron (Vercel Cron, cron-job.org, etc.).
 * Méthodes acceptées :
 * - Authorization: Bearer <CRON_SECRET>
 * - X-Cron-Secret: <CRON_SECRET>
 * - ?cron_secret=<CRON_SECRET> (pratique pour cron-job.org)
 */
export type CronAuthInput = {
  authorizationHeader?: string | null;
  cronSecretHeader?: string | null;
  querySecret?: string | null;
};

function normalizeSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export function isAuthorizedCronRequest(input: CronAuthInput | string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn(
      "[Cron] CRON_SECRET non défini — les jobs cron sont refusés en production"
    );
    return process.env.NODE_ENV !== "production";
  }

  const payload: CronAuthInput =
    typeof input === "string"
      ? { authorizationHeader: input }
      : (input ?? {});

  const candidates = [
    normalizeSecret(payload.authorizationHeader),
    normalizeSecret(payload.cronSecretHeader),
    normalizeSecret(payload.querySecret),
  ].filter(Boolean);

  return candidates.some((candidate) => candidate === secret);
}

export function extractCronAuthFromRequest(req: {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
}): CronAuthInput {
  const headers = req.headers ?? {};
  const authHeader = headers.authorization ?? headers.Authorization;
  const cronHeader = headers["x-cron-secret"] ?? headers["X-Cron-Secret"];

  const query = req.query ?? {};
  const querySecret =
    typeof query.cron_secret === "string"
      ? query.cron_secret
      : typeof query.secret === "string"
        ? query.secret
        : null;

  return {
    authorizationHeader: Array.isArray(authHeader) ? authHeader[0] : authHeader,
    cronSecretHeader: Array.isArray(cronHeader) ? cronHeader[0] : cronHeader,
    querySecret,
  };
}
