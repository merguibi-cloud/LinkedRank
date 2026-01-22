/**
 * Content Creator Agent
 * 
 * An AI agent that generates personalized LinkedIn content based on:
 * - User's profile and business context
 * - Past content performance
 * - User feedback and preferences
 * - Current trends
 */

import { 
  createTask, 
  updateTaskStatus, 
  addMemory, 
  getAgentMemories,
  getRelevantMemories,
  logAgentActivity,
  getAgentById
} from "../services/agentService";
import { generateLinkedInPost } from "../services/ai";

// Content format type
type ContentFormat = "citation" | "carousel" | "infographic" | "story" | "tips" | "question" | "text";
import { getDb } from "../db";
import { userProfiles, linkedinPosts, generatedPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { 
  TaskInputData, 
  TaskOutputData,
  AgentMemory,
  ContentFormat as ContentType
} from "../../shared/agentTypes";

// Content formats the agent can generate
type GeneratableFormat = "text" | "carousel" | "infographic" | "poll";

interface ContentGenerationContext {
  userProfile: any;
  pastPosts: any[];
  memories: AgentMemory[];
  preferences: ContentPreferences;
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
  }): Promise<{ taskId: number; content?: TaskOutputData }> {
    // Create a task for this generation
    const task = await createTask(this.agentId, this.userId, {
      type: "generate_post",
      title: input.topic 
        ? `Générer un post sur: ${input.topic}`
        : "Générer un post personnalisé",
      description: `Format: ${input.format || "text"}, Ton: ${input.tone || "auto"}`,
      inputData: input as TaskInputData,
    });
    
    try {
      // Update task status to in_progress
      await updateTaskStatus(task.id, "in_progress");
      
      // Gather context for generation
      const context = await this.gatherContext();
      
      // Determine the best topic if not provided
      const topic = input.topic || await this.suggestTopic(context);
      
      // Determine the best format
      const format = input.format || this.suggestFormat(topic, context);
      
      // Generate the content
      const generatedContent = await this.createContent({
        topic,
        format,
        tone: input.tone || context.preferences.tone,
        keywords: input.keywords,
        context,
      });
      
      // Prepare output data
      const outputData: TaskOutputData = {
        generatedContent: generatedContent.content,
        generatedTitle: generatedContent.title,
        hashtags: generatedContent.hashtags,
        imageUrl: generatedContent.imageUrl,
      };
      
      // Check if approval is required
      const agent = await getAgentById(this.agentId);
      
      if (agent?.requiresApproval) {
        await updateTaskStatus(task.id, "awaiting_approval", outputData);
        await logAgentActivity(
          this.agentId, 
          this.userId, 
          "content_generated", 
          "info",
          `Contenu généré sur "${topic}" - En attente d'approbation`,
          task.id
        );
      } else {
        await updateTaskStatus(task.id, "completed", outputData);
        await logAgentActivity(
          this.agentId, 
          this.userId, 
          "content_generated", 
          "info",
          `Contenu généré et approuvé automatiquement sur "${topic}"`,
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
    
    // Get user profile
    const [userProfile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, this.userId));
    
    // Get past posts for style learning
    const pastPosts = await db.select()
      .from(linkedinPosts)
      .where(eq(linkedinPosts.status, "published"))
      .orderBy(desc(linkedinPosts.publishedAt))
      .limit(20);
    
    // Get agent memories
    const memories = await getRelevantMemories(this.agentId, "generate_post");
    
    // Extract preferences from memories and profile
    const preferences = this.extractPreferences(userProfile, memories);
    
    return {
      userProfile,
      pastPosts,
      memories,
      preferences,
    };
  }
  
  /**
   * Extract content preferences from profile and memories
   */
  private extractPreferences(
    profile: any, 
    memories: AgentMemory[]
  ): ContentPreferences {
    // Default preferences
    const defaults: ContentPreferences = {
      tone: profile?.preferredTone || "professional",
      topics: [],
      avoidTopics: [],
      writingStyle: "engaging",
      hashtagStyle: "moderate",
      emojiUsage: "minimal",
      postLength: "medium",
    };
    
    // Override with memories
    for (const memory of memories) {
      if (memory.type === "user_preference") {
        if (memory.key === "preferred_topics") {
          defaults.topics = memory.value;
        } else if (memory.key === "avoid_topics") {
          defaults.avoidTopics = memory.value;
        } else if (memory.key === "writing_style") {
          defaults.writingStyle = memory.value;
        } else if (memory.key === "hashtag_style") {
          defaults.hashtagStyle = memory.value;
        } else if (memory.key === "emoji_usage") {
          defaults.emojiUsage = memory.value;
        } else if (memory.key === "post_length") {
          defaults.postLength = memory.value;
        }
      }
      
      if (memory.type === "content_style" && memory.key === "tone") {
        defaults.tone = memory.value;
      }
    }
    
    // Add topics from profile
    if (profile?.expertise) {
      try {
        const expertise = JSON.parse(profile.expertise);
        defaults.topics = [...defaults.topics, ...expertise];
      } catch {}
    }
    
    return defaults;
  }
  
  /**
   * Suggest a topic based on context
   */
  private async suggestTopic(context: ContentGenerationContext): Promise<string> {
    const topics = [
      ...context.preferences.topics,
      "leadership",
      "productivité",
      "innovation",
      "développement personnel",
      "entrepreneuriat",
    ];
    
    // Filter out recently used topics
    const recentTopics = context.pastPosts
      .slice(0, 5)
      .map(p => p.theme)
      .filter(Boolean);
    
    const availableTopics = topics.filter(t => !recentTopics.includes(t));
    
    // Return a random topic from available ones
    return availableTopics[Math.floor(Math.random() * availableTopics.length)] 
      || topics[0];
  }
  
  /**
   * Suggest the best format for a topic
   */
  private suggestFormat(
    topic: string, 
    context: ContentGenerationContext
  ): GeneratableFormat {
    // Analyze past performance by format
    const formatPerformance: Record<string, number> = {
      text: 0,
      carousel: 0,
      infographic: 0,
      poll: 0,
    };
    
    for (const post of context.pastPosts) {
      const engagement = (post.likes || 0) + (post.comments || 0) * 2;
      const format = post.mediaType === "none" ? "text" : post.mediaType;
      if (formatPerformance[format] !== undefined) {
        formatPerformance[format] += engagement;
      }
    }
    
    // Educational topics work well with carousels
    const educationalKeywords = ["comment", "étapes", "guide", "conseils", "tips"];
    if (educationalKeywords.some(k => topic.toLowerCase().includes(k))) {
      return "carousel";
    }
    
    // Data-heavy topics work well with infographics
    const dataKeywords = ["statistiques", "chiffres", "données", "étude"];
    if (dataKeywords.some(k => topic.toLowerCase().includes(k))) {
      return "infographic";
    }
    
    // Default to text for most topics
    return "text";
  }
  
  /**
   * Create the actual content
   */
  private async createContent(params: {
    topic: string;
    format: GeneratableFormat;
    tone: string;
    keywords?: string[];
    context: ContentGenerationContext;
  }): Promise<{
    content: string;
    title: string;
    hashtags: string[];
    imageUrl?: string;
  }> {
    const { topic, format, tone, keywords, context } = params;
    
    // Build the prompt with context
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(topic, format, tone, keywords);
    
    // Use the AI service to generate content
    const content = await generateLinkedInPost({
      topic,
      tone,
      language: "FR",
      contentFormat: format,
    });
    
    const result = { content, title: topic, imageUrl: undefined };
    
    // Extract hashtags from content or generate them
    const hashtags = this.extractOrGenerateHashtags(result.content, topic);
    
    return {
      content: result.content,
      title: result.title || topic,
      hashtags,
      imageUrl: result.imageUrl,
    };
  }
  
  /**
   * Build system prompt with agent context
   */
  private buildSystemPrompt(context: ContentGenerationContext): string {
    const { userProfile, preferences, memories } = context;
    
    let prompt = `Tu es un expert en création de contenu LinkedIn pour des professionnels.
Tu dois générer du contenu engageant et authentique.

`;
    
    // Add user context
    if (userProfile) {
      prompt += `CONTEXTE UTILISATEUR:
- Entreprise: ${userProfile.companyName || "Non spécifié"}
- Secteur: ${userProfile.industry || "Non spécifié"}
- Expertise: ${userProfile.expertise || "Non spécifié"}
- Bio: ${userProfile.personalBio || "Non spécifié"}

`;
    }
    
    // Add preferences
    prompt += `PRÉFÉRENCES DE STYLE:
- Ton: ${preferences.tone}
- Style d'écriture: ${preferences.writingStyle}
- Longueur: ${preferences.postLength}
- Hashtags: ${preferences.hashtagStyle}
- Emojis: ${preferences.emojiUsage}

`;
    
    // Add learnings from memories
    const feedbackMemories = memories.filter(m => m.type === "feedback");
    if (feedbackMemories.length > 0) {
      prompt += `APPRENTISSAGES DES RETOURS PRÉCÉDENTS:
`;
      for (const memory of feedbackMemories.slice(0, 5)) {
        if (memory.value.rejectionReason) {
          prompt += `- Éviter: ${memory.value.rejectionReason}\n`;
        }
      }
      prompt += "\n";
    }
    
    // Add best practices
    const bestPractices = memories.filter(m => m.type === "best_practice");
    if (bestPractices.length > 0) {
      prompt += `BONNES PRATIQUES À SUIVRE:
`;
      for (const bp of bestPractices) {
        prompt += `- ${bp.value}\n`;
      }
    }
    
    return prompt;
  }
  
  /**
   * Build user prompt for content generation
   */
  private buildUserPrompt(
    topic: string, 
    format: GeneratableFormat, 
    tone: string,
    keywords?: string[]
  ): string {
    let prompt = `Génère un post LinkedIn sur le sujet: "${topic}"

Format: ${format}
Ton: ${tone}
`;
    
    if (keywords && keywords.length > 0) {
      prompt += `Mots-clés à inclure: ${keywords.join(", ")}\n`;
    }
    
    prompt += `
INSTRUCTIONS:
1. Commence par un hook accrocheur qui capte l'attention
2. Développe le sujet avec des insights pertinents
3. Termine par un appel à l'action ou une question engageante
4. Le contenu doit être authentique et apporter de la valeur

Génère uniquement le contenu du post, sans commentaires supplémentaires.`;
    
    return prompt;
  }
  
  /**
   * Extract or generate hashtags
   */
  private extractOrGenerateHashtags(content: string, topic: string): string[] {
    // Extract existing hashtags from content
    const existingHashtags = content.match(/#\w+/g) || [];
    
    if (existingHashtags.length >= 3) {
      return existingHashtags.slice(0, 5);
    }
    
    // Generate additional hashtags based on topic
    const topicHashtags = [
      `#${topic.replace(/\s+/g, "")}`,
      "#LinkedIn",
      "#PersonalBranding",
      "#Leadership",
      "#Entrepreneuriat",
    ];
    
    const allHashtags = [...existingHashtags, ...topicHashtags];
    const uniqueHashtags = allHashtags.filter((tag, index) => allHashtags.indexOf(tag) === index);
    return uniqueHashtags.slice(0, 5);
  }
  
  /**
   * Learn from user feedback
   */
  async learnFromFeedback(taskId: number, feedback: {
    approved: boolean;
    rating?: number;
    comments?: string;
    modifications?: string;
  }): Promise<void> {
    const memoryKey = `feedback_${taskId}`;
    
    await addMemory(this.agentId, this.userId, {
      type: "feedback",
      key: memoryKey,
      value: feedback,
      importance: feedback.approved ? "medium" : "high",
      source: "user_feedback",
      context: feedback.comments,
    });
    
    // If there are specific modifications, learn from them
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
        status: "planned" | "generated";
      }> = [];
      
      // Generate topics for each day
      const topics = await this.generateTopicsForPeriod(days, context);
      
      const startDate = new Date();
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Skip weekends for professional content
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const topic = topics[i % topics.length];
        const format = this.suggestFormat(topic, context);
        
        calendar.push({
          date,
          topic,
          format,
          status: "planned",
        });
      }
      
      const outputData: TaskOutputData = {
        recommendations: calendar.map(c => 
          `${c.date.toLocaleDateString("fr-FR")}: ${c.topic} (${c.format})`
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
  
  /**
   * Generate diverse topics for a period
   */
  private async generateTopicsForPeriod(
    days: number, 
    context: ContentGenerationContext
  ): Promise<string[]> {
    const baseTopics = [
      ...context.preferences.topics,
      "Leadership et management",
      "Productivité et organisation",
      "Innovation et technologie",
      "Développement personnel",
      "Networking et relations",
      "Stratégie d'entreprise",
      "Communication professionnelle",
      "Gestion du temps",
      "Motivation et mindset",
      "Tendances du marché",
    ];
    
    // Filter out avoided topics
    const filteredTopics = baseTopics.filter(
      t => !context.preferences.avoidTopics.some(
        avoid => t.toLowerCase().includes(avoid.toLowerCase())
      )
    );
    
    // Shuffle and return enough topics
    return this.shuffleArray(filteredTopics).slice(0, days);
  }
  
  /**
   * Shuffle an array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Factory function to create a Content Creator Agent
 */
export function createContentCreatorAgent(
  agentId: number, 
  userId: number
): ContentCreatorAgent {
  return new ContentCreatorAgent(agentId, userId);
}
