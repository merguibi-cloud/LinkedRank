/**
 * Pousse les variables de .env vers Vercel (production, preview, development).
 * Usage: node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const ENV_FILE = ".env";
const TARGETS = ["production", "preview", "development"];

function parseEnvFile(content) {
  const vars = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) vars.set(key, value);
  }
  return vars;
}

function runVercel(args, input) {
  const result = spawnSync("vercel", args, {
    input,
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  return result;
}

function envExists(key, target) {
  const result = runVercel(["env", "ls", target], undefined);
  return result.stdout?.includes(key) ?? false;
}

function removeEnv(key, target) {
  runVercel(["env", "rm", key, target, "--yes"], undefined);
}

function addEnv(key, value, target) {
  const result = runVercel(["env", "add", key, target, "--force"], value);
  if (result.status !== 0) {
    console.error(`  ✗ ${key} (${target}): ${result.stderr?.trim() || "échec"}`);
    return false;
  }
  console.log(`  ✓ ${key} (${target})`);
  return true;
}

if (!existsSync(ENV_FILE)) {
  console.error(`Fichier ${ENV_FILE} introuvable.`);
  process.exit(1);
}

const vars = parseEnvFile(readFileSync(ENV_FILE, "utf8"));

if (!vars.has("CRON_SECRET") || !vars.get("CRON_SECRET")) {
  const secret = randomBytes(32).toString("hex");
  vars.set("CRON_SECRET", secret);
  appendFileSync(ENV_FILE, `\nCRON_SECRET=${secret}\n`);
  console.log("CRON_SECRET généré et ajouté à .env");
}

if (!vars.get("APP_URL")) {
  vars.set("APP_URL", "https://linkedrank.vercel.app");
}
if (!vars.get("VITE_APP_URL")) {
  vars.set("VITE_APP_URL", "https://linkedrank.vercel.app");
}
if (!vars.get("LINKEDIN_REDIRECT_URI")) {
  vars.set(
    "LINKEDIN_REDIRECT_URI",
    "https://linkedrank.vercel.app/api/linkedin/callback"
  );
}

console.log(`Synchronisation de ${vars.size} variables vers Vercel...\n`);

let ok = 0;
let fail = 0;

for (const target of TARGETS) {
  console.log(`\n— ${target} —`);
  for (const [key, value] of vars) {
    if (!value) {
      console.log(`  ⊘ ${key} (vide, ignoré)`);
      continue;
    }
    if (envExists(key, target)) {
      removeEnv(key, target);
    }
    if (addEnv(key, value, target)) ok++;
    else fail++;
  }
}

console.log(`\nTerminé : ${ok} ok, ${fail} échecs.`);
if (fail > 0) process.exit(1);
