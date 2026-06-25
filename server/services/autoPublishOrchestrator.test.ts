import { describe, expect, it } from "vitest";
import {
  isTooSimilarToRecent,
  pickVariationPlan,
  textSimilarity,
  tokenizeForSimilarity,
} from "./autoPublishOrchestrator";

const baseSettings = {
  id: 1,
  userId: 1,
  isEnabled: true,
  sector: "Marketing",
  targetAudience: "PME",
  tone: "professional",
  language: "FR",
  viralityLevel: "medium",
  contentLength: "medium",
  includeEmojis: true,
  includeHashtags: true,
  includeCallToAction: true,
  personalContext: "",
  inspirationCreators: "[]",
  inspirationTopics: JSON.stringify({
    contentTypes: ["storytelling", "tips"],
    includeImage: true,
    imageType: "ai",
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
} as const;

describe("autoPublishOrchestrator", () => {
  it("detects similar posts", () => {
    const a =
      "Le marketing B2B change vite. Voici trois leçons pour vos campagnes LinkedIn cette semaine.";
    const b =
      "Le marketing B2B évolue rapidement. Voici trois leçons pour vos campagnes LinkedIn cette semaine.";
    expect(textSimilarity(a, b)).toBeGreaterThan(0.5);
  });

  it("accepts clearly different posts", () => {
    const a = "Comment recruter des développeurs seniors en remote";
    const b = "Ma recette préférée de tarte aux pommes caramélisée";
    expect(textSimilarity(a, b)).toBeLessThan(0.15);
  });

  it("flags content too similar to recent", () => {
    const recent = [
      {
        snippet: "Trois erreurs que font les fondateurs sur LinkedIn chaque lundi",
        tokens: tokenizeForSimilarity(
          "Trois erreurs que font les fondateurs sur LinkedIn chaque lundi"
        ),
      },
    ];
    const candidate =
      "Voici trois erreurs communes des fondateurs sur LinkedIn le lundi matin";
    expect(isTooSimilarToRecent(candidate, recent)).toBe(true);
  });

  it("rotates variation plan by slot seed", () => {
    const plan0 = pickVariationPlan(baseSettings, 0, 0);
    const plan1 = pickVariationPlan(baseSettings, 0, 3);
    expect(plan0.contentFormat).not.toBe(plan1.contentFormat);
    expect(plan0.topicAngle).not.toBe(plan1.topicAngle);
  });
});
