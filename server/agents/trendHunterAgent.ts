/**
 * Trend Hunter Agent
 * 
 * An AI agent that monitors LinkedIn and other sources to detect
 * trending topics and content opportunities
 */

import { 
  createTask, 
  updateTaskStatus, 
  addMemory, 
  getAgentMemories,
  logAgentActivity,
  getAgentById
} from "../services/agentService";
import { getDb } from "../db";
import { viralPosts } from "../../drizzle/schema";
import { desc, sql } from "drizzle-orm";
import type { 
  TaskInputData, 
  TaskOutputData,
  AgentMemory
} from "../../shared/agentTypes";

// Trend categories
export type TrendCategory = 
  | "technology" 
  | "business" 
  | "leadership" 
  | "marketing" 
  | "career" 
  | "ai" 
  | "startup" 
  | "productivity";

export interface Trend {
  topic: string;
  category: TrendCategory;
  score: number; // 0-100 virality potential
  momentum: "rising" | "stable" | "declining";
  relatedHashtags: string[];
  samplePosts: string[];
  suggestedAngles: string[];
  detectedAt: Date;
}

export interface TrendAnalysis {
  trends: Trend[];
  topOpportunities: ContentOpportunity[];
  weeklyInsights: string[];
}

export interface ContentOpportunity {
  topic: string;
  reason: string;
  suggestedFormat: "text" | "carousel" | "infographic" | "video";
  urgency: "immediate" | "this_week" | "this_month";
  estimatedEngagement: "low" | "medium" | "high" | "viral";
}

/**
 * Trend Hunter Agent Class
 */
export class TrendHunterAgent {
  private agentId: number;
  private userId: number;
  
  constructor(agentId: number, userId: number) {
    this.agentId = agentId;
    this.userId = userId;
  }
  
