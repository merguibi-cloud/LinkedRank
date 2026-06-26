/**
 * Media Library Service — upload, AI analysis, and post generation from user media
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { mediaLibrary, userProfiles, generatedPosts } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import {
  saveMediaFile,
  deleteMediaFile,
  getMediaTypeFromMime,
  isAllowedMimeType,
} from "./mediaLibraryStorage";
import {
  generateLinkedInPost,
  generatePostFromMedia,
  type UserContext,
  type GenerationRequest,
} from "./contentGenerator";
import { resolvePublicUrl } from "../_core/publicUrl";

export interface MediaItem {
  id: number;
  title: string | null;
  description: string | null;
  tags: string[];
  fileUrl: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  mediaType: "image" | "video" | "document";
  aiDescription: string | null;
  aiSuggestedTheme: string | null;
  usageCount: number | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapMediaRow(row: typeof mediaLibrary.$inferSelect): MediaItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: parseTags(row.tags),
    fileUrl: resolvePublicUrl(row.fileUrl),
    fileKey: row.fileKey,
    fileName: row.fileName,
    mimeType: row.mimeType,
    fileSize: row.fileSize,
    mediaType: row.mediaType as MediaItem["mediaType"],
    aiDescription: row.aiDescription,
    aiSuggestedTheme: row.aiSuggestedTheme,
    usageCount: row.usageCount,
    lastUsedAt: row.lastUsedAt,
    createdAt: row.createdAt,
  };
}

async function getUserContext(userId: number): Promise<UserContext> {
  const db = await getDb();
  if (!db) return {};

  const profileResult = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const profile = profileResult[0];
  if (!profile) return {};

  return {
    companyName: profile.companyName || undefined,
    industry: profile.industry || undefined,
    sector: profile.sector || undefined,
    products: profile.products ? JSON.parse(profile.products) : undefined,
    services: profile.services ? JSON.parse(profile.services) : undefined,
    targetAudience: profile.targetAudience || undefined,
    personalBio: profile.personalBio || undefined,
    expertise: profile.expertise ? JSON.parse(profile.expertise) : undefined,
    achievements: profile.achievements || undefined,
    businessGoals: profile.businessGoals || undefined,
    uniqueSellingPoints: profile.uniqueSellingPoints || undefined,
  };
}

export async function analyzeMediaWithAI(
  fileUrl: string,
  mediaType: "image" | "video" | "document",
  title?: string
): Promise<{ description: string; suggestedTheme: string; tags: string[] }> {
  if (mediaType === "document") {
    return {
      description: title ? `Document : ${title}` : "Document téléversé par l'utilisateur",
      suggestedTheme: "business",
      tags: ["document"],
    };
  }

  if (mediaType === "video") {
    return {
      description: title ? `Vidéo : ${title}` : "Vidéo téléversée par l'utilisateur, idéale pour un post LinkedIn engageant",
      suggestedTheme: "marketing",
      tags: ["video", "contenu"],
    };
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Tu analyses des visuels pour des publications LinkedIn. Réponds UNIQUEMENT en JSON valide:
{"description":"Description détaillée du visuel (2-3 phrases, en français)","suggestedTheme":"entrepreneurship|leadership|marketing|tech|motivation|...","tags":["tag1","tag2","tag3"]}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: title
                ? `Analyse cette image pour un post LinkedIn. Titre fourni par l'utilisateur : "${title}"`
                : "Analyse cette image pour un post LinkedIn professionnel.",
            },
            { type: "image_url", image_url: { url: fileUrl, detail: "low" } },
          ],
        },
      ],
      maxTokens: 1024,
      temperature: 0.4,
      responseFormat: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    const text = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));

    return {
      description: parsed.description || "Visuel professionnel pour LinkedIn",
      suggestedTheme: parsed.suggestedTheme || "business",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch (error) {
    console.warn("[MediaLibrary] AI analysis failed:", error);
    return {
      description: title ? `Image : ${title}` : "Visuel téléversé par l'utilisateur",
      suggestedTheme: "business",
      tags: ["visuel"],
    };
  }
}

export async function uploadMedia(
  userId: number,
  input: {
    fileName: string;
    mimeType: string;
    base64Data: string;
    title?: string;
    description?: string;
    tags?: string[];
  }
): Promise<MediaItem> {
  if (!isAllowedMimeType(input.mimeType)) {
    throw new Error("Type de fichier non supporté (JPEG, PNG, GIF, WebP, MP4, PDF)");
  }

  const mediaType = getMediaTypeFromMime(input.mimeType)!;
  const base64Clean = input.base64Data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Clean, "base64");

  const { fileUrl, fileKey } = await saveMediaFile(
    buffer,
    input.fileName,
    userId,
    input.mimeType
  );

  const aiAnalysis = await analyzeMediaWithAI(fileUrl, mediaType, input.title);

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const mergedTags = Array.from(new Set([...(input.tags ?? []), ...aiAnalysis.tags]));

  const [result] = await db.insert(mediaLibrary).values({
    userId,
    title: input.title || input.fileName.replace(/\.[^.]+$/, ""),
    description: input.description || null,
    tags: mergedTags.length ? JSON.stringify(mergedTags) : null,
    fileUrl,
    fileKey,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: buffer.length,
    mediaType,
    aiDescription: aiAnalysis.description,
    aiSuggestedTheme: aiAnalysis.suggestedTheme,
  }).returning({ id: mediaLibrary.id });

  return mapMediaRow({
    id: result.id,
    userId,
    title: input.title || input.fileName.replace(/\.[^.]+$/, ""),
    description: input.description || null,
    tags: mergedTags.length ? JSON.stringify(mergedTags) : null,
    fileUrl,
    fileKey,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: buffer.length,
    mediaType,
    aiDescription: aiAnalysis.description,
    aiSuggestedTheme: aiAnalysis.suggestedTheme,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function listMedia(
  userId: number,
  options: { limit?: number; offset?: number; mediaType?: "image" | "video" | "document" } = {}
): Promise<{ items: MediaItem[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { limit = 50, offset = 0, mediaType } = options;
  const conditions = [eq(mediaLibrary.userId, userId)];
  if (mediaType) conditions.push(eq(mediaLibrary.mediaType, mediaType));

  const rows = await db
    .select()
    .from(mediaLibrary)
    .where(and(...conditions))
    .orderBy(desc(mediaLibrary.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(mediaLibrary)
    .where(and(...conditions));

  return {
    items: rows.map(mapMediaRow),
    total: countResult[0]?.count || 0,
  };
}

export async function getMediaById(userId: number, id: number): Promise<MediaItem | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(mediaLibrary)
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)))
    .limit(1);

  return rows[0] ? mapMediaRow(rows[0]) : null;
}

export async function updateMedia(
  userId: number,
  id: number,
  data: { title?: string; description?: string; tags?: string[] }
): Promise<MediaItem | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

  await db
    .update(mediaLibrary)
    .set(updateData)
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)));

  return getMediaById(userId, id);
}

export async function deleteMedia(userId: number, id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const item = await getMediaById(userId, id);
  if (!item) return false;

  const rows = await db
    .select({ fileKey: mediaLibrary.fileKey })
    .from(mediaLibrary)
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)))
    .limit(1);

  await db
    .delete(mediaLibrary)
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)));

  if (rows[0]?.fileKey) {
    await deleteMediaFile(rows[0].fileKey);
  }

  return true;
}

async function markMediaUsed(userId: number, mediaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(mediaLibrary)
    .set({
      usageCount: sql`${mediaLibrary.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(mediaLibrary.id, mediaId), eq(mediaLibrary.userId, userId)));
}

export async function generatePostForMedia(
  userId: number,
  mediaId: number,
  options: {
    tone?: GenerationRequest["tone"];
    language?: GenerationRequest["language"];
    postType?: GenerationRequest["postType"];
    additionalInstructions?: string;
  } = {}
): Promise<{ id: number; title: string; content: string; hashtags: string[]; imageUrl: string; mediaId: number }> {
  const media = await getMediaById(userId, mediaId);
  if (!media) throw new Error("Média introuvable");

  const userContext = await getUserContext(userId);
  const theme = media.aiSuggestedTheme || "business";

  const generated = await generatePostFromMedia({
    theme,
    tone: options.tone ?? "inspirational",
    language: options.language ?? "FR",
    userContext,
    postType: options.postType ?? "insight",
    additionalInstructions: options.additionalInstructions,
    media: {
      id: media.id,
      title: media.title ?? undefined,
      description: media.description ?? undefined,
      aiDescription: media.aiDescription ?? undefined,
      fileUrl: media.fileUrl,
      mediaType: media.mediaType,
      tags: media.tags,
    },
  });

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(generatedPosts).values({
    userId,
    title: generated.title,
    content: generated.content,
    language: options.language ?? "FR",
    theme,
    tone: options.tone ?? "inspirational",
    prompt: `Média #${mediaId}: ${media.aiDescription || media.title}`,
    status: "generated",
    imageUrl: media.mediaType === "image" ? media.fileUrl : null,
    imageKey: media.mediaType === "image" ? media.fileKey : null,
    mediaLibraryId: media.id,
  }).returning({ id: generatedPosts.id });

  await markMediaUsed(userId, mediaId);

  return {
    id: result.id,
    title: generated.title,
    content: generated.content,
    hashtags: generated.hashtags,
    imageUrl: media.mediaType === "image" ? media.fileUrl : generated.suggestedMedia ?? media.fileUrl,
    mediaId: media.id,
  };
}

export async function suggestPostsFromLibrary(
  userId: number,
  count: number = 3,
  options: {
    tone?: GenerationRequest["tone"];
    language?: GenerationRequest["language"];
  } = {}
): Promise<Array<{ id: number; title: string; content: string; hashtags: string[]; imageUrl: string; mediaId: number; mediaTitle: string | null }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Prioritize least-used media, images first
  const rows = await db
    .select()
    .from(mediaLibrary)
    .where(and(eq(mediaLibrary.userId, userId), eq(mediaLibrary.mediaType, "image")))
    .orderBy(mediaLibrary.usageCount, desc(mediaLibrary.createdAt))
    .limit(count);

  if (rows.length === 0) {
    throw new Error("Aucun visuel dans votre médiathèque. Téléversez des images d'abord.");
  }

  const results = [];
  for (const row of rows) {
    const media = mapMediaRow(row);
    try {
      const post = await generatePostForMedia(userId, media.id, options);
      results.push({ ...post, mediaTitle: media.title });
    } catch (error) {
      console.error(`[MediaLibrary] Failed to generate for media ${media.id}:`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("Impossible de générer des publications. Réessayez.");
  }

  return results;
}

export interface MediaSuggestion extends MediaItem {
  relevanceScore: number;
  matchReason: string;
}

const RELEVANCE_THRESHOLD = 60;

export async function suggestMediaForPost(
  userId: number,
  options: { content: string; title?: string; limit?: number }
): Promise<{ suggestions: MediaSuggestion[]; hasRelevantMatch: boolean }> {
  const { items } = await listMedia(userId, { limit: 30, mediaType: "image" });

  if (items.length === 0) {
    return { suggestions: [], hasRelevantMatch: false };
  }

  const limit = options.limit ?? 6;
  const mediaSummaries = items.map(m => ({
    id: m.id,
    title: m.title,
    description: m.aiDescription || m.description,
    theme: m.aiSuggestedTheme,
    tags: m.tags.join(", "),
  }));

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Tu sélectionnes les visuels d'une médiathèque les plus adaptés à une publication LinkedIn.
Réponds UNIQUEMENT en JSON valide:
{"matches":[{"id":number,"score":0-100,"reason":"courte explication en français"}]}
- score >= 60 = bon match pour accompagner le post
- score < 40 = peu pertinent
- Trie par score décroissant
- Maximum ${limit} résultats`,
        },
        {
          role: "user",
          content: `Publication:
Titre: ${options.title || "Sans titre"}
Contenu:
${options.content.slice(0, 1500)}

Médiathèque (${mediaSummaries.length} visuels):
${JSON.stringify(mediaSummaries)}`,
        },
      ],
      maxTokens: 1024,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    const text = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(
      text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    ) as { matches?: Array<{ id: number; score: number; reason: string }> };

    const itemMap = new Map(items.map(i => [i.id, i]));
    const suggestions: MediaSuggestion[] = (parsed.matches ?? [])
      .filter(m => itemMap.has(m.id))
      .map(m => ({
        ...itemMap.get(m.id)!,
        relevanceScore: Math.min(100, Math.max(0, m.score)),
        matchReason: m.reason || "",
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    const hasRelevantMatch = suggestions.some(
      s => s.relevanceScore >= RELEVANCE_THRESHOLD
    );

    return { suggestions, hasRelevantMatch };
  } catch (error) {
    console.warn("[MediaLibrary] suggestMediaForPost failed:", error);
    return {
      suggestions: items.slice(0, limit).map(item => ({
        ...item,
        relevanceScore: 40,
        matchReason: "Parcourez vos visuels ou générez une image IA",
      })),
      hasRelevantMatch: false,
    };
  }
}

export async function reanalyzeMedia(userId: number, id: number): Promise<MediaItem | null> {
  const media = await getMediaById(userId, id);
  if (!media) return null;

  const analysis = await analyzeMediaWithAI(media.fileUrl, media.mediaType, media.title ?? undefined);

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingTags = media.tags;
  const mergedTags = Array.from(new Set([...existingTags, ...analysis.tags]));

  await db
    .update(mediaLibrary)
    .set({
      aiDescription: analysis.description,
      aiSuggestedTheme: analysis.suggestedTheme,
      tags: mergedTags.length ? JSON.stringify(mergedTags) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.userId, userId)));

  return getMediaById(userId, id);
}
