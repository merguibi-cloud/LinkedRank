import "dotenv/config";
import { getDb } from "../server/db.ts";
import { autoPublishQueue, generatedPosts, mediaLibrary } from "../drizzle/schema.ts";
import { desc, eq, asc } from "drizzle-orm";
import { resolveStorageAssetUrl } from "../server/_core/publicUrl.ts";

const db = await getDb();
if (!db) {
  console.error("DB indisponible");
  process.exit(1);
}

const queue = await db
  .select({
    id: autoPublishQueue.id,
    userId: autoPublishQueue.userId,
    preview: autoPublishQueue.content,
    imageUrl: autoPublishQueue.imageUrl,
    imageKey: autoPublishQueue.imageKey,
    mediaLibraryId: autoPublishQueue.mediaLibraryId,
    status: autoPublishQueue.status,
    scheduledFor: autoPublishQueue.scheduledFor,
  })
  .from(autoPublishQueue)
  .where(eq(autoPublishQueue.status, "pending"))
  .orderBy(asc(autoPublishQueue.scheduledFor))
  .limit(10);

const posts = await db
  .select({
    id: generatedPosts.id,
    title: generatedPosts.title,
    status: generatedPosts.status,
    imageUrl: generatedPosts.imageUrl,
    imageKey: generatedPosts.imageKey,
    mediaLibraryId: generatedPosts.mediaLibraryId,
  })
  .from(generatedPosts)
  .orderBy(desc(generatedPosts.createdAt))
  .limit(10);

console.log("=== QUEUE (pending) ===");
for (const row of queue) {
  const resolved = resolveStorageAssetUrl(row.imageUrl, row.imageKey);
  console.log({
    id: row.id,
    scheduledFor: row.scheduledFor,
    imageUrl: row.imageUrl?.slice(0, 80) ?? null,
    imageKey: row.imageKey,
    mediaLibraryId: row.mediaLibraryId,
    resolved: resolved?.slice(0, 80) ?? null,
    preview: row.preview?.slice(0, 40),
  });
}

console.log("\n=== GENERATED POSTS ===");
for (const row of posts) {
  const resolved = resolveStorageAssetUrl(row.imageUrl, row.imageKey);
  console.log({
    id: row.id,
    title: row.title,
    status: row.status,
    imageUrl: row.imageUrl?.slice(0, 80) ?? null,
    imageKey: row.imageKey,
    resolved: resolved?.slice(0, 80) ?? null,
  });
}

const media = await db
  .select({
    id: mediaLibrary.id,
    fileUrl: mediaLibrary.fileUrl,
    fileKey: mediaLibrary.fileKey,
  })
  .from(mediaLibrary)
  .orderBy(desc(mediaLibrary.id))
  .limit(5);

console.log("\n=== MEDIA LIBRARY (recent) ===");
for (const row of media) {
  console.log({
    id: row.id,
    fileUrl: row.fileUrl?.slice(0, 100),
    fileKey: row.fileKey,
    resolved: resolveStorageAssetUrl(row.fileUrl, row.fileKey)?.slice(0, 100),
  });
}

process.exit(0);
