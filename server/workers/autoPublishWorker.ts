import { getDb } from "../db";
import { autoPublishSettings, autoPublishSchedule, autoPublishQueue, linkedinInfluencers } from "../../drizzle/schema";
import { eq, and, lte, desc, sql } from "drizzle-orm";
import { generateLinkedInPost } from "../services/ai";
import { postToLinkedIn, getLinkedInProfile } from "../services/linkedin";
import { getLinkedinSettings } from "../db";
import { renderQuoteImage } from "../services/htmlToImage";

// Check interval in milliseconds (every minute)
const CHECK_INTERVAL = 60 * 1000;

// Track published slots to prevent duplicates (key: `userId-dayOfWeek-publishTime-date`)
const publishedSlots = new Set<string>();

interface ScheduledPost {
  userId: number;
  scheduledFor: Date;
  content: string;
  status: string;
}

/**
 * Get the day of week (0 = Sunday, 1 = Monday, etc.)
 */
function getDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Get today's date string for tracking
 */
function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

/**
 * Check if current time matches a scheduled time (within 1 minute tolerance)
 */
function isTimeMatch(scheduledTime: string, currentTime: string): boolean {
  const [schedHours, schedMinutes] = scheduledTime.split(":").map(Number);
  const [currHours, currMinutes] = currentTime.split(":").map(Number);
  
  const schedTotal = schedHours * 60 + schedMinutes;
  const currTotal = currHours * 60 + currMinutes;
  
  // Match if within 1 minute
  return Math.abs(schedTotal - currTotal) <= 1;
}

// Color palettes for variety
const COLOR_PALETTES = [
  "violet",
  "ocean", 
  "sunset",
  "forest",
  "royal",
  "fire",
  "midnight",
  "gold"
];

/**
 * Generate a quote image using HTML rendering (reliable, no AI errors)
 */
