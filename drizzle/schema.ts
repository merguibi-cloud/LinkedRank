import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionPlan: varchar("subscriptionPlan", { length: 16 }).default("starter"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * LinkedIn Posts table - stores all posts with their content and metadata
 */
export const linkedinPosts = pgTable("linkedin_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: varchar("language", { length: 16 }).notNull(),
  theme: varchar("theme", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  
  // Media references
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  videoUrl: text("videoUrl"),
  mediaType: varchar("mediaType", { length: 16 }).default("none"),
  mediaSource: text("mediaSource"),
  
  // LinkedIn integration
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"),
  status: varchar("status", { length: 16 }).default("draft").notNull(),
  
  // Engagement metrics (updated after publishing)
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  impressions: integer("impressions").default(0),
  
  // Metadata
  isViral: boolean("isViral").default(false),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type LinkedinPost = typeof linkedinPosts.$inferSelect;
export type InsertLinkedinPost = typeof linkedinPosts.$inferInsert;

/**
 * Post categories/themes for organization
 */
export const postCategories = pgTable("post_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 100 }),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostCategory = typeof postCategories.$inferSelect;
export type InsertPostCategory = typeof postCategories.$inferInsert;

/**
 * Generated images for posts (citations, quotes, etc.)
 */
export const postImages = pgTable("post_images", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  type: varchar("type", { length: 16 }).default("quote"),
  prompt: text("prompt"),
  width: integer("width").default(1200),
  height: integer("height").default(1200),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostImage = typeof postImages.$inferSelect;
export type InsertPostImage = typeof postImages.$inferInsert;

/**
 * LinkedIn account settings and tokens
 */
export const linkedinSettings = pgTable("linkedin_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  linkedinUserId: varchar("linkedinUserId", { length: 100 }),
  profileName: varchar("profileName", { length: 255 }),
  profilePicture: text("profilePicture"),
  email: varchar("email", { length: 320 }),
  profileUrl: text("profileUrl"),
  isConnected: boolean("isConnected").default(false),
  autoPublish: boolean("autoPublish").default(false),
  defaultLanguage: varchar("defaultLanguage", { length: 16 }).default("FR"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type LinkedinSettings = typeof linkedinSettings.$inferSelect;
export type InsertLinkedinSettings = typeof linkedinSettings.$inferInsert;

/**
 * User profiles for content generation - stores business context
 */
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
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
  preferredTone: varchar("preferredTone", { length: 16 }).default("professional"),
  preferredLanguages: text("preferredLanguages"), // JSON array: ["FR", "EN", "AR"]
  contentGoals: text("contentGoals"), // JSON array of goals
  
  // Ambitions and context
  businessGoals: text("businessGoals"),
  uniqueSellingPoints: text("uniqueSellingPoints"),
  competitors: text("competitors"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * LinkedIn Influencers - for rankings and inspiration
 */
export const linkedinInfluencers = pgTable("linkedin_influencers", {
  id: serial("id").primaryKey(),
  
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
  followers: integer("followers").default(0),
  connections: integer("connections").default(0),
  postsCount: integer("postsCount").default(0),
  avgLikes: integer("avgLikes").default(0),
  avgComments: integer("avgComments").default(0),
  engagementRate: varchar("engagementRate", { length: 20 }),
  
  // Growth metrics
  followersGrowth30d: integer("followersGrowth30d").default(0),
  followersGrowth90d: integer("followersGrowth90d").default(0),
  
  // Rankings
  globalRank: integer("globalRank"),
  countryRank: integer("countryRank"),
  industryRank: integer("industryRank"),
  
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type LinkedinInfluencer = typeof linkedinInfluencers.$inferSelect;
export type InsertLinkedinInfluencer = typeof linkedinInfluencers.$inferInsert;

/**
 * Subscription plans
 */
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Pricing
  priceMonthly: integer("priceMonthly").default(0), // in cents
  priceYearly: integer("priceYearly").default(0), // in cents
  currency: varchar("currency", { length: 3 }).default("EUR"),
  
  // Stripe IDs
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 100 }),
  stripePriceIdYearly: varchar("stripePriceIdYearly", { length: 100 }),
  stripeProductId: varchar("stripeProductId", { length: 100 }),
  
  // Limits
  postsPerMonth: integer("postsPerMonth").default(10),
  aiGenerationsPerMonth: integer("aiGenerationsPerMonth").default(5),
  teamMembers: integer("teamMembers").default(1),
  linkedinAccounts: integer("linkedinAccounts").default(1),
  
  // Features (JSON)
  features: text("features"),
  
  isActive: boolean("isActive").default(true),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscriptions
 */
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  planId: integer("planId").notNull(),
  
  // Stripe data
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  
  // Status
  status: varchar("status", { length: 16 }).default("trialing"),
  billingCycle: varchar("billingCycle", { length: 16 }).default("monthly"),
  
  // Dates
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  
  // Usage tracking
  postsUsedThisMonth: integer("postsUsedThisMonth").default(0),
  aiGenerationsUsedThisMonth: integer("aiGenerationsUsedThisMonth").default(0),
  usageResetAt: timestamp("usageResetAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Generated posts by AI - user-specific
 */
export const generatedPosts = pgTable("generated_posts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  language: varchar("language", { length: 16 }).notNull(),
  
  // Generation context
  theme: varchar("theme", { length: 100 }),
  tone: varchar("tone", { length: 50 }),
  prompt: text("prompt"), // The user's input/context
  
  // Status
  status: varchar("status", { length: 16 }).default("generated"),
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"),
  
  // Engagement (if published)
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),

  // Visual assets
  suggestedMedia: text("suggestedMedia"),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  imagePrompt: text("imagePrompt"),
  mediaLibraryId: integer("mediaLibraryId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type GeneratedPost = typeof generatedPosts.$inferSelect;
export type InsertGeneratedPost = typeof generatedPosts.$inferInsert;

/**
 * Teams/Organizations for B2B
 */
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logo: text("logo"),
  
  // Owner
  ownerId: integer("ownerId").notNull(),
  
  // Subscription
  subscriptionId: integer("subscriptionId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team members
 */
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("teamId").notNull(),
  userId: integer("userId").notNull(),
  role: varchar("role", { length: 16 }).default("member"),
  
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;


/**
 * Auto-publish settings - user preferences for automatic content generation and publishing
 */
export const autoPublishSettings = pgTable("auto_publish_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  
  // Enable/disable
  isEnabled: boolean("isEnabled").default(false),
  
  // Content preferences
  sector: varchar("sector", { length: 100 }),
  targetAudience: text("targetAudience"),
  tone: varchar("tone", { length: 16 }).default("professional"),
  language: varchar("language", { length: 16 }).default("FR"),
  
  // Content style
  viralityLevel: varchar("viralityLevel", { length: 16 }).default("medium"),
  contentLength: varchar("contentLength", { length: 16 }).default("medium"),
  includeEmojis: boolean("includeEmojis").default(true),
  includeHashtags: boolean("includeHashtags").default(true),
  includeCallToAction: boolean("includeCallToAction").default(true),
  
  // Inspiration sources
  inspirationCreators: text("inspirationCreators"), // JSON array of influencer IDs
  inspirationTopics: text("inspirationTopics"), // JSON array of topics
  
  // Additional context
  personalContext: text("personalContext"), // User's business context for personalization
  avoidTopics: text("avoidTopics"), // JSON array of topics to avoid

  // IANA timezone (e.g. "Africa/Casablanca") captured from the user's browser when
  // saving settings — recurring schedule day/time matching uses this, not a hardcoded zone.
  timezone: varchar("timezone", { length: 64 }),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AutoPublishSettings = typeof autoPublishSettings.$inferSelect;
export type InsertAutoPublishSettings = typeof autoPublishSettings.$inferInsert;

/**
 * Auto-publish schedule - defines when to publish automatically
 */
export const autoPublishSchedule = pgTable("auto_publish_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Day of week (0 = Sunday, 1 = Monday, etc.)
  dayOfWeek: integer("dayOfWeek").notNull(),
  
  // Time (stored as HH:MM format)
  publishTime: varchar("publishTime", { length: 5 }).notNull(),

  // Optional specific date (YYYY-MM-DD) — null means recurring weekly on dayOfWeek
  publishDate: varchar("publishDate", { length: 10 }),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AutoPublishSchedule = typeof autoPublishSchedule.$inferSelect;
export type InsertAutoPublishSchedule = typeof autoPublishSchedule.$inferInsert;

/**
 * Auto-publish queue - posts generated and waiting to be published
 */
export const autoPublishQueue = pgTable("auto_publish_queue", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Content
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  mediaLibraryId: integer("mediaLibraryId"),
  generatedPostId: integer("generatedPostId"),
  generatedFrom: text("generatedFrom"), // JSON with inspiration source info
  
  // Schedule
  scheduledFor: timestamp("scheduledFor").notNull(),
  
  // Status
  status: varchar("status", { length: 16 }).default("pending"),
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  errorMessage: text("errorMessage"),
  
  // Retry logic
  retryCount: integer("retryCount").default(0),
  lastRetryAt: timestamp("lastRetryAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AutoPublishQueue = typeof autoPublishQueue.$inferSelect;
export type InsertAutoPublishQueue = typeof autoPublishQueue.$inferInsert;

/**
 * Auto-publish history - log of all auto-published posts
 */
export const autoPublishHistory = pgTable("auto_publish_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  queueId: integer("queueId"),
  
  // Content snapshot
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 255 }),
  mediaLibraryId: integer("mediaLibraryId"),
  generatedPostId: integer("generatedPostId"),
  
  // Publication info
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  
  // Performance (updated later)
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  impressions: integer("impressions").default(0),
  
  // Status
  status: varchar("status", { length: 16 }).default("success"),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutoPublishHistory = typeof autoPublishHistory.$inferSelect;
export type InsertAutoPublishHistory = typeof autoPublishHistory.$inferInsert;


/**
 * Viral Posts - Top publications LinkedIn de la semaine
 */
export const viralPosts = pgTable("viral_posts", {
  id: serial("id").primaryKey(),
  
  // Author info
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorHeadline: text("authorHeadline"),
  authorProfileUrl: varchar("authorProfileUrl", { length: 500 }),
  authorProfilePicture: text("authorProfilePicture"),
  authorFollowers: integer("authorFollowers").default(0),
  
  // Post content
  content: text("content").notNull(),
  postUrl: varchar("postUrl", { length: 500 }).notNull(),
  
  // Engagement metrics
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  impressions: integer("impressions").default(0),
  
  // Classification
  theme: varchar("theme", { length: 100 }),
  language: varchar("language", { length: 16 }).default("FR"),
  
  // Ranking
  weekNumber: integer("weekNumber").notNull(), // Week of the year
  year: integer("year").notNull(),
  rank: integer("rank").default(0), // Position in the weekly ranking
  
  // Metadata
  publishedAt: timestamp("publishedAt"),
  scrapedAt: timestamp("scrapedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type ViralPost = typeof viralPosts.$inferSelect;
export type InsertViralPost = typeof viralPosts.$inferInsert;


// ============================================
// AGENT IA SYSTEM TABLES
// ============================================

/**
 * AI Agents - Configuration and status of user's AI agents
 */
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Agent identity
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 18 }).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 50 }), // emoji or icon name
  
  // Status
  status: varchar("status", { length: 16 }).default("paused"),
  lastActiveAt: timestamp("lastActiveAt"),
  
  // Autonomy settings
  autonomyLevel: varchar("autonomyLevel", { length: 16 }).default("supervised"),
  requiresApproval: boolean("requiresApproval").default(true),
  
  // Performance metrics
  tasksCompleted: integer("tasksCompleted").default(0),
  tasksApproved: integer("tasksApproved").default(0),
  tasksRejected: integer("tasksRejected").default(0),
  successRate: varchar("successRate", { length: 10 }),
  
  // Configuration (JSON)
  config: text("config"), // Agent-specific settings
  
  // Scheduling settings
  scheduleEnabled: boolean("scheduleEnabled").default(false),
  scheduleDays: text("scheduleDays"), // JSON array of days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  scheduleHours: text("scheduleHours"), // JSON array of hours: ["08:00", "12:00", "18:00"]
  scheduleTimezone: varchar("scheduleTimezone", { length: 50 }).default("Europe/Paris"),
  tasksPerDay: integer("tasksPerDay").default(1),
  lastScheduledAt: timestamp("lastScheduledAt"),
  nextScheduledAt: timestamp("nextScheduledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Tasks - Work items created by agents
 */
export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull(),
  userId: integer("userId").notNull(),
  
  // Task details
  type: varchar("type", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Task status
  status: varchar("status", { length: 17 }).default("pending"),
  
  // Priority and scheduling
  priority: varchar("priority", { length: 16 }).default("medium"),
  scheduledFor: timestamp("scheduledFor"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Input/Output data (JSON)
  inputData: text("inputData"),
  outputData: text("outputData"),
  
  // Approval workflow
  requiresApproval: boolean("requiresApproval").default(true),
  approvedAt: timestamp("approvedAt"),
  approvedBy: integer("approvedBy"),
  rejectionReason: text("rejectionReason"),
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

/**
 * Agent Memory - Learning and context storage for agents
 */
export const agentMemory = pgTable("agent_memory", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull(),
  userId: integer("userId").notNull(),
  
  // Memory type
  type: varchar("type", { length: 19 }).notNull(),
  
  // Memory content
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // JSON data
  
  // Importance and relevance
  importance: varchar("importance", { length: 16 }).default("medium"),
  confidence: varchar("confidence", { length: 10 }), // 0-100%
  
  // Source and context
  source: varchar("source", { length: 100 }), // where this memory came from
  context: text("context"), // additional context
  
  // Expiration
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

/**
 * Agent Logs - Activity history for agents
 */
export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull(),
  userId: integer("userId").notNull(),
  taskId: integer("taskId"),
  
  // Log details
  action: varchar("action", { length: 100 }).notNull(),
  level: varchar("level", { length: 16 }).default("info"),
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
export const carouselTemplates = pgTable("carousel_templates", {
  id: serial("id").primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  
  // Template structure
  slideCount: integer("slideCount").default(5),
  layout: text("layout").notNull(), // JSON structure
  
  // Styling
  colorScheme: varchar("colorScheme", { length: 50 }),
  fontFamily: varchar("fontFamily", { length: 100 }),
  
  // Categories
  category: varchar("category", { length: 16 }).default("educational"),
  
  // Usage stats
  usageCount: integer("usageCount").default(0),
  
  isActive: boolean("isActive").default(true),
  isPremium: boolean("isPremium").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type CarouselTemplate = typeof carouselTemplates.$inferSelect;
export type InsertCarouselTemplate = typeof carouselTemplates.$inferInsert;

/**
 * Generated Carousels - User-created carousels
 */
export const generatedCarousels = pgTable("generated_carousels", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  templateId: integer("templateId"),
  agentTaskId: integer("agentTaskId"),
  
  // Carousel content
  title: varchar("title", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }),
  slides: text("slides").notNull(), // JSON array of slide content
  
  // Generated files
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 255 }),
  previewImages: text("previewImages"), // JSON array of image URLs
  
  // Status
  status: varchar("status", { length: 16 }).default("draft"),
  
  // LinkedIn post reference
  linkedinPostId: varchar("linkedinPostId", { length: 100 }),
  publishedAt: timestamp("publishedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type GeneratedCarousel = typeof generatedCarousels.$inferSelect;
export type InsertGeneratedCarousel = typeof generatedCarousels.$inferInsert;

/**
 * Infographic Templates - Pre-designed infographic layouts
 */
export const infographicTemplates = pgTable("infographic_templates", {
  id: serial("id").primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  
  // Template structure
  layout: text("layout").notNull(), // JSON structure
  dimensions: varchar("dimensions", { length: 50 }).default("1080x1350"),
  
  // Categories
  category: varchar("category", { length: 16 }).default("statistics"),
  
  // Usage stats
  usageCount: integer("usageCount").default(0),
  
  isActive: boolean("isActive").default(true),
  isPremium: boolean("isPremium").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InfographicTemplate = typeof infographicTemplates.$inferSelect;
export type InsertInfographicTemplate = typeof infographicTemplates.$inferInsert;

/**
 * Trend Alerts - Detected trends by Trend Hunter agent
 */
export const trendAlerts = pgTable("trend_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  agentId: integer("agentId"),
  
  // Trend details
  topic: varchar("topic", { length: 255 }).notNull(),
  description: text("description"),
  
  // Metrics
  trendScore: integer("trendScore").default(0), // 0-100
  growthRate: varchar("growthRate", { length: 20 }),
  mentionCount: integer("mentionCount").default(0),
  
  // Sources
  sources: text("sources"), // JSON array of source URLs
  relatedPosts: text("relatedPosts"), // JSON array of post IDs
  
  // Suggested action
  suggestedPostContent: text("suggestedPostContent"),
  suggestedPostType: varchar("suggestedPostType", { length: 16 }),
  
  // Status
  status: varchar("status", { length: 16 }).default("new"),
  
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
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  
  // Notification type
  type: varchar("type", { length: 20 }).notNull(),
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entities
  agentId: integer("agentId"),
  taskId: integer("taskId"),
  postId: integer("postId"),
  
  // Action URL
  actionUrl: varchar("actionUrl", { length: 500 }),
  actionLabel: varchar("actionLabel", { length: 100 }),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  // Priority
  priority: varchar("priority", { length: 16 }).default("medium"),
  
  // Metadata (JSON)
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User media library — images, videos and publication drafts for AI-assisted posting
 */
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),

  title: varchar("title", { length: 255 }),
  description: text("description"),
  tags: text("tags"), // JSON array of strings

  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: integer("fileSize").default(0),
  mediaType: varchar("mediaType", { length: 16 }).notNull(),

  aiDescription: text("aiDescription"),
  aiSuggestedTheme: varchar("aiSuggestedTheme", { length: 100 }),
  usageCount: integer("usageCount").default(0),
  lastUsedAt: timestamp("lastUsedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type MediaLibraryItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaLibraryItem = typeof mediaLibrary.$inferInsert;

/**
 * Sliding-window rate-limit hits — one row per call to a guarded endpoint
 * (AI generation, LinkedIn publish). Enforced globally across all serverless
 * instances since it lives in Postgres, not in-process memory.
 */
export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    bucket: varchar("bucket", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("rate_limit_hits_user_bucket_idx").on(table.userId, table.bucket, table.createdAt)]
);

export type RateLimitHit = typeof rateLimitHits.$inferSelect;
