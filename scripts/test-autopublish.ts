/**
 * Test bout-en-bout de l'auto-publication.
 *
 * Usage:
 *   pnpm exec tsx scripts/test-autopublish.ts              # diagnostic seulement
 *   pnpm exec tsx scripts/test-autopublish.ts --run        # insère un post test + déclenche le cron prod
 *   pnpm exec tsx scripts/test-autopublish.ts --run --local # déclenche le worker en local
 */
import "dotenv/config";
import { getDb, closeDb, getLinkedinSettings } from "../server/db.ts";
import {
  autoPublishSettings,
  autoPublishQueue,
  users,
} from "../drizzle/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import { runAutoPublishTick } from "../server/workers/autoPublishWorker.ts";
import { resolveStorageAssetUrl } from "../server/_core/publicUrl.ts";

const args = new Set(process.argv.slice(2));
const doRun = args.has("--run");
const useLocal = args.has("--local");
const userIdArg = process.argv.find((a) => a.startsWith("--user-id="));
const forcedUserId = userIdArg
  ? Number(userIdArg.split("=")[1])
  : null;
const prodUrl = (process.env.APP_URL || "https://www.linkedrank.fr").replace(
  /\/$/,
  ""
);

async function getCronSecret(): Promise<string> {
  const fromEnv = process.env.CRON_SECRET?.trim();
  if (fromEnv) return fromEnv;
  throw new Error("CRON_SECRET manquant dans .env");
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DB indisponible");

  const enabled = await db
    .select()
    .from(autoPublishSettings)
    .where(eq(autoPublishSettings.isEnabled, true));

  if (enabled.length === 0) {
    console.log("❌ Aucun utilisateur avec auto-publication activée.");
    await closeDb();
    process.exit(1);
  }

  console.log("=== Utilisateurs auto-publication ===\n");

  let testUserId: number | null = null;

  for (const s of enabled) {
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, s.userId))
      .limit(1);

    const linkedin = await getLinkedinSettings(s.userId);
    const hasToken = Boolean(linkedin?.accessToken);

    const [nextPending] = await db
      .select({
        id: autoPublishQueue.id,
        scheduledFor: autoPublishQueue.scheduledFor,
        status: autoPublishQueue.status,
      })
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.userId, s.userId),
          eq(autoPublishQueue.status, "pending")
        )
      )
      .orderBy(autoPublishQueue.scheduledFor)
      .limit(1);

    const [lastResult] = await db
      .select({
        id: autoPublishQueue.id,
        status: autoPublishQueue.status,
        scheduledFor: autoPublishQueue.scheduledFor,
        publishedAt: autoPublishQueue.publishedAt,
        errorMessage: autoPublishQueue.errorMessage,
      })
      .from(autoPublishQueue)
      .where(eq(autoPublishQueue.userId, s.userId))
      .orderBy(desc(autoPublishQueue.id))
      .limit(1);

    console.log({
      userId: user?.id,
      email: user?.email,
      name: user?.name,
      linkedinConnecte: hasToken,
      prochainPost: nextPending ?? null,
      dernierResultat: lastResult ?? null,
    });

    if (hasToken && testUserId === null) {
      testUserId = forcedUserId ?? s.userId;
    }
  }

  if (forcedUserId) {
    const li = await getLinkedinSettings(forcedUserId);
    if (!li?.accessToken) {
      console.log(`\n❌ User ${forcedUserId} sans token LinkedIn.`);
      await closeDb();
      process.exit(1);
    }
    testUserId = forcedUserId;
  }

  if (!doRun) {
    console.log(
      "\n💡 Pour lancer un test réel : pnpm exec tsx scripts/test-autopublish.ts --run"
    );
    await closeDb();
    return;
  }

  if (!testUserId) {
    console.log(
      "\n❌ Impossible de tester : aucun compte avec LinkedIn connecté."
    );
    await closeDb();
    process.exit(1);
  }

  const scheduledFor = new Date(Date.now() - 30_000);
  const testContent = `[TEST LinkedRank] Publication automatique — ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}. Ce post de test peut être supprimé.`;

  const [inserted] = await db
    .insert(autoPublishQueue)
    .values({
      userId: testUserId,
      content: testContent,
      scheduledFor,
      status: "pending",
      generatedFrom: JSON.stringify({ type: "manual", test: true }),
    })
    .returning({ id: autoPublishQueue.id });

  console.log(`\n✅ Post test #${inserted.id} inséré (échéance: maintenant)`);

  if (useLocal) {
    console.log("⏳ Exécution du worker en local...");
    await runAutoPublishTick();
  } else {
    const secret = await getCronSecret();
    console.log(`⏳ Appel cron prod: ${prodUrl}/api/cron/auto-publish`);
    const res = await fetch(`${prodUrl}/api/cron/auto-publish`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    console.log(`Cron → HTTP ${res.status}: ${body}`);
    if (!res.ok) {
      await closeDb();
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }

  const [result] = await db
    .select({
      id: autoPublishQueue.id,
      status: autoPublishQueue.status,
      publishedAt: autoPublishQueue.publishedAt,
      errorMessage: autoPublishQueue.errorMessage,
      imageUrl: autoPublishQueue.imageUrl,
      imageKey: autoPublishQueue.imageKey,
    })
    .from(autoPublishQueue)
    .where(eq(autoPublishQueue.id, inserted.id));

  const resolvedImage = resolveStorageAssetUrl(
    result.imageUrl,
    result.imageKey
  );

  console.log("\n=== Résultat du test ===");
  console.log({
    queueId: result.id,
    status: result.status,
    publishedAt: result.publishedAt,
    errorMessage: result.errorMessage,
    imageUrl: resolvedImage,
  });

  if (result.status === "published") {
    console.log("\n✅ SUCCÈS — Vérifiez votre profil LinkedIn.");
  } else if (result.status === "publishing") {
    console.log(
      "\n⏳ En cours (publishing) — relancez dans 1 min ou vérifiez les logs Vercel."
    );
  } else {
    console.log(
      "\n❌ ÉCHEC — Vérifiez la connexion LinkedIn et les logs Vercel."
    );
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
