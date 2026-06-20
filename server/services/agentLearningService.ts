/**
 * Agent Learning Service
 * Collecte les données de performance par utilisateur et alimente
 * la mémoire des agents pour des publications de plus en plus pertinentes.
 */

import { getDb } from "../db";
import {
  generatedPosts,
  autoPublishHistory,
  agentTasks,
  agentMemory,
  agents,
} from "../../drizzle/schema";
import { eq, desc, and, or, gte } from "drizzle-orm";
import type { MemoryImportance, MemoryType } from "../../shared/agentTypes";

export interface PostPerformanceRecord {
  id: number;
  source: "generated" | "auto_publish" | "agent_task";
  title?: string | null;
  content: string;
  theme?: string | null;
  tone?: string | null;
  postType?: string | null;
  publishedAt?: Date | null;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagementScore: number;
  engagementRate: number;
}

export interface UserPerformanceAnalysis {
  totalPosts: number;
  publishedPosts: number;
  avgEngagement: number;
  avgEngagementRate: number;
  topPerformingPosts: PostPerformanceRecord[];
  underperformingPosts: PostPerformanceRecord[];
  bestThemes: Array<{ theme: string; avgEngagement: number; count: number }>;
  worstThemes: Array<{ theme: string; avgEngagement: number; count: number }>;
  bestTones: Array<{ tone: string; avgEngagement: number; count: number }>;
  bestPostingTimes: Array<{ day: string; hour: number; avgEngagement: number }>;
  rejectedTopics: string[];
  approvedTopics: string[];
  insights: string[];
}

export interface LearningContext {
  insightsSummary: string;
  topPerformingTopics: string[];
  underperformingTopics: string[];
  bestTones: string[];
  avoidPatterns: string[];
  successfulExamples: string[];
  failedExamples: string[];
  bestPostingTimes: string[];
  approvalRate: number;
}

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function calculateEngagementScore(
  likes: number,
  comments: number,
  shares: number,
  impressions: number
): number {
  const weighted = likes + comments * 3 + shares * 5;
  if (impressions > 0) {
    return Math.round((weighted / impressions) * 1000) / 10;
  }
  return weighted;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  try {
    return JSON.parse(value as string) as T;
  } catch {
    return fallback;
  }
}

