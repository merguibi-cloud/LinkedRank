import { Router, type Request, type Response } from "express";
import { getDb } from "../db";
import { autoPublishQueue, generatedPosts } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireAuth } from "../_core/authMiddleware";

const router = Router();

router.use(requireAuth);

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function parseScheduledInput(body: {
  scheduledAt?: string;
  date?: string;
  time?: string;
}): Date | null {
  if (body.scheduledAt) {
    const parsed = new Date(body.scheduledAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (body.date && body.time) {
    return combineDateAndTime(body.date, body.time);
  }
  return null;
}

function mapQueueItem(item: typeof autoPublishQueue.$inferSelect) {
  return {
    id: item.id,
    content: item.content,
    imageUrl: item.imageUrl,
    scheduledDate: item.scheduledFor,
    status:
      item.status === "pending" || item.status === "publishing"
        ? ("pending" as const)
        : item.status === "published"
          ? ("published" as const)
          : item.status === "cancelled"
            ? ("cancelled" as const)
            : ("failed" as const),
    errorMessage: item.errorMessage,
    publishedAt: item.publishedAt,
  };
}

router.get("/", async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { from, to } = req.query;
    const conditions = [eq(autoPublishQueue.userId, userId)];

    if (from && typeof from === "string") {
      conditions.push(gte(autoPublishQueue.scheduledFor, new Date(from)));
    }
    if (to && typeof to === "string") {
      conditions.push(lte(autoPublishQueue.scheduledFor, new Date(to)));
    }

    const posts = await db
      .select()
      .from(autoPublishQueue)
      .where(and(...conditions))
      .orderBy(desc(autoPublishQueue.scheduledFor));

    return res.json({
      posts: posts
        .filter((p) => {
          if (p.status === "cancelled") return false;
          if (!p.generatedFrom) return false;
          try {
            const meta = JSON.parse(p.generatedFrom);
            return meta.type === "manual" || meta.type === "generator" || meta.type === "auto-publish";
          } catch {
            return false;
          }
        })
        .map(mapQueueItem),
    });
  } catch (error) {
    console.error("[Schedule] Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch scheduled posts" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  const { content, imageUrl, generatedPostId, source } = req.body as {
    content?: string;
    imageUrl?: string;
    generatedPostId?: number;
    scheduledAt?: string;
    date?: string;
    time?: string;
    source?: string;
  };

  if (!content?.trim()) {
    return res.status(400).json({ error: "Le contenu du post est requis" });
  }

  const scheduledFor = parseScheduledInput(req.body);
  if (!scheduledFor) {
    return res.status(400).json({ error: "Date et heure de diffusion requises" });
  }

  if (scheduledFor.getTime() <= Date.now()) {
    return res.status(400).json({ error: "La date de diffusion doit être dans le futur" });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const trimmedContent = content.trim();

    const existingPending = await db
      .select()
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.userId, userId),
          eq(autoPublishQueue.status, "pending"),
          eq(autoPublishQueue.content, trimmedContent),
          eq(autoPublishQueue.scheduledFor, scheduledFor)
        )
      )
      .limit(1);

    if (existingPending.length > 0) {
      return res.json({
        success: true,
        post: mapQueueItem(existingPending[0]),
        duplicate: true,
      });
    }

    const generatedFrom = JSON.stringify({
      type: source === "auto-publish"
        ? "auto-publish"
        : generatedPostId
          ? "generator"
          : "manual",
      postId: generatedPostId ?? null,
    });

    const [result] = await db
      .insert(autoPublishQueue)
      .values({
        userId,
        content: trimmedContent,
        imageUrl: imageUrl || null,
        scheduledFor,
        status: "pending",
        generatedFrom,
      })
      .$returningId();

    if (generatedPostId) {
      await db
        .update(generatedPosts)
        .set({
          status: "scheduled",
          scheduledAt: scheduledFor,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(generatedPosts.id, generatedPostId),
            eq(generatedPosts.userId, userId)
          )
        );
    }

    const [inserted] = await db
      .select()
      .from(autoPublishQueue)
      .where(eq(autoPublishQueue.id, result.id))
      .limit(1);

    return res.json({ success: true, post: mapQueueItem(inserted) });
  } catch (error) {
    console.error("[Schedule] Error creating post:", error);
    return res.status(500).json({ error: "Failed to schedule post" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  const postId = parseInt(req.params.id, 10);
  if (Number.isNaN(postId)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  const { content } = req.body as {
    content?: string;
    scheduledAt?: string;
    date?: string;
    time?: string;
  };

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const [existing] = await db
      .select()
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.id, postId),
          eq(autoPublishQueue.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({ error: "Seuls les posts en attente peuvent être modifiés" });
    }

    const updates: Partial<typeof autoPublishQueue.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (content?.trim()) {
      updates.content = content.trim();
    }

    const scheduledFor = parseScheduledInput(req.body);
    if (scheduledFor) {
      if (scheduledFor.getTime() <= Date.now()) {
        return res.status(400).json({ error: "La date de diffusion doit être dans le futur" });
      }
      updates.scheduledFor = scheduledFor;
    }

    await db
      .update(autoPublishQueue)
      .set(updates)
      .where(eq(autoPublishQueue.id, postId));

    let generatedPostId: number | null = null;
    if (existing.generatedFrom) {
      try {
        const meta = JSON.parse(existing.generatedFrom);
        generatedPostId = meta.postId ?? null;
      } catch {
        /* ignore */
      }
    }

    if (generatedPostId && updates.scheduledFor) {
      await db
        .update(generatedPosts)
        .set({
          scheduledAt: updates.scheduledFor,
          content: updates.content ?? existing.content,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(generatedPosts.id, generatedPostId),
            eq(generatedPosts.userId, userId)
          )
        );
    }

    const [updated] = await db
      .select()
      .from(autoPublishQueue)
      .where(eq(autoPublishQueue.id, postId))
      .limit(1);

    return res.json({ success: true, post: mapQueueItem(updated) });
  } catch (error) {
    console.error("[Schedule] Error updating post:", error);
    return res.status(500).json({ error: "Failed to update scheduled post" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  const postId = parseInt(req.params.id, 10);
  if (Number.isNaN(postId)) {
    return res.status(400).json({ error: "ID invalide" });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const [existing] = await db
      .select()
      .from(autoPublishQueue)
      .where(
        and(
          eq(autoPublishQueue.id, postId),
          eq(autoPublishQueue.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    if (existing.status === "published") {
      return res.status(400).json({ error: "Impossible de supprimer un post déjà publié" });
    }

    await db
      .update(autoPublishQueue)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(autoPublishQueue.id, postId));

    if (existing.generatedFrom) {
      try {
        const meta = JSON.parse(existing.generatedFrom);
        if (meta.postId) {
          await db
            .update(generatedPosts)
            .set({ status: "saved", scheduledAt: null, updatedAt: new Date() })
            .where(
              and(
                eq(generatedPosts.id, meta.postId),
                eq(generatedPosts.userId, userId)
              )
            );
        }
      } catch {
        /* ignore */
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[Schedule] Error deleting post:", error);
    return res.status(500).json({ error: "Failed to delete scheduled post" });
  }
});

export default router;
