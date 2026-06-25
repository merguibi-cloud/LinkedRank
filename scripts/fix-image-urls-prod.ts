/** Corrige les URLs localhost en base → domaine production (linkedrank.fr). */
import "dotenv/config";
import { eq, like, or } from "drizzle-orm";
import { getDb, closeDb } from "../server/db.ts";
import {
  autoPublishQueue,
  generatedPosts,
  mediaLibrary,
} from "../drizzle/schema.ts";
import { buildMediaProxyUrl } from "../server/_core/publicUrl.ts";

const PROD = "https://www.linkedrank.fr";

function prodMediaUrl(imageKey: string): string {
  return buildMediaProxyUrl(imageKey).replace(/^https?:\/\/[^/]+/, PROD);
}

function needsFix(url: string | null | undefined): boolean {
  if (!url) return false;
  return /localhost|127\.0\.0\.1/i.test(url);
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DB indisponible");

  const queueRows = await db
    .select()
    .from(autoPublishQueue)
    .where(
      or(
        like(autoPublishQueue.imageUrl, "%localhost%"),
        like(autoPublishQueue.imageUrl, "%127.0.0.1%")
      )
    );
  let q = 0;
  for (const row of queueRows) {
    if (!row.imageKey) continue;
    const url = prodMediaUrl(row.imageKey);
    await db
      .update(autoPublishQueue)
      .set({ imageUrl: url })
      .where(eq(autoPublishQueue.id, row.id));
    q++;
  }

  const postRows = await db
    .select()
    .from(generatedPosts)
    .where(
      or(
        like(generatedPosts.imageUrl, "%localhost%"),
        like(generatedPosts.imageUrl, "%127.0.0.1%")
      )
    );
  let p = 0;
  for (const row of postRows) {
    if (!row.imageKey) continue;
    const url = prodMediaUrl(row.imageKey);
    await db
      .update(generatedPosts)
      .set({ imageUrl: url })
      .where(eq(generatedPosts.id, row.id));
    p++;
  }

  const mediaRows = await db
    .select()
    .from(mediaLibrary)
    .where(
      or(
        like(mediaLibrary.fileUrl, "%localhost%"),
        like(mediaLibrary.fileUrl, "%127.0.0.1%")
      )
    );
  let m = 0;
  for (const row of mediaRows) {
    if (!row.fileKey) continue;
    const url = prodMediaUrl(row.fileKey);
    if (needsFix(row.fileUrl) && !row.fileUrl.includes("blob.vercel-storage.com")) {
      await db
        .update(mediaLibrary)
        .set({ fileUrl: url })
        .where(eq(mediaLibrary.id, row.id));
      m++;
    }
  }

  console.log(
    `Queue: ${q}, Posts: ${p}, Media: ${m} URL(s) corrigée(s) → ${PROD}`
  );
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
