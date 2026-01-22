import { Router, Request, Response, NextFunction } from "express";
import { getDb, getUserByOpenId } from "../db";
import { autoPublishSettings, autoPublishSchedule, autoPublishQueue, linkedinInfluencers } from "../../drizzle/schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { generateLinkedInPost } from "../services/ai";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

type ScheduleSlot = {
  dayOfWeek: number;
  publishTime: string;
  isActive?: boolean;
};

const router = Router();

// Authentication middleware for auto-publish routes
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ error: "No session cookie" });
    }
    
    const cookies = parseCookieHeader(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    
    if (!sessionCookie) {
      return res.status(401).json({ error: "No session cookie" });
    }
    
    const session = await sdk.verifySession(sessionCookie);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    const user = await getUserByOpenId(session.openId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    (req as any).userId = user.id;
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user's auto-publish settings
router.get("/settings", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    // Get settings
    const [settings] = await db
      .select()
      .from(autoPublishSettings)
      .where(eq(autoPublishSettings.userId, userId))
      .limit(1);

    // Get schedule
    const schedule = await db
      .select()
      .from(autoPublishSchedule)
      .where(eq(autoPublishSchedule.userId, userId));

    return res.json({
      settings: settings || null,
      schedule: schedule.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        publishTime: s.publishTime,
        isActive: s.isActive,
      })),
    });
  } catch (error) {
    console.error("Error fetching auto-publish settings:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Save user's auto-publish settings
router.post("/settings", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { settings, schedule } = req.body as { 
      settings: Record<string, unknown>; 
      schedule: ScheduleSlot[] 
    };

    // Upsert settings
    const existingSettings = await db
      .select()
      .from(autoPublishSettings)
      .where(eq(autoPublishSettings.userId, userId))
      .limit(1);

    if (existingSettings.length > 0) {
      await db
        .update(autoPublishSettings)
        .set({
          isEnabled: settings.isEnabled as boolean,
          sector: settings.sector as string,
          targetAudience: settings.targetAudience as string,
          tone: settings.tone as "professional" | "casual" | "inspirational" | "educational" | "provocative",
          language: settings.language as "FR" | "EN" | "AR" | "ES" | "DE",
          viralityLevel: settings.viralityLevel as "low" | "medium" | "high",
          contentLength: settings.contentLength as "short" | "medium" | "long",
          includeEmojis: settings.includeEmojis as boolean,
          includeHashtags: settings.includeHashtags as boolean,
          includeCallToAction: settings.includeCallToAction as boolean,
          personalContext: settings.personalContext as string,
        })
        .where(eq(autoPublishSettings.userId, userId));
    } else {
      await db.insert(autoPublishSettings).values({
        userId,
        isEnabled: settings.isEnabled as boolean,
        sector: settings.sector as string,
        targetAudience: settings.targetAudience as string,
        tone: settings.tone as "professional" | "casual" | "inspirational" | "educational" | "provocative",
        language: settings.language as "FR" | "EN" | "AR" | "ES" | "DE",
        viralityLevel: settings.viralityLevel as "low" | "medium" | "high",
        contentLength: settings.contentLength as "short" | "medium" | "long",
        includeEmojis: settings.includeEmojis as boolean,
        includeHashtags: settings.includeHashtags as boolean,
        includeCallToAction: settings.includeCallToAction as boolean,
        personalContext: settings.personalContext as string,
      });
    }

    // Update schedule - delete existing and insert new
    await db
      .delete(autoPublishSchedule)
      .where(eq(autoPublishSchedule.userId, userId));

    if (schedule && schedule.length > 0) {
      await db.insert(autoPublishSchedule).values(
        schedule.map((s: ScheduleSlot) => ({
          userId,
          dayOfWeek: s.dayOfWeek,
          publishTime: s.publishTime,
          isActive: s.isActive ?? true,
        }))
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error saving auto-publish settings:", error);
    return res.status(500).json({ error: "Failed to save settings" });
  }
});

// Search influencers with suggestions based on sector
router.get("/influencers", async (req: Request, res: Response) => {
  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { search, sector, limit = "20" } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);

    let conditions: any[] = [];

    // Search by name, headline, or company
    if (search && typeof search === "string" && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          like(linkedinInfluencers.name, searchTerm),
          like(linkedinInfluencers.headline, searchTerm),
          like(linkedinInfluencers.company, searchTerm)
        )
      );
    }

    // Filter by sector/industry if provided
    if (sector && typeof sector === "string" && sector.trim()) {
      const sectorMapping: Record<string, string[]> = {
        "tech": ["Tech", "Technology", "Software", "IT", "SaaS"],
        "marketing": ["Marketing", "Digital Marketing", "Growth", "Brand"],
        "finance": ["Finance", "Banking", "Investment", "FinTech"],
        "hr": ["HR", "Human Resources", "Recruitment", "Talent"],
        "entrepreneurship": ["Entrepreneurship", "Startup", "Business", "CEO", "Founder"],
        "sales": ["Sales", "Business Development", "Revenue"],
        "consulting": ["Consulting", "Strategy", "Advisory"],
        "leadership": ["Leadership", "Management", "Executive"],
      };

      const sectorTerms = sectorMapping[sector.toLowerCase()] || [sector];
      const sectorConditions = sectorTerms.map(term => 
        or(
          like(linkedinInfluencers.industry, `%${term}%`),
          like(linkedinInfluencers.headline, `%${term}%`),
          like(linkedinInfluencers.sector, `%${term}%`)
        )
      );
      
      if (sectorConditions.length > 0) {
        conditions.push(or(...sectorConditions));
      }
    }

    const influencers = await db
      .select({
        id: linkedinInfluencers.id,
        name: linkedinInfluencers.name,
        headline: linkedinInfluencers.headline,
        profilePicture: linkedinInfluencers.profilePicture,
        followers: linkedinInfluencers.followers,
        country: linkedinInfluencers.country,
        industry: linkedinInfluencers.industry,
        linkedinUrl: linkedinInfluencers.linkedinUrl,
      })
      .from(linkedinInfluencers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(linkedinInfluencers.followers))
      .limit(limitNum);

    return res.json({ influencers });
  } catch (error) {
    console.error("Error searching influencers:", error);
    return res.status(500).json({ error: "Failed to search influencers" });
  }
});

