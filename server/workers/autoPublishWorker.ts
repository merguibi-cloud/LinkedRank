import { getDb } from "../db";
import { autoPublishSettings, autoPublishSchedule, autoPublishQueue, generatedPosts } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { postToLinkedIn } from "../services/linkedin";
import { getLinkedinSettings } from "../db";
import { notifyPostPublished } from "../services/notificationService";
import { recordPublishedPost } from "../services/agentLearningService";
import { resolveStorageAssetUrl, normalizeStoredImageFields } from "../_core/publicUrl";
import {
  getDateKeyInZone,
  getDayOfWeekInZone,
  getTimeKeyInZone,
  wallClockToUtc,
} from "@shared/scheduleTime";
import {
  prefillAllEnabledUsers,
  generateSmartAutoPost,
  emergencyGenerateForSlot,
  isQueueItemForSlot,
} from "../services/autoPublishOrchestrator";

// Check interval in milliseconds (every minute)
const CHECK_INTERVAL = 60 * 1000;

let workerInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let isProcessingQueue = false;
let isProcessingRecurring = false;
let isPrefilling = false;
let prefillTick = 0;

// Track published slots to prevent duplicates (key: `userId-dayOfWeek-publishTime-date`)
const publishedSlots = new Set<string>();

interface ScheduledPost {
  userId: number;
  scheduledFor: Date;
  content: string;
  status: string;
}

/**
 * Get the day of week (0 = Sunday, 1 = Monday, etc.) — Europe/Paris
 */
function getDayOfWeek(): number {
  return getDayOfWeekInZone();
}

/**
 * Get current time in HH:MM format — Europe/Paris
 */
function getCurrentTime(): string {
  return getTimeKeyInZone();
}

/**
 * Get today's date string for tracking — Europe/Paris
 */
