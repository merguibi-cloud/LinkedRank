import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { signOutSupabase } from "./_core/supabase";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getAllPosts, getPostById, createPost, updatePost, deletePost, getPostsCount, getAllCategories, getDb } from "./db";
import {
  createAgent,
  getUserAgents,
  getAgentById,
  updateAgentStatus,
  updateAgentConfig,
  initializeUserAgents,
  createTask,
  getPendingTasks,
  getAgentTasks,
  approveTask,
  rejectTask,
  getAgentLogs,
  processTask,
  processAllPendingTasks,
} from "./services/agentService";
import { agents, agentTasks, agentLogs, generatedCarousels, carouselTemplates } from "../drizzle/schema";
import { generateCarousel, generateCarouselContent, renderCarouselToImages, type CarouselConfig } from "./services/carouselGenerator";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyPostsGenerated,
} from "./services/notificationService";
import { 
  generateLinkedInPost, 
  generateMultiplePosts,
  AVAILABLE_THEMES, 
  AVAILABLE_TONES, 
  AVAILABLE_LANGUAGES,
  type GenerationRequest,
  type UserContext
} from "./services/contentGenerator";
import { buildLearningContext } from "./services/agentLearningService";
import {
  ONBOARDING_QUESTIONS,
  extractProfileFromAnswers,
  saveOnboardingProfile,
  isOnboardingComplete,
} from "./services/voiceOnboardingService";
import { generatePostImage } from "./services/postImageService";
import { userProfiles, generatedPosts, linkedinInfluencers } from "../drizzle/schema";
import { eq, desc, sql, like, or, and } from "drizzle-orm";
import { canUserPerformAction, getRemainingUsage } from "./services/subscriptionLimits";
import {
  uploadMedia,
  listMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  generatePostForMedia,
  suggestPostsFromLibrary,
  suggestMediaForPost,
  reanalyzeMedia,
} from "./services/mediaLibraryService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { passwordHash, ...safeUser } = opts.ctx.user;
      return safeUser;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await signOutSupabase(ctx.req, ctx.res);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Posts router
  posts: router({
    list: publicProcedure
      .input(z.object({
        language: z.enum(["FR", "EN"]).optional(),
        status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const posts = await getAllPosts(input);
        const total = await getPostsCount(input);
        return { posts, total };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPostById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        language: z.enum(["FR", "EN"]),
        theme: z.string(),
        category: z.string().optional(),
        mediaType: z.enum(["none", "image", "video"]).default("none"),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        mediaSource: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published", "failed"]).default("draft"),
      }))
      .mutation(async ({ input }) => {
        const id = await createPost(input);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        language: z.enum(["FR", "EN"]).optional(),
        theme: z.string().optional(),
        category: z.string().optional(),
        mediaType: z.enum(["none", "image", "video"]).optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        mediaSource: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePost(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.id);
        return { success: true };
      }),
  }),

  // Categories router
  categories: router({
    list: publicProcedure.query(async () => {
      return await getAllCategories();
    }),
  }),

  // Content Generator router
  generator: router({
    // Get available options for the generator
    options: publicProcedure.query(() => {
      return {
        themes: AVAILABLE_THEMES,
        tones: AVAILABLE_TONES,
        languages: AVAILABLE_LANGUAGES,
      };
    }),

    // Generate a single post
    generate: protectedProcedure
      .input(z.object({
        theme: z.string(),
        tone: z.enum(["professional", "casual", "inspirational", "educational", "provocative"]),
        language: z.enum(["FR", "EN", "AR", "ES", "DE"]),
        postType: z.enum(["story", "tips", "question", "announcement", "motivation", "insight"]).optional(),
        additionalInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const userId = ctx.user.id;

        // Check subscription limits for AI generation
        const limitCheck = await canUserPerformAction(userId, "ai_generation");
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || "Limite de génération atteinte. Passez à un plan supérieur pour continuer.");
        }

        // Get user profile for context
        const profileResult = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId))
          .limit(1);
        
        const profile = profileResult[0];

        const userContext: UserContext = profile ? {
          companyName: profile.companyName || undefined,
          industry: profile.industry || undefined,
          sector: profile.sector || undefined,
          products: profile.products ? JSON.parse(profile.products) : undefined,
          services: profile.services ? JSON.parse(profile.services) : undefined,
          targetAudience: profile.targetAudience || undefined,
          personalBio: profile.personalBio || undefined,
          expertise: profile.expertise ? JSON.parse(profile.expertise) : undefined,
          achievements: profile.achievements || undefined,
          businessGoals: profile.businessGoals || undefined,
          uniqueSellingPoints: profile.uniqueSellingPoints || undefined,
        } : {};

        const learningContext = await buildLearningContext(userId);

        const request: GenerationRequest = {
          theme: input.theme,
          tone: input.tone,
          language: input.language,
          userContext,
          additionalInstructions: input.additionalInstructions,
          postType: input.postType,
          learningContext,
        };

        const generated = await generateLinkedInPost(request);

        // Save to database
        const [result] = await db.insert(generatedPosts).values({
          userId,
          title: generated.title,
          content: generated.content,
          language: input.language,
          theme: input.theme,
          tone: input.tone,
          prompt: input.additionalInstructions || null,
          status: "generated",
        }).returning({ id: generatedPosts.id });

        await notifyPostsGenerated(userId, 1, input.theme, [result.id]);

        return {
          id: result.id,
          ...generated,
        };
      }),

    // Generate multiple posts
    generateBatch: protectedProcedure
      .input(z.object({
        theme: z.string(),
        tone: z.enum(["professional", "casual", "inspirational", "educational", "provocative"]),
        language: z.enum(["FR", "EN", "AR", "ES", "DE"]),
        count: z.number().min(1).max(5).default(3),
        additionalInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const userId = ctx.user.id;

        // Check subscription limits for AI generation
        const limitCheck = await canUserPerformAction(userId, "ai_generation");
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || "Limite de génération atteinte. Passez à un plan supérieur pour continuer.");
        }

        // Get user profile for context
        const profileResult = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId))
          .limit(1);
        
        const profile = profileResult[0];

        const userContext: UserContext = profile ? {
          companyName: profile.companyName || undefined,
          industry: profile.industry || undefined,
          sector: profile.sector || undefined,
          products: profile.products ? JSON.parse(profile.products) : undefined,
          services: profile.services ? JSON.parse(profile.services) : undefined,
          targetAudience: profile.targetAudience || undefined,
          personalBio: profile.personalBio || undefined,
          expertise: profile.expertise ? JSON.parse(profile.expertise) : undefined,
          achievements: profile.achievements || undefined,
          businessGoals: profile.businessGoals || undefined,
          uniqueSellingPoints: profile.uniqueSellingPoints || undefined,
        } : {};

        const learningContext = await buildLearningContext(userId);

        const request: GenerationRequest = {
          theme: input.theme,
          tone: input.tone,
          language: input.language,
          userContext,
          additionalInstructions: input.additionalInstructions,
          learningContext,
        };

        const posts = await generateMultiplePosts(request, input.count);

        // Save all to database
        const savedPosts = [];
        const savedIds: number[] = [];
        for (const post of posts) {
          const [result] = await db.insert(generatedPosts).values({
            userId,
            title: post.title,
            content: post.content,
            language: input.language,
            theme: input.theme,
            tone: input.tone,
            prompt: input.additionalInstructions || null,
            status: "generated",
          }).returning({ id: generatedPosts.id });
          savedIds.push(result.id);
          savedPosts.push({ id: result.id, ...post });
        }

        await notifyPostsGenerated(userId, savedPosts.length, input.theme, savedIds);

        return savedPosts;
      }),

    // Get user's generated posts
    myPosts: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
        status: z.enum(["generated", "saved", "scheduled", "published", "deleted"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { posts: [], total: 0 };
        
        const userId = ctx.user.id;
        
        const conditions = [eq(generatedPosts.userId, userId)];
        if (input.status) {
          conditions.push(eq(generatedPosts.status, input.status));
        }

        const posts = await db
          .select()
          .from(generatedPosts)
          .where(and(...conditions))
          .orderBy(desc(generatedPosts.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(generatedPosts)
          .where(and(...conditions));

        return {
          posts,
          total: countResult[0]?.count || 0,
        };
      }),

    // Save/update a generated post
    savePost: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        status: z.enum(["generated", "saved", "scheduled", "published", "deleted"]).optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        imagePrompt: z.string().optional(),
        mediaLibraryId: z.number().optional(),
        linkedinPostId: z.string().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        await db
          .update(generatedPosts)
          .set({ ...data, updatedAt: new Date() })
          .where(and(
            eq(generatedPosts.id, id),
            eq(generatedPosts.userId, ctx.user.id)
          ));
        return { success: true };
      }),

    generatePostImage: protectedProcedure
      .input(z.object({
        content: z.string().min(10),
        title: z.string().min(1),
        suggestedMedia: z.string().optional(),
        visualStyle: z.string().optional(),
        imageSize: z.enum(["1024x1024", "1536x1024", "1024x1536", "1792x1024", "1024x1792"]).optional(),
        generatedPostId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const limitCheck = await canUserPerformAction(ctx.user.id, "image_generation");
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || "Génération d'image non disponible");
        }

        return generatePostImage(ctx.user.id, input);
      }),
  }),

  // Media Library router
  mediaLibrary: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        mediaType: z.enum(["image", "video", "document"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        return listMedia(ctx.user.id, input);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getMediaById(ctx.user.id, input.id);
      }),

    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        base64Data: z.string().min(1),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return uploadMedia(ctx.user.id, input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const updated = await updateMedia(ctx.user.id, id, data);
        if (!updated) throw new Error("Média introuvable");
        return updated;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const ok = await deleteMedia(ctx.user.id, input.id);
        if (!ok) throw new Error("Média introuvable");
        return { success: true };
      }),

    reanalyze: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const updated = await reanalyzeMedia(ctx.user.id, input.id);
        if (!updated) throw new Error("Média introuvable");
        return updated;
      }),

    generatePost: protectedProcedure
      .input(z.object({
        mediaId: z.number(),
        tone: z.enum(["professional", "casual", "inspirational", "educational", "provocative"]).optional(),
        language: z.enum(["FR", "EN", "AR", "ES", "DE"]).optional(),
        postType: z.enum(["story", "tips", "question", "announcement", "motivation", "insight"]).optional(),
        additionalInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const limitCheck = await canUserPerformAction(ctx.user.id, "ai_generation");
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || "Limite de génération atteinte");
        }
        const { mediaId, ...options } = input;
        return generatePostForMedia(ctx.user.id, mediaId, options);
      }),

    suggestPosts: protectedProcedure
      .input(z.object({
        count: z.number().min(1).max(5).default(3),
        tone: z.enum(["professional", "casual", "inspirational", "educational", "provocative"]).optional(),
        language: z.enum(["FR", "EN", "AR", "ES", "DE"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const limitCheck = await canUserPerformAction(ctx.user.id, "ai_generation");
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || "Limite de génération atteinte");
        }
        const { count, ...options } = input;
        return suggestPostsFromLibrary(ctx.user.id, count, options);
      }),

    suggestForPost: protectedProcedure
      .input(z.object({
        content: z.string().min(10),
        title: z.string().optional(),
        limit: z.number().min(1).max(10).optional(),
      }))
      .query(async ({ ctx, input }) => {
        return suggestMediaForPost(ctx.user.id, input);
      }),
  }),

  // User Profile router
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.user.id))
        .limit(1);
      
      const profile = result[0];
      if (!profile) return null;

      return {
        ...profile,
        products: profile.products ? JSON.parse(profile.products) : [],
        services: profile.services ? JSON.parse(profile.services) : [],
        expertise: profile.expertise ? JSON.parse(profile.expertise) : [],
        preferredLanguages: profile.preferredLanguages ? JSON.parse(profile.preferredLanguages) : ["FR"],
        contentGoals: profile.contentGoals ? JSON.parse(profile.contentGoals) : [],
      };
    }),

    update: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional(),
        products: z.array(z.string()).optional(),
        services: z.array(z.string()).optional(),
        targetAudience: z.string().optional(),
        personalBio: z.string().optional(),
        expertise: z.array(z.string()).optional(),
        achievements: z.string().optional(),
        preferredTone: z.enum(["professional", "casual", "inspirational", "educational", "provocative"]).optional(),
        preferredLanguages: z.array(z.string()).optional(),
        contentGoals: z.array(z.string()).optional(),
        businessGoals: z.string().optional(),
        uniqueSellingPoints: z.string().optional(),
        competitors: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const userId = ctx.user.id;

        // Check if profile exists
        const existingResult = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId))
          .limit(1);
        
        const existing = existingResult[0];

        const data = {
          ...input,
          products: input.products ? JSON.stringify(input.products) : undefined,
          services: input.services ? JSON.stringify(input.services) : undefined,
          expertise: input.expertise ? JSON.stringify(input.expertise) : undefined,
          preferredLanguages: input.preferredLanguages ? JSON.stringify(input.preferredLanguages) : undefined,
          contentGoals: input.contentGoals ? JSON.stringify(input.contentGoals) : undefined,
        };

        if (existing) {
          await db
            .update(userProfiles)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userProfiles.userId, userId));
        } else {
          await db.insert(userProfiles).values({
            userId,
            ...data,
          });
        }

        return { success: true };
      }),
  }),

  // Influencers router
  influencers: router({
    list: publicProcedure
      .input(z.object({
        country: z.string().optional(),
        industry: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
        sortBy: z.enum(["followers", "engagement", "growth"]).optional().default("followers"),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { influencers: [], total: 0 };
        
        const conditions = [];
        
        if (input.country) {
          conditions.push(eq(linkedinInfluencers.country, input.country));
        }
        if (input.industry) {
          conditions.push(
            or(
              eq(linkedinInfluencers.industry, input.industry),
              eq(linkedinInfluencers.sector, input.industry)
            )
          );
        }
        if (input.search) {
          conditions.push(
            or(
              like(linkedinInfluencers.name, `%${input.search}%`),
              like(linkedinInfluencers.headline, `%${input.search}%`)
            )
          );
        }

        const orderBy = input.sortBy === "engagement" 
          ? desc(linkedinInfluencers.avgLikes)
          : input.sortBy === "growth"
          ? desc(linkedinInfluencers.followersGrowth30d)
          : desc(linkedinInfluencers.followers);

        const influencers = await db
          .select()
          .from(linkedinInfluencers)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(input.offset);

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(linkedinInfluencers)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          influencers,
          total: countResult[0]?.count || 0,
        };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db
          .select()
          .from(linkedinInfluencers)
          .where(eq(linkedinInfluencers.id, input.id))
          .limit(1);
        return result[0] || null;
      }),

    // Get available countries and industries for filters
    filters: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { countries: [], industries: [] };
      
      const countries = await db
        .selectDistinct({ country: linkedinInfluencers.country })
        .from(linkedinInfluencers)
        .where(sql`${linkedinInfluencers.country} IS NOT NULL`);

      const industries = await db
        .selectDistinct({ industry: linkedinInfluencers.industry })
        .from(linkedinInfluencers)
        .where(sql`${linkedinInfluencers.industry} IS NOT NULL`);

      return {
        countries: countries.map((c: { country: string | null }) => c.country).filter(Boolean) as string[],
        industries: industries.map((i: { industry: string | null }) => i.industry).filter(Boolean) as string[],
      };
    }),
  }),

  // Agents router
  agents: router({
    // Get all agents for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const userAgents = await getUserAgents(ctx.user.id);
      return userAgents;
    }),

    // Get single agent
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAgentById(input.id);
      }),

    // Initialize default agents for user
    initialize: protectedProcedure.mutation(async ({ ctx }) => {
      const existingAgents = await getUserAgents(ctx.user.id);
      // Check if we need to add missing agents (Growth Strategist, Network Builder)
      const existingTypes = existingAgents.map(a => a.type);
      const missingTypes = ['growth_strategist', 'network_builder'].filter(t => !existingTypes.includes(t as any));
      
      if (missingTypes.length > 0) {
        // Add missing agents
        const { createAgent } = await import('./services/agentService');
        const newAgentDefs = [
          { name: 'Growth Strategist', type: 'growth_strategist', description: 'Analyse vos performances et recommande des stratégies de croissance', avatar: '📈' },
          { name: 'Network Builder', type: 'network_builder', description: 'Identifie les connexions stratégiques et optimise votre réseau', avatar: '🤝' },
        ].filter(a => missingTypes.includes(a.type));
        
        for (const agentDef of newAgentDefs) {
          await createAgent(ctx.user.id, agentDef as any);
        }
        
        return await getUserAgents(ctx.user.id);
      }
      
      if (existingAgents.length > 0) {
        return existingAgents;
      }
      return await initializeUserAgents(ctx.user.id);
    }),

    // Toggle agent status (active/paused)
    toggleStatus: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        active: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await updateAgentStatus(input.agentId, input.active ? "active" : "paused");
        return { success: true };
      }),

    // Update agent configuration
    updateConfig: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        config: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        await updateAgentConfig(input.agentId, input.config as any);
        return { success: true };
      }),

    // Get pending tasks for approval
    pendingTasks: protectedProcedure.query(async ({ ctx }) => {
      return await getPendingTasks(ctx.user.id);
    }),

    // Get tasks for specific agent
    agentTasks: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        return await getAgentTasks(input.agentId, input.limit);
      }),

    // Approve a task
    approveTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        modifications: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await approveTask(input.taskId, ctx.user.id);
        return { success: true };
      }),

    // Reject a task
    rejectTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        await rejectTask(input.taskId, input.reason || "");
        return { success: true };
      }),

    // Get agent activity logs
    logs: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await getAgentLogs(ctx.user.id, input.agentId, input.limit);
      }),

    // Create a new task manually
    createTask: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        type: z.enum(["generate_post", "generate_carousel", "generate_infographic", "analyze_trends", "suggest_response", "detect_trend", "analyze_performance", "suggest_connection", "schedule_post"]),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        inputData: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const task = await createTask(input.agentId, ctx.user.id, {
          type: input.type as any,
          title: input.title,
          description: input.description,
          priority: input.priority,
          inputData: input.inputData as any,
        });
        return task;
      }),

    // Process a specific task
    processTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await processTask(input.taskId);
        return { success: true };
      }),

    // Process all pending tasks for user
    processAllPending: protectedProcedure
      .mutation(async ({ ctx }) => {
        const result = await processAllPendingTasks(ctx.user.id);
        return result;
      }),

    // Update agent schedule
    updateSchedule: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        scheduleEnabled: z.boolean(),
        scheduleDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])).optional(),
        scheduleHours: z.array(z.string()).optional(),
        scheduleTimezone: z.string().optional(),
        tasksPerDay: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateAgentSchedule } = await import('./services/agentScheduler');
        const agent = await updateAgentSchedule(
          input.agentId,
          input.scheduleEnabled,
          input.scheduleDays as any,
          input.scheduleHours,
          input.scheduleTimezone,
          input.tasksPerDay
        );
        return { success: true, agent };
      }),

    // Update agent autonomy level
    updateAutonomy: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        autonomyLevel: z.enum(["supervised", "semi_autonomous", "autonomous"]),
        requiresApproval: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const db = (await getDb())!;
        await db.update(agents).set({
          autonomyLevel: input.autonomyLevel,
          requiresApproval: input.requiresApproval,
        }).where(eq(agents.id, input.agentId));
        return { success: true };
      }),

    // Get scheduler status
    schedulerStatus: protectedProcedure.query(async () => {
      const { getSchedulerStatus } = await import('./services/agentScheduler');
      return getSchedulerStatus();
    }),

    // Force check scheduled tasks (for testing)
    forceCheckSchedule: protectedProcedure
      .mutation(async () => {
        const { checkAndExecuteScheduledTasks } = await import('./services/agentScheduler');
        const result = await checkAndExecuteScheduledTasks();
        return result;
      }),
  }),

  // Carousels router
  carousels: router({
    // Generate a new carousel
    generate: protectedProcedure
      .input(z.object({
        topic: z.string(),
        slideCount: z.number().min(3).max(15).default(7),
        style: z.enum(["modern", "minimal", "bold", "gradient"]).default("modern"),
        primaryColor: z.string().optional().default("#8B5CF6"),
        secondaryColor: z.string().optional().default("#EC4899"),
        authorTitle: z.string().optional(),
        includeSwipeIndicator: z.boolean().optional().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const config: CarouselConfig = {
          topic: input.topic,
          slideCount: input.slideCount,
          style: input.style,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          authorName: ctx.user.name || "Auteur",
          authorTitle: input.authorTitle,
          includeSwipeIndicator: input.includeSwipeIndicator,
        };

        const result = await generateCarousel(config);

        // Save to database
        const db = (await getDb())!;
        const [saved] = await db.insert(generatedCarousels).values({
          userId: ctx.user.id,
          title: input.topic,
          topic: input.topic,
          slides: JSON.stringify(result.slides),
          previewImages: JSON.stringify(result.imageUrls),
          status: "ready",
        }).returning({ id: generatedCarousels.id });

        return {
          id: saved.id,
          slides: result.slides,
          imageUrls: result.imageUrls,
        };
      }),

    // List user's carousels
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const db = (await getDb())!;
        
        const carousels = await db
          .select()
          .from(generatedCarousels)
          .where(eq(generatedCarousels.userId, ctx.user.id))
          .orderBy(desc(generatedCarousels.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return carousels.map(c => ({
          ...c,
          slides: c.slides ? JSON.parse(c.slides) : [],
          previewImages: c.previewImages ? JSON.parse(c.previewImages) : [],
        }));
      }),

    // Get single carousel
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = (await getDb())!;
        
        const [carousel] = await db
          .select()
          .from(generatedCarousels)
          .where(and(
            eq(generatedCarousels.id, input.id),
            eq(generatedCarousels.userId, ctx.user.id)
          ))
          .limit(1);

        if (!carousel) return null;

        return {
          ...carousel,
          slides: carousel.slides ? JSON.parse(carousel.slides) : [],
          previewImages: carousel.previewImages ? JSON.parse(carousel.previewImages) : [],
        };
      }),

    // Delete carousel
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = (await getDb())!;
        
        await db
          .delete(generatedCarousels)
          .where(and(
            eq(generatedCarousels.id, input.id),
            eq(generatedCarousels.userId, ctx.user.id)
          ));

        return { success: true };
      }),

    // Get templates
    templates: publicProcedure.query(async () => {
      const db = (await getDb())!;
      
      const templates = await db
        .select()
        .from(carouselTemplates)
        .where(eq(carouselTemplates.isActive, true))
        .orderBy(desc(carouselTemplates.usageCount));

      return templates.map(t => ({
        ...t,
        layout: t.layout ? JSON.parse(t.layout) : {},
      }));
    }),
  }),

  // Notifications router
  notifications: router({
    // Get user notifications
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        unreadOnly: z.boolean().optional().default(false),
      }))
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, {
          limit: input.limit,
          offset: input.offset,
          unreadOnly: input.unreadOnly,
        });
      }),

    // Get unread count
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadCount(ctx.user.id);
    }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markAsRead(input.id, ctx.user.id);
        return { success: true };
      }),

    // Mark all notifications as read
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllAsRead(ctx.user.id);
      return { success: true };
    }),

    // Delete notification
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  onboarding: router({
    getQuestions: protectedProcedure.query(() => ONBOARDING_QUESTIONS),

    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const completed = await isOnboardingComplete(ctx.user.id);
      return { completed };
    }),

    finalize: protectedProcedure
      .input(
        z.object({
          answers: z.array(
            z.object({
              questionId: z.string(),
              question: z.string(),
              answer: z.string().min(1),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { profile, usedFallback } = await extractProfileFromAnswers(input.answers);
        const result = await saveOnboardingProfile(ctx.user.id, profile);
        return { profile, schedule: result.schedule, usedFallback };
      }),
  }),
});

export type AppRouter = typeof appRouter;
