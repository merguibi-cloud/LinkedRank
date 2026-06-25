/**
 * Vérifie l'en-tête Authorization envoyé par Vercel Cron (Bearer CRON_SECRET)
 * ou par un service externe configuré avec le même secret.
 */
export function isAuthorizedCronRequest(
  authorizationHeader: string | undefined
): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn(
      "[Cron] CRON_SECRET non défini — les jobs cron sont refusés en production"
    );
    return process.env.NODE_ENV !== "production";
  }
  return authorizationHeader === `Bearer ${secret}`;
}