function getTodayString(): string {
  return getDateKeyInZone();
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

// Color palettes for variety — moved to orchestrator

/**
 * Publish a post to LinkedIn for a user
 */
async function publishToLinkedIn(
  userId: number,
  content: string,
  imageUrl?: string | null,
  pdfUrl?: string | null,
  documentTitle?: string | null
): Promise<boolean> {
  try {
    // Get user's LinkedIn settings (access token)
    const linkedinSettings = await getLinkedinSettings(userId);
    
    if (!linkedinSettings?.accessToken) {
      console.log(`[AutoPublish] User ${userId} has no LinkedIn access token`);
      return false;
    }

    const media = pdfUrl
      ? {
          pdfUrl,
          documentTitle: documentTitle || content.slice(0, 80),
        }
      : imageUrl || undefined;

    const result = await postToLinkedIn(
      linkedinSettings.accessToken,
      linkedinSettings.linkedinUserId || "",
      content,
      media
    );

    if (result.success) {
      console.log(
        `[AutoPublish] Successfully published post for user ${userId}${
          pdfUrl ? " with PDF carousel" : imageUrl ? " with image" : ""
        }`
      );
      const preview = content.slice(0, 80).replace(/\n/g, " ");
      await notifyPostPublished(userId, preview);
      await recordPublishedPost(userId, {
        content,
        linkedinPostId: result.postId,
        source: "auto_publish",
      });
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


async function tryClaimQueueItem(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  id: number
): Promise<boolean> {
  const claimed = await db
    .update(autoPublishQueue)
    .set({ status: "publishing", updatedAt: new Date() })
    .where(
      and(
        eq(autoPublishQueue.id, id),
        eq(autoPublishQueue.status, "pending")
      )
    )
    .returning({ id: autoPublishQueue.id });

  return claimed.length > 0;
}

async function runPrefillCycle(): Promise<void> {
  if (isPrefilling) return;
  isPrefilling = true;
  try {
    await prefillAllEnabledUsers();
  } catch (error) {
    console.error("[AutoPublish] Prefill cycle error:", error);
  } finally {
    isPrefilling = false;
  }
}

/** Repasse en pending les posts bloqués en publishing (timeout serverless). */
async function recoverStuckPublishingItems(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const staleBefore = new Date(Date.now() - 3 * 60 * 1000);
  const stuck = await db
    .select({ id: autoPublishQueue.id })
    .from(autoPublishQueue)
    .where(
      and(
        eq(autoPublishQueue.status, "publishing"),
        lte(autoPublishQueue.updatedAt, staleBefore)
      )
    );

  if (stuck.length === 0) return;

  for (const row of stuck) {
    await db
      .update(autoPublishQueue)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(autoPublishQueue.id, row.id));
  }

  console.log(
    `[AutoPublish] ${stuck.length} post(s) débloqué(s) (publishing → pending)`
  );
}

/**
 * Publish posts scheduled for a specific date/time
 */
async function processScheduledQueue(): Promise<void> {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  const db = await getDb();
  if (!db) {
    isProcessingQueue = false;
    return;
  }

  const now = new Date();

  try {
    const pendingPosts = await db
      .select()
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.status, "pending"),
          lte(autoPublishQueue.scheduledFor, now)
        )
      );

    if (pendingPosts.length === 0) return;

    console.log(`[AutoPublish] Processing ${pendingPosts.length} queue item(s)`);

    const batchLimit = process.env.VERCEL ? 1 : pendingPosts.length;

    for (const post of pendingPosts.slice(0, batchLimit)) {
      const claimed = await tryClaimQueueItem(db, post.id);
      if (!claimed) {
        console.log(`[AutoPublish] Post ${post.id} already claimed, skipping`);
        continue;
      }

      let success = false;
      let errorMessage: string | null = null;
      const resolvedImageUrl = resolveStorageAssetUrl(
        post.imageUrl,
        post.imageKey
      );

      let resolvedPdfUrl: string | undefined;
      let documentTitle: string | undefined;
      if (post.generatedFrom) {
        try {
          const meta = JSON.parse(post.generatedFrom) as {
            pdfUrl?: string;
            pdfKey?: string;
            documentTitle?: string;
          };
          if (meta.pdfUrl) {
            resolvedPdfUrl =
              resolveStorageAssetUrl(meta.pdfUrl, meta.pdfKey) ?? undefined;
            documentTitle = meta.documentTitle;
          }
        } catch {
          /* ignore malformed metadata */
        }
      }

      try {
        success = await publishToLinkedIn(
          post.userId,
          post.content,
          resolvedPdfUrl ? null : resolvedImageUrl,
          resolvedPdfUrl,
          documentTitle
        );
        if (!success) {
          errorMessage = "Publication LinkedIn échouée";
        }
      } catch (error) {
        console.error(`[AutoPublish] Post ${post.id} publish error:`, error);
        errorMessage =
          error instanceof Error
            ? error.message
            : "Publication LinkedIn échouée";
      }

      await db
        .update(autoPublishQueue)
        .set({
          status: success ? "published" : "failed",
          publishedAt: success ? new Date() : null,
          errorMessage: success ? null : errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(autoPublishQueue.id, post.id));

      if (post.generatedFrom) {
        try {
          const meta = JSON.parse(post.generatedFrom);
          if (meta.postId) {
            await db
              .update(generatedPosts)
              .set({
                status: success ? "published" : "failed",
                publishedAt: success ? new Date() : null,
                updatedAt: new Date(),
              })
              .where(eq(generatedPosts.id, meta.postId));
          }
        } catch {
          /* ignore malformed metadata */
        }
      }

      console.log(
        `[AutoPublish] Scheduled post ${post.id} ${success ? "published" : "failed"} for user ${post.userId}`
      );
    }
  } catch (error) {
    console.error("[AutoPublish] Error processing scheduled queue:", error);
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * Process scheduled publications
 */
async function processScheduledPublications(): Promise<void> {
  if (isProcessingRecurring) return;
  isProcessingRecurring = true;

  const db = await getDb();
  if (!db) {
    console.log("[AutoPublish] Database not available, skipping check");
    isProcessingRecurring = false;
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
      // One-time slot: only on the exact date
      if (schedule.publishDate && schedule.publishDate !== todayString) {
        continue;
      }

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

      const slotDate = wallClockToUtc(todayString, schedule.publishTime);

      const existingQueue = await db
        .select()
        .from(autoPublishQueue)
        .where(
          and(
            eq(autoPublishQueue.userId, schedule.userId),
            eq(autoPublishQueue.status, "pending")
          )
        );

      const hasPrefilled = existingQueue.some((q) =>
        isQueueItemForSlot(q, slotDate, schedule.id)
      );

      if (hasPrefilled) {
        publishedSlots.add(slotKey);
        console.log(`[AutoPublish] Slot ${slotKey} already in queue, worker will publish`);
        continue;
      }

      // Mark slot as processed to prevent duplicates
      publishedSlots.add(slotKey);

      try {
        console.log(`[AutoPublish] Emergency generate for user ${schedule.userId} slot ${schedule.id}`);
        const { content, imageUrl, imageKey, plan, generatedPostId } =
          await emergencyGenerateForSlot(schedule.userId, settings, schedule.id);

        const resolvedImageUrl = resolveStorageAssetUrl(imageUrl, imageKey);
        const success = await publishToLinkedIn(
          schedule.userId,
          content,
          resolvedImageUrl
        );

        const storedImage = normalizeStoredImageFields(imageUrl, imageKey);

        await db.insert(autoPublishQueue).values({
          userId: schedule.userId,
          content,
          imageUrl: storedImage.imageUrl,
          imageKey: storedImage.imageKey,
          generatedPostId: generatedPostId ?? null,
          scheduledFor: new Date(),
          status: success ? "published" : "failed",
          publishedAt: success ? new Date() : null,
          generatedFrom: JSON.stringify({
            type: "auto_recurring",
            slotId: schedule.id,
            topicAngle: plan.topicAngle,
            emergency: true,
          }),
          errorMessage: success ? null : "Publication LinkedIn échouée",
        });

        console.log(`[AutoPublish] Post ${success ? "published" : "failed"} for user ${schedule.userId}`);

        if (schedule.publishDate && success) {
          await db
            .update(autoPublishSchedule)
            .set({ isActive: false })
            .where(eq(autoPublishSchedule.id, schedule.id));
          console.log(`[AutoPublish] One-shot slot ${schedule.id} deactivated after publish`);
        }
      } catch (error) {
        console.error(`[AutoPublish] Error processing schedule for user ${schedule.userId}:`, error);
      }
    }
  } catch (error) {
    console.error("[AutoPublish] Error processing schedules:", error);
  } finally {
    isProcessingRecurring = false;
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

/** Exécution d'un cycle de publication (file + créneaux récurrents). */
export async function runAutoPublishTick(): Promise<void> {
  await recoverStuckPublishingItems();
  await processScheduledQueue();
  await processScheduledPublications();
}

/** Remplit la file d'attente pour tous les utilisateurs actifs. */
export async function runAutoPublishPrefill(): Promise<void> {
  await runPrefillCycle();
}

/**
 * Start the auto-publish worker
 */
export function startAutoPublishWorker(): void {
  if (workerInterval) {
    console.log("[AutoPublish] Worker already running, skipping duplicate start");
    return;
  }

  console.log("[AutoPublish] Starting auto-publish worker...");
  
  void runAutoPublishTick();
  void runAutoPublishPrefill();

  workerInterval = setInterval(() => {
    void runAutoPublishTick();
    prefillTick += 1;
    if (prefillTick % 5 === 0) {
      void runAutoPublishPrefill();
    }
  }, CHECK_INTERVAL);
  
  cleanupInterval = setInterval(() => {
    cleanupOldSlots();
  }, 60 * 60 * 1000);
  
  console.log("[AutoPublish] Worker started, checking every minute");
}

export function stopAutoPublishWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  console.log("[AutoPublish] Worker stopped");
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

      console.log(`[AutoPublish] No content provided, generating smart post for user ${userId}...`);
      const generated = await generateSmartAutoPost(userId, settings);
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
    console.log(`[AutoPublish] Generating immediate smart post for user ${userId}...`);
    const { content, imageUrl } = await generateSmartAutoPost(userId, settings);

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
