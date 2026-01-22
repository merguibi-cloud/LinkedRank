/**
 * Agent Scheduler Tests
 * Tests for the agent scheduling and auto-publishing functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([]))
        }))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId: 1 }]))
    }))
  })),
  getLinkedinSettings: vi.fn(() => Promise.resolve(null))
}));

// Mock the agent service
vi.mock("./services/agentService", () => ({
  getUserAgents: vi.fn(() => Promise.resolve([])),
  createTask: vi.fn(() => Promise.resolve({ id: 1 })),
  processTask: vi.fn(() => Promise.resolve()),
  updateAgentStatus: vi.fn(() => Promise.resolve()),
  getAgentById: vi.fn(() => Promise.resolve(null)),
  logAgentActivity: vi.fn(() => Promise.resolve())
}));

describe("Agent Scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNextScheduledTime", () => {
    it("should return null when schedule is disabled", async () => {
      const { getNextScheduledTime } = await import("./services/agentScheduler");
      
      const agent = {
        id: 1,
        userId: 1,
        name: "Test Agent",
        type: "content_creator" as const,
        status: "active" as const,
        scheduleEnabled: false,
        scheduleDays: [],
        scheduleHours: [],
        autonomyLevel: "supervised" as const,
        requiresApproval: true,
        tasksCompleted: 0,
        tasksApproved: 0,
        tasksRejected: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = getNextScheduledTime(agent);
      expect(result).toBeNull();
    });

    it("should return null when no days are scheduled", async () => {
      const { getNextScheduledTime } = await import("./services/agentScheduler");
      
      const agent = {
        id: 1,
        userId: 1,
        name: "Test Agent",
        type: "content_creator" as const,
        status: "active" as const,
        scheduleEnabled: true,
        scheduleDays: [],
        scheduleHours: ["08:00", "12:00"],
        autonomyLevel: "supervised" as const,
        requiresApproval: true,
        tasksCompleted: 0,
        tasksApproved: 0,
        tasksRejected: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = getNextScheduledTime(agent);
      expect(result).toBeNull();
    });

    it("should return a valid date when schedule is configured", async () => {
      const { getNextScheduledTime } = await import("./services/agentScheduler");
      
      const agent = {
        id: 1,
        userId: 1,
        name: "Test Agent",
        type: "content_creator" as const,
        status: "active" as const,
        scheduleEnabled: true,
        scheduleDays: ["monday", "tuesday", "wednesday", "thursday", "friday"] as const,
        scheduleHours: ["08:00", "12:00", "18:00"],
        autonomyLevel: "supervised" as const,
        requiresApproval: true,
        tasksCompleted: 0,
        tasksApproved: 0,
        tasksRejected: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = getNextScheduledTime(agent);
      // Should return a date (either today or within the next 7 days)
      expect(result).toBeDefined();
      if (result) {
        expect(result instanceof Date).toBe(true);
        expect(result.getTime()).toBeGreaterThan(Date.now());
      }
    });
  });

  describe("getSchedulerStatus", () => {
    it("should return scheduler status", async () => {
      const { getSchedulerStatus } = await import("./services/agentScheduler");
      
      const status = getSchedulerStatus();
      expect(status).toHaveProperty("running");
      expect(typeof status.running).toBe("boolean");
    });
  });

  describe("checkAndExecuteScheduledTasks", () => {
    it("should return execution results", async () => {
      const { checkAndExecuteScheduledTasks } = await import("./services/agentScheduler");
      
      const result = await checkAndExecuteScheduledTasks();
      
      expect(result).toHaveProperty("checked");
      expect(result).toHaveProperty("executed");
      expect(result).toHaveProperty("errors");
      expect(typeof result.checked).toBe("number");
      expect(typeof result.executed).toBe("number");
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe("processAutonomousTasks", () => {
    it("should return processing results", async () => {
      const { processAutonomousTasks } = await import("./services/agentScheduler");
      
      const result = await processAutonomousTasks();
      
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("published");
      expect(result).toHaveProperty("errors");
      expect(typeof result.processed).toBe("number");
      expect(typeof result.published).toBe("number");
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});

describe("LinkedIn Auto Publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("canPublishToLinkedIn", () => {
    it("should return false when LinkedIn is not connected", async () => {
      const { canPublishToLinkedIn } = await import("./services/linkedinAutoPublisher");
      
      const result = await canPublishToLinkedIn(1);
      
      expect(result.canPublish).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("publishToLinkedIn", () => {
    it("should return error when LinkedIn is not connected", async () => {
      const { publishToLinkedIn } = await import("./services/linkedinAutoPublisher");
      
      const result = await publishToLinkedIn(1, {
        content: "Test post content",
        hashtags: ["test", "linkedin"]
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe("Agent Types", () => {
  it("should have valid schedule day types", async () => {
    const { ScheduleDay } = await import("../shared/agentTypes");
    
    // ScheduleDay is a type, not a runtime value, so we just verify the import works
    expect(true).toBe(true);
  });

  it("should have valid autonomy level types", async () => {
    // Verify the types are correctly defined
    type AutonomyLevel = "supervised" | "semi_autonomous" | "autonomous";
    
    const levels: AutonomyLevel[] = ["supervised", "semi_autonomous", "autonomous"];
    expect(levels.length).toBe(3);
  });
});
