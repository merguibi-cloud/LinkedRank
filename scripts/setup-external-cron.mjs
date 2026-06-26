/**
 * Configure un cron externe gratuit (compatible plan Vercel Hobby).
 * Crée un job sur cron-job.org qui appelle /api/cron/auto-publish chaque minute.
 *
 * Prérequis : CRON_SECRET dans .env et sur Vercel (pnpm vercel:env)
 * Usage : node scripts/setup-external-cron.mjs
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";

const ENV_FILE = ".env";
const SITE = process.env.APP_URL || process.env.VERCEL_PROD_URL || "https://www.linkedrank.fr";
const BASE = SITE.replace(/\/$/, "");

function getCronSecret() {
  if (existsSync(ENV_FILE)) {
    const match = readFileSync(ENV_FILE, "utf8").match(/^CRON_SECRET=(.+)$/m);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  if (existsSync(".env.vercel.tmp")) {
    const match = readFileSync(".env.vercel.tmp", "utf8").match(/^CRON_SECRET=(.+)$/m);
    if (match?.[1]?.trim()) {
      const secret = match[1].trim();
      if (existsSync(ENV_FILE)) {
        appendFileSync(ENV_FILE, `\nCRON_SECRET=${secret}\n`);
        console.log("CRON_SECRET copié depuis .env.vercel.tmp → .env\n");
      }
      return secret;
    }
  }
  console.error(
    "CRON_SECRET manquant — lancez :\n  vercel env pull .env.vercel.tmp --environment=production\n  pnpm vercel:env"
  );
  process.exit(1);
}

const secret = getCronSecret();
const headerUrl = `${BASE}/api/cron/auto-publish`;
const queryUrl = `${headerUrl}?cron_secret=${encodeURIComponent(secret)}`;

console.log(`
=== Auto-publication — cron externe (cron-job.org) ===

Votre job a été désactivé car l'authentification échouait (401).
Réactivez-le avec l'une des options ci-dessous :

── Option A (recommandée) : en-tête HTTP ──
URL : ${headerUrl}
Méthode : GET
Schedule : toutes les 1 à 5 minutes
En-tête personnalisé :
  Authorization: Bearer ${secret}

── Option B : secret dans l'URL ──
URL : ${queryUrl}
Méthode : GET
Schedule : toutes les 1 à 5 minutes
(Aucun en-tête requis)

Étapes cron-job.org :
1. Ouvrir le job "auto-publish" désactivé → Edit
2. Coller l'URL (option A ou B)
3. Si option A : Advanced → Request headers → Authorization = Bearer <secret>
4. Sauvegarder puis réactiver le job

Test manuel :
  curl -H "Authorization: Bearer ${secret}" ${headerUrl}
`);
