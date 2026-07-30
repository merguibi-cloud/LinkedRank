import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { signOutSupabase } from "./_core/supabase";
import { resolvePublicUrl, resolvePublicUrls, resolveStorageAssetUrl } from "./_core/publicUrl";
import { systemRouter } from "./_core/systemRouter";
import { checkRateLimit } from "./_core/rateLimit";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./services/password";
import { getAllPosts, getPostById, createPost, updatePost, deletePost, getPostsCount, getAllCategories, getDb, getPgClient, getUserByEmail, upsertUser } from "./db";
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
import { agents, agentTasks, agentLogs, generatedCarousels, carouselTemplates, users, mediaLibrary, autoPublishQueue, tokenUsage, linkedinSettings } from "../drizzle/schema";
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
import { userProfiles, generatedPosts, linkedinInfluencers, viralPosts } from "../drizzle/schema";
import { eq, desc, asc, sql, like, or, and } from "drizzle-orm";
import { VIRAL_POSTS_FALLBACK } from "./data/viralPostsFallback";
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
import { deleteMediaFile } from "./services/mediaLibraryStorage";
import { withCache } from "./_core/cache";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";
import WebSocket from "ws";

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
    // Supabase accounts update name/email/password via supabase.auth.updateUser()
    // client-side — our DB mirrors that on the next request. These mutations
    // are only for the legacy email/password login method.
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().trim().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.loginMethod === "supabase") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Utilisez les paramètres de votre compte Supabase pour modifier votre nom",
          });
        }
        await upsertUser({ openId: ctx.user.openId, name: input.name });
        return { success: true } as const;
      }),
    updateEmail: protectedProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.loginMethod === "supabase") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Utilisez les paramètres de votre compte Supabase pour modifier votre email",
          });
        }
        const normalized = input.email.toLowerCase();
        const existing = await getUserByEmail(normalized);
        if (existing && existing.id !== ctx.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un compte existe déjà avec cet email",
          });
        }
        await upsertUser({ openId: ctx.user.openId, email: normalized });
        return { success: true } as const;
      }),
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.loginMethod === "supabase") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Utilisez les paramètres de votre compte Supabase pour modifier votre mot de passe",
          });
        }
        if (
          !ctx.user.passwordHash ||
          !(await verifyPassword(input.currentPassword, ctx.user.passwordHash))
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Mot de passe actuel incorrect",
          });
        }
        const passwordHash = await hashPassword(input.newPassword);
        await upsertUser({ openId: ctx.user.openId, passwordHash });
        return { success: true } as const;
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
    list: publicProcedure.query(() =>
      withCache("categories:list", 5 * 60_000, getAllCategories)
    ),
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

        const rateLimit = await checkRateLimit(userId, "ai_generation");
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Trop de générations en peu de temps. Réessayez dans quelques minutes.",
          });
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
          userId,
          endpoint: "post_generation",
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

        const rateLimit = await checkRateLimit(userId, "ai_generation", input.count);
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Trop de générations en peu de temps. Réessayez dans quelques minutes.",
          });
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
          userId,
          endpoint: "post_batch_generation",
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
          posts: posts.map((post) => ({
            ...post,
            imageUrl: resolveStorageAssetUrl(post.imageUrl, post.imageKey),
          })),
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
    filters: publicProcedure.query(() =>
      withCache("influencers:filters", 15 * 60_000, async () => {
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
      })
    ),
  }),

  viralPosts: router({
    list: publicProcedure
      .input(
        z.object({
          weekNumber: z.number().optional(),
          year: z.number().optional(),
          language: z.enum(["all", "FR", "EN"]).optional().default("all"),
          limit: z.number().min(1).max(50).optional().default(20),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        const conditions = [];

        if (input.weekNumber) {
          conditions.push(eq(viralPosts.weekNumber, input.weekNumber));
        }
        if (input.year) {
          conditions.push(eq(viralPosts.year, input.year));
        }
        if (input.language !== "all") {
          conditions.push(eq(viralPosts.language, input.language));
        }

        if (db) {
          const rows = await db
            .select()
            .from(viralPosts)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(viralPosts.rank), desc(viralPosts.likes))
            .limit(input.limit);

          if (rows.length > 0) {
            return { posts: rows, source: "database" as const };
          }
        }

        let fallback = [...VIRAL_POSTS_FALLBACK];
        if (input.language !== "all") {
          fallback = fallback.filter((post) => post.language === input.language);
        }

        return {
          posts: fallback.slice(0, input.limit),
          source: "fallback" as const,
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
        const rateLimit = await checkRateLimit(ctx.user.id, "ai_generation");
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Trop de générations en peu de temps. Réessayez dans quelques minutes.",
          });
        }

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
          pdfUrl: result.pdfUrl ?? null,
          pdfKey: result.pdfKey ?? null,
          status: "ready",
        }).returning({ id: generatedCarousels.id });

        return {
          id: saved.id,
          slides: result.slides,
          imageUrls: resolvePublicUrls(result.imageUrls),
          pdfUrl: result.pdfUrl ? resolvePublicUrl(result.pdfUrl) : undefined,
          pdfKey: result.pdfKey,
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
          previewImages: resolvePublicUrls(
            c.previewImages ? JSON.parse(c.previewImages) : []
          ),
          pdfUrl: c.pdfUrl ? resolvePublicUrl(c.pdfUrl) : undefined,
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
          previewImages: resolvePublicUrls(
            carousel.previewImages ? JSON.parse(carousel.previewImages) : []
          ),
          pdfUrl: carousel.pdfUrl ? resolvePublicUrl(carousel.pdfUrl) : undefined,
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
    templates: publicProcedure.query(() =>
      withCache("carousels:templates", 5 * 60_000, async () => {
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
      })
    ),
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

  admin: router({
    stats: adminProcedure.query(async () => {
      const pg = await getPgClient();
      if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Keep the overview to one database round trip. In production the pool is
      // intentionally small, so launching six queries concurrently can leave a
      // serverless request waiting for connections during traffic spikes.
      const [summary] = await pg`SELECT
        (SELECT COUNT(*)::int FROM users) AS users_total,
        (SELECT COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours')::int FROM users) AS users_last_24h,
        (SELECT COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days')::int FROM users) AS users_last_7d,
        (SELECT COUNT(*) FILTER (WHERE "lastSignedIn" > NOW() - INTERVAL '24 hours')::int FROM users) AS users_active_24h,
        (SELECT COUNT(*) FILTER (WHERE "lastSignedIn" > NOW() - INTERVAL '7 days')::int FROM users) AS users_active_7d,
        (SELECT COUNT(*)::int FROM generated_posts) AS generations_total,
        (SELECT COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours')::int FROM generated_posts) AS generations_last_24h,
        (SELECT COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days')::int FROM generated_posts) AS generations_last_7d,
        (SELECT COUNT(DISTINCT "userId")::int FROM generated_posts) AS generations_unique_users,
        (SELECT COUNT(*) FILTER (WHERE status = 'published')::int FROM auto_publish_queue) AS autopublish_published,
        (SELECT COUNT(*) FILTER (WHERE status = 'failed')::int FROM auto_publish_queue) AS autopublish_failed,
        (SELECT COUNT(*) FILTER (WHERE status = 'pending')::int FROM auto_publish_queue) AS autopublish_pending,
        (SELECT COUNT(*)::int FROM token_usage) AS spend_calls,
        (SELECT COALESCE(SUM("totalTokens"), 0)::int FROM token_usage) AS spend_total_tokens,
        (SELECT COALESCE(SUM("costUsd"::numeric), 0) FROM token_usage) AS spend_total_cost,
        (SELECT COALESCE(SUM("costUsd"::numeric) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days'), 0) FROM token_usage) AS spend_cost_7d,
        (SELECT COUNT(*)::int FROM media_library) AS storage_total_files,
        (SELECT COALESCE(SUM("fileSize"), 0)::bigint FROM media_library) AS storage_total_bytes,
        (SELECT COUNT(*)::int FROM generated_carousels) AS carousels_total`;

      return {
        users: {
          total: Number(summary.users_total),
          last24h: Number(summary.users_last_24h),
          last7d: Number(summary.users_last_7d),
          active24h: Number(summary.users_active_24h),
          active7d: Number(summary.users_active_7d),
        },
        generations: {
          total: Number(summary.generations_total),
          last24h: Number(summary.generations_last_24h),
          last7d: Number(summary.generations_last_7d),
          uniqueUsers: Number(summary.generations_unique_users),
        },
        autoPublish: {
          published: Number(summary.autopublish_published),
          failed: Number(summary.autopublish_failed),
          pending: Number(summary.autopublish_pending),
        },
        spend: {
          calls: Number(summary.spend_calls),
          totalTokens: Number(summary.spend_total_tokens),
          totalCost: Number(summary.spend_total_cost).toFixed(4),
          cost7d: Number(summary.spend_cost_7d).toFixed(4),
        },
        storage: {
          files: Number(summary.storage_total_files),
          bytes: Number(summary.storage_total_bytes),
          mb: Math.round(Number(summary.storage_total_bytes) / 1024 / 1024),
        },
        carousels: Number(summary.carousels_total),
      };
    }),

    users: adminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(25),
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        plan: z.string().min(1).max(32).optional(),
        linkedin: z.enum(["connected", "disconnected"]).optional(),
        sort: z.enum(["created_desc", "created_asc", "active_desc", "name_asc", "generations_desc"]).default("created_desc"),
      }))
      .query(async ({ input }) => {
        const pg = await getPgClient();
        if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const offset = (input.page - 1) * input.limit;
        const pattern = input.search ? `%${input.search}%` : null;
        const role = input.role ?? null;
        const plan = input.plan ?? null;
        const linkedinConnected = input.linkedin === "connected" ? true : input.linkedin === "disconnected" ? false : null;

        const [rows, [countRow]] = await Promise.all([
          pg`SELECT u.id, u.email, u.name, u."firstName", u."lastName", u."phoneNumber", u.role, u."subscriptionPlan",
                    u."createdAt", u."lastSignedIn",
                    COALESCE(gp.cnt, 0)::int AS generations,
                    COALESCE(ls.linkedin_connected, false) AS linkedin_connected
             FROM users u
             LEFT JOIN LATERAL (
               SELECT COUNT(*)::int AS cnt FROM generated_posts WHERE "userId" = u.id
             ) gp ON true
             LEFT JOIN LATERAL (
               SELECT BOOL_OR("isConnected") AS linkedin_connected
               FROM linkedin_settings WHERE "userId" = u.id
             ) ls ON true
             WHERE (${pattern}::text IS NULL OR u.email ILIKE ${pattern} OR u.name ILIKE ${pattern})
               AND (${role}::text IS NULL OR u.role = ${role})
               AND (${plan}::text IS NULL OR u."subscriptionPlan" = ${plan})
               AND (${linkedinConnected}::boolean IS NULL OR COALESCE(ls.linkedin_connected, false) = ${linkedinConnected})
             ORDER BY
               CASE WHEN ${input.sort} = 'created_desc' THEN u."createdAt" END DESC,
               CASE WHEN ${input.sort} = 'created_asc' THEN u."createdAt" END ASC,
               CASE WHEN ${input.sort} = 'active_desc' THEN u."lastSignedIn" END DESC,
               CASE WHEN ${input.sort} = 'name_asc' THEN LOWER(COALESCE(u.name, u.email)) END ASC,
               CASE WHEN ${input.sort} = 'generations_desc' THEN COALESCE(gp.cnt, 0) END DESC,
               u.id DESC
             LIMIT ${input.limit} OFFSET ${offset}`,
          pg`SELECT COUNT(*)::int AS total
             FROM users u
             LEFT JOIN LATERAL (
               SELECT BOOL_OR("isConnected") AS linkedin_connected
               FROM linkedin_settings WHERE "userId" = u.id
             ) ls ON true
             WHERE (${pattern}::text IS NULL OR u.email ILIKE ${pattern} OR u.name ILIKE ${pattern})
               AND (${role}::text IS NULL OR u.role = ${role})
               AND (${plan}::text IS NULL OR u."subscriptionPlan" = ${plan})
               AND (${linkedinConnected}::boolean IS NULL OR COALESCE(ls.linkedin_connected, false) = ${linkedinConnected})`,
        ]);

        return {
          rows: rows.map(r => ({
            id: Number(r.id),
            email: r.email as string,
            name: r.name as string | null,
            firstName: r.firstName as string | null,
            lastName: r.lastName as string | null,
            phoneNumber: r.phoneNumber as string | null,
            role: r.role as string,
            plan: r.subscriptionPlan as string,
            createdAt: String(r.createdAt),
            lastSignedIn: String(r.lastSignedIn),
            generations: Number(r.generations),
            linkedinConnected: Boolean(r.linkedin_connected),
          })),
          total: Number(countRow.total),
          page: input.page,
          limit: input.limit,
        };
      }),

    exportUsers: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        plan: z.string().min(1).max(32).optional(),
        linkedin: z.enum(["connected", "disconnected"]).optional(),
        sort: z.enum(["created_desc", "created_asc", "active_desc", "name_asc", "generations_desc"]).default("created_desc"),
      }))
      .mutation(async ({ input }) => {
        const pg = await getPgClient();
        if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const pattern = input.search ? `%${input.search}%` : null;
        const role = input.role ?? null;
        const plan = input.plan ?? null;
        const linkedinConnected = input.linkedin === "connected" ? true : input.linkedin === "disconnected" ? false : null;

        const rows = await pg`SELECT u.id, u.email, u.name, u."firstName", u."lastName", u."phoneNumber", u.role, u."subscriptionPlan",
                    u."createdAt", u."lastSignedIn",
                    COALESCE(gp.cnt, 0)::int AS generations,
                    COALESCE(ls.linkedin_connected, false) AS linkedin_connected
             FROM users u
             LEFT JOIN LATERAL (
               SELECT COUNT(*)::int AS cnt FROM generated_posts WHERE "userId" = u.id
             ) gp ON true
             LEFT JOIN LATERAL (
               SELECT BOOL_OR("isConnected") AS linkedin_connected
               FROM linkedin_settings WHERE "userId" = u.id
             ) ls ON true
             WHERE (${pattern}::text IS NULL OR u.email ILIKE ${pattern} OR u.name ILIKE ${pattern})
               AND (${role}::text IS NULL OR u.role = ${role})
               AND (${plan}::text IS NULL OR u."subscriptionPlan" = ${plan})
               AND (${linkedinConnected}::boolean IS NULL OR COALESCE(ls.linkedin_connected, false) = ${linkedinConnected})
             ORDER BY
               CASE WHEN ${input.sort} = 'created_desc' THEN u."createdAt" END DESC,
               CASE WHEN ${input.sort} = 'created_asc' THEN u."createdAt" END ASC,
               CASE WHEN ${input.sort} = 'active_desc' THEN u."lastSignedIn" END DESC,
               CASE WHEN ${input.sort} = 'name_asc' THEN LOWER(COALESCE(u.name, u.email)) END ASC,
               CASE WHEN ${input.sort} = 'generations_desc' THEN COALESCE(gp.cnt, 0) END DESC,
               u.id DESC
             LIMIT 10000`;

        return rows.map(r => ({
          id: Number(r.id),
          email: (r.email as string | null) ?? "",
          name: (r.name as string | null) ?? "",
          firstName: (r.firstName as string | null) ?? "",
          lastName: (r.lastName as string | null) ?? "",
          phoneNumber: (r.phoneNumber as string | null) ?? "",
          role: r.role as string,
          plan: (r.subscriptionPlan as string | null) ?? "",
          generations: Number(r.generations),
          linkedinConnected: Boolean(r.linkedin_connected),
          createdAt: String(r.createdAt),
          lastSignedIn: String(r.lastSignedIn),
        }));
      }),

    inviteUser: adminProcedure
      .input(z.object({
        email: z.string().trim().email().max(320),
        firstName: z.string().trim().min(1).max(120),
        lastName: z.string().trim().min(1).max(120),
        phoneNumber: z.string().trim().min(5).max(32),
      }))
      .mutation(async ({ input }) => {
        if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Service d'invitation Supabase non configuré",
          });
        }

        const email = input.email.toLowerCase();
        const applicationUser = await getUserByEmail(email);
        if (applicationUser && !applicationUser.openId.startsWith("supabase:")) {
          throw new TRPCError({ code: "CONFLICT", message: "Un utilisateur existe déjà avec cet email" });
        }

        const supabase = createSupabaseAdminClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
          realtime: { transport: WebSocket as never },
        });
        const redirectBase = (ENV.appUrl || "https://linkedrank.fr").replace(/\/$/, "");
        const invitationOptions = {
          redirectTo: `${redirectBase}/reset-password?invite=1`,
          data: {
            name: `${input.firstName} ${input.lastName}`,
            first_name: input.firstName,
            last_name: input.lastName,
            phone_number: input.phoneNumber,
          },
        };
        let { data, error } = await supabase.auth.admin.inviteUserByEmail(email, invitationOptions);

        let reinvited = false;
        if (error && /already|registered|exists/i.test(error.message)) {
          let pendingUserId: string | null = null;

          for (let page = 1; page <= 100 && !pendingUserId; page += 1) {
            const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
              page,
              perPage: 1000,
            });
            if (listError) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Impossible de vérifier l'invitation existante : ${listError.message}`,
              });
            }

            const existing = usersPage.users.find(
              user => user.email?.toLowerCase() === email,
            );
            if (existing) {
              if (existing.email_confirmed_at) {
                if (applicationUser) {
                  throw new TRPCError({
                    code: "CONFLICT",
                    message: "Un compte actif existe déjà avec cet email",
                  });
                }

                // The invite was verified by Supabase, but the user never
                // completed activation and therefore has no application row.
                // Preserve the Auth identity and send a fresh password link.
                const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${redirectBase}/reset-password?invite=1`,
                });
                if (recoveryError) {
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Impossible de renvoyer le lien d'activation : ${recoveryError.message}`,
                  });
                }

                return {
                  success: true,
                  email,
                  invitationId: existing.id,
                  reinvited: true,
                  recovery: true,
                };
              }
              pendingUserId = existing.id;
              break;
            }

            if (usersPage.users.length < 1000) break;
          }

          if (!pendingUserId) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Cet email est déjà enregistré et ne peut pas être réinvité",
            });
          }

          const { error: deleteError } = await supabase.auth.admin.deleteUser(pendingUserId);
          if (deleteError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Impossible de remplacer l'invitation expirée : ${deleteError.message}`,
            });
          }

          ({ data, error } = await supabase.auth.admin.inviteUserByEmail(email, invitationOptions));
          reinvited = true;
        }

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Invitation impossible : ${error.message}`,
          });
        }

        return {
          success: true,
          email,
          invitationId: data.user?.id ?? null,
          reinvited,
          recovery: false,
        };
      }),

    autopublishFailures: adminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        const pg = await getPgClient();
        if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const offset = (input.page - 1) * input.limit;

        const [byError, recent, [countRow]] = await Promise.all([
          pg`SELECT "errorMessage", COUNT(*)::int AS count
             FROM auto_publish_queue WHERE status = 'failed'
             GROUP BY "errorMessage" ORDER BY count DESC LIMIT 10`,
          pg`SELECT aq."errorMessage", aq."scheduledFor", aq."retryCount", u.email
             FROM auto_publish_queue aq
             LEFT JOIN users u ON u.id = aq."userId"
             WHERE aq.status = 'failed'
             ORDER BY aq."updatedAt" DESC
             LIMIT ${input.limit} OFFSET ${offset}`,
          pg`SELECT COUNT(*)::int AS total FROM auto_publish_queue WHERE status = 'failed'`,
        ]);

        return {
          byError: byError.map(r => ({ error: r.errorMessage as string, count: Number(r.count) })),
          recent: recent.map(r => ({
            email: r.email as string,
            error: r.errorMessage as string,
            retries: Number(r.retryCount),
            scheduledFor: String(r.scheduledFor),
          })),
          total: Number(countRow.total),
          page: input.page,
          limit: input.limit,
        };
      }),

    spend: adminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(15),
      }))
      .query(async ({ input }) => {
        const pg = await getPgClient();
        if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const offset = (input.page - 1) * input.limit;

        // Run these sequentially: the production pool has only two connections,
        // and four concurrent queries can stall a serverless invocation.
        const byModel = await pg`SELECT model, COUNT(*)::int AS calls, SUM("totalTokens")::int AS tokens, SUM("costUsd"::numeric) AS cost
          FROM token_usage GROUP BY model ORDER BY cost DESC`;
        const byEndpoint = await pg`SELECT COALESCE(endpoint, 'unknown') AS endpoint, COUNT(*)::int AS calls, SUM("costUsd"::numeric) AS cost
          FROM token_usage GROUP BY endpoint ORDER BY cost DESC LIMIT 10`;
        const topUsers = await pg`SELECT u.email, u.name, COUNT(*)::int AS calls, SUM(tu."totalTokens")::int AS tokens, SUM(tu."costUsd"::numeric) AS cost
          FROM token_usage tu
          LEFT JOIN users u ON u.id = tu."userId"
          GROUP BY tu."userId", u.email, u.name
          ORDER BY cost DESC
          LIMIT ${input.limit} OFFSET ${offset}`;
        const [countRow] = await pg`SELECT COUNT(*)::int AS total FROM (
          SELECT "userId" FROM token_usage GROUP BY "userId"
        ) tracked_users`;

        return {
          byModel: byModel.map(r => ({ model: r.model as string, calls: Number(r.calls), tokens: Number(r.tokens), cost: Number(r.cost).toFixed(4) })),
          byEndpoint: byEndpoint.map(r => ({ endpoint: r.endpoint as string, calls: Number(r.calls), cost: Number(r.cost).toFixed(4) })),
          topUsers: topUsers.map(r => ({ email: (r.email as string | null) ?? "Anonyme", name: r.name as string | null, calls: Number(r.calls), tokens: Number(r.tokens), cost: Number(r.cost).toFixed(4) })),
          total: Number(countRow.total),
          page: input.page,
          limit: input.limit,
        };
      }),

    setRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { ok: true };
      }),

    deleteUser: adminProcedure
      .input(z.object({ userId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Vous ne pouvez pas supprimer votre propre compte administrateur",
          });
        }

        const pg = await getPgClient();
        if (!pg) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

        const [target] = await pg`
          SELECT id, email, "openId"
          FROM users
          WHERE id = ${input.userId}
          LIMIT 1
        `;
        if (!target) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur introuvable" });
        }

        const storedFiles = await pg`
          SELECT "fileKey" AS key FROM media_library
          WHERE "userId" = ${input.userId} AND "fileKey" IS NOT NULL
          UNION
          SELECT "imageKey" AS key FROM generated_posts
          WHERE "userId" = ${input.userId} AND "imageKey" IS NOT NULL
          UNION
          SELECT "imageKey" AS key FROM auto_publish_queue
          WHERE "userId" = ${input.userId} AND "imageKey" IS NOT NULL
          UNION
          SELECT "imageKey" AS key FROM auto_publish_history
          WHERE "userId" = ${input.userId} AND "imageKey" IS NOT NULL
          UNION
          SELECT "pdfKey" AS key FROM generated_carousels
          WHERE "userId" = ${input.userId} AND "pdfKey" IS NOT NULL
        `;

        const openId = String(target.openId);
        if (openId.startsWith("supabase:")) {
          if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Suppression impossible : le service administrateur Supabase n'est pas configuré",
            });
          }

          const supabase = createSupabaseAdminClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
            realtime: { transport: WebSocket as never },
          });
          const authUserId = openId.slice("supabase:".length);
          const { error } = await supabase.auth.admin.deleteUser(authUserId);
          if (error && !/not found|does not exist/i.test(error.message)) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Impossible de supprimer l'accès de connexion : ${error.message}`,
            });
          }
        }

        try {
          await pg.begin(async transaction => {
            await transaction`DELETE FROM agent_logs WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM agent_memory WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM agent_tasks WHERE "userId" = ${input.userId} OR "approvedBy" = ${input.userId}`;
            await transaction`DELETE FROM agents WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM auto_publish_history WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM auto_publish_queue WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM auto_publish_schedule WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM auto_publish_settings WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM generated_carousels WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM generated_posts WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM trend_alerts WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM notifications WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM media_library WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM linkedin_settings WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM user_profiles WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM user_subscriptions WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM rate_limit_hits WHERE "userId" = ${input.userId}`;
            await transaction`DELETE FROM token_usage WHERE "userId" = ${input.userId}`;
            await transaction`
              DELETE FROM team_members
              WHERE "userId" = ${input.userId}
                 OR "teamId" IN (SELECT id FROM teams WHERE "ownerId" = ${input.userId})
            `;
            await transaction`DELETE FROM teams WHERE "ownerId" = ${input.userId}`;
            await transaction`DELETE FROM users WHERE id = ${input.userId}`;
          });
        } catch (error) {
          console.error("[Admin] User data deletion failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "L'accès a été révoqué, mais la suppression des données a échoué. Réessayez.",
          });
        }

        const fileCleanup = await Promise.allSettled(
          storedFiles.map(file => deleteMediaFile(String(file.key))),
        );
        const failedFileCount = fileCleanup.filter(result => result.status === "rejected").length;
        if (failedFileCount > 0) {
          console.warn(`[Admin] ${failedFileCount} stored file(s) could not be deleted for user ${input.userId}`);
        }

        return { success: true, email: (target.email as string | null) ?? null };
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
