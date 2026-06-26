/**
 * Orchestrateur auto-publication :
 * - Pré-remplit la file d'attente avant publication
 * - Varie formats, angles et visuels (pas de posts identiques)
 * - Génération réflexive (Gemini) + images (Nano Banana / prompts enrichis)
 */

import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import {
  autoPublishQueue,
  autoPublishSchedule,
  autoPublishSettings,
  generatedPosts,
} from "../../drizzle/schema";
import { generateLinkedInPost, AVAILABLE_FORMATS } from "./ai";
import { invokeLLM } from "../_core/llm";
import {
  buildLinkedInPostParams,
  getInfluencersForSettings,
  parseInspirationTopics,
} from "./autoPublishGeneration";
import { buildLearningContext, type LearningContext } from "./agentLearningService";
import { generatePostImage } from "./postImageService";
import { renderQuoteImage } from "./htmlToImage";
import { projectUpcomingPublications } from "./upcomingPublications";
import { normalizeStoredImageFields } from "../_core/publicUrl";
import type { AutoPublishSettings } from "../../drizzle/schema";

export const PREFILL_LOOKAHEAD_HOURS = 48;
export const PREFILL_MIN_LEAD_HOURS = 1;
export const MAX_SIMILARITY = 0.42;
export const MAX_GENERATION_ATTEMPTS = 3;
const SLOT_MATCH_MS = 5 * 60 * 1000;

const TOPIC_ANGLES = [
  "leçon apprise cette semaine",
  "erreur courante dans le secteur",
  "tendance émergente à décrypter",
  "retour d'expérience client",
  "conseil actionnable immédiat",
  "mythe à déconstruire",
  "coulisses et transparence",
  "étude de cas rapide",
  "question provocante au marché",
  "framework ou méthode simple",
];

const COLOR_PALETTES = [
  "violet",
  "ocean",
  "sunset",
  "forest",
  "royal",
  "fire",
  "midnight",
  "gold",
];

const AI_VISUAL_STYLES = [
  "professional",
  "abstract",
  "minimal",
  "tech",
  "nature",
  "dynamic",
];

export type VariationPlan = {
  variationIndex: number;
  contentFormat: string;
  topicAngle: string;
  topicBrief: string;
  colorPalette: string;
  aiImageStyle: string;
};

export type SmartPostResult = {
  content: string;
  imageUrl: string | null;
  imageKey?: string | null;
  mediaLibraryId?: number | null;
  plan: VariationPlan;
  generatedPostId?: number;
};

type ContentFingerprint = {
  tokens: Set<string>;
  snippet: string;
};

export function tokenizeForSimilarity(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");
  return new Set(
    normalized
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 200)
  );
}

