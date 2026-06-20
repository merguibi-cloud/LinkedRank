/**
 * Content Creator Agent
 *
 * An AI agent that generates personalized LinkedIn content based on:
 * - User's profile and business context
 * - Past content performance
 * - User feedback and preferences
 * - Current trends
 * - Editorial choices catalog (angles, hooks, formats)
 */

import {
  createTask,
  updateTaskStatus,
  addMemory,
  getRelevantMemories,
  logAgentActivity,
  getAgentById,
} from "../services/agentService";
import { generateLinkedInPost } from "../services/ai";
import {
  LINKEDIN_ENGAGEMENT_METHOD,
  LINKEDIN_CIT_METHOD,
  LINKEDIN_ALGORITHM_TIPS,
  LINKEDIN_POST_STRUCTURE_CHECKLIST,
} from "../services/linkedinPostMethodology";
import { buildLearningContext } from "../services/agentLearningService";
import {
  type ContentAngleId,
  type GeneratableFormat,
  type ContentChoice,
  buildContentChoice,
  buildPersonalContext,
  resolveAiFormat,
  getEditorialMix,
  getAngleById,
  pickHookForAngle,
  inferAngleFromContent,
  computeAnglePerformance,
  computeFormatPerformance,
  TOPIC_PILLARS,
} from "../services/contentChoices";
import { getDb } from "../db";
import { userProfiles, generatedPosts } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import type { TaskInputData, TaskOutputData, AgentMemory } from "../../shared/agentTypes";

interface ContentGenerationContext {
  userProfile: any;
  pastPosts: any[];
  memories: AgentMemory[];
  preferences: ContentPreferences;
  learning: Awaited<ReturnType<typeof buildLearningContext>>;
  anglePerformance: Partial<Record<ContentAngleId, number>>;
  formatPerformance: Partial<Record<GeneratableFormat, number>>;
  recentAngles: ContentAngleId[];
  recentTopics: string[];
}

interface ContentPreferences {
  tone: string;
  topics: string[];
  avoidTopics: string[];
  writingStyle: string;
  hashtagStyle: "minimal" | "moderate" | "heavy";
  emojiUsage: "none" | "minimal" | "moderate";
  postLength: "short" | "medium" | "long";
}

/**
 * Content Creator Agent Class
 */
export class ContentCreatorAgent {
  private agentId: number;
  private userId: number;

  constructor(agentId: number, userId: number) {
    this.agentId = agentId;
    this.userId = userId;
  }

  /**
   * Generate content based on a topic or let the agent choose
   */
  async generateContent(input: {
    topic?: string;
    format?: GeneratableFormat;
    tone?: string;
    keywords?: string[];
    inspirationPosts?: string[];
    angle?: ContentAngleId;
  }): Promise<{ taskId: number; content?: TaskOutputData }> {
    const task = await createTask(this.agentId, this.userId, {
      type: "generate_post",
      title: input.topic ? `Générer un post sur: ${input.topic}` : "Générer un post personnalisé",
      description: `Format: ${input.format || "auto"}, Ton: ${input.tone || "auto"}`,
      inputData: input as TaskInputData,
    });

    try {
      await updateTaskStatus(task.id, "in_progress");

      const context = await this.gatherContext();

      const choice = this.resolveEditorialChoice(input, context);

      const generatedContent = await this.createContent({
        choice,
        tone: input.tone || choice.tone || context.preferences.tone,
        keywords: input.keywords,
        context,
      });

      const outputData: TaskOutputData = {
        generatedContent: generatedContent.content,
        generatedTitle: generatedContent.title,
        hashtags: generatedContent.hashtags,
        imageUrl: generatedContent.imageUrl,
        recommendations: [choice.rationale],
      };

      const agent = await getAgentById(this.agentId);

      if (agent?.requiresApproval) {
        await updateTaskStatus(task.id, "awaiting_approval", outputData);
        await logAgentActivity(
          this.agentId,
          this.userId,
          "content_generated",
          "info",
          `Contenu généré — ${choice.rationale} — En attente d'approbation`,
          task.id
        );
      } else {
        await updateTaskStatus(task.id, "completed", outputData);
        await logAgentActivity(
          this.agentId,
          this.userId,
          "content_generated",
          "info",
          `Contenu généré et approuvé automatiquement — ${choice.rationale}`,
          task.id
        );
      }

      return { taskId: task.id, content: outputData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateTaskStatus(task.id, "failed", undefined, errorMessage);
      await logAgentActivity(
        this.agentId,
        this.userId,
        "content_generation_failed",
        "error",
        `Échec de génération: ${errorMessage}`,
        task.id
      );
      throw error;
    }
  }

  /**
   * Gather all context needed for content generation
   */
  private async gatherContext(): Promise<ContentGenerationContext> {
    const db = (await getDb())!;

    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, this.userId));

