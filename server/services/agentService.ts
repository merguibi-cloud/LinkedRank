/**
 * Agent Service - Core service for managing AI agents
 * Handles agent lifecycle, task management, and memory operations
 */

import { getDb } from "../db";
import { 
  agents, 
  agentTasks, 
  agentMemory, 
  agentLogs 
} from "../../drizzle/schema";
import { generateLinkedInPost, type GenerationRequest, type UserContext } from "./contentGenerator";
import { notifyTaskCompleted, notifyTaskNeedsApproval, notifyTaskFailed } from "./notificationService";
import { eq, and, desc, sql } from "drizzle-orm";
import type { 
  Agent, 
  AgentTask, 
  AgentMemory,
  AgentConfig,
  TaskInputData,
  TaskOutputData,
  AgentType,
  AgentStatus,
  TaskType,
  TaskStatus,
  AutonomyLevel,
  MemoryType,
  MemoryImportance
} from "../../shared/agentTypes";

// ============================================
// AGENT MANAGEMENT
// ============================================

/**
 * Create a new agent for a user
 */
export async function createAgent(
  userId: number,
  data: {
    name: string;
    type: AgentType;
    description?: string;
    avatar?: string;
    autonomyLevel?: AutonomyLevel;
    requiresApproval?: boolean;
    config?: AgentConfig;
  }
): Promise<Agent> {
  const db = (await getDb())!;
  
  const [result] = await db.insert(agents).values({
    userId,
    name: data.name,
    type: data.type,
    description: data.description,
    avatar: data.avatar || getDefaultAvatar(data.type),
    status: "paused",
    autonomyLevel: data.autonomyLevel || "supervised",
    requiresApproval: data.requiresApproval ?? true,
    config: data.config ? JSON.stringify(data.config) : null,
    tasksCompleted: 0,
    tasksApproved: 0,
    tasksRejected: 0,
  });
  
  const agent = await getAgentById(result.insertId);
  
  // Log agent creation
  await logAgentActivity(result.insertId, userId, "agent_created", "info", `Agent "${data.name}" created`);
  
  return agent!;
}

/**
 * Get default avatar emoji for agent type
 */
function getDefaultAvatar(type: AgentType): string {
  const avatars: Record<AgentType, string> = {
    content_creator: "✍️",
    trend_hunter: "🔍",
    engagement_manager: "💬",
    growth_strategist: "📈",
    network_builder: "🤝",
  };
  return avatars[type] || "🤖";
}

/**
 * Parse agent from database to typed Agent
 */
function parseAgent(agent: any): Agent {
  return {
    ...agent,
    config: agent.config ? JSON.parse(agent.config) : undefined,
    scheduleDays: agent.scheduleDays ? JSON.parse(agent.scheduleDays) : undefined,
    scheduleHours: agent.scheduleHours ? JSON.parse(agent.scheduleHours) : undefined,
    scheduleEnabled: agent.scheduleEnabled ?? false,
  } as Agent;
}

/**
 * Get agent by ID
 */
export async function getAgentById(agentId: number): Promise<Agent | null> {
  const db = (await getDb())!;
  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
  
  if (!agent) return null;
  
  return parseAgent(agent);
}

/**
 * Get all agents for a user
 */
export async function getUserAgents(userId: number): Promise<Agent[]> {
  const db = (await getDb())!;
  const results = await db.select().from(agents).where(eq(agents.userId, userId));
  
  return results.map(parseAgent);
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  agentId: number, 
  status: AgentStatus
): Promise<void> {
  const db = (await getDb())!;
  
  await db.update(agents)
    .set({ 
      status, 
      lastActiveAt: status === "active" ? new Date() : undefined 
    })
    .where(eq(agents.id, agentId));
}

/**
 * Update agent configuration
 */
export async function updateAgentConfig(
  agentId: number,
  config: Partial<AgentConfig>
): Promise<void> {
  const db = (await getDb())!;
  const agent = await getAgentById(agentId);
  
  if (!agent) throw new Error("Agent not found");
  
  const newConfig = { ...agent.config, ...config };
  
  await db.update(agents)
    .set({ config: JSON.stringify(newConfig) })
    .where(eq(agents.id, agentId));
}