// Get suggested influencers based on sector
router.get("/suggested-influencers", async (req: Request, res: Response) => {
  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { sector } = req.query;

    // Get top influencers, optionally filtered by sector
    let influencers;
    
    if (sector && typeof sector === "string" && sector.trim()) {
      const sectorMapping: Record<string, string[]> = {
        "tech": ["Tech", "Technology", "Software", "IT", "SaaS", "AI", "Developer"],
        "marketing": ["Marketing", "Digital Marketing", "Growth", "Brand", "Content"],
        "finance": ["Finance", "Banking", "Investment", "FinTech", "Trading"],
        "hr": ["HR", "Human Resources", "Recruitment", "Talent", "People"],
        "entrepreneurship": ["Entrepreneurship", "Startup", "Business", "CEO", "Founder", "Entrepreneur"],
        "sales": ["Sales", "Business Development", "Revenue", "Account"],
        "consulting": ["Consulting", "Strategy", "Advisory", "Consultant"],
        "leadership": ["Leadership", "Management", "Executive", "Director"],
      };

      const sectorTerms = sectorMapping[sector.toLowerCase()] || [sector];
      const sectorConditions = sectorTerms.map(term => 
        or(
          like(linkedinInfluencers.industry, `%${term}%`),
          like(linkedinInfluencers.headline, `%${term}%`),
          like(linkedinInfluencers.sector, `%${term}%`)
        )
      );

      influencers = await db
        .select({
          id: linkedinInfluencers.id,
          name: linkedinInfluencers.name,
          headline: linkedinInfluencers.headline,
          profilePicture: linkedinInfluencers.profilePicture,
          followers: linkedinInfluencers.followers,
          country: linkedinInfluencers.country,
          industry: linkedinInfluencers.industry,
          linkedinUrl: linkedinInfluencers.linkedinUrl,
        })
        .from(linkedinInfluencers)
        .where(or(...sectorConditions))
        .orderBy(desc(linkedinInfluencers.followers))
        .limit(50);
    } else {
      // Return top influencers overall
      influencers = await db
        .select({
          id: linkedinInfluencers.id,
          name: linkedinInfluencers.name,
          headline: linkedinInfluencers.headline,
          profilePicture: linkedinInfluencers.profilePicture,
          followers: linkedinInfluencers.followers,
          country: linkedinInfluencers.country,
          industry: linkedinInfluencers.industry,
          linkedinUrl: linkedinInfluencers.linkedinUrl,
        })
        .from(linkedinInfluencers)
        .orderBy(desc(linkedinInfluencers.followers))
        .limit(50);
    }

    return res.json({ influencers });
  } catch (error) {
    console.error("Error getting suggested influencers:", error);
    return res.status(500).json({ error: "Failed to get suggested influencers" });
  }
});