    const pastPosts = await db
      .select()
      .from(generatedPosts)
      .where(and(eq(generatedPosts.userId, this.userId), eq(generatedPosts.status, "published")))
      .orderBy(desc(generatedPosts.publishedAt))
      .limit(20);

    const memories = await getRelevantMemories(this.agentId, "generate_post");
    const preferences = this.extractPreferences(userProfile, memories);
    const learning = await buildLearningContext(this.userId, this.agentId);

    const anglePerformance = computeAnglePerformance(pastPosts);
    const formatPerformance = computeFormatPerformance(pastPosts);

    const recentAngles = pastPosts
      .slice(0, 5)
      .map((p) => inferAngleFromContent(p.content))
      .filter(Boolean) as ContentAngleId[];

    const recentTopics = pastPosts
      .slice(0, 5)
      .map((p) => p.theme)
      .filter(Boolean) as string[];

    return {
      userProfile,
      pastPosts,
      memories,
      preferences,
      learning,
      anglePerformance,
      formatPerformance,
      recentAngles,
      recentTopics,
    };
  }

  /**
   * Résout le choix éditorial complet (sujet + angle + accroche + format)
   */
  private resolveEditorialChoice(
    input: { topic?: string; format?: GeneratableFormat; angle?: ContentAngleId },
    context: ContentGenerationContext
  ): ContentChoice {
    if (input.topic && input.angle) {
      const angle = getAngleById(input.angle);
      const hook = pickHookForAngle(input.angle);
      const format = input.format || angle.preferredMedia || "text";
      return {
        topic: input.topic,
        angle,
        hook,
        format,
        tone: context.preferences.tone,
        rationale: `Sujet imposé · angle ${angle.name}`,
      };
    }

    const choice = buildContentChoice({
      topic: input.topic,
      profileTopics: context.preferences.topics,
      industry: context.userProfile?.industry,
      learning: context.learning,
      avoidTopics: [
        ...context.preferences.avoidTopics,
        ...(context.learning.avoidPatterns || []),
      ],
      recentTopics: context.recentTopics,
      recentAngles: context.recentAngles,
      anglePerformance: context.anglePerformance,
      formatPerformance: context.formatPerformance,
      preferredTone: context.preferences.tone,
    });

    if (input.format) choice.format = input.format;
    if (input.angle) choice.angle = getAngleById(input.angle);

    return choice;
  }

  /**
   * Extract content preferences from profile and memories
   */
  private extractPreferences(profile: any, memories: AgentMemory[]): ContentPreferences {
    const defaults: ContentPreferences = {
      tone: profile?.preferredTone || "professional",
      topics: [],
      avoidTopics: [],
      writingStyle: "engaging",
      hashtagStyle: "moderate",
      emojiUsage: "minimal",
      postLength: "medium",
    };

    for (const memory of memories) {
      if (memory.type === "user_preference") {
        if (memory.key === "preferred_topics") defaults.topics = memory.value;
        else if (memory.key === "avoid_topics") defaults.avoidTopics = memory.value;
        else if (memory.key === "writing_style") defaults.writingStyle = memory.value;
        else if (memory.key === "hashtag_style") defaults.hashtagStyle = memory.value;
        else if (memory.key === "emoji_usage") defaults.emojiUsage = memory.value;
        else if (memory.key === "post_length") defaults.postLength = memory.value;
      }
      if (memory.type === "content_style" && memory.key === "tone") {
        defaults.tone = memory.value;
      }
    }

    if (profile?.expertise) {
      try {
        const expertise = JSON.parse(profile.expertise);
        defaults.topics = [...defaults.topics, ...expertise];
      } catch {
        /* ignore */
      }
    }

    return defaults;
  }

  /**
   * Create the actual content
   */
  private async createContent(params: {
    choice: ContentChoice;
    tone: string;
    keywords?: string[];
    context: ContentGenerationContext;
  }): Promise<{
    content: string;
    title: string;
    hashtags: string[];
    imageUrl?: string;
  }> {
    const { choice, tone, keywords, context } = params;
    const { topic, angle, hook, format } = choice;

    const pastPostPreviews = context.pastPosts
      .slice(0, 3)
      .map((p) => p.content.replace(/\s+/g, " ").trim().slice(0, 100));

    const personalContext = buildPersonalContext({
      angle,
      hook,
      learning: context.learning,
      profile: {
        companyName: context.userProfile?.companyName,
        industry: context.userProfile?.industry,
        personalBio: context.userProfile?.personalBio,
        expertise: context.userProfile?.expertise,
      },
      pastPostPreviews,
    });

    const aiFormat = resolveAiFormat(format, angle);
    const contentLength = context.preferences.postLength;
    const includeEmojis = context.preferences.emojiUsage !== "none";

    let enrichedTopic = topic;
    if (keywords?.length) {
      enrichedTopic += ` (mots-clés: ${keywords.join(", ")})`;
    }

    const content = await generateLinkedInPost({
      topic: enrichedTopic,
      tone,
      language: "FR",
      contentFormat: aiFormat,
      sector: context.userProfile?.industry || "Business",
      personalContext,
      contentLength,
      includeEmojis,
      includeHashtags: context.preferences.hashtagStyle !== "minimal",
      includeCallToAction: true,
    });

    const hashtags = this.extractOrGenerateHashtags(content, topic);

    return {
      content,
      title: topic,
      hashtags,
      imageUrl: undefined,
    };
  }

  /**
   * Build system prompt with agent context (used for future LLM direct calls)
   */
  private buildSystemPrompt(context: ContentGenerationContext): string {
    const { userProfile, preferences, memories } = context;

    let prompt = `Tu es un expert en création de contenu LinkedIn pour des professionnels.
Tu dois générer du contenu engageant et authentique en appliquant les méthodologies ci-dessous.

${LINKEDIN_ENGAGEMENT_METHOD}

${LINKEDIN_CIT_METHOD}

${LINKEDIN_ALGORITHM_TIPS}

`;

    if (userProfile) {
      prompt += `CONTEXTE UTILISATEUR:
- Entreprise: ${userProfile.companyName || "Non spécifié"}
- Secteur: ${userProfile.industry || "Non spécifié"}
- Expertise: ${userProfile.expertise || "Non spécifié"}
- Bio: ${userProfile.personalBio || "Non spécifié"}

`;
    }

    prompt += `PRÉFÉRENCES DE STYLE:
- Ton: ${preferences.tone}
- Style d'écriture: ${preferences.writingStyle}
- Longueur: ${preferences.postLength}
- Hashtags: ${preferences.hashtagStyle}
- Emojis: ${preferences.emojiUsage}

`;

    if (context.learning.insightsSummary) {
      prompt += `PERFORMANCE DES PUBLICATIONS:
${context.learning.insightsSummary}
`;
      if (context.learning.successfulExamples?.length) {
        prompt += `Exemples performants: ${context.learning.successfulExamples.join(" | ")}\n`;
      }
      prompt += "\n";
    }

    const feedbackMemories = memories.filter((m) => m.type === "feedback");
    if (feedbackMemories.length > 0) {
      prompt += `APPRENTISSAGES DES RETOURS PRÉCÉDENTS:
`;
      for (const memory of feedbackMemories.slice(0, 5)) {
        if (memory.value.rejectionReason) {
          prompt += `- Éviter: ${memory.value.rejectionReason}\n`;
        }
        if (memory.value.approved && memory.value.topic) {
          prompt += `- Sujet approuvé: ${memory.value.topic}\n`;
        }
      }
      prompt += "\n";
    }

    return prompt;
  }

  /**
   * Build user prompt for content generation
   */
  private buildUserPrompt(
    choice: ContentChoice,
    tone: string,
    keywords?: string[]
  ): string {
    let prompt = `Génère un post LinkedIn sur le sujet: "${choice.topic}"

Angle éditorial: ${choice.angle.emoji} ${choice.angle.name} — ${choice.angle.description}
Accroche (${choice.hook.name}): ${choice.hook.template}
Format: ${choice.format}
Ton: ${tone}
`;

    if (keywords?.length) {
      prompt += `Mots-clés à inclure: ${keywords.join(", ")}\n`;
    }

    prompt += `
${LINKEDIN_POST_STRUCTURE_CHECKLIST}

Génère uniquement le contenu du post, sans commentaires supplémentaires.`;

    return prompt;
  }

  /**
   * Extract or generate hashtags
   */
  private extractOrGenerateHashtags(content: string, topic: string): string[] {
    const existingHashtags = content.match(/#\w+/g) || [];

    if (existingHashtags.length >= 3) {
      return existingHashtags.slice(0, 5);
    }

    const pillar = TOPIC_PILLARS.find(
      (p) => topic.toLowerCase().includes(p.name.toLowerCase()) || topic.toLowerCase().includes(p.id)
    );

    const topicHashtags = [
      `#${topic.replace(/\s+/g, "").replace(/[^a-zA-Z0-9À-ÿ]/g, "")}`,
      pillar ? `#${pillar.name.replace(/\s+/g, "")}` : "#LinkedIn",
      "#PersonalBranding",
      "#Leadership",
      "#Entrepreneuriat",
    ];

    const allHashtags = [...existingHashtags, ...topicHashtags];
    const unique = allHashtags.filter((tag, index) => allHashtags.indexOf(tag) === index);
    return unique.slice(0, 5);
  }

  /**
   * Learn from user feedback
   */
  async learnFromFeedback(
    taskId: number,
    feedback: {
      approved: boolean;
      rating?: number;
      comments?: string;
      modifications?: string;
    }
  ): Promise<void> {
    const memoryKey = `feedback_${taskId}`;

    await addMemory(this.agentId, this.userId, {
      type: "feedback",
      key: memoryKey,
      value: feedback,
      importance: feedback.approved ? "medium" : "high",
      source: "user_feedback",
      context: feedback.comments,
    });

    if (feedback.modifications) {
      await addMemory(this.agentId, this.userId, {
        type: "content_style",
        key: `style_learning_${Date.now()}`,
        value: {
          modification: feedback.modifications,
          learnedAt: new Date(),
        },
        importance: "high",
        source: "user_modification",
      });
    }

    await logAgentActivity(
      this.agentId,
      this.userId,
      "feedback_received",
      "info",
      `Feedback reçu: ${feedback.approved ? "Approuvé" : "Rejeté"}${feedback.comments ? ` - ${feedback.comments}` : ""}`,
      taskId
    );
  }

  /**
   * Generate a content calendar for the next N days
   */
  async generateContentCalendar(days: number = 30): Promise<{
    taskId: number;
    calendar?: Array<{
      date: Date;
      topic: string;
      format: GeneratableFormat;
      angle: ContentAngleId;
      status: "planned" | "generated";
    }>;
  }> {
    const task = await createTask(this.agentId, this.userId, {
      type: "schedule_post",
      title: `Planifier ${days} jours de contenu`,
      description: `Génération d'un calendrier éditorial pour ${days} jours`,
      inputData: { days } as any,
    });

    try {
      await updateTaskStatus(task.id, "in_progress");

      const context = await this.gatherContext();
      const calendar: Array<{
        date: Date;
        topic: string;
        format: GeneratableFormat;
        angle: ContentAngleId;
        status: "planned" | "generated";
      }> = [];

      const editorialMix = getEditorialMix(days);
      const usedTopics: string[] = [...context.recentTopics];

      const startDate = new Date();
      let mixIndex = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const angleId = editorialMix[mixIndex % editorialMix.length];
        mixIndex++;

        const choice = buildContentChoice({
          profileTopics: context.preferences.topics,
          industry: context.userProfile?.industry,
          learning: context.learning,
          avoidTopics: context.preferences.avoidTopics,
          recentTopics: usedTopics,
          recentAngles: calendar.map((c) => c.angle),
          anglePerformance: context.anglePerformance,
          formatPerformance: context.formatPerformance,
          preferredTone: context.preferences.tone,
        });

        choice.angle = getAngleById(angleId);

        usedTopics.push(choice.topic);

        calendar.push({
          date,
          topic: choice.topic,
          format: choice.format,
          angle: angleId,
          status: "planned",
        });
      }

      const outputData: TaskOutputData = {
        recommendations: calendar.map(
          (c) =>
            `${c.date.toLocaleDateString("fr-FR")}: ${c.topic} — ${getAngleById(c.angle).emoji} ${getAngleById(c.angle).name} (${c.format})`
        ),
      };

      await updateTaskStatus(task.id, "awaiting_approval", outputData);

      return { taskId: task.id, calendar };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateTaskStatus(task.id, "failed", undefined, errorMessage);
      throw error;
    }
  }
}

/**
 * Factory function to create a Content Creator Agent
 */
export function createContentCreatorAgent(agentId: number, userId: number): ContentCreatorAgent {
  return new ContentCreatorAgent(agentId, userId);
}
