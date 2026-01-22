import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

describe("LinkedRank Platform Tests", () => {
  describe("Influencers/Creators", () => {
    it("should fetch influencers from database", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const influencers = await db
        .select()
        .from(schema.linkedinInfluencers)
        .limit(10);
      
      expect(Array.isArray(influencers)).toBe(true);
      expect(influencers.length).toBeGreaterThan(0);
    });

    it("should filter influencers by country", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const franceInfluencers = await db
        .select()
        .from(schema.linkedinInfluencers)
        .where(eq(schema.linkedinInfluencers.country, "France"));
      
      expect(Array.isArray(franceInfluencers)).toBe(true);
      franceInfluencers.forEach((influencer) => {
        expect(influencer.country).toBe("France");
      });
    });

    it("should sort influencers by followers", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const sortedInfluencers = await db
        .select()
        .from(schema.linkedinInfluencers)
        .orderBy(desc(schema.linkedinInfluencers.followers))
        .limit(5);
      
      expect(Array.isArray(sortedInfluencers)).toBe(true);
      for (let i = 1; i < sortedInfluencers.length; i++) {
        expect(sortedInfluencers[i - 1].followers).toBeGreaterThanOrEqual(
          sortedInfluencers[i].followers || 0
        );
      }
    });

    it("should have required fields for each influencer", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const influencers = await db
        .select()
        .from(schema.linkedinInfluencers)
        .limit(5);
      
      influencers.forEach((influencer) => {
        expect(influencer.name).toBeTruthy();
        expect(influencer.country).toBeTruthy();
        expect(typeof influencer.followers).toBe("number");
      });
    });
  });

  describe("Posts/Content", () => {
    it("should fetch posts from database", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const posts = await db
        .select()
        .from(schema.linkedinPosts)
        .limit(10);
      
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
    });

    it("should filter posts by language", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const frenchPosts = await db
        .select()
        .from(schema.linkedinPosts)
        .where(eq(schema.linkedinPosts.language, "FR"));
      
      expect(Array.isArray(frenchPosts)).toBe(true);
      frenchPosts.forEach((post) => {
        expect(post.language).toBe("FR");
      });
    });

    it("should have posts with themes", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const posts = await db
        .select()
        .from(schema.linkedinPosts)
        .limit(10);
      
      expect(Array.isArray(posts)).toBe(true);
      // Check that posts have theme field
      posts.forEach((post) => {
        expect(post.theme).toBeTruthy();
      });
    });

    it("should have content for each post", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const posts = await db
        .select()
        .from(schema.linkedinPosts)
        .limit(10);
      
      posts.forEach((post) => {
        expect(post.content).toBeTruthy();
        expect(post.content.length).toBeGreaterThan(10);
      });
    });
  });

  describe("User Profiles", () => {
    it("should access user profiles table", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      
      // Check if userProfiles table exists and can be queried
      const profiles = await db
        .select()
        .from(schema.userProfiles)
        .limit(1);
      
      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe("Database Statistics", () => {
    it("should have sufficient influencers for rankings", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.linkedinInfluencers);
      
      const count = Number(result[0]?.count || 0);
      expect(count).toBeGreaterThanOrEqual(10);
    });

    it("should have sufficient posts for content library", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.linkedinPosts);
      
      const count = Number(result[0]?.count || 0);
      expect(count).toBeGreaterThanOrEqual(20);
    });

    it("should have multiple countries represented", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const countries = await db
        .selectDistinct({ country: schema.linkedinInfluencers.country })
        .from(schema.linkedinInfluencers);
      
      expect(countries.length).toBeGreaterThanOrEqual(5);
    });

    it("should have multiple industries represented", async () => {
      const db = await getDb();
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }
      const industries = await db
        .selectDistinct({ industry: schema.linkedinInfluencers.industry })
        .from(schema.linkedinInfluencers);
      
      expect(industries.length).toBeGreaterThanOrEqual(5);
    });
  });
});
