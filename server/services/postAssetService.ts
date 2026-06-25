import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { generatedPosts, mediaLibrary } from "../../drizzle/schema";
import { saveMediaFile } from "./mediaLibraryStorage";

export interface PersistedPostImage {
  imageUrl: string;
  imageKey: string;
  mediaLibraryId: number;
}

export async function persistAiGeneratedImage(
  userId: number,
  buffer: Buffer,
  options: {
    title?: string;
    prompt?: string;
    fileName?: string;
    tags?: string[];
  } = {}
): Promise<PersistedPostImage> {
  const fileName = options.fileName ?? `ai-post-${Date.now()}.png`;
  const { fileUrl, fileKey } = await saveMediaFile(
    buffer,
    fileName,
    userId,
    "image/png"
  );

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tags = Array.from(
    new Set(["ai-generated", "post", ...(options.tags ?? [])])
  );

  const [row] = await db
    .insert(mediaLibrary)
    .values({
      userId,
      title: options.title?.slice(0, 255) || "Image IA générée",
      description: options.prompt?.slice(0, 500) || null,
      tags: JSON.stringify(tags),
      fileUrl,
      fileKey,
      fileName,
      mimeType: "image/png",
      fileSize: buffer.length,
      mediaType: "image",
      aiDescription: options.prompt || null,
      aiSuggestedTheme: options.title?.slice(0, 100) || null,
    })
    .returning({ id: mediaLibrary.id });

  return {
    imageUrl: fileUrl,
    imageKey: fileKey,
    mediaLibraryId: row.id,
  };
}

export async function linkImageToGeneratedPost(
  userId: number,
  postId: number,
  asset: Partial<PersistedPostImage> & { imagePrompt?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(generatedPosts)
    .set({
      ...(asset.imageUrl !== undefined ? { imageUrl: asset.imageUrl } : {}),
      ...(asset.imageKey !== undefined ? { imageKey: asset.imageKey } : {}),
      ...(asset.mediaLibraryId !== undefined
        ? { mediaLibraryId: asset.mediaLibraryId }
        : {}),
      ...(asset.imagePrompt !== undefined ? { imagePrompt: asset.imagePrompt } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(generatedPosts.id, postId), eq(generatedPosts.userId, userId)));
}

export async function markGeneratedPostPublished(
  userId: number,
  postId: number,
  linkedinPostId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(generatedPosts)
    .set({
      status: "published",
      linkedinPostId,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(generatedPosts.id, postId), eq(generatedPosts.userId, userId)));
}