function contentPreview(content: string, maxLen = 120): string {
  return content.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

/**
 * Récupère l'historique de performance d'un utilisateur depuis toutes les sources.
 */
export async function getUserPostPerformance(userId: number): Promise<PostPerformanceRecord[]> {
  const db = (await getDb())!;
  const records: PostPerformanceRecord[] = [];

  const userGenerated = await db
    .select()
    .from(generatedPosts)
    .where(
      and(
        eq(generatedPosts.userId, userId),
        or(eq(generatedPosts.status, "published"), eq(generatedPosts.status, "scheduled"))
      )
    )
    .orderBy(desc(generatedPosts.publishedAt))
    .limit(100);

  for (const post of userGenerated) {
    const likes = post.likes ?? 0;
    const comments = post.comments ?? 0;
    const shares = post.shares ?? 0;
    records.push({
      id: post.id,
      source: "generated",
      title: post.title,
      content: post.content,
      theme: post.theme,
      tone: post.tone,
      publishedAt: post.publishedAt,
      likes,
      comments,
      shares,
      impressions: 0,
      engagementScore: calculateEngagementScore(likes, comments, shares, 0),
      engagementRate: 0,
    });
  }

  const autoHistory = await db
    .select()
    .from(autoPublishHistory)
    .where(and(eq(autoPublishHistory.userId, userId), eq(autoPublishHistory.status, "success")))
    .orderBy(desc(autoPublishHistory.publishedAt))
    .limit(100);

  for (const entry of autoHistory) {
    const likes = entry.likes ?? 0;
    const comments = entry.comments ?? 0;
    const shares = entry.shares ?? 0;
    const impressions = entry.impressions ?? 0;
    records.push({
      id: entry.id,
      source: "auto_publish",
      content: entry.content,
      publishedAt: entry.publishedAt,
      likes,
      comments,
      shares,
      impressions,
      engagementScore: calculateEngagementScore(likes, comments, shares, impressions),
      engagementRate:
        impressions > 0
          ? Math.round(((likes + comments + shares) / impressions) * 1000) / 10
          : 0,
    });
  }

  const agentPublished = await db
    .select()
    .from(agentTasks)
    .where(
      and(
        eq(agentTasks.userId, userId),
        or(eq(agentTasks.status, "approved"), eq(agentTasks.status, "completed"))
      )
    )
    .orderBy(desc(agentTasks.approvedAt))
    .limit(50);

  for (const task of agentPublished) {
    const output = parseJsonField<Record<string, any>>(task.outputData, {});
    const input = parseJsonField<Record<string, any>>(task.inputData, {});
    const post = output.generatedPost || output;
    const content = post.content || output.generatedContent;
    if (!content) continue;

    records.push({
      id: task.id,
      source: "agent_task",
      title: post.title || task.title,
      content,
      theme: input.topic || input.theme || output.metadata?.theme,
      tone: input.tone || output.metadata?.tone,
      postType: input.postType || output.metadata?.postType,
      publishedAt: task.approvedAt,
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0,
      engagementScore: 0,
      engagementRate: 0,
    });
  }

  return records.sort((a, b) => {
    const dateA = a.publishedAt?.getTime() ?? 0;
    const dateB = b.publishedAt?.getTime() ?? 0;
    return dateB - dateA;
  });
}

function groupByField(
  records: PostPerformanceRecord[],
  field: "theme" | "tone"
): Array<{ key: string; avgEngagement: number; count: number }> {
  const groups = new Map<string, { total: number; count: number }>();

  for (const record of records) {
    const key = (field === "theme" ? record.theme : record.tone)?.trim();
    if (!key) continue;
    const existing = groups.get(key) || { total: 0, count: 0 };
    existing.total += record.engagementScore;
    existing.count += 1;
    groups.set(key, existing);
  }

  return Array.from(groups.entries())
    .map(([key, data]) => ({
      key,
      avgEngagement: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/**
 * Analyse les performances réelles d'un utilisateur.
 */
export async function analyzeUserPerformance(userId: number): Promise<UserPerformanceAnalysis> {
  const db = (await getDb())!;
  const records = await getUserPostPerformance(userId);
  const withEngagement = records.filter((r) => r.engagementScore > 0);

  const avgEngagement =
    withEngagement.length > 0
      ? Math.round(
          (withEngagement.reduce((sum, r) => sum + r.engagementScore, 0) / withEngagement.length) * 10
        ) / 10
      : 0;

  const withRate = records.filter((r) => r.engagementRate > 0);
  const avgEngagementRate =
    withRate.length > 0
      ? Math.round((withRate.reduce((sum, r) => sum + r.engagementRate, 0) / withRate.length) * 10) / 10
      : 0;

  const sorted = [...withEngagement].sort((a, b) => b.engagementScore - a.engagementScore);
  const topPerformingPosts = sorted.slice(0, 5);
  const underperformingPosts =
    sorted.length > 3 ? sorted.slice(-3).reverse() : [];

  const themeGroups = groupByField(withEngagement, "theme");
  const toneGroups = groupByField(withEngagement, "tone");

  const timeGroups = new Map<string, { total: number; count: number }>();
  for (const record of withEngagement) {
    if (!record.publishedAt) continue;
    const day = DAY_NAMES[record.publishedAt.getDay()];
    const hour = record.publishedAt.getHours();
    const key = `${day}-${hour}`;
    const existing = timeGroups.get(key) || { total: 0, count: 0 };
    existing.total += record.engagementScore;
    existing.count += 1;
    timeGroups.set(key, existing);
  }

  const bestPostingTimes = Array.from(timeGroups.entries())
    .map(([key, data]) => {
      const [day, hourStr] = key.split("-");
      return {
        day,
        hour: parseInt(hourStr, 10),
        avgEngagement: Math.round((data.total / data.count) * 10) / 10,
      };
    })
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5);

  const rejectedTasks = await db
    .select()
    .from(agentTasks)
    .where(and(eq(agentTasks.userId, userId), eq(agentTasks.status, "rejected")))
    .orderBy(desc(agentTasks.updatedAt))
    .limit(20);

  const rejectedTopics = rejectedTasks
    .map((t) => {
      const input = parseJsonField<Record<string, any>>(t.inputData, {});
      return input.topic || input.theme || t.title;
    })
    .filter(Boolean) as string[];

  const approvedTasks = await db
    .select()
    .from(agentTasks)
    .where(
      and(
        eq(agentTasks.userId, userId),
        or(eq(agentTasks.status, "approved"), eq(agentTasks.status, "completed"))
      )
    )
    .orderBy(desc(agentTasks.approvedAt))
    .limit(20);

  const approvedTopics = approvedTasks
    .map((t) => {
      const input = parseJsonField<Record<string, any>>(t.inputData, {});
      return input.topic || input.theme || t.title;
    })
    .filter(Boolean) as string[];

  const insights: string[] = [];

  if (topPerformingPosts.length > 0) {
    const best = topPerformingPosts[0];
    insights.push(
      `Meilleur post: "${contentPreview(best.title || best.content, 60)}" (${best.engagementScore} pts d'engagement)`
    );
  }

  if (themeGroups.length > 0) {
    insights.push(
      `Thème le plus performant: "${themeGroups[0].key}" (${themeGroups[0].avgEngagement} pts en moyenne)`
    );
  }

  if (themeGroups.length > 1) {
    const worst = themeGroups[themeGroups.length - 1];
    if (worst.count >= 2) {
      insights.push(
        `Thème à éviter ou retravailler: "${worst.key}" (${worst.avgEngagement} pts en moyenne)`
      );
    }
  }

  if (toneGroups.length > 0) {
    insights.push(`Ton le plus efficace: "${toneGroups[0].key}"`);
  }

  if (bestPostingTimes.length > 0) {
    const best = bestPostingTimes[0];
    insights.push(`Meilleur créneau: ${best.day} vers ${best.hour}h`);
  }

  if (rejectedTopics.length > 0) {
    insights.push(`${rejectedTopics.length} sujet(s) rejeté(s) par l'utilisateur — à éviter`);
  }

  return {
    totalPosts: records.length,
    publishedPosts: records.filter((r) => r.publishedAt).length,
    avgEngagement,
    avgEngagementRate,
    topPerformingPosts,
    underperformingPosts,
    bestThemes: themeGroups.slice(0, 5).map((g) => ({
      theme: g.key,
      avgEngagement: g.avgEngagement,
      count: g.count,
    })),
    worstThemes: themeGroups.slice(-3).reverse().map((g) => ({
      theme: g.key,
      avgEngagement: g.avgEngagement,
      count: g.count,
    })),
    bestTones: toneGroups.slice(0, 3).map((g) => ({
      tone: g.key,
      avgEngagement: g.avgEngagement,
      count: g.count,
    })),
    bestPostingTimes,
    rejectedTopics,
    approvedTopics,
    insights,
  };
}

async function upsertAgentMemory(
  agentId: number,
  userId: number,
  data: {
    type: MemoryType;
    key: string;
    value: unknown;
    importance?: MemoryImportance;
    source?: string;
    context?: string;
  }
): Promise<void> {
  const db = (await getDb())!;

  const [existing] = await db
    .select()
    .from(agentMemory)
    .where(and(eq(agentMemory.agentId, agentId), eq(agentMemory.key, data.key)));

  if (existing) {
    await db
      .update(agentMemory)
      .set({
        value: JSON.stringify(data.value),
        importance: data.importance || existing.importance,
        context: data.context || existing.context,
        source: data.source || existing.source,
      })
      .where(eq(agentMemory.id, existing.id));
  } else {
    await db.insert(agentMemory).values({
      agentId,
      userId,
      type: data.type,
      key: data.key,
      value: JSON.stringify(data.value),
      importance: data.importance || "medium",
      source: data.source,
      context: data.context,
    });
  }
}

/**
 * Stocke les insights de performance dans la mémoire de l'agent.
 */
export async function storePerformanceInsights(
  agentId: number,
  userId: number,
  analysis: UserPerformanceAnalysis
): Promise<void> {
  await upsertAgentMemory(agentId, userId, {
    type: "performance_insight",
    key: "performance_overview",
    value: {
      totalPosts: analysis.totalPosts,
      avgEngagement: analysis.avgEngagement,
      avgEngagementRate: analysis.avgEngagementRate,
      insights: analysis.insights,
      updatedAt: new Date().toISOString(),
    },
    importance: "high",
    source: "performance_analysis",
  });

  if (analysis.bestThemes.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "performance_insight",
      key: "best_themes",
      value: analysis.bestThemes,
      importance: "high",
      source: "performance_analysis",
    });
  }

  if (analysis.worstThemes.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "performance_insight",
      key: "worst_themes",
      value: analysis.worstThemes,
      importance: "high",
      source: "performance_analysis",
    });
  }

  if (analysis.bestTones.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "performance_insight",
      key: "best_tones",
      value: analysis.bestTones,
      importance: "medium",
      source: "performance_analysis",
    });
  }

  if (analysis.bestPostingTimes.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "performance_insight",
      key: "best_posting_times",
      value: analysis.bestPostingTimes,
      importance: "medium",
      source: "performance_analysis",
    });
  }

  if (analysis.topPerformingPosts.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "best_practice",
      key: "top_performing_posts",
      value: analysis.topPerformingPosts.map((p) => ({
        preview: contentPreview(p.content, 200),
        theme: p.theme,
        tone: p.tone,
        engagementScore: p.engagementScore,
      })),
      importance: "critical",
      source: "performance_analysis",
    });
  }

  if (analysis.rejectedTopics.length > 0) {
    await upsertAgentMemory(agentId, userId, {
      type: "feedback",
      key: "rejected_topics",
      value: analysis.rejectedTopics,
      importance: "critical",
      source: "user_feedback",
      context: "Sujets rejetés par l'utilisateur — ne pas reproposer",
    });
  }
}

