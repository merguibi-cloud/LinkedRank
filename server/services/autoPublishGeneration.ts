import type { AutoPublishSettings } from "../../drizzle/schema";
import { linkedinInfluencers } from "../../drizzle/schema";
import { desc, sql } from "drizzle-orm";
import type { getDb } from "../db";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

const CONTENT_TYPE_TO_FORMAT: Record<string, string> = {
  storytelling: "story",
  tips: "tips",
  case_study: "listicle",
  opinion: "controversial",
  educational: "tips",
  behind_scenes: "story",
  industry_news: "infographic",
  carousel: "carousel",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  visibility: "augmenter la visibilité et la notoriété",
  leads: "générer des leads qualifiés",
  recruitment: "attirer des talents",
  thought_leadership: "devenir une référence (thought leadership)",
  networking: "développer le réseau professionnel",
  sales: "convertir l'audience en clients",
};

export interface ParsedTopics {
  objectives: string[];
  contentTypes: string[];
  includeImage: boolean;
  imageType: "ai" | "quote";
  imageStyle: string;
  colorPalette: string;
  customQuote: string;
  aiImageStyle: string;
  aiImageFormat: string;
}

export function parseInspirationTopics(settings: {
  inspirationTopics?: string | null;
}): ParsedTopics {
  let topics: Record<string, unknown> = {};
  if (settings.inspirationTopics) {
    try {
      topics = JSON.parse(settings.inspirationTopics);
    } catch {
      topics = {};
    }
  }

  return {
    objectives: (topics.objectives as string[]) || [],
    contentTypes: (topics.contentTypes as string[]) || [],
    includeImage: topics.includeImage !== false,
    imageType: topics.imageType === "quote" ? "quote" : "ai",
    imageStyle: (topics.imageStyle as string) || "gradient",
    colorPalette: (topics.colorPalette as string) || "violet",
    customQuote: (topics.customQuote as string) || "",
    aiImageStyle: (topics.aiImageStyle as string) || "professional",
    aiImageFormat: (topics.aiImageFormat as string) || "1536x1024",
  };
}

export function pickContentFormat(contentTypes: string[], variationIndex = 0): string {
  if (contentTypes.length === 0) return "";
  const formats = contentTypes
    .map((t) => CONTENT_TYPE_TO_FORMAT[t])
    .filter(Boolean);
  if (formats.length === 0) return "";
  return formats[variationIndex % formats.length];
}

function buildObjectivesHint(objectives: string[]): string {
  if (objectives.length === 0) return "";
  const labels = objectives.map((o) => OBJECTIVE_LABELS[o] || o);
  return `Objectifs du client : ${labels.join(", ")}.`;
}

function parseAvoidTopics(settings: AutoPublishSettings): string[] {
  if (!settings.avoidTopics) return [];
  try {
    return JSON.parse(settings.avoidTopics) as string[];
  } catch {
    return [];
  }
}

export async function getInfluencersForSettings(
  db: Db,
  settings: AutoPublishSettings,
  limit = 5
) {
  let creatorIds: number[] = [];
  if (settings.inspirationCreators) {
    try {
      creatorIds = JSON.parse(settings.inspirationCreators) as number[];
    } catch {
      creatorIds = [];
    }
  }

  if (creatorIds.length > 0) {
    return db
      .select()
      .from(linkedinInfluencers)
      .where(
        sql`${linkedinInfluencers.id} IN (${sql.join(
          creatorIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .limit(limit);
  }

  if (settings.sector) {
    const sector = settings.sector.toLowerCase();
    const matches = await db
      .select()
      .from(linkedinInfluencers)
      .where(
        sql`(
          LOWER(${linkedinInfluencers.industry}) LIKE ${`%${sector}%`}
          OR LOWER(${linkedinInfluencers.headline}) LIKE ${`%${sector}%`}
          OR LOWER(${linkedinInfluencers.sector}) LIKE ${`%${sector}%`}
        )`
      )
      .orderBy(desc(linkedinInfluencers.followers))
      .limit(limit);

    if (matches.length > 0) return matches;
  }

  return db
    .select()
    .from(linkedinInfluencers)
    .orderBy(desc(linkedinInfluencers.followers))
    .limit(limit);
}

export function buildLinkedInPostParams(
  settings: AutoPublishSettings,
  influencers: { name: string }[],
  variationIndex = 0
) {
  const topics = parseInspirationTopics(settings);
  const avoid = parseAvoidTopics(settings);
  const contentFormat = pickContentFormat(topics.contentTypes, variationIndex);
  const objectivesHint = buildObjectivesHint(topics.objectives);

  const contextParts = [settings.personalContext, objectivesHint].filter(Boolean);
  if (avoid.length > 0) {
    contextParts.push(`Éviter les sujets : ${avoid.join(", ")}.`);
  }

  return {
    sector: settings.sector || "Business",
    targetAudience: settings.targetAudience || "professionnels",
    tone: settings.tone || "professional",
    language: settings.language || "FR",
    viralityLevel: settings.viralityLevel || "medium",
    contentLength: settings.contentLength || "medium",
    includeEmojis: settings.includeEmojis ?? true,
    includeHashtags: settings.includeHashtags ?? true,
    includeCallToAction: settings.includeCallToAction ?? true,
    personalContext: contextParts.join(" "),
    inspirationFrom: influencers.map((i) => i.name).join(", "),
    contentFormat,
    topic:
      variationIndex > 0
        ? `Variation ${variationIndex + 1} — angle unique adapté aux objectifs du client`
        : topics.contentTypes.length > 0
          ? `Format privilégié : ${topics.contentTypes.join(", ")}`
          : "",
  };
}
