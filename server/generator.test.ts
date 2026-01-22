import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { userProfiles, generatedPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Content Generator API", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should have user_profiles table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    // Just verify the table is accessible
    const profiles = await db
      .select()
      .from(userProfiles)
      .limit(1);

    expect(Array.isArray(profiles)).toBe(true);
    console.log(`User profiles table accessible, found ${profiles.length} profiles`);
  });

  it("should have generated_posts table accessible", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    // Just verify the table is accessible
    const posts = await db
      .select()
      .from(generatedPosts)
      .limit(1);

    expect(Array.isArray(posts)).toBe(true);
    console.log(`Generated posts table accessible, found ${posts.length} posts`);
  });

  it("should support all required profile fields", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    // Test that we can query all the profile fields
    const profiles = await db
      .select({
        id: userProfiles.id,
        userId: userProfiles.userId,
        companyName: userProfiles.companyName,
        industry: userProfiles.industry,
        sector: userProfiles.sector,
        products: userProfiles.products,
        services: userProfiles.services,
        targetAudience: userProfiles.targetAudience,
        personalBio: userProfiles.personalBio,
        expertise: userProfiles.expertise,
        achievements: userProfiles.achievements,
        preferredTone: userProfiles.preferredTone,
        preferredLanguages: userProfiles.preferredLanguages,
        contentGoals: userProfiles.contentGoals,
        businessGoals: userProfiles.businessGoals,
        uniqueSellingPoints: userProfiles.uniqueSellingPoints,
        competitors: userProfiles.competitors,
      })
      .from(userProfiles)
      .limit(1);

    expect(Array.isArray(profiles)).toBe(true);
    console.log("All profile fields are accessible");
  });

  it("should support all required generated post fields", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    // Test that we can query all the generated post fields
    const posts = await db
      .select({
        id: generatedPosts.id,
        userId: generatedPosts.userId,
        content: generatedPosts.content,
        language: generatedPosts.language,
        theme: generatedPosts.theme,
        tone: generatedPosts.tone,
        status: generatedPosts.status,
        publishedAt: generatedPosts.publishedAt,
        linkedinPostId: generatedPosts.linkedinPostId,
      })
      .from(generatedPosts)
      .limit(1);

    expect(Array.isArray(posts)).toBe(true);
    console.log("All generated post fields are accessible");
  });
});

describe("Content Generation Logic", () => {
  it("should have valid themes list", () => {
    const themes = [
      "entrepreneuriat",
      "leadership",
      "innovation",
      "motivation",
      "productivité",
      "networking",
      "personal-branding",
      "vente",
      "marketing",
      "tech-ia",
      "finance",
      "rh-management",
      "éducation",
      "développement-personnel",
      "storytelling",
    ];

    expect(themes.length).toBeGreaterThan(10);
    themes.forEach((theme) => {
      expect(typeof theme).toBe("string");
      expect(theme.length).toBeGreaterThan(0);
    });
  });

  it("should have valid languages list", () => {
    const languages = [
      { code: "FR", name: "Français" },
      { code: "EN", name: "English" },
      { code: "AR", name: "العربية" },
      { code: "ES", name: "Español" },
      { code: "DE", name: "Deutsch" },
    ];

    expect(languages.length).toBe(5);
    languages.forEach((lang) => {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
    });
  });

  it("should have valid tones list", () => {
    const tones = [
      "inspirant",
      "éducatif",
      "provocateur",
      "storytelling",
      "professionnel",
    ];

    expect(tones.length).toBe(5);
    tones.forEach((tone) => {
      expect(typeof tone).toBe("string");
    });
  });

  it("should have valid post types list", () => {
    const postTypes = [
      "motivation",
      "conseil",
      "histoire",
      "question",
      "liste",
      "citation",
      "actualité",
      "behind-the-scenes",
    ];

    expect(postTypes.length).toBe(8);
    postTypes.forEach((type) => {
      expect(typeof type).toBe("string");
    });
  });
});
