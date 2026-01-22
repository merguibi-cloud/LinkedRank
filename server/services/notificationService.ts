import { getDb } from "../db";
import { notifications, type Notification } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Notification types
 */
export type NotificationType = 
  | "agent_task_completed"
  | "agent_task_failed"
  | "agent_needs_approval"
  | "trend_detected"
  | "post_published"
  | "post_performance"
  | "suggestion"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  agentId?: number;
  taskId?: number;
  postId?: number;
  actionUrl?: string;
  actionLabel?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    agentId: data.agentId,
    taskId: data.taskId,
    postId: data.postId,
    actionUrl: data.actionUrl,
    actionLabel: data.actionLabel,
    priority: data.priority || "medium",
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  }).$returningId();
  
  // Fetch the created notification
  const [created] = await db.select().from(notifications).where(eq(notifications.id, result[0].id));
  return created;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: number,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  const { limit = 50, offset = 0, unreadOnly = false } = options;
  
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  
  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(notifications)
    .set({ 
      isRead: true,
      readAt: new Date()
    })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(notifications)
    .set({ 
      isRead: true,
      readAt: new Date()
    })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db
    .delete(notifications)
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}

// ============================================
// NOTIFICATION HELPERS FOR AGENTS
// ============================================

/**
 * Notify when an agent task is completed
 */
export async function notifyTaskCompleted(
  userId: number,
  agentId: number,
  taskId: number,
  agentName: string,
  taskTitle: string
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "agent_task_completed",
    title: `${agentName} a terminé une tâche`,
    message: `La tâche "${taskTitle}" a été complétée avec succès.`,
    agentId,
    taskId,
    actionUrl: "/agents",
    actionLabel: "Voir les résultats",
    priority: "medium",
  });
}

/**
 * Notify when an agent task needs approval
 */
export async function notifyTaskNeedsApproval(
  userId: number,
  agentId: number,
  taskId: number,
  agentName: string,
  taskTitle: string
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "agent_needs_approval",
    title: `${agentName} attend votre approbation`,
    message: `La tâche "${taskTitle}" est prête pour validation.`,
    agentId,
    taskId,
    actionUrl: "/agents",
    actionLabel: "Approuver",
    priority: "high",
  });
}

/**
 * Notify when an agent task fails
 */
export async function notifyTaskFailed(
  userId: number,
  agentId: number,
  taskId: number,
  agentName: string,
  taskTitle: string,
  errorMessage: string
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "agent_task_failed",
    title: `${agentName} a rencontré une erreur`,
    message: `La tâche "${taskTitle}" a échoué: ${errorMessage}`,
    agentId,
    taskId,
    actionUrl: "/agents",
    actionLabel: "Voir les détails",
    priority: "high",
    metadata: { error: errorMessage },
  });
}

/**
 * Notify when a trend is detected
 */
export async function notifyTrendDetected(
  userId: number,
  trendTitle: string,
  trendDescription: string,
  agentId?: number
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "trend_detected",
    title: `Nouvelle tendance détectée`,
    message: `${trendTitle}: ${trendDescription}`,
    agentId,
    actionUrl: "/analytics",
    actionLabel: "Voir la tendance",
    priority: "medium",
  });
}

/**
 * Notify when a post is published
 */
export async function notifyPostPublished(
  userId: number,
  postId: number,
  postTitle: string
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "post_published",
    title: `Post publié avec succès`,
    message: `Votre post "${postTitle}" a été publié sur LinkedIn.`,
    postId,
    actionUrl: "/dashboard",
    actionLabel: "Voir les performances",
    priority: "low",
  });
}

/**
 * Notify about post performance
 */
export async function notifyPostPerformance(
  userId: number,
  postId: number,
  postTitle: string,
  metrics: { likes: number; comments: number; impressions: number }
): Promise<Notification | null> {
  const isViral = metrics.impressions > 10000 || metrics.likes > 500;
  
  return createNotification({
    userId,
    type: "post_performance",
    title: isViral ? `🔥 Votre post devient viral !` : `Mise à jour de performance`,
    message: `"${postTitle}" a atteint ${metrics.impressions} impressions, ${metrics.likes} likes et ${metrics.comments} commentaires.`,
    postId,
    actionUrl: "/dashboard",
    actionLabel: "Voir les détails",
    priority: isViral ? "high" : "low",
    metadata: metrics,
  });
}

/**
 * Send a suggestion notification
 */
export async function notifySuggestion(
  userId: number,
  title: string,
  message: string,
  actionUrl?: string,
  actionLabel?: string
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "suggestion",
    title,
    message,
    actionUrl,
    actionLabel,
    priority: "low",
  });
}

/**
 * Send a system notification
 */
export async function notifySystem(
  userId: number,
  title: string,
  message: string,
  priority: NotificationPriority = "medium"
): Promise<Notification | null> {
  return createNotification({
    userId,
    type: "system",
    title,
    message,
    priority,
  });
}