/**
 * Initialize default agents for a new user
 */
export async function initializeUserAgents(userId: number): Promise<Agent[]> {
  const defaultAgents = [
    {
      name: "Content Creator",
      type: "content_creator" as AgentType,
      description: "Génère du contenu personnalisé basé sur votre style et vos objectifs",
      avatar: "✍️",
    },
    {
      name: "Trend Hunter",
      type: "trend_hunter" as AgentType,
      description: "Détecte les tendances et vous alerte sur les opportunités de contenu",
      avatar: "🔍",
    },
    {
      name: "Engagement Manager",
      type: "engagement_manager" as AgentType,
      description: "Analyse les commentaires et suggère des réponses personnalisées",
      avatar: "💬",
    },
    {
      name: "Growth Strategist",
      type: "growth_strategist" as AgentType,
      description: "Analyse vos performances et recommande des stratégies de croissance",
      avatar: "📈",
    },
    {
      name: "Network Builder",
      type: "network_builder" as AgentType,
      description: "Identifie les connexions stratégiques et optimise votre réseau",
      avatar: "🤝",
    },
  ];
  
  const createdAgents: Agent[] = [];
  
  for (const agentData of defaultAgents) {
    const agent = await createAgent(userId, agentData);
    createdAgents.push(agent);
  }
  
  return createdAgents;
}

// ============================================
// TASK MANAGEMENT
// ============================================

/**
 * Create a new task for an agent
 */
export async function createTask(
  agentId: number,
  userId: number,
  data: {
    type: TaskType;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    scheduledFor?: Date;
    inputData?: TaskInputData;
    requiresApproval?: boolean;
  }
): Promise<AgentTask> {
  const db = (await getDb())!;
  
  const agent = await getAgentById(agentId);
  if (!agent) throw new Error("Agent not found");
  
  const [result] = await db.insert(agentTasks).values({
    agentId,
    userId,
    type: data.type,
    title: data.title,
    description: data.description,
    status: "pending",
    priority: data.priority || "medium",
    scheduledFor: data.scheduledFor,
    inputData: data.inputData ? JSON.stringify(data.inputData) : null,
    requiresApproval: data.requiresApproval ?? agent.requiresApproval,
    retryCount: 0,
  });
  
  await logAgentActivity(agentId, userId, "task_created", "info", `Task "${data.title}" created`, result.insertId);
  
  return (await getTaskById(result.insertId))!;
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: number): Promise<AgentTask | null> {
  const db = (await getDb())!;
  const [task] = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId));
  
  if (!task) return null;
  
  return {
    ...task,
    inputData: task.inputData ? JSON.parse(task.inputData) : undefined,
    outputData: task.outputData ? JSON.parse(task.outputData) : undefined,
  } as AgentTask;
}

/**
 * Get pending tasks for a user
 */
export async function getPendingTasks(userId: number): Promise<AgentTask[]> {
  const db = (await getDb())!;
  const results = await db.select()
    .from(agentTasks)
    .where(and(
      eq(agentTasks.userId, userId),
      eq(agentTasks.status, "awaiting_approval")
    ))
    .orderBy(desc(agentTasks.createdAt));
  
  return results.map(task => ({
    ...task,
    inputData: task.inputData ? JSON.parse(task.inputData) : undefined,
    outputData: task.outputData ? JSON.parse(task.outputData) : undefined,
  })) as AgentTask[];
}

/**
 * Get all tasks for an agent
 */
