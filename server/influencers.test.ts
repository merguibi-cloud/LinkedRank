import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { linkedinInfluencers } from "../drizzle/schema";
import { desc, eq, like, or, and, sql } from "drizzle-orm";

describe("Influencers API", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should have influencers in the database", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const influencers = await db
      .select()
      .from(linkedinInfluencers)
      .limit(10);

    expect(influencers.length).toBeGreaterThan(0);
    console.log(`Found ${influencers.length} influencers`);
  });

  it("should have influencers from multiple countries", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const countries = await db
      .selectDistinct({ country: linkedinInfluencers.country })
      .from(linkedinInfluencers)
      .where(sql`${linkedinInfluencers.country} IS NOT NULL`);

    expect(countries.length).toBeGreaterThan(5);
    console.log(`Found influencers from ${countries.length} countries`);
  });

  it("should filter influencers by country", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const frenchInfluencers = await db
      .select()
      .from(linkedinInfluencers)
      .where(eq(linkedinInfluencers.country, "France"));

    expect(frenchInfluencers.length).toBeGreaterThan(0);
    frenchInfluencers.forEach((inf) => {
      expect(inf.country).toBe("France");
    });
    console.log(`Found ${frenchInfluencers.length} French influencers`);
  });

  it("should filter influencers by industry", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const techInfluencers = await db
      .select()
      .from(linkedinInfluencers)
      .where(eq(linkedinInfluencers.industry, "Technology"));

    expect(techInfluencers.length).toBeGreaterThan(0);
    console.log(`Found ${techInfluencers.length} Tech influencers`);
  });

  it("should sort influencers by followers", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const sortedInfluencers = await db
      .select()
      .from(linkedinInfluencers)
      .orderBy(desc(linkedinInfluencers.followers))
      .limit(5);

    expect(sortedInfluencers.length).toBe(5);
    
    // Verify descending order
    for (let i = 0; i < sortedInfluencers.length - 1; i++) {
      const current = sortedInfluencers[i].followers || 0;
      const next = sortedInfluencers[i + 1].followers || 0;
      expect(current).toBeGreaterThanOrEqual(next);
    }
    
    console.log(`Top influencer: ${sortedInfluencers[0].name} with ${sortedInfluencers[0].followers} followers`);
  });

  it("should search influencers by name", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const searchResults = await db
      .select()
      .from(linkedinInfluencers)
      .where(like(linkedinInfluencers.name, "%Youssef%"));

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].name).toContain("Youssef");
    console.log(`Found ${searchResults.length} results for "Youssef"`);
  });

  it("should have required fields for each influencer", async () => {
    if (!db) {
      console.log("Database not available, skipping test");
      return;
    }

    const influencers = await db
      .select()
      .from(linkedinInfluencers)
      .limit(10);

    influencers.forEach((inf) => {
      expect(inf.name).toBeTruthy();
      expect(inf.linkedinUrl).toBeTruthy();
      expect(inf.country).toBeTruthy();
    });
  });
});
