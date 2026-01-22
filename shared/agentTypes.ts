/**
 * Agent IA System - Shared Types
 * Types for the AI agent system that powers LinkedRank
 */

// Agent Types
export type AgentType = 
  | "content_creator"
  | "trend_hunter"
  | "engagement_manager"
  | "growth_strategist"
  | "network_builder";

export type AgentStatus = "active" | "paused" | "learning" | "error";

export type AutonomyLevel = "supervised" | "semi_autonomous" | "autonomous";

// Task Types
export type TaskType =
  | "generate_post"
  | "generate_carousel"
  | "generate_infographic"
  | "suggest_response"
  | "detect_trend"
  | "analyze_trends"
  | "analyze_performance"
  | "suggest_connection"
  | "schedule_post";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "failed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Memory Types
export type MemoryType =
  | "user_preference"
  | "content_style"
  | "feedback"
  | "performance_insight"
  | "audience_insight"
  | "topic_expertise"
  | "best_practice"
  | "trend_analysis";

export type MemoryImportance = "low" | "medium" | "high" | "critical";

// Content Types
export type ContentFormat = "text" | "carousel" | "infographic" | "video" | "poll";

export type CarouselCategory =
  | "educational"
  | "storytelling"
  | "tips_list"
  | "comparison"
  | "case_study"
  | "statistics"
  | "how_to";

export type InfographicCategory =
  | "statistics"
  | "process"
  | "comparison"
  | "timeline"
  | "hierarchy"
  | "list"
  | "quote";

// Agent Configuration Interfaces
export interface AgentConfig {
  // Content Creator specific
  preferredTopics?: string[];
  writingStyle?: "professional" | "casual" | "inspirational" | "educational";
  postingFrequency?: "daily" | "every_other_day" | "weekly";
  
  // Trend Hunter specific
  monitoredKeywords?: string[];
  industries?: string[];
  alertThreshold?: number;
  
  // Engagement Manager specific
  responseStyle?: "friendly" | "professional" | "brief";
  autoRespondToComments?: boolean;
  leadDetectionEnabled?: boolean;
  
  // Growth Strategist specific
  targetMetrics?: string[];
  benchmarkCompetitors?: string[];
  
  // Network Builder specific
  targetProfiles?: string[];
  connectionCriteria?: string[];
  maxConnectionsPerDay?: number;
}

// Schedule Day Type
export type ScheduleDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

// Agent Interface
export interface Agent {
  id: number;
  userId: number;
  name: string;
  type: AgentType;
  description?: string;
  avatar?: string;
  status: AgentStatus;
  lastActiveAt?: Date;
  autonomyLevel: AutonomyLevel;
  requiresApproval: boolean;
  tasksCompleted: number;
  tasksApproved: number;
  tasksRejected: number;
  successRate?: string;
  config?: AgentConfig;
  // Scheduling settings
  scheduleEnabled: boolean;
  scheduleDays?: ScheduleDay[];
  scheduleHours?: string[];
  scheduleTimezone?: string;
  tasksPerDay?: number;
  lastScheduledAt?: Date;
  nextScheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task Interface
export interface AgentTask {
  id: number;
  agentId: number;
  userId: number;
  type: TaskType;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  inputData?: TaskInputData;
  outputData?: TaskOutputData;
  requiresApproval: boolean;
  approvedAt?: Date;
  approvedBy?: number;
  rejectionReason?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task Input/Output Data
export interface TaskInputData {
  // For content generation
  topic?: string;
  keywords?: string[];
  tone?: string;
  targetAudience?: string;
  inspirationPosts?: string[];
  
  // For trend detection
  searchTerms?: string[];
  timeRange?: string;
  
  // For engagement
  commentId?: string;
  postId?: string;
  
  // For networking
  targetProfileUrl?: string;
  connectionReason?: string;
}

export interface TaskOutputData {
  // For content generation
  generatedContent?: string;
  generatedTitle?: string;
  hashtags?: string[];
  imageUrl?: string;
  carouselSlides?: CarouselSlide[];
  
  // Generated post (full structure from content generator)
  generatedPost?: {
    title?: string;
    content: string;
    hashtags?: string[];
    suggestedMedia?: string;
    callToAction?: string;
    imageUrl?: string;
  };
  
  // For trend detection
  detectedTrends?: DetectedTrend[];
  
  // For engagement
  suggestedResponse?: string;
  leadScore?: number;
  