export async function getAgentTasks(
  agentId: number, 
  limit = 50
): Promise<AgentTask[]> {
  const db = (await getDb())!;
  const results = await db.select()
    .from(agentTasks)
    .where(eq(agentTasks.agentId, agentId))
    .orderBy(desc(agentTasks.createdAt))
    .limit(limit);
  
  return results.map(task => ({
    ...task,
    inputData: task.inputData ? JSON.parse(task.inputData) : undefined,
    outputData: task.outputData ? JSON.parse(task.outputData) : undefined,
  })) as AgentTask[];
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
  outputData?: TaskOutputData,
  errorMessage?: string
): Promise<void> {
  const db = (await getDb())!;
  
  const updates: any = { status };
  
  if (status === "in_progress") {
    updates.startedAt = new Date();
  } else if (status === "completed" || status === "failed") {
    updates.completedAt = new Date();
  }
  
  if (outputData) {
    updates.outputData = JSON.stringify(outputData);
  }
  
  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }
  
  await db.update(agentTasks).set(updates).where(eq(agentTasks.id, taskId));
}

/**
 * Approve a task and optionally publish to LinkedIn
 */
export async function approveTask(
  taskId: number,
  approvedBy: number,
  modifications?: Partial<TaskOutputData>,
  autoPublish: boolean = false
): Promise<{ success: boolean; linkedinPostId?: string; error?: string }> {
  const db = (await getDb())!;
  const task = await getTaskById(taskId);
  
  if (!task) throw new Error("Task not found");
  
  const outputData = modifications 
    ? { ...task.outputData, ...modifications }
    : task.outputData;
  
  await db.update(agentTasks).set({
    status: "approved",
    approvedAt: new Date(),
    approvedBy,
    outputData: JSON.stringify(outputData),
  }).where(eq(agentTasks.id, taskId));
  
  // Update agent stats
  await db.update(agents).set({
    tasksApproved: sql`${agents.tasksApproved} + 1`,
    tasksCompleted: sql`${agents.tasksCompleted} + 1`,
  }).where(eq(agents.id, task.agentId));
  
  await logAgentActivity(task.agentId, task.userId, "task_approved", "info", `Task "${task.title}" approved`, taskId);

  // If autoPublish is enabled and task has generated content, publish to LinkedIn
  let linkedinResult: { success: boolean; linkedinPostId?: string; error?: string } = { success: true };
  
  if (autoPublish && outputData?.generatedPost?.content) {
    try {
      const { publishToLinkedIn } = await import("./linkedinAutoPublisher");
      linkedinResult = await publishToLinkedIn(task.userId, outputData.generatedPost);
      
      if (linkedinResult.success) {
        await logAgentActivity(task.agentId, task.userId, "linkedin_published", "info", 
          `Content published to LinkedIn: ${linkedinResult.linkedinPostId}`, taskId);
      } else {
        await logAgentActivity(task.agentId, task.userId, "linkedin_publish_failed", "error", 
          `Failed to publish to LinkedIn: ${linkedinResult.error}`, taskId);
      }
    } catch (error) {
      console.error("[AgentService] LinkedIn auto-publish error:", error);
      linkedinResult = { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  
  return linkedinResult;
}

/**
 * Reject a task
 */
export async function rejectTask(
  taskId: number,
  reason: string
): Promise<void> {
  const db = (await getDb())!;
  const task = await getTaskById(taskId);
  
  if (!task) throw new Error("Task not found");
  
  await db.update(agentTasks).set({
    status: "rejected",
    rejectionReason: reason,
  }).where(eq(agentTasks.id, taskId));
  
  // Update agent stats
  await db.update(agents).set({
    tasksRejected: sql`${agents.tasksRejected} + 1`,
  }).where(eq(agents.id, task.agentId));
  
  // Store rejection as memory for learning
  await addMemory(task.agentId, task.userId, {
    type: "feedback",
    key: `rejection_${taskId}`,
    value: {
      taskType: task.type,
      inputData: task.inputData,
      outputData: task.outputData,
      rejectionReason: reason,
    },
    importance: "high",
    source: "user_feedback",
  });
  
  await logAgentActivity(task.agentId, task.userId, "task_rejected", "warning", `Task "${task.title}" rejected: ${reason}`, taskId);
}

// ============================================
// MEMORY MANAGEMENT
// ============================================

/**
 * Add a memory entry for an agent
 */
export async function addMemory(
  agentId: number,
  userId: number,
  data: {
    type: MemoryType;
    key: string;
    value: any;
    importance?: MemoryImportance;
    confidence?: string;
    source?: string;
    context?: string;
    expiresAt?: Date;
  }
): Promise<void> {
  const db = (await getDb())!;
  
  // Check if memory with same key exists
  const [existing] = await db.select()
    .from(agentMemory)
    .where(and(
      eq(agentMemory.agentId, agentId),
      eq(agentMemory.key, data.key)
    ));
  
  if (existing) {
    // Update existing memory
    await db.update(agentMemory).set({
      value: JSON.stringify(data.value),
      importance: data.importance || existing.importance,
      confidence: data.confidence || existing.confidence,
      context: data.context || existing.context,
    }).where(eq(agentMemory.id, existing.id));
  } else {
    // Create new memory
    await db.insert(agentMemory).values({
      agentId,
      userId,
      type: data.type,
      key: data.key,
      value: JSON.stringify(data.value),
      importance: data.importance || "medium",
      confidence: data.confidence,
      source: data.source,
      context: data.context,
      expiresAt: data.expiresAt,
    });
  }
}

/**
 * Get memories for an agent
 */
export async function getAgentMemories(
  agentId: number,
  type?: MemoryType
): Promise<AgentMemory[]> {
  const db = (await getDb())!;
  
  let query = db.select().from(agentMemory).where(eq(agentMemory.agentId, agentId));
  
  if (type) {
    query = db.select().from(agentMemory).where(and(
      eq(agentMemory.agentId, agentId),
      eq(agentMemory.type, type)
    ));
  }
  
  const results = await query.orderBy(desc(agentMemory.importance));
  
  return results.map(m => ({
    ...m,
    value: JSON.parse(m.value),
  })) as AgentMemory[];
}

/**
 * Get relevant memories for a task
 */
export async function getRelevantMemories(
  agentId: number,
  taskType: TaskType
): Promise<AgentMemory[]> {
  const db = (await getDb())!;
  
  // Get user preferences and content style memories
  const relevantTypes: MemoryType[] = [
    "user_preference",
    "content_style",
    "feedback",
    "best_practice",
  ];
  
  const results = await db.select()
    .from(agentMemory)
    .where(eq(agentMemory.agentId, agentId))
    .orderBy(desc(agentMemory.importance));
  
  return results
    .filter(m => relevantTypes.includes(m.type as MemoryType))
    .map(m => ({
      ...m,
      value: JSON.parse(m.value),
    })) as AgentMemory[];
}

// ============================================
// LOGGING
// ============================================

/**
 * Log agent activity
 */
export async function logAgentActivity(
  agentId: number,
  userId: number,
  action: string,
  level: "debug" | "info" | "warning" | "error",
  message: string,
  taskId?: number,
  metadata?: Record<string, any>
): Promise<void> {
  const db = (await getDb())!;
  
  await db.insert(agentLogs).values({
    agentId,
    userId,
    taskId,
    action,
    level,
    message,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Get recent activity for a user's agents
 */
export async function getRecentActivity(
  userId: number,
  limit = 50
): Promise<any[]> {
  const db = (await getDb())!;
  
  const results = await db.select()
    .from(agentLogs)
    .where(eq(agentLogs.userId, userId))
    .orderBy(desc(agentLogs.createdAt))
    .limit(limit);
  
  return results.map(log => ({
    ...log,
    metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
  }));
}

// ============================================
// DASHBOARD DATA
// ============================================

/**
 * Get dashboard data for agent supervision
 */
export async function getAgentDashboardData(userId: number) {
  const db = (await getDb())!;
  
  // Get all agents
  const userAgents = await getUserAgents(userId);
  
  // Get pending tasks
  const pendingTasks = await getPendingTasks(userId);
  
  // Get recent activity
  const recentActivity = await getRecentActivity(userId, 20);
  
  // Calculate stats
  const activeAgents = userAgents.filter(a => a.status === "active").length;
  
  // Get today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = await db.select()
    .from(agentTasks)
    .where(and(
      eq(agentTasks.userId, userId),
      sql`${agentTasks.createdAt} >= ${today}`
    ));
  
  // Calculate success rate
  const totalCompleted = userAgents.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const totalApproved = userAgents.reduce((sum, a) => sum + a.tasksApproved, 0);
  const successRate = totalCompleted > 0 
    ? Math.round((totalApproved / totalCompleted) * 100) + "%"
    : "N/A";
  
  return {
    agents: userAgents,
    pendingTasks,
    recentActivity,
    stats: {
      totalTasksToday: todayTasks.length,
      tasksAwaitingApproval: pendingTasks.length,
      activeAgents,
      successRate,
    },
  };
}


/**
 * Get agent logs for a user
 */
export async function getAgentLogs(
  userId: number,
  agentId?: number,
  limit = 50
): Promise<any[]> {
  const db = (await getDb())!;
  
  const conditions = [eq(agentLogs.userId, userId)];
  if (agentId) {
    conditions.push(eq(agentLogs.agentId, agentId));
  }
  
  const results = await db.select()
    .from(agentLogs)
    .where(and(...conditions))
    .orderBy(desc(agentLogs.createdAt))
    .limit(limit);
  
  return results.map(log => ({
    ...log,
    metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
  }));
}


// ============================================
// TASK PROCESSOR - Process pending tasks with AI
// ============================================

/**
 * Process a pending task using AI
 */
export async function processTask(taskId: number): Promise<void> {
  const db = (await getDb())!;
  const task = await getTaskById(taskId);
  
  if (!task) throw new Error("Task not found");
  if (task.status !== "pending") throw new Error("Task is not pending");
  
  // Update status to in_progress
  await updateTaskStatus(taskId, "in_progress");
  await logAgentActivity(task.agentId, task.userId, "task_started", "info", `Processing task "${task.title}"`, taskId);
  
  try {
    let outputData: any = {};
    
    switch (task.type) {
      case "generate_post":
        outputData = await processGeneratePostTask(task);
        break;
      case "generate_carousel":
        outputData = await processGenerateCarouselTask(task);
        break;
      case "detect_trend":
      case "analyze_trends":
        outputData = await processAnalyzeTrendsTask(task);
        break;
      case "suggest_response":
        outputData = await processSuggestResponseTask(task);
        break;
      case "analyze_performance":
        outputData = await processAnalyzePerformanceTask(task);
        break;
      case "suggest_connection":
        outputData = await processSuggestConnectionTask(task);
        break;
      default:
        outputData = { message: "Task type not yet implemented", taskType: task.type };
    }
    
    // Update task with output and set to awaiting_approval
    await db.update(agentTasks).set({
      status: "awaiting_approval",
      outputData: JSON.stringify(outputData),
    }).where(eq(agentTasks.id, taskId));
    
    await logAgentActivity(task.agentId, task.userId, "task_completed", "info", `Task "${task.title}" ready for approval`, taskId);
    
    // Send notification to user
    const agent = await getAgentById(task.agentId);
    if (agent) {
      await notifyTaskNeedsApproval(
        task.userId,
        task.agentId,
        taskId,
        agent.name,
        task.title
      );
    }
    
  } catch (error: any) {
    await updateTaskStatus(taskId, "failed", undefined, error.message);
    await logAgentActivity(task.agentId, task.userId, "task_failed", "error", `Task "${task.title}" failed: ${error.message}`, taskId);
    
    // Send failure notification
    const agent = await getAgentById(task.agentId);
    if (agent) {
      await notifyTaskFailed(
        task.userId,
        task.agentId,
        taskId,
        agent.name,
        task.title,
        error.message
      );
    }
    
    throw error;
  }
}

/**
 * Process generate_post task
 */
async function processGeneratePostTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  
  const userContext: UserContext = {
    companyName: inputData.companyName,
    industry: inputData.industry,
    expertise: inputData.topics || [],
    targetAudience: inputData.targetAudience,
  };
  
  const request: GenerationRequest = {
    theme: inputData.topic || task.title || "LinkedIn et le personal branding",
    tone: inputData.tone || "professional",
    language: inputData.language || "FR",
    userContext,
    additionalInstructions: task.description,
    postType: inputData.postType || "insight",
  };
  
  const generatedContent = await generateLinkedInPost(request);
  
  return {
    generatedPost: {
      title: generatedContent.title,
      content: generatedContent.content,
      hashtags: generatedContent.hashtags,
      suggestedMedia: generatedContent.suggestedMedia,
      callToAction: generatedContent.callToAction,
    },
    metadata: {
      theme: request.theme,
      tone: request.tone,
      language: request.language,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Process generate_carousel task
 */
async function processGenerateCarouselTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  
  // Use the carousel generator
  const { generateCarouselContent } = await import("./carouselGenerator");
  
  const topic = inputData.topic || task.title || "LinkedIn Tips";
  const slideCount = inputData.slideCount || 5;
  
  const carouselSlides = await generateCarouselContent(topic, slideCount);
  
  return {
    carousel: {
      slides: carouselSlides,
      topic,
    },
    metadata: {
      topic,
      slideCount: carouselSlides.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Process analyze_trends task
 */
async function processAnalyzeTrendsTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  
  // Simulate trend analysis (in production, this would use real data)
  const trends = [
    { topic: "Intelligence Artificielle", score: 95, growth: "+15%", category: "Tech" },
    { topic: "Leadership authentique", score: 88, growth: "+12%", category: "Management" },
    { topic: "Remote work", score: 82, growth: "+8%", category: "Workplace" },
    { topic: "Personal branding", score: 79, growth: "+10%", category: "Career" },
    { topic: "Sustainability", score: 75, growth: "+20%", category: "Business" },
  ];
  
  return {
    trends,
    analysis: "Les tendances actuelles montrent un fort intérêt pour l'IA et le leadership authentique. Le personal branding reste un sujet porteur.",
    recommendations: [
      "Créer du contenu sur l'IA et son impact sur votre secteur",
      "Partager des histoires de leadership authentique",
      "Aborder le sujet du travail hybride",
    ],
    metadata: {
      analyzedAt: new Date().toISOString(),
      period: inputData.period || "last_7_days",
    },
  };
}

/**
 * Process suggest_response task
 */
async function processSuggestResponseTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  const comment = inputData.comment || "Merci pour ce post !";
  
  // Generate response suggestions
  const suggestions = [
    {
      type: "professional",
      response: `Merci beaucoup pour votre retour ! Je suis ravi que ce contenu vous ait été utile. N'hésitez pas à me suivre pour plus de contenus similaires.`,
    },
    {
      type: "engaging",
      response: `Merci ! 🙏 Qu'est-ce qui vous a le plus marqué dans ce post ? J'aimerais avoir votre avis.`,
    },
    {
      type: "brief",
      response: `Merci pour ce retour positif ! 🙌`,
    },
  ];
  
  return {
    originalComment: comment,
    suggestions,
    sentiment: "positive",
    metadata: {
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Process all pending tasks for a user
 */
export async function processAllPendingTasks(userId: number): Promise<{ processed: number; failed: number }> {
  const db = (await getDb())!;
  
  const pendingTasks = await db.select()
    .from(agentTasks)
    .where(and(
      eq(agentTasks.userId, userId),
      eq(agentTasks.status, "pending")
    ))
    .limit(10);
  
  let processed = 0;
  let failed = 0;
  
  for (const task of pendingTasks) {
    try {
      await processTask(task.id);
      processed++;
    } catch (error) {
      failed++;
      console.error(`Failed to process task ${task.id}:`, error);
    }
  }
  
  return { processed, failed };
}


/**
 * Process analyze_performance task (Growth Strategist)
 */
async function processAnalyzePerformanceTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  
  // Simulate performance analysis (in production, this would use real LinkedIn data)
  const performanceData = {
    overview: {
      totalPosts: 45,
      totalImpressions: 125000,
      totalEngagements: 8500,
      averageEngagementRate: 6.8,
      followerGrowth: "+12%",
      period: inputData.period || "last_30_days",
    },
    topPerformingPosts: [
      { title: "L'IA et le futur du travail", impressions: 15000, engagements: 1200, engagementRate: 8.0 },
      { title: "5 conseils pour votre personal branding", impressions: 12000, engagements: 950, engagementRate: 7.9 },
      { title: "Mon parcours entrepreneurial", impressions: 10000, engagements: 800, engagementRate: 8.0 },
    ],
    bestPostingTimes: [
      { day: "Mardi", time: "08:00-09:00", engagementMultiplier: 1.5 },
      { day: "Mercredi", time: "12:00-13:00", engagementMultiplier: 1.4 },
      { day: "Jeudi", time: "17:00-18:00", engagementMultiplier: 1.3 },
    ],
    contentTypePerformance: [
      { type: "Storytelling", avgEngagement: 8.5, count: 12 },
      { type: "Conseils pratiques", avgEngagement: 7.2, count: 18 },
      { type: "Actualités secteur", avgEngagement: 5.8, count: 10 },
      { type: "Carrousels", avgEngagement: 9.2, count: 5 },
    ],
    audienceInsights: {
      topIndustries: ["Tech", "Consulting", "Marketing", "Finance"],
      topLocations: ["France", "Belgique", "Suisse", "Canada"],
      seniorityDistribution: {
        "C-Level": 15,
        "Director": 25,
        "Manager": 35,
        "Individual Contributor": 25,
      },
    },
  };
  
  const recommendations = [
    {
      priority: "high",
      category: "timing",
      title: "Optimiser les horaires de publication",
      description: "Publiez davantage le mardi matin et mercredi midi pour maximiser l'engagement.",
      expectedImpact: "+20% d'engagement",
    },
    {
      priority: "high",
      category: "content",
      title: "Augmenter les carrousels",
      description: "Les carrousels ont le meilleur taux d'engagement (9.2%). Passez de 5 à 10 par mois.",
      expectedImpact: "+15% d'impressions",
    },
    {
      priority: "medium",
      category: "engagement",
      title: "Répondre plus rapidement aux commentaires",
      description: "Répondez dans les 2 premières heures pour booster l'algorithme.",
      expectedImpact: "+10% de reach",
    },
    {
      priority: "medium",
      category: "content",
      title: "Plus de storytelling personnel",
      description: "Le storytelling génère 8.5% d'engagement vs 5.8% pour les actualités.",
      expectedImpact: "+25% d'engagement",
    },
    {
      priority: "low",
      category: "audience",
      title: "Cibler les décideurs",
      description: "40% de votre audience est C-Level ou Director. Adaptez le contenu.",
      expectedImpact: "Meilleure conversion",
    },
  ];
  
  const growthPlan = {
    shortTerm: [
      "Publier 3 carrousels cette semaine",
      "Répondre à tous les commentaires sous 2h",
      "Tester le créneau mardi 8h",
    ],
    mediumTerm: [
      "Augmenter la fréquence à 5 posts/semaine",
      "Créer une série de posts thématiques",
      "Collaborer avec 2 influenceurs du secteur",
    ],
    longTerm: [
      "Atteindre 10K followers en 3 mois",
      "Devenir Top Voice dans votre secteur",
      "Lancer une newsletter LinkedIn",
    ],
  };
  
  return {
    performanceData,
    recommendations,
    growthPlan,
    viralityScore: 72,
    viralityTrend: "+5",
    metadata: {
      analyzedAt: new Date().toISOString(),
      period: inputData.period || "last_30_days",
    },
  };
}

/**
 * Process suggest_connection task (Network Builder)
 */
async function processSuggestConnectionTask(task: any): Promise<any> {
  const inputData = task.inputData || {};
  const targetIndustry = inputData.industry || "Tech";
  const targetRole = inputData.role || "Decision Maker";
  
  // Simulate connection suggestions (in production, this would use LinkedIn API)
  const suggestedConnections = [
    {
      name: "Marie Dupont",
      title: "VP Marketing",
      company: "TechCorp France",
      industry: "Tech",
      mutualConnections: 12,
      relevanceScore: 95,
      reason: "Même secteur, rôle décisionnel, 12 connexions communes",
      profileUrl: "https://linkedin.com/in/marie-dupont",
      avatar: "👩‍💼",
      engagementOpportunity: "A publié récemment sur l'IA - opportunité de commenter",
    },
    {
      name: "Pierre Martin",
      title: "CEO",
      company: "StartupAI",
      industry: "Tech",
      mutualConnections: 8,
      relevanceScore: 92,
      reason: "Entrepreneur tech, actif sur LinkedIn, intérêts communs",
      profileUrl: "https://linkedin.com/in/pierre-martin",
      avatar: "👨‍💼",
      engagementOpportunity: "Organise un webinar la semaine prochaine",
    },
    {
      name: "Sophie Bernard",
      title: "Directrice Innovation",
      company: "Grand Groupe SA",
      industry: "Consulting",
      mutualConnections: 15,
      relevanceScore: 88,
      reason: "Influence dans le secteur, potentiel partenariat",
      profileUrl: "https://linkedin.com/in/sophie-bernard",
      avatar: "👩‍💼",
      engagementOpportunity: "Cherche des experts IA pour un projet",
    },
    {
      name: "Thomas Leroy",
      title: "Head of Digital",
      company: "Media Corp",
      industry: "Media",
      mutualConnections: 6,
      relevanceScore: 85,
      reason: "Secteur complémentaire, fort engagement sur LinkedIn",
      profileUrl: "https://linkedin.com/in/thomas-leroy",
      avatar: "👨‍💼",
      engagementOpportunity: "Commente régulièrement les posts tech",
    },
    {
      name: "Claire Moreau",
      title: "Partner",
      company: "VC Ventures",
      industry: "Finance",
      mutualConnections: 4,
      relevanceScore: 82,
      reason: "Investisseur tech, peut ouvrir des portes",
      profileUrl: "https://linkedin.com/in/claire-moreau",
      avatar: "👩‍💼",
      engagementOpportunity: "Recherche des startups à accompagner",
    },
  ];
  
  const connectionStrategy = {
    weeklyGoal: 10,
    priorityActions: [
      "Envoyer une demande personnalisée à Marie Dupont (score 95)",
      "Commenter le dernier post de Pierre Martin avant de le contacter",
      "Participer au webinar de Pierre Martin pour créer un lien",
    ],
    messageTemplates: [
      {
        type: "introduction",
        template: "Bonjour [Prénom], je suis [Votre nom], [votre titre]. J'ai remarqué votre travail sur [sujet] et j'aimerais échanger avec vous sur [intérêt commun]. Seriez-vous ouvert(e) à une discussion ?",
      },
      {
        type: "mutual_connection",
        template: "Bonjour [Prénom], nous avons [X] connexions en commun dont [Nom]. Je travaille sur [sujet] et je pense que nous pourrions avoir des synergies intéressantes.",
      },
      {
        type: "content_engagement",
        template: "Bonjour [Prénom], j'ai beaucoup apprécié votre post sur [sujet]. Votre perspective sur [point spécifique] m'a particulièrement interpellé. J'aimerais en discuter davantage.",
      },
    ],
  };
  
  const networkAnalysis = {
    currentNetworkSize: 2500,
    industryDistribution: {
      "Tech": 45,
      "Consulting": 20,
      "Finance": 15,
      "Marketing": 12,
      "Autres": 8,
    },
    seniorityDistribution: {
      "C-Level": 10,
      "VP/Director": 25,
      "Manager": 40,
      "Individual": 25,
    },
    gaps: [
      "Peu de connexions dans le secteur Finance (15%)",
      "Manque de C-Level dans votre réseau (10%)",
      "Faible présence internationale",
    ],
    opportunities: [
      "Renforcer les connexions avec les décideurs",
      "Développer le réseau à l'international",
      "Créer des ponts avec le secteur Finance",
    ],
  };
  
  return {
    suggestedConnections,
    connectionStrategy,
    networkAnalysis,
    metadata: {
      generatedAt: new Date().toISOString(),
      targetIndustry,
      targetRole,
    },
  };
}
