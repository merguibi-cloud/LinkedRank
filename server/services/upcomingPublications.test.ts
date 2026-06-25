import { describe, expect, it } from "vitest";
import {
  groupPublicationsByDay,
  projectUpcomingPublications,
} from "./upcomingPublications";

describe("projectUpcomingPublications", () => {
  const now = new Date("2026-06-24T10:00:00");

  it("projects recurring slots when auto-publish is enabled", () => {
    const publications = projectUpcomingPublications({
      settings: {
        id: 1,
        userId: 1,
        isEnabled: true,
        sector: "Tech",
        targetAudience: "Founders",
        tone: "professional",
        language: "FR",
        viralityLevel: "medium",
        contentLength: "medium",
        includeEmojis: true,
        includeHashtags: true,
        includeCallToAction: true,
        personalContext: "",
        inspirationCreators: "[]",
        inspirationTopics: "{}",
        createdAt: now,
        updatedAt: now,
      },
      schedule: [
        {
          id: 10,
          userId: 1,
          dayOfWeek: 2,
          publishTime: "09:00",
          publishDate: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      queue: [],
      days: 7,
      now,
    });

    expect(publications.some((p) => p.type === "recurring" && p.status === "projected")).toBe(
      true
    );
  });

  it("includes one-shot slots only on the exact date", () => {
    const publications = projectUpcomingPublications({
      settings: {
        id: 1,
        userId: 1,
        isEnabled: true,
        sector: "Tech",
        targetAudience: "Founders",
        tone: "professional",
        language: "FR",
        viralityLevel: "medium",
        contentLength: "medium",
        includeEmojis: true,
        includeHashtags: true,
        includeCallToAction: true,
        personalContext: "",
        inspirationCreators: "[]",
        inspirationTopics: "{}",
        createdAt: now,
        updatedAt: now,
      },
      schedule: [
        {
          id: 11,
          userId: 1,
          dayOfWeek: 3,
          publishTime: "14:00",
          publishDate: "2026-06-25",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      queue: [],
      days: 7,
      now,
    });

    const oneShots = publications.filter((p) => p.type === "one_shot");
    expect(oneShots).toHaveLength(1);
    expect(oneShots[0].scheduledFor).toContain("2026-06-25");
  });

  it("skips projected slots when auto-publish is disabled", () => {
    const publications = projectUpcomingPublications({
      settings: {
        id: 1,
        userId: 1,
        isEnabled: false,
        sector: "Tech",
        targetAudience: "Founders",
        tone: "professional",
        language: "FR",
        viralityLevel: "medium",
        contentLength: "medium",
        includeEmojis: true,
        includeHashtags: true,
        includeCallToAction: true,
        personalContext: "",
        inspirationCreators: "[]",
        inspirationTopics: "{}",
        createdAt: now,
        updatedAt: now,
      },
      schedule: [
        {
          id: 12,
          userId: 1,
          dayOfWeek: 2,
          publishTime: "09:00",
          publishDate: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      queue: [],
      days: 7,
      now,
    });

    expect(publications.filter((p) => p.status === "projected")).toHaveLength(0);
  });
});

describe("groupPublicationsByDay", () => {
  it("groups publications by date key in chronological order", () => {
    const grouped = groupPublicationsByDay([
      {
        id: "a",
        scheduledFor: "2026-06-26T09:00:00.000Z",
        type: "recurring",
        status: "projected",
        content: null,
        imageUrl: null,
        source: "auto_recurring",
        queueId: null,
        dayLabel: "Jeudi",
        timeLabel: "09:00",
        relativeLabel: "Dans 2 jours",
      },
      {
        id: "b",
        scheduledFor: "2026-06-25T14:00:00.000Z",
        type: "one_shot",
        status: "projected",
        content: null,
        imageUrl: null,
        source: "auto_recurring",
        queueId: null,
        dayLabel: "Mercredi",
        timeLabel: "14:00",
        relativeLabel: "Demain",
      },
    ]);

    expect(grouped.map((g) => g.dateKey)).toEqual(["2026-06-25", "2026-06-26"]);
    expect(grouped[0].items).toHaveLength(1);
  });
});