  /**
   * Scan for current trends
   */
  async scanTrends(): Promise<{ taskId: number; analysis?: TrendAnalysis }> {
    const task = await createTask(this.agentId, this.userId, {
      type: "analyze_trends",
      title: "Analyse des tendances LinkedIn",
      description: "Scan des tendances actuelles et opportunités de contenu",
      inputData: {} as TaskInputData,
    });
    
    try {
      await updateTaskStatus(task.id, "in_progress");
      
      // Gather trend data from multiple sources
      const viralContent = await this.analyzeViralContent();
      const hashtagTrends = await this.analyzeHashtags();
      const industryTrends = await this.analyzeIndustryTrends();
      
      // Combine and rank trends
      const trends = this.combineTrends(viralContent, hashtagTrends, industryTrends);
      
      // Generate content opportunities
      const opportunities = this.generateOpportunities(trends);
      
      // Generate weekly insights
      const insights = this.generateInsights(trends, opportunities);
      
      const analysis: TrendAnalysis = {
        trends,
        topOpportunities: opportunities,
        weeklyInsights: insights,
      };
      
      // Store in memory for future reference
      await addMemory(this.agentId, this.userId, {
        type: "trend_analysis",
        key: `trends_${Date.now()}`,
        value: analysis,
        importance: "high",
        source: "trend_scan",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      const outputData: TaskOutputData = {
        recommendations: opportunities.map(o => 
          `[${o.urgency.toUpperCase()}] ${o.topic} - ${o.reason} (Format: ${o.suggestedFormat})`
        ),
      };
      
      // Check if approval is required
      const agent = await getAgentById(this.agentId);
      
      if (agent?.requiresApproval) {
        await updateTaskStatus(task.id, "awaiting_approval", outputData);
      } else {
        await updateTaskStatus(task.id, "completed", outputData);
      }
      
      await logAgentActivity(
        this.agentId,
        this.userId,
        "trends_analyzed",
        "info",
        `${trends.length} tendances détectées, ${opportunities.length} opportunités identifiées`,
        task.id
      );
      
      return { taskId: task.id, analysis };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateTaskStatus(task.id, "failed", undefined, errorMessage);
      await logAgentActivity(
        this.agentId,
        this.userId,
        "trend_scan_failed",
        "error",
        `Échec de l'analyse: ${errorMessage}`,
        task.id
      );
      throw error;
    }
  }
  
  /**
   * Analyze viral content from database
   */
  private async analyzeViralContent(): Promise<Trend[]> {
    const db = (await getDb())!;
    const trends: Trend[] = [];
    
    try {
      // Get recent viral posts
      const posts = await db.select()
        .from(viralPosts)
        .orderBy(desc(viralPosts.likes))
        .limit(50);
      
      // Extract topics and patterns
      const topicCounts: Record<string, number> = {};
      const hashtagCounts: Record<string, number> = {};
      
      for (const post of posts) {
        // Extract theme/topic
        if (post.theme) {
          topicCounts[post.theme] = (topicCounts[post.theme] || 0) + 1;
        }
        
        // Extract hashtags from content
        const hashtags = (post.content || "").match(/#\w+/g) || [];
        for (const tag of hashtags) {
          hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1;
        }
      }
      
      // Convert to trends
      for (const [topic, count] of Object.entries(topicCounts)) {
        if (count >= 2) {
          trends.push({
            topic,
            category: this.categorize(topic),
            score: Math.min(100, count * 20),
            momentum: "stable",
            relatedHashtags: Object.entries(hashtagCounts)
              .filter(([_, c]) => c >= 2)
              .map(([tag]) => tag)
              .slice(0, 5),
            samplePosts: posts
              .filter(p => p.theme === topic)
              .map(p => p.content || "")
              .slice(0, 3),
            suggestedAngles: this.generateAngles(topic),
            detectedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing viral content:", error);
    }
    
    return trends;
  }
  
  /**
   * Analyze hashtag trends
   */
  private async analyzeHashtags(): Promise<Trend[]> {
    // Predefined trending hashtags based on current market
    const trendingHashtags = [
      { tag: "#AI", category: "ai" as TrendCategory, score: 95 },
      { tag: "#Leadership", category: "leadership" as TrendCategory, score: 85 },
      { tag: "#Entrepreneuriat", category: "startup" as TrendCategory, score: 80 },
      { tag: "#PersonalBranding", category: "marketing" as TrendCategory, score: 78 },
      { tag: "#Productivité", category: "productivity" as TrendCategory, score: 75 },
      { tag: "#Innovation", category: "technology" as TrendCategory, score: 72 },
      { tag: "#Recrutement", category: "career" as TrendCategory, score: 70 },
      { tag: "#Marketing", category: "marketing" as TrendCategory, score: 68 },
    ];
    
    return trendingHashtags.map(h => ({
      topic: h.tag.replace("#", ""),
      category: h.category,
      score: h.score,
      momentum: "rising" as const,
      relatedHashtags: [h.tag],
      samplePosts: [],
      suggestedAngles: this.generateAngles(h.tag.replace("#", "")),
      detectedAt: new Date(),
    }));
  }
  
  /**
   * Analyze industry trends
   */
  private async analyzeIndustryTrends(): Promise<Trend[]> {
    // Current industry trends based on market analysis
    const industryTrends = [
      {
        topic: "Intelligence Artificielle Générative",
        category: "ai" as TrendCategory,
        score: 98,
        momentum: "rising" as const,
        angles: [
          "Comment l'IA transforme votre métier",
          "Les outils IA indispensables en 2025",
          "IA vs Humain : complémentarité",
        ],
      },
      {
        topic: "Travail Hybride",
        category: "business" as TrendCategory,
        score: 82,
        momentum: "stable" as const,
        angles: [
          "Optimiser sa productivité en remote",
          "Manager une équipe hybride",
          "Les outils du travail moderne",
        ],
      },
      {
        topic: "Personal Branding LinkedIn",
        category: "marketing" as TrendCategory,
        score: 88,
        momentum: "rising" as const,
        angles: [
          "Construire son audience de 0",
          "Les erreurs à éviter sur LinkedIn",
          "Stratégie de contenu qui fonctionne",
        ],
      },
      {
        topic: "Bien-être au Travail",
        category: "career" as TrendCategory,
        score: 75,
        momentum: "rising" as const,
        angles: [
          "Prévenir le burnout",
          "Équilibre vie pro/perso",
          "Santé mentale en entreprise",
        ],
      },
      {
        topic: "Automatisation des Processus",
        category: "technology" as TrendCategory,
        score: 85,
        momentum: "rising" as const,
        angles: [
          "Automatiser sans perdre l'humain",
          "ROI de l'automatisation",
          "Les tâches à automatiser en priorité",
        ],
      },
    ];
    
    return industryTrends.map(t => ({
      topic: t.topic,
      category: t.category,
      score: t.score,
      momentum: t.momentum,
      relatedHashtags: [`#${t.topic.replace(/\s+/g, "")}`],
      samplePosts: [],
      suggestedAngles: t.angles,
      detectedAt: new Date(),
    }));
  }
  
  /**
   * Combine trends from multiple sources
   */
  private combineTrends(
    viral: Trend[],
    hashtags: Trend[],
    industry: Trend[]
  ): Trend[] {
    const allTrends = [...viral, ...hashtags, ...industry];
    
    // Deduplicate and merge similar trends
    const mergedTrends: Map<string, Trend> = new Map();
    
    for (const trend of allTrends) {
      const key = trend.topic.toLowerCase();
      const existing = mergedTrends.get(key);
      
      if (existing) {
        // Merge scores and data
        existing.score = Math.max(existing.score, trend.score);
        existing.relatedHashtags = Array.from(new Set([...existing.relatedHashtags, ...trend.relatedHashtags]));
        existing.suggestedAngles = Array.from(new Set([...existing.suggestedAngles, ...trend.suggestedAngles]));
      } else {
        mergedTrends.set(key, { ...trend });
      }
    }
    
    // Sort by score
    return Array.from(mergedTrends.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
  
  /**
   * Generate content opportunities from trends
   */
  private generateOpportunities(trends: Trend[]): ContentOpportunity[] {
    const opportunities: ContentOpportunity[] = [];
    
    for (const trend of trends.slice(0, 5)) {
      // Determine best format based on topic
      const format = this.suggestFormat(trend);
      
      // Determine urgency based on momentum
      const urgency = trend.momentum === "rising" 
        ? "immediate" 
        : trend.momentum === "stable" 
          ? "this_week" 
          : "this_month";
      
      // Estimate engagement
      const engagement = trend.score >= 90 
        ? "viral" 
        : trend.score >= 75 
          ? "high" 
          : trend.score >= 50 
            ? "medium" 
            : "low";
      
      opportunities.push({
        topic: trend.topic,
        reason: `Score de viralité: ${trend.score}/100, Momentum: ${trend.momentum}`,
        suggestedFormat: format,
        urgency: urgency as "immediate" | "this_week" | "this_month",
        estimatedEngagement: engagement as "low" | "medium" | "high" | "viral",
      });
      
      // Add angle-specific opportunities
      for (const angle of trend.suggestedAngles.slice(0, 2)) {
        opportunities.push({
          topic: angle,
          reason: `Angle spécifique sur "${trend.topic}"`,
          suggestedFormat: "text",
          urgency: "this_week",
          estimatedEngagement: engagement as "low" | "medium" | "high" | "viral",
        });
      }
    }
    
    return opportunities.slice(0, 10);
  }
  
  /**
   * Generate weekly insights
   */
  private generateInsights(trends: Trend[], opportunities: ContentOpportunity[]): string[] {
    const insights: string[] = [];
    
    // Top trend insight
    if (trends.length > 0) {
      insights.push(
        `🔥 Tendance #1: "${trends[0].topic}" avec un score de viralité de ${trends[0].score}/100`
      );
    }
    
    // Rising trends
    const risingTrends = trends.filter(t => t.momentum === "rising");
    if (risingTrends.length > 0) {
      insights.push(
        `📈 ${risingTrends.length} tendances en forte hausse cette semaine`
      );
    }
    
    // Immediate opportunities
    const immediateOpps = opportunities.filter(o => o.urgency === "immediate");
    if (immediateOpps.length > 0) {
      insights.push(
        `⚡ ${immediateOpps.length} opportunités à saisir immédiatement`
      );
    }
    
    // Category distribution
    const categories = trends.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      insights.push(
        `📊 Catégorie dominante: ${topCategory[0]} (${topCategory[1]} tendances)`
      );
    }
    
    // Recommendation
    insights.push(
      `💡 Recommandation: Publiez sur "${trends[0]?.topic || 'IA'}" cette semaine pour maximiser l'engagement`
    );
    
    return insights;
  }
  
  /**
   * Categorize a topic
   */
  private categorize(topic: string): TrendCategory {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes("ia") || topicLower.includes("ai") || topicLower.includes("intelligence")) {
      return "ai";
    }
    if (topicLower.includes("leader") || topicLower.includes("management")) {
      return "leadership";
    }
    if (topicLower.includes("market") || topicLower.includes("brand")) {
      return "marketing";
    }
    if (topicLower.includes("startup") || topicLower.includes("entrepreneur")) {
      return "startup";
    }
    if (topicLower.includes("tech") || topicLower.includes("innov")) {
      return "technology";
    }
    if (topicLower.includes("carrière") || topicLower.includes("emploi") || topicLower.includes("recrutement")) {
      return "career";
    }
    if (topicLower.includes("productiv") || topicLower.includes("efficac")) {
      return "productivity";
    }
    
    return "business";
  }
  
  /**
   * Generate content angles for a topic
   */
  private generateAngles(topic: string): string[] {
    const genericAngles = [
      `Les 5 erreurs à éviter en ${topic}`,
      `Comment j'ai réussi grâce à ${topic}`,
      `${topic}: ce que personne ne vous dit`,
      `Le guide ultime du ${topic} en 2025`,
      `Pourquoi ${topic} va tout changer`,
    ];
    
    return genericAngles.slice(0, 3);
  }
  
  /**
   * Suggest best format for a trend
   */
  private suggestFormat(trend: Trend): "text" | "carousel" | "infographic" | "video" {
    // Educational topics work well with carousels
    if (trend.topic.toLowerCase().includes("guide") || 
        trend.topic.toLowerCase().includes("étapes") ||
        trend.topic.toLowerCase().includes("conseils")) {
      return "carousel";
    }
    
    // Data-heavy topics work well with infographics
    if (trend.category === "technology" || 
        trend.topic.toLowerCase().includes("statistiques") ||
        trend.topic.toLowerCase().includes("chiffres")) {
      return "infographic";
    }
    
    // High-score trends might benefit from video
    if (trend.score >= 90) {
      return "carousel"; // Video not yet implemented, use carousel
    }
    
    return "text";
  }
  
  /**
   * Monitor a specific topic
   */
  async monitorTopic(topic: string): Promise<void> {
    await addMemory(this.agentId, this.userId, {
      type: "user_preference",
      key: `monitored_topic_${topic.toLowerCase().replace(/\s+/g, "_")}`,
      value: { topic, addedAt: new Date() },
      importance: "high",
      source: "user_request",
    });
    
    await logAgentActivity(
      this.agentId,
      this.userId,
      "topic_monitored",
      "info",
      `Nouveau sujet surveillé: "${topic}"`
    );
  }
  
  /**
   * Get trend alerts
   */
  async getTrendAlerts(): Promise<Trend[]> {
    const memories = await getAgentMemories(this.agentId);
    const recentAnalysis = memories
      .filter(m => (m.type as string) === "trend_analysis")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!recentAnalysis) {
      return [];
    }
    
    const analysis = recentAnalysis.value as TrendAnalysis;
    return analysis.trends.filter(t => t.score >= 80 && t.momentum === "rising");
  }
}

/**
 * Factory function to create a Trend Hunter Agent
 */
export function createTrendHunterAgent(
  agentId: number, 
  userId: number
): TrendHunterAgent {
  return new TrendHunterAgent(agentId, userId);
}