async function generateQuoteImageHTML(content: string, userName: string): Promise<string | null> {
  try {
    // Extract a good quote from the content
    const lines = content.split('\n').filter(l => l.trim().length > 20 && l.trim().length < 150);
    let quote = "Le succès est la somme de petits efforts répétés jour après jour.";
    
    if (lines.length > 0) {
      // Find a line with quotes or a strong statement
      const quoteLine = lines.find(l => l.includes('"') || l.includes('«')) || lines[0];
      quote = quoteLine.replace(/["*«»]/g, '').trim();
      // Limit quote length for better display
      if (quote.length > 120) {
        quote = quote.substring(0, 117) + '...';
      }
    }

    // Pick a random color palette for variety
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

    console.log("[AutoPublish] Generating quote image with HTML rendering...");
    console.log("[AutoPublish] Quote:", quote.substring(0, 50) + "...");
    console.log("[AutoPublish] Palette:", randomPalette);
    
    const result = await renderQuoteImage({
      quote,
      authorName: userName || "Auteur",
      colorPalette: randomPalette,
    });

    console.log("[AutoPublish] Quote image generated:", result?.url ? "success" : "no URL");
    return result?.url || null;
  } catch (error) {
    console.error("[AutoPublish] Error generating quote image:", error);
    return null;
  }
}

/**
 * Generate a post for a user based on their settings
 */
async function generatePostForUser(userId: number, settings: any): Promise<{ content: string; imageUrl: string | null }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get top influencers for inspiration
  const influencers = await db
    .select()
    .from(linkedinInfluencers)
    .orderBy(desc(linkedinInfluencers.followers))
    .limit(5);

  // Generate post using AI
  const content = await generateLinkedInPost({
    sector: settings.sector,
    targetAudience: settings.targetAudience,
    tone: settings.tone,
    language: settings.language,
    viralityLevel: settings.viralityLevel,
    contentLength: settings.contentLength,
    includeEmojis: settings.includeEmojis,
    includeHashtags: settings.includeHashtags,
    includeCallToAction: settings.includeCallToAction,
    personalContext: settings.personalContext,
    inspirationFrom: influencers.map((i) => i.name).join(", "),
  });

  // Generate image if enabled
  let imageUrl: string | null = null;
  if (settings.includeImage !== false) {
    try {
      // Get user name for the image - use profile URL or default
      const linkedinSettings = await getLinkedinSettings(userId);
      // Extract name from profile URL or use default
      const userName = "Auteur";
      imageUrl = await generateQuoteImageHTML(content, userName);
    } catch (error) {
      console.error("[AutoPublish] Image generation failed, continuing without image:", error);
    }
  }

  return { content, imageUrl };
}

/**
 * Publish a post to LinkedIn for a user
 */
async function publishToLinkedIn(userId: number, content: string, imageUrl?: string | null): Promise<boolean> {
  try {
    // Get user's LinkedIn settings (access token)
    const linkedinSettings = await getLinkedinSettings(userId);
    
    if (!linkedinSettings?.accessToken) {
      console.log(`[AutoPublish] User ${userId} has no LinkedIn access token`);
      return false;
    }

    // Post to LinkedIn with image if available
    const result = await postToLinkedIn(
      linkedinSettings.accessToken,
      linkedinSettings.linkedinUserId || "",
      content,
      imageUrl || undefined
    );

    if (result.success) {
      console.log(`[AutoPublish] Successfully published post for user ${userId}${imageUrl ? ' with image' : ''}`);
      return true;
    } else {
      console.error(`[AutoPublish] LinkedIn API error for user ${userId}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`[AutoPublish] Failed to publish for user ${userId}:`, error);
    return false;
  }
}

/**
 * Process scheduled publications
 */
async function processScheduledPublications(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[AutoPublish] Database not available, skipping check");
    return;
  }

  const currentDay = getDayOfWeek();
  const currentTime = getCurrentTime();
  const todayString = getTodayString();

  console.log(`[AutoPublish] Checking schedules at ${currentTime} (day ${currentDay}, date ${todayString})`);

  try {
    // Get all active schedules for the current day
    const schedules = await db
      .select()
      .from(autoPublishSchedule)
      .where(
        and(
          eq(autoPublishSchedule.dayOfWeek, currentDay),
          eq(autoPublishSchedule.isActive, true)
        )
      );

    console.log(`[AutoPublish] Found ${schedules.length} active schedules for today`);

    for (const schedule of schedules) {
      // Check if the time matches
      if (!isTimeMatch(schedule.publishTime, currentTime)) {
        continue;
      }

      // Create unique slot key to prevent duplicates
      const slotKey = `${schedule.userId}-${currentDay}-${schedule.publishTime}-${todayString}`;
      
      if (publishedSlots.has(slotKey)) {
        console.log(`[AutoPublish] Slot ${slotKey} already processed, skipping`);
        continue;
      }

      console.log(`[AutoPublish] Processing slot for user ${schedule.userId} at ${schedule.publishTime}`);

      // Get user's auto-publish settings
      const [settings] = await db
        .select()
        .from(autoPublishSettings)
        .where(
          and(
            eq(autoPublishSettings.userId, schedule.userId),
            eq(autoPublishSettings.isEnabled, true)
          )
        )
        .limit(1);

      if (!settings) {
        console.log(`[AutoPublish] User ${schedule.userId} has auto-publish disabled or no settings`);
        continue;
      }

      // Mark slot as processed to prevent duplicates
      publishedSlots.add(slotKey);

      // Generate and publish the post
      try {
        console.log(`[AutoPublish] Generating post for user ${schedule.userId}...`);
        const { content, imageUrl } = await generatePostForUser(schedule.userId, settings);

        // Add to queue as pending
        const [queueEntry] = await db
          .insert(autoPublishQueue)
          .values({
            userId: schedule.userId,
            content,
            imageUrl: imageUrl || null,
            scheduledFor: new Date(),
            status: "pending",
          })
          .$returningId();

        // Publish to LinkedIn
        console.log(`[AutoPublish] Publishing to LinkedIn for user ${schedule.userId}...`);
        const success = await publishToLinkedIn(schedule.userId, content, imageUrl);

        // Update queue status
        await db
          .update(autoPublishQueue)
          .set({
            status: success ? "published" : "failed",
            publishedAt: success ? new Date() : null,
          })
          .where(eq(autoPublishQueue.id, queueEntry.id));

        console.log(`[AutoPublish] Post ${success ? "published" : "failed"} for user ${schedule.userId}`);
      } catch (error) {
        console.error(`[AutoPublish] Error processing schedule for user ${schedule.userId}:`, error);
      }
    }
  } catch (error) {
    console.error("[AutoPublish] Error processing schedules:", error);
  }
}

/**
 * Clean up old slot tracking entries (keep only today's)
 */
function cleanupOldSlots(): void {
  const todayString = getTodayString();
  const toRemove: string[] = [];
  
  publishedSlots.forEach(slot => {
    if (!slot.endsWith(todayString)) {
      toRemove.push(slot);
    }
  });
  
  toRemove.forEach(slot => publishedSlots.delete(slot));
  
  if (toRemove.length > 0) {
    console.log(`[AutoPublish] Cleaned up ${toRemove.length} old slot entries`);
  }
}

/**
 * Start the auto-publish worker
 */
export function startAutoPublishWorker(): void {
  console.log("[AutoPublish] Starting auto-publish worker...");
  
  // Run immediately on start
  processScheduledPublications();
  
  // Then run every minute
  setInterval(() => {
    processScheduledPublications();
  }, CHECK_INTERVAL);
  
  // Clean up old slots every hour
  setInterval(() => {
    cleanupOldSlots();
  }, 60 * 60 * 1000);
  
  console.log("[AutoPublish] Worker started, checking every minute");
}

/**
 * Process a single immediate publication with provided content (from preview)
 */
export async function publishNowWithContent(
  userId: number, 
  content?: string, 
  imageUrl?: string
): Promise<{ success: boolean; message: string; content?: string; imageUrl?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // If no content provided, generate new content
    let finalContent = content;
    let finalImageUrl = imageUrl;

    if (!finalContent) {
      // Get user's settings and generate new content
      const [settings] = await db
        .select()
        .from(autoPublishSettings)
        .where(eq(autoPublishSettings.userId, userId))
        .limit(1);

      if (!settings) {
        return { success: false, message: "No auto-publish settings found. Please configure your preferences first." };
      }

      console.log(`[AutoPublish] No content provided, generating new post for user ${userId}...`);
      const generated = await generatePostForUser(userId, settings);
      finalContent = generated.content;
      finalImageUrl = generated.imageUrl || undefined;
    }

    console.log(`[AutoPublish] Publishing to LinkedIn for user ${userId}...`);
    console.log(`[AutoPublish] Content length: ${finalContent?.length || 0}`);
    console.log(`[AutoPublish] Image URL: ${finalImageUrl ? 'provided' : 'none'}`);

    // Publish to LinkedIn with the exact content and image
    const success = await publishToLinkedIn(userId, finalContent!, finalImageUrl);

    if (success) {
      // Add to queue as published
      await db.insert(autoPublishQueue).values({
        userId,
        content: finalContent!,
        imageUrl: finalImageUrl || null,
        scheduledFor: new Date(),
        status: "published",
        publishedAt: new Date(),
      });

      return { 
        success: true, 
        message: finalImageUrl 
          ? "Post publié avec image sur LinkedIn ! 🎉" 
          : "Post publié sur LinkedIn ! 🎉", 
        content: finalContent,
        imageUrl: finalImageUrl
      };
    } else {
      return { success: false, message: "Failed to publish to LinkedIn. Please check your LinkedIn connection." };
    }
  } catch (error) {
    console.error(`[AutoPublish] Error in publishNowWithContent for user ${userId}:`, error);
    return { success: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Process a single immediate publication (for testing) - DEPRECATED, use publishNowWithContent
 */
export async function publishNow(userId: number): Promise<{ success: boolean; message: string; content?: string; imageUrl?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get user's settings
    const [settings] = await db
      .select()
      .from(autoPublishSettings)
      .where(eq(autoPublishSettings.userId, userId))
      .limit(1);

    if (!settings) {
      return { success: false, message: "No auto-publish settings found. Please configure your preferences first." };
    }

    // Generate post with image
    console.log(`[AutoPublish] Generating immediate post for user ${userId}...`);
    const { content, imageUrl } = await generatePostForUser(userId, settings);

    // Publish to LinkedIn
    const success = await publishToLinkedIn(userId, content, imageUrl);

    if (success) {
      // Add to queue as published
      await db.insert(autoPublishQueue).values({
        userId,
        content,
        imageUrl: imageUrl || null,
        scheduledFor: new Date(),
        status: "published",
        publishedAt: new Date(),
      });

      return { 
        success: true, 
        message: imageUrl 
          ? "Post publié avec image sur LinkedIn ! 🎉" 
          : "Post publié sur LinkedIn ! 🎉", 
        content,
        imageUrl: imageUrl || undefined
      };
    } else {
      return { success: false, message: "Failed to publish to LinkedIn. Please check your LinkedIn connection." };
    }
  } catch (error) {
    console.error(`[AutoPublish] Error in publishNow for user ${userId}:`, error);
    return { success: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
