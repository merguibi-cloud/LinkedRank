/**
 * Agent Scheduler Service
 * Handles automatic scheduling and execution of agent tasks
 */

import { getDb } from "../db";
import { agents, agentTasks } from "../../drizzle/schema";
import { eq, and, sql, lte, isNull, or } from "drizzle-orm";
import { 
  getUserAgents, 
  createTask, 
  processTask, 
  updateAgentStatus,
  getAgentById,
  logAgentActivity
} from "./agentService";
import type { Agent, AgentType, TaskType, ScheduleDay } from "../../shared/agentTypes";

// Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP: Record<ScheduleDay, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Map agent types to their default task types
const AGENT_TASK_TYPES: Record<AgentType, TaskType> = {
  content_creator: "generate_post",
  trend_hunter: "analyze_trends",
  engagement_manager: "suggest_response",
  growth_strategist: "analyze_performance",
  network_builder: "suggest_connection",
};

// Map agent types to task titles
const AGENT_TASK_TITLES: Record<AgentType, string> = {
  content_creator: "Générer un post LinkedIn",
  trend_hunter: "Analyser les tendances",
  engagement_manager: "Suggérer des réponses",
  growth_strategist: "Analyser les performances",
  network_builder: "Suggérer des connexions",
};

/**
 * Check if current time matches a scheduled hour
 */
function isScheduledTime(scheduleHours: string[], currentHour: number, currentMinute: number): boolean {
  for (const hour of scheduleHours) {
    const [h, m] = hour.split(":").map(Number);
    // Allow a 5-minute window around the scheduled time
    if (h === currentHour && Math.abs(m - currentMinute) <= 5) {
      return true;
    }
  }
  return false;
}

/**
 * Check if today is a scheduled day
 */
function isScheduledDay(scheduleDays: ScheduleDay[], currentDay: number): boolean {
  return scheduleDays.some(day => DAY_MAP[day] === currentDay);
}

/**
 * Get the next scheduled time for an agent
 */
export function getNextScheduledTime(agent: Agent): Date | null {
  if (!agent.scheduleEnabled || !agent.scheduleDays?.length || !agent.scheduleHours?.length) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Sort hours
  const sortedHours = [...agent.scheduleHours].sort();

  // Check today first
  if (isScheduledDay(agent.scheduleDays, currentDay)) {
    for (const hour of sortedHours) {
      const [h, m] = hour.split(":").map(Number);
      if (h > currentHour || (h === currentHour && m > currentMinute)) {
        const nextTime = new Date(now);
        nextTime.setHours(h, m, 0, 0);
        return nextTime;
      }
    }
  }

  // Check next days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (isScheduledDay(agent.scheduleDays, nextDay)) {
      const nextTime = new Date(now);
      nextTime.setDate(nextTime.getDate() + i);
      const [h, m] = sortedHours[0].split(":").map(Number);
      nextTime.setHours(h, m, 0, 0);
      return nextTime;
    }
  }

  return null;
}

/**
 * Update agent's next scheduled time
 */
export async function updateAgentSchedule(
  agentId: number,
  scheduleEnabled: boolean,
  scheduleDays?: ScheduleDay[],
  scheduleHours?: string[],
  scheduleTimezone?: string,
  tasksPerDay?: number
): Promise<Agent | null> {
  const db = (await getDb())!;

  await db.update(agents).set({
    scheduleEnabled,
    scheduleDays: scheduleDays ? JSON.stringify(scheduleDays) : null,
    scheduleHours: scheduleHours ? JSON.stringify(scheduleHours) : null,
    scheduleTimezone: scheduleTimezone || "Europe/Paris",
    tasksPerDay: tasksPerDay || 1,
  }).where(eq(agents.id, agentId));

  const agent = await getAgentById(agentId);
  
  if (agent && scheduleEnabled) {
    const nextTime = getNextScheduledTime(agent);
    if (nextTime) {
      await db.update(agents).set({
        nextScheduledAt: nextTime,
      }).where(eq(agents.id, agentId));
    }
  }

  return getAgentById(agentId);
}

