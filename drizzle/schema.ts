import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["starter", "pro", "business"]).default("starter"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * LinkedIn Posts table - stores all posts with their content and metadata
 */
export const linkedinPosts = mysqlTable("linkedin_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["FR", "EN"]).notNull(),
  theme: varchar("theme", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  
  // Media references
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  videoUrl: text("videoUrl"),
  mediaType: mysqlEnum("mediaType", ["image", "video", "none"]).default("none"),
  mediaSource: text("mediaSource"),
  
  // LinkedIn integration
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
  
  // Engagement metrics (updated after publishing)
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  impressions: int("impressions").default(0),
  
  // Metadata
  isViral: boolean("isViral").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkedinPost = typeof linkedinPosts.$inferSelect;
export type InsertLinkedinPost = typeof linkedinPosts.$inferInsert;

/**
 * Post categories/themes for organization
 */
export const postCategories = mysqlTable("post_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 100 }),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostCategory = typeof postCategories.$inferSelect;
export type InsertPostCategory = typeof postCategories.$inferInsert;

/**
 * Generated images for posts (citations, quotes, etc.)
 */
export const postImages = mysqlTable("post_images", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["quote", "citation", "infographic", "custom"]).default("quote"),
  prompt: text("prompt"),
  width: int("width").default(1200),
  height: int("height").default(1200),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostImage = typeof postImages.$inferSelect;
export type InsertPostImage = typeof postImages.$inferInsert;

/**
 * LinkedIn account settings and tokens
 */
export const linkedinSettings = mysqlTable("linkedin_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  linkedinUserId: varchar("linkedinUserId", { length: 100 }),
  profileUrl: text("profileUrl"),
  isConnected: boolean("isConnected").default(false),
  autoPublish: boolean("autoPublish").default(false),
  defaultLanguage: mysqlEnum("defaultLanguage", ["FR", "EN"]).default("FR"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkedinSettings = typeof linkedinSettings.$inferSelect;
export type InsertLinkedinSettings = typeof linkedinSettings.$inferInsert;

/**
 * User profiles for content generation - stores business context
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Business information
  companyName: varchar("companyName", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  sector: varchar("sector", { length: 100 }),
  products: text("products"), // JSON array of products/services
  services: text("services"), // JSON array of services
  targetAudience: text("targetAudience"),
  
  // Personal branding
  personalBio: text("personalBio"),
  expertise: text("expertise"), // JSON array of expertise areas
  achievements: text("achievements"),
  
  // Content preferences
  preferredTone: mysqlEnum("preferredTone", ["professional", "casual", "inspirational", "educational", "provocative"]).default("professional"),
  preferredLanguages: text("preferredLanguages"), // JSON array: ["FR", "EN", "AR"]
  contentGoals: text("contentGoals"), // JSON array of goals
  
  // Ambitions and context
  businessGoals: text("businessGoals"),
  uniqueSellingPoints: text("uniqueSellingPoints"),
  competitors: text("competitors"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * LinkedIn Influencers - for rankings and inspiration
 */
export const linkedinInfluencers = mysqlTable("linkedin_influencers", {
  id: int("id").autoincrement().primaryKey(),
  
  // LinkedIn profile data
  linkedinUrl: varchar("linkedinUrl", { length: 500 }).notNull(),
  linkedinUsername: varchar("linkedinUsername", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  headline: text("headline"),
  profilePicture: text("profilePicture"),
  bannerImage: text("bannerImage"),
  
  // Location
  country: varchar("country", { length: 100 }),
  countryCode: varchar("countryCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  
  // Professional info
  industry: varchar("industry", { length: 100 }),
  sector: varchar("sector", { length: 100 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("jobTitle", { length: 255 }),
  
  // Metrics
  followers: int("followers").default(0),
  connections: int("connections").default(0),
  postsCount: int("postsCount").default(0),
  avgLikes: int("avgLikes").default(0),
  avgComments: int("avgComments").default(0),
  engagementRate: varchar("engagementRate", { length: 20 }),
  
  // Growth metrics
  followersGrowth30d: int("followersGrowth30d").default(0),
  followersGrowth90d: int("followersGrowth90d").default(0),
  
  // Rankings
  globalRank: int("globalRank"),
  countryRank: int("countryRank"),
  industryRank: int("industryRank"),
  
  // Content analysis
  topTopics: text("topTopics"), // JSON array
  postingFrequency: varchar("postingFrequency", { length: 50 }),
  bestPostingTime: varchar("bestPostingTime", { length: 50 }),
  
  // Verification and status
  isVerified: boolean("isVerified").default(false),
  isTopVoice: boolean("isTopVoice").default(false),
  isCreator: boolean("isCreator").default(false),
  
  // Metadata
  lastScrapedAt: timestamp("lastScrapedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkedinInfluencer = typeof linkedinInfluencers.$inferSelect;
export type InsertLinkedinInfluencer = typeof linkedinInfluencers.$inferInsert;

/**
 * Subscription plans
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Pricing
  priceMonthly: int("priceMonthly").default(0), // in cents
  priceYearly: int("priceYearly").default(0), // in cents
  currency: varchar("currency", { length: 3 }).default("EUR"),
  
  // Stripe IDs
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 100 }),
  stripePriceIdYearly: varchar("stripePriceIdYearly", { length: 100 }),
  stripeProductId: varchar("stripeProductId", { length: 100 }),
  
  // Limits
  postsPerMonth: int("postsPerMonth").default(10),
  aiGenerationsPerMonth: int("aiGenerationsPerMonth").default(5),
  teamMembers: int("teamMembers").default(1),
  linkedinAccounts: int("linkedinAccounts").default(1),
  
  // Features (JSON)
  features: text("features"),
  
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscriptions
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  
  // Stripe data
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "paused"]).default("trialing"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly"),
  
  // Dates
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  
  // Usage tracking
  postsUsedThisMonth: int("postsUsedThisMonth").default(0),
  aiGenerationsUsedThisMonth: int("aiGenerationsUsedThisMonth").default(0),
  usageResetAt: timestamp("usageResetAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Generated posts by AI - user-specific
 */
export const generatedPosts = mysqlTable("generated_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["FR", "EN", "AR", "ES", "DE"]).notNull(),
  
  // Generation context
  theme: varchar("theme", { length: 100 }),
  tone: varchar("tone", { length: 50 }),
  prompt: text("prompt"), // The user's input/context
  
  // Status
  status: mysqlEnum("status", ["generated", "saved", "scheduled", "published", "deleted"]).default("generated"),
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"),
  
  // Engagement (if published)
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedPost = typeof generatedPosts.$inferSelect;
export type InsertGeneratedPost = typeof generatedPosts.$inferInsert;

/**
 * Teams/Organizations for B2B
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logo: text("logo"),
  
  // Owner
  ownerId: int("ownerId").notNull(),
  
  // Subscription
  subscriptionId: int("subscriptionId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team members
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "manager", "member"]).default("member"),
  
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;


/**
 * Auto-publish settings - user preferences for automatic content generation and publishing
 */
export const autoPublishSettings = mysqlTable("auto_publish_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Enable/disable
  isEnabled: boolean("isEnabled").default(false),
  
  // Content preferences
  sector: varchar("sector", { length: 100 }),
  targetAudience: text("targetAudience"),
  tone: mysqlEnum("tone", ["professional", "casual", "inspirational", "educational", "provocative"]).default("professional"),
  language: mysqlEnum("language", ["FR", "EN", "AR", "ES", "DE"]).default("FR"),
  
  // Content style
  viralityLevel: mysqlEnum("viralityLevel", ["low", "medium", "high"]).default("medium"),
  contentLength: mysqlEnum("contentLength", ["short", "medium", "long"]).default("medium"),
  includeEmojis: boolean("includeEmojis").default(true),
  includeHashtags: boolean("includeHashtags").default(true),
  includeCallToAction: boolean("includeCallToAction").default(true),
  
  // Inspiration sources
  inspirationCreators: text("inspirationCreators"), // JSON array of influencer IDs
  inspirationTopics: text("inspirationTopics"), // JSON array of topics
  
  // Additional context
  personalContext: text("personalContext"), // User's business context for personalization
  avoidTopics: text("avoidTopics"), // JSON array of topics to avoid
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoPublishSettings = typeof autoPublishSettings.$inferSelect;
export type InsertAutoPublishSettings = typeof autoPublishSettings.$inferInsert;

/**
 * Auto-publish schedule - defines when to publish automatically
 */
export const autoPublishSchedule = mysqlTable("auto_publish_schedule", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Day of week (0 = Sunday, 1 = Monday, etc.)
  dayOfWeek: int("dayOfWeek").notNull(),
  
  // Time (stored as HH:MM format)
  publishTime: varchar("publishTime", { length: 5 }).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoPublishSchedule = typeof autoPublishSchedule.$inferSelect;
export type InsertAutoPublishSchedule = typeof autoPublishSchedule.$inferInsert;

/**
 * Auto-publish queue - posts generated and waiting to be published
 */
export const autoPublishQueue = mysqlTable("auto_publish_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Content
  content: text("content").notNull(),
  imageUrl: text("imageUrl"), // Generated quote image URL
  generatedFrom: text("generatedFrom"), // JSON with inspiration source info
  
  // Schedule
  scheduledFor: timestamp("scheduledFor").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "publishing", "published", "failed", "cancelled"]).default("pending"),
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  errorMessage: text("errorMessage"),
  
  // Retry logic
  retryCount: int("retryCount").default(0),
  lastRetryAt: timestamp("lastRetryAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoPublishQueue = typeof autoPublishQueue.$inferSelect;
export type InsertAutoPublishQueue = typeof autoPublishQueue.$inferInsert;

/**
 * Auto-publish history - log of all auto-published posts
 */
export const autoPublishHistory = mysqlTable("auto_publish_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  queueId: int("queueId"),
  
  // Content snapshot
  content: text("content").notNull(),
  
  // Publication info
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  
  // Performance (updated later)
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  impressions: int("impressions").default(0),
  
  // Status
  status: mysqlEnum("status", ["success", "failed"]).default("success"),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutoPublishHistory = typeof autoPublishHistory.$inferSelect;
export type InsertAutoPublishHistory = typeof autoPublishHistory.$inferInsert;


/**
 * Viral Posts - Top publications LinkedIn de la semaine
 */
export const viralPosts = mysqlTable("viral_posts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Author info
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorHeadline: text("authorHeadline"),
  authorProfileUrl: varchar("authorProfileUrl", { length: 500 }),
  authorProfilePicture: text("authorProfilePicture"),
  authorFollowers: int("authorFollowers").default(0),
  
  // Post content
  content: text("content").notNull(),
  postUrl: varchar("postUrl", { length: 500 }).notNull(),
  
  // Engagement metrics
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  impressions: int("impressions").default(0),
  
  // Classification
  theme: varchar("theme", { length: 100 }),
  language: mysqlEnum("language", ["FR", "EN", "ES", "DE", "AR"]).default("FR"),
  
  // Ranking
  weekNumber: int("weekNumber").notNull(), // Week of the year
  year: int("year").notNull(),
  rank: int("rank").default(0), // Position in the weekly ranking
  
  // Metadata
  publishedAt: timestamp("publishedAt"),
  scrapedAt: timestamp("scrapedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ViralPost = typeof viralPosts.$inferSelect;
export type InsertViralPost = typeof viralPosts.$inferInsert;


// ============================================
// AGENT IA SYSTEM TABLES
// ============================================

/**
 * AI Agents - Configuration and status of user's AI agents
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Agent identity
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", [
    "content_creator",
    "trend_hunter", 
    "engagement_manager",
    "growth_strategist",
    "network_builder"
  ]).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 50 }), // emoji or icon name
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "learning", "error"]).default("paused"),
  lastActiveAt: timestamp("lastActiveAt"),
  
  // Autonomy settings
  autonomyLevel: mysqlEnum("autonomyLevel", ["supervised", "semi_autonomous", "autonomous"]).default("supervised"),
  requiresApproval: boolean("requiresApproval").default(true),
  
  // Performance metrics
  tasksCompleted: int("tasksCompleted").default(0),
  tasksApproved: int("tasksApproved").default(0),
  tasksRejected: int("tasksRejected").default(0),
  successRate: varchar("successRate", { length: 10 }),
  
  // Configuration (JSON)
  config: text("config"), // Agent-specific settings
  
  // Scheduling settings
  scheduleEnabled: boolean("scheduleEnabled").default(false),
  scheduleDays: text("scheduleDays"), // JSON array of days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  scheduleHours: text("scheduleHours"), // JSON array of hours: ["08:00", "12:00", "18:00"]
  scheduleTimezone: varchar("scheduleTimezone", { length: 50 }).default("Europe/Paris"),
  tasksPerDay: int("tasksPerDay").default(1),
  lastScheduledAt: timestamp("lastScheduledAt"),
  nextScheduledAt: timestamp("nextScheduledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Tasks - Work items created by agents
 */
export const agentTasks = mysqlTable("agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  
  // Task details
  type: mysqlEnum("type", [
    "generate_post",
    "generate_carousel",
    "generate_infographic",
    "suggest_response",
    "detect_trend",
    "analyze_trends",
    "analyze_performance",
    "suggest_connection",
    "schedule_post"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Task status
  status: mysqlEnum("status", [
    "pending",
    "in_progress", 
    "awaiting_approval",
    "approved",
    "rejected",
    "completed",
    "failed"
  ]).default("pending"),
  
  // Priority and scheduling
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  scheduledFor: timestamp("scheduledFor"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Input/Output data (JSON)
  inputData: text("inputData"),
  outputData: text("outputData"),
  
  // Approval workflow
  requiresApproval: boolean("requiresApproval").default(true),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  rejectionReason: text("rejectionReason"),
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

/**
 * Agent Memory - Learning and context storage for agents
 */
export const agentMemory = mysqlTable("agent_memory", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  
  // Memory type
  type: mysqlEnum("type", [
    "user_preference",
    "content_style",
    "feedback",
    "performance_insight",
    "audience_insight",
    "topic_expertise",
    "best_practice",
    "trend_analysis"
  ]).notNull(),
  
  // Memory content
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // JSON data
  
  // Importance and relevance
  importance: mysqlEnum("importance", ["low", "medium", "high", "critical"]).default("medium"),
  confidence: varchar("confidence", { length: 10 }), // 0-100%
  
  // Source and context
  source: varchar("source", { length: 100 }), // where this memory came from
  context: text("context"), // additional context
  
  // Expiration
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

/**
 * Agent Logs - Activity history for agents
 */
export const agentLogs = mysqlTable("agent_logs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  taskId: int("taskId"),
  
  // Log details
  action: varchar("action", { length: 100 }).notNull(),
  level: mysqlEnum("level", ["debug", "info", "warning", "error"]).default("info"),
  message: text("message").notNull(),
  
  // Additional data (JSON)
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = typeof agentLogs.$inferInsert;

/**
 * Carousel Templates - Pre-designed carousel layouts
 */
export const carouselTemplates = mysqlTable("carousel_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  
  // Template structure
  slideCount: int("slideCount").default(5),
  layout: text("layout").notNull(), // JSON structure
  
  // Styling
  colorScheme: varchar("colorScheme", { length: 50 }),
  fontFamily: varchar("fontFamily", { length: 100 }),
  
  // Categories
  category: mysqlEnum("category", [
    "educational",
    "storytelling", 
    "tips_list",
    "comparison",
    "case_study",
    "statistics",
    "how_to"
  ]).default("educational"),
  
  // Usage stats
  usageCount: int("usageCount").default(0),
  
  isActive: boolean("isActive").default(true),
  isPremium: boolean("isPremium").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarouselTemplate = typeof carouselTemplates.$inferSelect;
export type InsertCarouselTemplate = typeof carouselTemplates.$inferInsert;

/**
 * Generated Carousels - User-created carousels
 */
export const generatedCarousels = mysqlTable("generated_carousels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId"),
  agentTaskId: int("agentTaskId"),
  
  // Carousel content
  title: varchar("title", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }),
  slides: text("slides").notNull(), // JSON array of slide content
  
  // Generated files
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 255 }),
  previewImages: text("previewImages"), // JSON array of image URLs
  
  // Status
  status: mysqlEnum("status", ["draft", "generating", "ready", "published", "failed"]).default("draft"),
  
  // LinkedIn post reference
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedCarousel = typeof generatedCarousels.$inferSelect;
export type InsertGeneratedCarousel = typeof generatedCarousels.$inferInsert;

/**
 * Infographic Templates - Pre-designed infographic layouts
 */
export const infographicTemplates = mysqlTable("infographic_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  
  // Template structure
  layout: text("layout").notNull(), // JSON structure
  dimensions: varchar("dimensions", { length: 50 }).default("1080x1350"),
  
  // Categories
  category: mysqlEnum("category", [
    "statistics",
    "process",
    "comparison",
    "timeline",
    "hierarchy",
    "list",
    "quote"
  ]).default("statistics"),
  
  // Usage stats
  usageCount: int("usageCount").default(0),
  
  isActive: boolean("isActive").default(true),
  isPremium: boolean("isPremium").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InfographicTemplate = typeof infographicTemplates.$inferSelect;
export type InsertInfographicTemplate = typeof infographicTemplates.$inferInsert;

/**
 * Trend Alerts - Detected trends by Trend Hunter agent
 */
export const trendAlerts = mysqlTable("trend_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"),
  
  // Trend details
  topic: varchar("topic", { length: 255 }).notNull(),
  description: text("description"),
  
  // Metrics
  trendScore: int("trendScore").default(0), // 0-100
  growthRate: varchar("growthRate", { length: 20 }),
  mentionCount: int("mentionCount").default(0),
  
  // Sources
  sources: text("sources"), // JSON array of source URLs
  relatedPosts: text("relatedPosts"), // JSON array of post IDs
  
  // Suggested action
  suggestedPostContent: text("suggestedPostContent"),
  suggestedPostType: mysqlEnum("suggestedPostType", ["text", "carousel", "infographic", "video"]),
  
  // Status
  status: mysqlEnum("status", ["new", "viewed", "acted_on", "dismissed"]).default("new"),
  
  // Timing
  detectedAt: timestamp("detectedAt").defaultNow(),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrendAlert = typeof trendAlerts.$inferSelect;
export type InsertTrendAlert = typeof trendAlerts.$inferInsert;


/**
 * Notifications - Real-time notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Notification type
  type: mysqlEnum("type", [
    "agent_task_completed",
    "agent_task_failed",
    "agent_needs_approval",
    "trend_detected",
    "post_published",
    "post_performance",
    "suggestion",
    "system"
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entities
  agentId: int("agentId"),
  taskId: int("taskId"),
  postId: int("postId"),
  
  // Action URL
  actionUrl: varchar("actionUrl", { length: 500 }),
  actionLabel: varchar("actionLabel", { length: 100 }),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  // Priority
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Metadata (JSON)
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