  // For analytics
  insights?: PerformanceInsight[];
  recommendations?: string[];
}

// Carousel Types
export interface CarouselSlide {
  slideNumber: number;
  title?: string;
  content: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  layout?: "centered" | "left" | "right" | "split";
}

export interface CarouselTemplate {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  slideCount: number;
  layout: CarouselLayout;
  colorScheme?: string;
  fontFamily?: string;
  category: CarouselCategory;
  usageCount: number;
  isActive: boolean;
  isPremium: boolean;
}

export interface CarouselLayout {
  slides: SlideLayout[];
  transitions?: string;
  aspectRatio?: string;
}

export interface SlideLayout {
  type: "title" | "content" | "quote" | "list" | "image" | "cta";
  elements: LayoutElement[];
}

export interface LayoutElement {
  type: "text" | "image" | "icon" | "shape";
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: Record<string, string>;
}

// Infographic Types
export interface InfographicTemplate {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  layout: InfographicLayout;
  dimensions: string;
  category: InfographicCategory;
  usageCount: number;
  isActive: boolean;
  isPremium: boolean;
}

export interface InfographicLayout {
  sections: InfographicSection[];
  background?: string;
  colorPalette?: string[];
}

export interface InfographicSection {
  type: "header" | "stat" | "chart" | "list" | "quote" | "footer";
  position: { x: number; y: number };
  size: { width: number; height: number };
  content?: string;
}

// Trend Types
export interface DetectedTrend {
  topic: string;
  score: number;
  growthRate: string;
  mentionCount: number;
  sources: string[];
  suggestedContent?: string;
}

export interface TrendAlert {
  id: number;
  userId: number;
  agentId?: number;
  topic: string;
  description?: string;
  trendScore: number;
  growthRate?: string;
  mentionCount: number;
  sources?: string[];
  relatedPosts?: string[];
  suggestedPostContent?: string;
  suggestedPostType?: ContentFormat;
  status: "new" | "viewed" | "acted_on" | "dismissed";
  detectedAt: Date;
  expiresAt?: Date;
}

// Analytics Types
export interface PerformanceInsight {
  metric: string;
  value: number;
  change: number;
  changePercent: string;
  trend: "up" | "down" | "stable";
  recommendation?: string;
}

// Memory Types
export interface AgentMemory {
  id: number;
  agentId: number;
  userId: number;
  type: MemoryType;
  key: string;
  value: any;
  importance: MemoryImportance;
  confidence?: string;
  source?: string;
  context?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Agent Log Types
export interface AgentLog {
  id: number;
  agentId: number;
  userId: number;
  taskId?: number;
  action: string;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Response Types
export interface AgentDashboardData {
  agents: Agent[];
  pendingTasks: AgentTask[];
  recentActivity: AgentLog[];
  stats: {
    totalTasksToday: number;
    tasksAwaitingApproval: number;
    activeAgents: number;
    successRate: string;
  };
}

export interface AgentTaskQueue {
  tasks: AgentTask[];
  total: number;
  pending: number;
  awaitingApproval: number;
}

// Agent Creation/Update DTOs
export interface CreateAgentDto {
  name: string;
  type: AgentType;
  description?: string;
  avatar?: string;
  autonomyLevel?: AutonomyLevel;
  requiresApproval?: boolean;
  config?: AgentConfig;
}

export interface UpdateAgentDto {
  name?: string;
  description?: string;
  avatar?: string;
  status?: AgentStatus;
  autonomyLevel?: AutonomyLevel;
  requiresApproval?: boolean;
  config?: AgentConfig;
}

export interface CreateTaskDto {
  agentId: number;
  type: TaskType;
  title: string;
  description?: string;
  priority?: TaskPriority;
  scheduledFor?: Date;
  inputData?: TaskInputData;
}

export interface ApproveTaskDto {
  taskId: number;
  modifications?: Partial<TaskOutputData>;
}

export interface RejectTaskDto {
  taskId: number;
  reason: string;
}

// Schedule Update DTO
export interface UpdateAgentScheduleDto {
  agentId: number;
  scheduleEnabled: boolean;
  scheduleDays?: ScheduleDay[];
  scheduleHours?: string[];
  scheduleTimezone?: string;
  tasksPerDay?: number;
}

// Autonomy Update DTO
export interface UpdateAgentAutonomyDto {
  agentId: number;
  autonomyLevel: AutonomyLevel;
  requiresApproval: boolean;
}
