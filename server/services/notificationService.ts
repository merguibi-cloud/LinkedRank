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
  
  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }));
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
 * Notify when posts are generated manually
 */
export async function notifyPostsGenerated(
  userId: number,
  count: number,
  theme: string,
  savedPostIds?: number[]
): Promise<Notification | null> {
  const title = count === 1 ? "Post généré !" : `${count} nouveaux posts générés`;
  const message =
    count === 1
      ? `Nouveau contenu créé sur le thème « ${theme} »`
      : `${count} nouveaux posts générés sur « ${theme} »`;

  return createNotification({
    userId,
    type: "agent_task_completed",
    title,
    message,
    postId: savedPostIds?.[0],
    actionUrl: "/generate",
    actionLabel: "Voir les posts",
    priority: "medium",
    metadata: { count, theme, postIds: savedPostIds },
  });
}

/**
 * Notify when a post is published
 */
export async function notifyPostPublished(
  userId: number,
  postTitle?: string,
  postId?: number
): Promise<Notification | null> {
  const message = postTitle
    ? `« ${postTitle.slice(0, 80)}${postTitle.length > 80 ? "…" : ""} » est en ligne sur LinkedIn`
    : "Votre post sur LinkedIn a été publié avec succès";

  return createNotification({
    userId,
    type: "post_published",
    title: "Post publié !",
    message,
    postId,
    actionUrl: "/dashboard",
    actionLabel: "Voir le dashboard",
    priority: "medium",
  });
}

/**
 * Contextual notification when an agent completes a task
 */
export async function sendTaskCompletionNotification(
  userId: number,
  agent: { id: number; name: string; avatar?: string | null },
  task: { id: number; type: string; title: string },
  outputData?: Record<string, unknown>
): Promise<Notification | null> {
  const agentMeta = { agentEmoji: agent.avatar, agentName: agent.name };

  switch (task.type) {
    case "generate_post": {
      const theme =
        (outputData?.metadata as { theme?: string } | undefined)?.theme ||
        (outputData?.generatedPost as { title?: string } | undefined)?.title ||
        task.title;
      return createNotification({
        userId,
        type: "agent_task_completed",
        title: `${agent.name} a terminé`,
        message: `Nouveau post généré sur « ${theme} »`,
        agentId: agent.id,
        taskId: task.id,
        actionUrl: "/agents",
        actionLabel: "Voir le résultat",
        priority: "medium",
        metadata: { ...agentMeta, theme },
      });
    }
    case "generate_carousel": {
      const title =
        (outputData?.carousel as { title?: string } | undefined)?.title || task.title;
      return createNotification({
        userId,
        type: "agent_task_completed",
        title: `${agent.name} a terminé`,
        message: `Un nouveau carousel « ${title} » est prêt à publier`,
        agentId: agent.id,
        taskId: task.id,
        actionUrl: "/agents",
        actionLabel: "Voir le carousel",
        priority: "medium",
        metadata: agentMeta,
      });
    }
    case "detect_trend":
    case "analyze_trends": {
      const trends = outputData?.trends as Array<{ topic: string; growth?: string }> | undefined;
      const topTrend = trends?.[0];
      if (topTrend) {
        return createNotification({
          userId,
          type: "trend_detected",
          title: `${agent.name} a détecté une tendance`,
          message: `Le sujet « ${topTrend.topic} » explose sur LinkedIn (${topTrend.growth || "+15%"})`,
          agentId: agent.id,
          taskId: task.id,
          actionUrl: "/trending",
          actionLabel: "Explorer la tendance",
          priority: "medium",
          metadata: { ...agentMeta, trend: topTrend.topic, growth: topTrend.growth },
        });
      }
      break;
    }
    case "suggest_response":
      return createNotification({
        userId,
        type: "suggestion",
        title: `${agent.name} suggère`,
        message: "Des commentaires méritent une réponse pour booster l'engagement",
        agentId: agent.id,
        taskId: task.id,
        actionUrl: "/agents",
        actionLabel: "Voir les suggestions",
        priority: "medium",
        metadata: agentMeta,
      });
    case "analyze_performance": {
      const insights = outputData?.insights as string | undefined;
      return createNotification({
        userId,
        type: "post_performance",
        title: "Nouveau record !",
        message: insights || "Vos performances LinkedIn ont progressé — consultez les détails",
        agentId: agent.id,
        taskId: task.id,
        actionUrl: "/dashboard",
        actionLabel: "Voir les stats",
        priority: "medium",
        metadata: agentMeta,
      });
    }
    default:
      break;
  }

  return notifyTaskNeedsApproval(userId, agent.id, task.id, agent.name, task.title);
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