// Generate preview post (single or multiple)
router.post("/preview", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const settings = req.body as Record<string, unknown>;
    const selectedCreatorIds = settings.selectedCreators as number[] || [];
    const count = Math.min(Math.max(1, Number(settings.count) || 1), 5); // 1-5 posts

    // Get selected influencers or top ones
    let influencers;
    if (selectedCreatorIds.length > 0) {
      influencers = await db
        .select()
        .from(linkedinInfluencers)
        .where(sql`${linkedinInfluencers.id} IN (${sql.join(selectedCreatorIds.map(id => sql`${id}`), sql`, `)})`)
        .limit(5);
    } else {
      influencers = await db
        .select()
        .from(linkedinInfluencers)
        .orderBy(desc(linkedinInfluencers.followers))
        .limit(5);
    }

    const baseParams = {
      sector: settings.sector as string,
      targetAudience: settings.targetAudience as string,
      tone: settings.tone as string,
      language: settings.language as string,
      viralityLevel: settings.viralityLevel as string,
      contentLength: settings.contentLength as string,
      includeEmojis: settings.includeEmojis as boolean,
      includeHashtags: settings.includeHashtags as boolean,
      includeCallToAction: settings.includeCallToAction as boolean,
      personalContext: settings.personalContext as string,
      inspirationFrom: influencers.map((i) => i.name).join(", "),
    };

    // Generate multiple posts in parallel if count > 1
    const posts: string[] = [];
    const generatePromises = [];
    
    for (let i = 0; i < count; i++) {
      generatePromises.push(
        generateLinkedInPost({
          ...baseParams,
          // Add variation by changing the topic hint
          topic: i === 0 ? "" : `Variation ${i + 1} - contenu unique et différent`,
        })
      );
    }

    const results = await Promise.allSettled(generatePromises);
    for (const result of results) {
      if (result.status === "fulfilled") {
        posts.push(result.value);
      }
    }

    if (posts.length === 0) {
      throw new Error("Failed to generate any posts");
    }

    return res.json({
      preview: posts[0], // First post for backward compatibility
      previews: posts, // All generated posts
      inspirationFrom: influencers.map((i) => ({
        id: i.id,
        name: i.name,
        headline: i.headline,
        followers: i.followers,
        profilePicture: i.profilePicture,
      })),
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return res.status(500).json({ error: "Failed to generate preview: " + (error instanceof Error ? error.message : "Unknown error") });
  }
});

// Publish immediately (for testing) - uses preview content if provided
router.post("/publish-now", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const { content, imageUrl } = req.body;

  console.log("[publish-now] Received request:");
  console.log("[publish-now] - userId:", userId);
  console.log("[publish-now] - content length:", content?.length || 0);
  console.log("[publish-now] - imageUrl:", imageUrl || "NOT PROVIDED");

  try {
    const { publishNowWithContent } = await import("../workers/autoPublishWorker");
    const result = await publishNowWithContent(userId, content, imageUrl);
    console.log("[publish-now] Result:", result.success, result.message);
    return res.json(result);
  } catch (error) {
    console.error("Error publishing now:", error);
    return res.status(500).json({ success: false, message: "Failed to publish: " + (error instanceof Error ? error.message : "Unknown error") });
  }
});

// Get queue status
router.get("/queue", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const queue = await db
      .select()
      .from(autoPublishQueue)
      .where(eq(autoPublishQueue.userId, userId))
      .orderBy(autoPublishQueue.scheduledFor);

    return res.json({ queue });
  } catch (error) {
    console.error("Error fetching queue:", error);
    return res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// Generate quote image using HTML rendering (exact text and colors)
router.post("/generate-image", async (req: Request, res: Response) => {
  try {
    const { quote, authorName, style, colorPalette, colors } = req.body;

    if (!quote) {
      return res.status(400).json({ error: "Quote is required" });
    }

    // Use HTML to Image rendering for exact text and colors
    const { renderQuoteImage } = await import("../services/htmlToImage");

    console.log("[generate-image] Rendering quote image with HTML...");
    console.log("[generate-image] Quote:", quote.substring(0, 50) + "...");
    console.log("[generate-image] Author:", authorName);
    console.log("[generate-image] Palette:", colorPalette);
    
    const result = await renderQuoteImage({
      quote,
      authorName: authorName || "Youssef Koutari",
      style: style || "gradient",
      colorPalette: colorPalette || "violet",
      colors,
    });

    if (!result?.url) {
      return res.status(500).json({ error: "No image URL returned" });
    }

    console.log("[generate-image] Image rendered successfully:", result.url);
    return res.json({ imageUrl: result.url });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ error: "Failed to generate image: " + (error instanceof Error ? error.message : "Unknown error") });
  }
});

export default router;