/**
 * Check and execute scheduled tasks for all agents
 * This should be called periodically (e.g., every minute)
 */
export async function checkAndExecuteScheduledTasks(): Promise<{
  checked: number;
  executed: number;
  errors: string[];
}> {
  const db = (await getDb())!;
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  console.log(`[AgentScheduler] Checking schedules at ${currentHour}:${currentMinute} (day ${currentDay})`);

  // Get all agents with scheduling enabled
  const scheduledAgents = await db.select()
    .from(agents)
    .where(eq(agents.scheduleEnabled, true));

  let checked = 0;
  let executed = 0;
  const errors: string[] = [];

  for (const agentData of scheduledAgents) {
    checked++;
    
    try {
      // Parse schedule data
      const scheduleDays: ScheduleDay[] = agentData.scheduleDays 
        ? JSON.parse(agentData.scheduleDays) 
        : [];
      const scheduleHours: string[] = agentData.scheduleHours 
        ? JSON.parse(agentData.scheduleHours) 
        : [];

      if (!scheduleDays.length || !scheduleHours.length) {
        continue;
      }

      // Check if today is a scheduled day
      if (!isScheduledDay(scheduleDays, currentDay)) {
        continue;
      }

      // Check if current time matches a scheduled hour
      if (!isScheduledTime(scheduleHours, currentHour, currentMinute)) {
        continue;
      }

      // Check if we already executed a task in the last 10 minutes
      if (agentData.lastScheduledAt) {
        const lastScheduled = new Date(agentData.lastScheduledAt);
        const minutesSinceLastSchedule = (now.getTime() - lastScheduled.getTime()) / (1000 * 60);
        if (minutesSinceLastSchedule < 10) {
          console.log(`[AgentScheduler] Agent ${agentData.name} already executed ${minutesSinceLastSchedule.toFixed(1)} minutes ago, skipping`);
          continue;
        }
      }

      console.log(`[AgentScheduler] Executing scheduled task for agent: ${agentData.name}`);

      // Create and execute task
      const taskType = AGENT_TASK_TYPES[agentData.type as AgentType];
      const taskTitle = AGENT_TASK_TITLES[agentData.type as AgentType];

      const task = await createTask(agentData.id, agentData.userId, {
        type: taskType,
        title: `${taskTitle} (Planifié)`,
        description: `Tâche planifiée automatiquement pour ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`,
        priority: "medium",
        inputData: {
          topic: "LinkedIn et le personal branding",
          tone: "professional",
        },
      });

      // Process the task
      await processTask(task.id);

      // Update last scheduled time
      const nextTime = getNextScheduledTime({
        ...agentData,
        scheduleDays,
        scheduleHours,
        scheduleEnabled: true,
      } as Agent);

      await db.update(agents).set({
        lastScheduledAt: now,
        nextScheduledAt: nextTime,
        lastActiveAt: now,
      }).where(eq(agents.id, agentData.id));

      await logAgentActivity(
        agentData.id, 
        agentData.userId, 
        "scheduled_task_executed", 
        "info", 
        `Tâche planifiée exécutée: ${taskTitle}`,
        task.id
      );

      executed++;
      console.log(`[AgentScheduler] Task created and processed for agent: ${agentData.name}`);

    } catch (error: any) {
      const errorMsg = `Error processing agent ${agentData.name}: ${error.message}`;
      console.error(`[AgentScheduler] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  console.log(`[AgentScheduler] Checked ${checked} agents, executed ${executed} tasks, ${errors.length} errors`);

  return { checked, executed, errors };
}

/**
 * Process tasks for autonomous agents (no approval required)
 * Auto-approves and publishes to LinkedIn if configured
 */
export async function processAutonomousTasks(): Promise<{
  processed: number;
  published: number;
  errors: string[];
}> {
  const db = (await getDb())!;

  // Get tasks from autonomous agents that are awaiting approval
  const autonomousTasks = await db.select()
    .from(agentTasks)
    .innerJoin(agents, eq(agentTasks.agentId, agents.id))
    .where(and(
      eq(agentTasks.status, "awaiting_approval"),
      eq(agents.autonomyLevel, "autonomous"),
      eq(agents.requiresApproval, false)
    ));

  let processed = 0;
  let published = 0;
  const errors: string[] = [];

  for (const { agent_tasks: task, agents: agent } of autonomousTasks) {
    try {
      console.log(`[AgentScheduler] Auto-processing task ${task.id} for autonomous agent ${agent.name}`);

      // Parse output data
      const outputData = task.outputData ? JSON.parse(task.outputData as string) : null;

      // Auto-approve the task
      await db.update(agentTasks).set({
        status: "approved",
        approvedAt: new Date(),
      }).where(eq(agentTasks.id, task.id));

      // Update agent stats
      await db.update(agents).set({
        tasksApproved: sql`${agents.tasksApproved} + 1`,
        tasksCompleted: sql`${agents.tasksCompleted} + 1`,
      }).where(eq(agents.id, agent.id));

      await logAgentActivity(
        agent.id,
        agent.userId,
        "task_auto_approved",
        "info",
        `Tâche auto-approuvée (mode autonome): ${task.title}`,
        task.id
      );

      processed++;

      // If it's a content task, try to publish it to LinkedIn
      if (task.type === "generate_post" && outputData?.generatedPost?.content) {
        try {
          const { publishToLinkedIn } = await import("./linkedinAutoPublisher");
          const publishResult = await publishToLinkedIn(agent.userId, outputData.generatedPost);

          if (publishResult.success) {
            await logAgentActivity(
              agent.id,
              agent.userId,
              "linkedin_auto_published",
              "info",
              `Contenu publié automatiquement sur LinkedIn: ${publishResult.linkedinPostId}`,
              task.id
            );
            published++;
            console.log(`[AgentScheduler] Auto-published to LinkedIn: ${publishResult.linkedinPostId}`);
          } else {
            await logAgentActivity(
              agent.id,
              agent.userId,
              "linkedin_auto_publish_failed",
              "warning",
              `Échec de la publication automatique: ${publishResult.error}`,
              task.id
            );
            console.log(`[AgentScheduler] LinkedIn auto-publish failed: ${publishResult.error}`);
          }
        } catch (publishError: any) {
          console.error(`[AgentScheduler] LinkedIn publish error:`, publishError);
          await logAgentActivity(
            agent.id,
            agent.userId,
            "linkedin_auto_publish_error",
            "error",
            `Erreur lors de la publication: ${publishError.message}`,
            task.id
          );
        }
      }

    } catch (error: any) {
      const errorMsg = `Error processing autonomous task ${task.id}: ${error.message}`;
      console.error(`[AgentScheduler] ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  if (processed > 0) {
    console.log(`[AgentScheduler] Processed ${processed} autonomous tasks, published ${published} to LinkedIn`);
  }

  return { processed, published, errors };
}

/**
 * Start the agent scheduler worker
 * Runs every minute to check for scheduled tasks
 */
let schedulerInterval: NodeJS.Timeout | null = null;

export function startAgentScheduler(): void {
  if (schedulerInterval) {
    console.log("[AgentScheduler] Scheduler already running");
    return;
  }

  console.log("[AgentScheduler] Starting agent scheduler...");

  // Run immediately on start
  checkAndExecuteScheduledTasks().catch(console.error);
  processAutonomousTasks().catch(console.error);

  // Then run every minute
  schedulerInterval = setInterval(async () => {
    try {
      await checkAndExecuteScheduledTasks();
      await processAutonomousTasks();
    } catch (error) {
      console.error("[AgentScheduler] Error in scheduler:", error);
    }
  }, 60 * 1000); // Every minute

  console.log("[AgentScheduler] Agent scheduler started");
}

export function stopAgentScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[AgentScheduler] Agent scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { running: boolean; lastCheck?: Date } {
  return {
    running: schedulerInterval !== null,
  };
}
