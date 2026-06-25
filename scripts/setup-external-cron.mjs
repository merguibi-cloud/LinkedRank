/**
 * Configure un cron externe gratuit (compatible plan Vercel Hobby).
 * Crée un job sur cron-job.org qui appelle /api/cron/auto-publish chaque minute.
 *
 * Prérequis : CRON_SECRET dans .env et sur Vercel (pnpm vercel:env)
 * Usage : node scripts/setup-external-cron.mjs
 */
import { readFileSync, existsSync } from "node:fs";

const ENV_FILE = ".env";
const SITE = process.env.APP_URL || process.env.VERCEL_PROD_URL || "https://linkedrank-pi.vercel.app";
const CRON_URL = `${SITE.replace(/\/$/, "")}/api/cron/auto-publish`;

function getCronSecret() {
  if (!existsSync(ENV_FILE)) {
    console.error(".env introuvable");
    process.exit(1);
  }
  const match = readFileSync(ENV_FILE, "utf8").match(/^CRON_SECRET=(.+)$/m);
  if (!match?.[1]) {
    console.error("CRON_SECRET manquant — lancez pnpm vercel:env d'abord");
    process.exit(1);
  }
  return match[1].trim();
}

const secret = getCronSecret();

console.log(`
=== Auto-publication — cron externe (plan Vercel Hobby) ===

Le plan Hobby Vercel n'autorise qu'1 cron/jour. Pour publier à l'heure prévue,
configurez un cron GRATUIT sur https://console.cron-job.org :

1. Créer un compte gratuit
2. Create cronjob → URL :
   ${CRON_URL}

3. Schedule : Every 1 minute (ou Every 5 minutes minimum recommandé)

4. Request method : GET

5. Headers (Advanced) :
   Authorization: Bearer ${secret.slice(0, 8)}…${secret.slice(-4)}
   (valeur complète dans votre .env → CRON_SECRET)

6. Activer le job

Alternative : passer au plan Vercel Pro et ajouter dans vercel.json :
  "crons": [{ "path": "/api/cron/auto-publish", "schedule": "* * * * *" }]

Test manuel :
  curl -H "Authorization: Bearer <CRON_SECRET>" ${CRON_URL}
`);
