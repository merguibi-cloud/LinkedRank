/**
 * Répare les médias : upload cloud + régénération des images manquantes.
 * Usage: pnpm exec tsx scripts/repair-media.ts [--upload] [--regenerate]
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.vercel.tmp", override: false });
import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { eq, isNull, or, like, and } from "drizzle-orm";
import { getDb, closeDb } from "../server/db.ts";
import {
  autoPublishQueue,
  autoPublishSettings,
  generatedPosts,
  mediaLibrary,
} from "../drizzle/schema.ts";
import { buildMediaProxyUrl, resolveStorageAssetUrl } from "../server/_core/publicUrl.ts";
import { generatePostImage } from "../server/services/postImageService.ts";
import { uploadToSupabaseStorage } from "../server/lib/supabaseStorage.ts";

const args = new Set(process.argv.slice(2));
const doUpload = args.has("--upload") || args.size === 0;
const doRegenerate = args.has("--regenerate") || args.size === 0;

async function uploadBuffer(
  fileKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const { url } = await put(fileKey, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
      token: blobToken,
    });
    return url;
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
    return uploadToSupabaseStorage(fileKey, buffer, mimeType);
  }
  throw new Error(
    "BLOB_READ_WRITE_TOKEN ou SUPABASE_SERVICE_ROLE_KEY requis pour l'upload cloud"
  );
}

async function repairMediaLibrary(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB indisponible");

  const rows = await db
    .select()
    .from(mediaLibrary)
    .where(like(mediaLibrary.fileUrl, "%localhost%"));

  let fixed = 0;
  for (const row of rows) {
    const localPath = path.resolve(process.cwd(), "uploads", row.fileKey);
    if (!fs.existsSync(localPath)) {
      console.log(`[skip] fichier local absent: ${row.fileKey}`);
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const mime = row.mimeType || "image/png";
    const cloudUrl = await uploadBuffer(row.fileKey, buffer, mime);
    const proxyUrl = buildMediaProxyUrl(row.fileKey);

    await db
      .update(mediaLibrary)
      .set({ fileUrl: cloudUrl })
      .where(eq(mediaLibrary.id, row.id));

    await db
      .update(generatedPosts)
      .set({ imageUrl: proxyUrl, imageKey: row.fileKey })
      .where(eq(generatedPosts.mediaLibraryId, row.id));

    await db
      .update(autoPublishQueue)
      .set({ imageUrl: proxyUrl, imageKey: row.fileKey, mediaLibraryId: row.id })
      .where(eq(autoPublishQueue.mediaLibraryId, row.id));

    console.log(`[upload] media #${row.id} → ${cloudUrl.slice(0, 60)}…`);
    fixed++;
  }
  return fixed;
}

async function regenerateMissingQueueImages(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB indisponible");

  const pending = await db
    .select()
    .from(autoPublishQueue)
    .where(
      and(
        eq(autoPublishQueue.status, "pending"),
        or(isNull(autoPublishQueue.imageUrl), like(autoPublishQueue.imageUrl, "%localhost%"))
      )
    );

  let fixed = 0;
  for (const item of pending) {
    if (item.imageUrl && !item.imageUrl.includes("localhost")) continue;

    const existing = resolveStorageAssetUrl(item.imageUrl, item.imageKey);
    if (existing && item.imageKey) {
      await db
        .update(autoPublishQueue)
        .set({ imageUrl: existing })
        .where(eq(autoPublishQueue.id, item.id));
      console.log(`[proxy] queue #${item.id} URL corrigée`);
      fixed++;
      continue;
    }

    const [settings] = await db
      .select()
      .from(autoPublishSettings)
      .where(eq(autoPublishSettings.userId, item.userId))
      .limit(1);

    if (!settings) {
      console.log(`[skip] queue #${item.id} — pas de settings`);
      continue;
    }

    try {
      console.log(`[gen] queue #${item.id} — génération image…`);
      const result = await generatePostImage(item.userId, {
        content: item.content,
        title: settings.sector || "LinkedIn",
        generatedPostId: item.generatedPostId ?? undefined,
      });
      const displayUrl = buildMediaProxyUrl(result.imageKey);

      await db
        .update(autoPublishQueue)
        .set({
          imageUrl: displayUrl,
          imageKey: result.imageKey,
          mediaLibraryId: result.mediaLibraryId,
        })
        .where(eq(autoPublishQueue.id, item.id));

      if (item.generatedPostId) {
        await db
          .update(generatedPosts)
          .set({
            imageUrl: displayUrl,
            imageKey: result.imageKey,
            mediaLibraryId: result.mediaLibraryId,
          })
          .where(eq(generatedPosts.id, item.generatedPostId));
      }

      console.log(`[gen] queue #${item.id} OK`);
      fixed++;
    } catch (err) {
      console.error(`[gen] queue #${item.id} échec:`, err);
    }
  }
  return fixed;
}

async function main() {
  if (doUpload) {
    const n = await repairMediaLibrary();
    console.log(`\n${n} entrée(s) médiathèque uploadée(s).`);
  }
  if (doRegenerate) {
    const n = await regenerateMissingQueueImages();
    console.log(`\n${n} publication(s) queue réparée(s).`);
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