export function textSimilarity(a: string, b: string): number {
  const setA = tokenizeForSimilarity(a);
  const setB = tokenizeForSimilarity(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const w of setA) {
    if (setB.has(w)) inter++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

export function isTooSimilarToRecent(
  content: string,
  fingerprints: ContentFingerprint[],
  threshold = MAX_SIMILARITY
): boolean {
  return fingerprints.some((fp) => textSimilarity(content, fp.snippet) >= threshold);
}

export function pickVariationPlan(
  settings: AutoPublishSettings,
  recentCount: number,
  slotSeed: number
): VariationPlan {
  const topics = parseInspirationTopics(settings);
  const formats =
    topics.contentTypes.length > 0
      ? topics.contentTypes
          .map((t) => {
            const map: Record<string, string> = {
              storytelling: "story",
              tips: "tips",
              case_study: "listicle",
              opinion: "controversial",
              educational: "tips",
              behind_scenes: "story",
              industry_news: "infographic",
              carousel: "carousel",
            };
            return map[t];
          })
          .filter(Boolean)
      : [...AVAILABLE_FORMATS];

  const uniqueFormats = [...new Set(formats.length ? formats : AVAILABLE_FORMATS)];
  const variationIndex = recentCount + slotSeed;

  const contentFormat =
    uniqueFormats[variationIndex % uniqueFormats.length] ?? "story";
  const topicAngle =
    TOPIC_ANGLES[(variationIndex + slotSeed) % TOPIC_ANGLES.length];
  const sector = settings.sector || "votre secteur";

  return {
    variationIndex,
    contentFormat,
    topicAngle,
    topicBrief: `${topicAngle} — angle frais pour ${sector}, sans répéter les posts précédents`,
    colorPalette:
      topics.colorPalette ||
      COLOR_PALETTES[variationIndex % COLOR_PALETTES.length],
    aiImageStyle:
      topics.aiImageStyle ||
      AI_VISUAL_STYLES[(variationIndex + 1) % AI_VISUAL_STYLES.length],
  };
}

function buildLearningBlock(learning: LearningContext): string {
  const parts: string[] = [];
  if (learning.insightsSummary) parts.push(learning.insightsSummary);
  if (learning.topPerformingTopics.length) {
    parts.push(`Sujets performants: ${learning.topPerformingTopics.join(", ")}`);
  }
  if (learning.avoidPatterns.length) {
    parts.push(`À éviter: ${learning.avoidPatterns.join(", ")}`);
  }
  if (learning.successfulExamples.length) {
    parts.push(`Réussites: ${learning.successfulExamples.join(" | ")}`);
  }
  return parts.join(". ");
}

async function refinePostContent(
  content: string,
  settings: AutoPublishSettings,
  plan: VariationPlan
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Tu es éditeur LinkedIn. Améliore le post sans changer le fond.
- Garde le format "${plan.contentFormat}"
- Ton: ${settings.tone || "professional"}
- Supprime les clichés et répétitions
- Hook plus fort en première ligne
- Réponds UNIQUEMENT avec le post final`,
        },
        { role: "user", content },
      ],
      maxTokens: 1800,
      temperature: 0.65,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const refined =
      typeof raw === "string"
        ? raw
        : (raw[0] as { text?: string })?.text ?? "";
    return refined.trim().length > 80 ? refined.trim() : content;
  } catch {
    return content;
  }
}

async function loadRecentFingerprints(
  userId: number,
  limit = 15
): Promise<ContentFingerprint[]> {
  const db = await getDb();
  if (!db) return [];

  const [queueRows, postRows] = await Promise.all([
    db
      .select({ content: autoPublishQueue.content })
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.userId, userId),
          inArray(autoPublishQueue.status, ["pending", "published", "publishing"])
        )
      )
      .orderBy(desc(autoPublishQueue.createdAt))
      .limit(limit),
    db
      .select({ content: generatedPosts.content })
      .from(generatedPosts)
      .where(eq(generatedPosts.userId, userId))
      .orderBy(desc(generatedPosts.createdAt))
      .limit(limit),
  ]);

  const all = [...queueRows, ...postRows].map((r) => r.content).filter(Boolean);
  return all.map((snippet) => ({
    snippet,
    tokens: tokenizeForSimilarity(snippet),
  }));
}

async function generateVariedImage(
  userId: number,
  content: string,
  settings: AutoPublishSettings,
  plan: VariationPlan,
  generatedPostId?: number
): Promise<{
  imageUrl: string;
  imageKey: string;
  mediaLibraryId: number;
} | null> {
  const topics = parseInspirationTopics(settings);
  if (!topics.includeImage) return null;

  try {
    if (topics.imageType === "ai") {
      const result = await generatePostImage(userId, {
        content,
        title: `${settings.sector || "LinkedIn"} — ${plan.topicAngle}`,
        visualStyle: plan.aiImageStyle,
        imageSize: topics.aiImageFormat,
        generatedPostId,
        suggestedMedia: `Unique visual for: ${plan.topicAngle}. Style: ${plan.aiImageStyle}. Must differ from previous posts.`,
      });
      return {
        imageUrl: result.imageUrl,
        imageKey: result.imageKey,
        mediaLibraryId: result.mediaLibraryId,
      };
    }

    const lines = content.split("\n").filter((l) => l.trim().length > 15);
    const quote =
      lines.find((l) => l.includes('"') || l.includes("«"))?.replace(/["*«»]/g, "").trim() ||
      lines[0]?.slice(0, 120) ||
      plan.topicBrief;

    const result = await renderQuoteImage({
      quote: quote.slice(0, 140),
      authorName: settings.sector || "LinkedIn",
      style: topics.imageStyle || "gradient",
      colorPalette: plan.colorPalette,
    });
    if (!result?.url) return null;
    const keyMatch = result.url.match(/\/(generated\/[^?]+)/);
    return {
      imageUrl: result.url,
      imageKey: keyMatch?.[1] ?? `generated/${Date.now()}.png`,
      mediaLibraryId: 0,
    };
  } catch (error) {
    console.error("[AutoPublishOrchestrator] Image generation failed:", error);
    return null;
  }
}

/**
 * Génère un post unique avec réflexion IA + image variée.
 */
export async function generateSmartAutoPost(
  userId: number,
  settings: AutoPublishSettings,
  slotSeed = 0
): Promise<SmartPostResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const fingerprints = await loadRecentFingerprints(userId);
  const learning = await buildLearningContext(userId);
  const influencers = await getInfluencersForSettings(db, settings);
  const plan = pickVariationPlan(settings, fingerprints.length, slotSeed);

  let content = "";
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const attemptPlan =
      attempt === 0
        ? plan
        : {
            ...plan,
            topicAngle: TOPIC_ANGLES[(plan.variationIndex + attempt + 1) % TOPIC_ANGLES.length],
            topicBrief: `${plan.topicBrief} — variation ${attempt + 1}, angle totalement différent`,
            contentFormat:
              AVAILABLE_FORMATS[
                (AVAILABLE_FORMATS.indexOf(plan.contentFormat) + attempt + 1) %
                  AVAILABLE_FORMATS.length
              ],
          };

    const baseParams = buildLinkedInPostParams(
      settings,
      influencers,
      attemptPlan.variationIndex + attempt
    );
    const learningBlock = buildLearningBlock(learning);
    const antiRepeat = fingerprints
      .slice(0, 5)
      .map((f) => f.snippet.slice(0, 100).replace(/\n/g, " "))
      .join(" | ");

    const draft = await generateLinkedInPost({
      ...baseParams,
      contentFormat: attemptPlan.contentFormat,
      topic: attemptPlan.topicBrief,
      personalContext: [
        baseParams.personalContext,
        learningBlock,
        antiRepeat ? `Ne pas répéter ces extraits récents: ${antiRepeat}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (!isTooSimilarToRecent(draft, fingerprints)) {
      content = await refinePostContent(draft, settings, attemptPlan);
      if (!isTooSimilarToRecent(content, fingerprints)) {
        Object.assign(plan, attemptPlan);
        break;
      }
    }
    content = draft;
  }

  if (!content) {
    throw new Error("Impossible de générer un post unique");
  }

  const [saved] = await db
    .insert(generatedPosts)
    .values({
      userId,
      title: plan.topicAngle,
      content,
      language: settings.language || "FR",
      theme: settings.sector || "Auto",
      tone: settings.tone || "professional",
      status: "scheduled",
    })
    .returning({ id: generatedPosts.id });

  const imageAsset = await generateVariedImage(
    userId,
    content,
    settings,
    plan,
    saved?.id
  );

  if (saved && imageAsset) {
    await db
      .update(generatedPosts)
      .set({
        imageUrl: imageAsset.imageUrl,
        imageKey: imageAsset.imageKey,
        ...(imageAsset.mediaLibraryId
          ? { mediaLibraryId: imageAsset.mediaLibraryId }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(generatedPosts.id, saved.id));
  }

  return {
    content,
    imageUrl: imageAsset?.imageUrl ?? null,
    imageKey: imageAsset?.imageKey ?? null,
    mediaLibraryId: imageAsset?.mediaLibraryId ?? null,
    plan,
    generatedPostId: saved?.id,
  };
}

function parseQueueMeta(generatedFrom: string | null) {
  if (!generatedFrom) return null;
  try {
    return JSON.parse(generatedFrom) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isQueueItemForSlot(
  item: { scheduledFor: Date; generatedFrom: string | null },
  scheduledFor: Date,
  slotId?: number
): boolean {
  const diff = Math.abs(
    new Date(item.scheduledFor).getTime() - scheduledFor.getTime()
  );
  if (diff > SLOT_MATCH_MS) return false;
  const meta = parseQueueMeta(item.generatedFrom);
  if (slotId != null && meta?.slotId != null) {
    return Number(meta.slotId) === slotId;
  }
  return true;
}

/**
 * Prépare la file pour les créneaux à venir (sans publier).
 */
export async function prefillQueueForUser(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [settings] = await db
    .select()
    .from(autoPublishSettings)
    .where(
      and(
        eq(autoPublishSettings.userId, userId),
        eq(autoPublishSettings.isEnabled, true)
      )
    )
    .limit(1);

  if (!settings) return 0;

  const schedule = await db
    .select()
    .from(autoPublishSchedule)
    .where(eq(autoPublishSchedule.userId, userId));

  const queue = await db
    .select()
    .from(autoPublishQueue)
    .where(
      and(
        eq(autoPublishQueue.userId, userId),
        inArray(autoPublishQueue.status, ["pending", "publishing"])
      )
    );

  const now = new Date();
  const lookaheadEnd = new Date(
    now.getTime() + PREFILL_LOOKAHEAD_HOURS * 3600000
  );
  const minLead = new Date(
    now.getTime() + PREFILL_MIN_LEAD_HOURS * 3600000
  );

  const projected = projectUpcomingPublications({
    settings,
    schedule,
    queue,
    days: Math.ceil(PREFILL_LOOKAHEAD_HOURS / 24),
    now,
  }).filter((p) => p.status === "projected");

  let created = 0;

  for (const slot of projected) {
    const scheduledFor = new Date(slot.scheduledFor);
    if (scheduledFor > lookaheadEnd || scheduledFor < minLead) continue;

    const alreadyQueued = queue.some((q) =>
      isQueueItemForSlot(q, scheduledFor)
    );
    if (alreadyQueued) continue;

    const slotIdMatch = slot.id.match(/slot-(\d+)-/);
    const slotId = slotIdMatch ? Number(slotIdMatch[1]) : 0;

    try {
      const { content, imageUrl, imageKey, mediaLibraryId, plan, generatedPostId } =
        await generateSmartAutoPost(userId, settings, slotId + created);

      const storedImage = normalizeStoredImageFields(imageUrl, imageKey);

      await db.insert(autoPublishQueue).values({
        userId,
        content,
        imageUrl: storedImage.imageUrl,
        imageKey: storedImage.imageKey,
        mediaLibraryId: mediaLibraryId || null,
        generatedPostId: generatedPostId ?? null,
        scheduledFor,
        status: "pending",
        generatedFrom: JSON.stringify({
          type: "auto_recurring",
          slotId,
          topicAngle: plan.topicAngle,
          contentFormat: plan.contentFormat,
          variationIndex: plan.variationIndex,
          prefilled: true,
        }),
      });

      created++;
      console.log(
        `[AutoPublishOrchestrator] Prefilled queue for user ${userId} at ${scheduledFor.toISOString()}`
      );
    } catch (error) {
      console.error(
        `[AutoPublishOrchestrator] Prefill failed user ${userId}:`,
        error
      );
    }
  }

  return created;
}

export async function prefillAllEnabledUsers(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const users = await db
    .select({ userId: autoPublishSettings.userId })
    .from(autoPublishSettings)
    .where(eq(autoPublishSettings.isEnabled, true));

  for (const { userId } of users) {
    try {
      await prefillQueueForUser(userId);
    } catch (error) {
      console.error(`[AutoPublishOrchestrator] User ${userId} prefill error:`, error);
    }
  }
}

/**
 * Publication d'urgence si le créneau est atteint sans file préparée.
 */
export async function emergencyGenerateForSlot(
  userId: number,
  settings: AutoPublishSettings,
  slotId: number
): Promise<SmartPostResult> {
  return generateSmartAutoPost(userId, settings, slotId);
}