/**
 * Synchronise l'apprentissage pour tous les agents d'un utilisateur (ou un agent spécifique).
 */
export async function syncUserLearning(userId: number, agentId?: number): Promise<void> {
  const db = (await getDb())!;
  const analysis = await analyzeUserPerformance(userId);

  let targetAgents: Array<{ id: number }>;
  if (agentId) {
    targetAgents = [{ id: agentId }];
  } else {
    targetAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, userId));
  }

  for (const agent of targetAgents) {
    await storePerformanceInsights(agent.id, userId, analysis);
  }
}

/**
 * Construit le contexte d'apprentissage pour enrichir les prompts IA.
 */
export async function buildLearningContext(
  userId: number,
  agentId?: number
): Promise<LearningContext> {
  const analysis = await analyzeUserPerformance(userId);
  const db = (await getDb())!;

  let approvalRate = 0;
  if (agentId) {
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    if (agent[0]) {
      const total = (agent[0].tasksApproved ?? 0) + (agent[0].tasksRejected ?? 0);
      approvalRate = total > 0 ? Math.round(((agent[0].tasksApproved ?? 0) / total) * 100) : 0;
    }
  }

  const topPerformingTopics = analysis.bestThemes.map((t) => t.theme);
  const underperformingTopics = analysis.worstThemes.map((t) => t.theme);
  const bestTones = analysis.bestTones.map((t) => t.tone);
  const bestPostingTimes = analysis.bestPostingTimes.map(
    (t) => `${t.day} ${t.hour}h (${t.avgEngagement} pts)`
  );

  const avoidPatterns = [
    ...analysis.rejectedTopics.slice(0, 5),
    ...underperformingTopics.slice(0, 3),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const successfulExamples = analysis.topPerformingPosts
    .slice(0, 3)
    .map((p) => `"${contentPreview(p.title || p.content, 80)}" (${p.engagementScore} pts)`);

  const failedExamples = analysis.underperformingPosts
    .slice(0, 2)
    .map((p) => `"${contentPreview(p.title || p.content, 80)}" (${p.engagementScore} pts)`);

  const insightsSummary =
    analysis.insights.length > 0
      ? analysis.insights.join(". ")
      : analysis.totalPosts === 0
        ? "Pas encore assez de données publiées — explorer les sujets du profil utilisateur."
        : "Données limitées — privilégier les sujets approuvés par l'utilisateur.";

  return {
    insightsSummary,
    topPerformingTopics,
    underperformingTopics,
    bestTones,
    avoidPatterns,
    successfulExamples,
    failedExamples,
    bestPostingTimes,
    approvalRate,
  };
}

/**
 * Enregistre le feedback d'approbation d'une tâche agent.
 */
export async function recordTaskApproval(
  agentId: number,
  userId: number,
  task: {
    id: number;
    type: string;
    title: string;
    inputData?: unknown;
    outputData?: unknown;
  },
  modifications?: Record<string, unknown>
): Promise<void> {
  const input = parseJsonField<Record<string, any>>(task.inputData, {});
  const output = parseJsonField<Record<string, any>>(task.outputData, {});

  await upsertAgentMemory(agentId, userId, {
    type: "feedback",
    key: `approval_${task.id}`,
    value: {
      approved: true,
      taskType: task.type,
      topic: input.topic || input.theme || task.title,
      tone: input.tone || output.metadata?.tone,
      postType: input.postType || output.metadata?.postType,
      modifications: modifications || null,
      approvedAt: new Date().toISOString(),
    },
    importance: modifications ? "high" : "medium",
    source: "user_feedback",
  });

  if (modifications) {
    await upsertAgentMemory(agentId, userId, {
      type: "content_style",
      key: `style_from_modification_${task.id}`,
      value: {
        originalTopic: input.topic || task.title,
        modifications,
        learnedAt: new Date().toISOString(),
      },
      importance: "high",
      source: "user_modification",
    });
  }

  await syncUserLearning(userId, agentId);
}

/**
 * Enregistre une publication réussie pour l'apprentissage futur.
 */
export async function recordPublishedPost(
  userId: number,
  data: {
    content: string;
    theme?: string;
    tone?: string;
    postType?: string;
    linkedinPostId?: string;
    source: "generator" | "agent" | "auto_publish";
    agentId?: number;
  }
): Promise<void> {
  const db = (await getDb())!;

  const targetAgentId = data.agentId
    ? data.agentId
    : (
        await db
          .select({ id: agents.id })
          .from(agents)
          .where(and(eq(agents.userId, userId), eq(agents.type, "content_creator")))
          .limit(1)
      )[0]?.id;

  if (!targetAgentId) return;

  await upsertAgentMemory(targetAgentId, userId, {
    type: "topic_expertise",
    key: `published_${Date.now()}`,
    value: {
      theme: data.theme,
      tone: data.tone,
      postType: data.postType,
      preview: contentPreview(data.content, 150),
      linkedinPostId: data.linkedinPostId,
      source: data.source,
      publishedAt: new Date().toISOString(),
    },
    importance: "medium",
    source: "publication",
  });
}

/**
 * Analyse périodique pour tous les utilisateurs actifs.
 */
export async function syncAllUsersLearning(): Promise<{ synced: number; errors: string[] }> {
  const db = (await getDb())!;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeAgents = await db
    .select({ userId: agents.userId, id: agents.id })
    .from(agents)
    .where(and(eq(agents.status, "active"), gte(agents.lastActiveAt, thirtyDaysAgo)));

  const userIds = Array.from(new Set(activeAgents.map((a) => a.userId)));
  let synced = 0;
  const errors: string[] = [];

  for (const userId of userIds) {
    try {
      await syncUserLearning(userId);
      synced++;
    } catch (err) {
      errors.push(
        `User ${userId}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  return { synced, errors };
}
