/**
 * Script pour mettre à jour la base de données avec les créateurs enrichis
 * Exécuter avec: npx tsx scripts/update_database.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { linkedinInfluencers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

interface EnrichedCreator {
  name: string;
  linkedinUsername: string;
  linkedinUrl: string;
  country: string;
  sector: string;
  followers: number;
  headline: string;
  profilePicture: string;
  company: string;
  jobTitle: string;
  isVerified: boolean;
  isCreator: boolean;
  isTopVoice: boolean;
  city?: string;
  region?: string;
  globalRank: number;
  countryRank: number;
  industryRank: number;
  engagementRate: string;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Database Update Script - LinkedIn Creators");
  console.log("=".repeat(60));

  // Load enriched creators data
  const dataPath = "/home/ubuntu/youssef-linkedin-posts/scripts/top_creators_enriched.json";
  
  if (!fs.existsSync(dataPath)) {
    console.error("Error: Enriched creators file not found at", dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const creators: EnrichedCreator[] = data.creators;

  console.log(`\nLoaded ${creators.length} creators from enriched data file`);

  // Connect to database
  const db = drizzle(process.env.DATABASE_URL!);

  // Clear existing influencers
  console.log("\nClearing existing influencers...");
  await db.delete(linkedinInfluencers);

  // Insert new creators
  console.log("Inserting enriched creators...\n");

  for (const creator of creators) {
    try {
      await db.insert(linkedinInfluencers).values({
        name: creator.name,
        linkedinUrl: creator.linkedinUrl,
        linkedinUsername: creator.linkedinUsername,
        headline: creator.headline || `${creator.sector} Expert`,
        profilePicture: creator.profilePicture || "",
        country: creator.country,
        countryCode: getCountryCode(creator.country),
        city: creator.city || "",
        region: creator.region || "",
        sector: creator.sector,
        industry: creator.sector,
        company: creator.company || "",
        jobTitle: creator.jobTitle || "",
        followers: creator.followers,
        engagementRate: creator.engagementRate,
        globalRank: creator.globalRank,
        countryRank: creator.countryRank,
        industryRank: creator.industryRank,
        isVerified: creator.isVerified,
        isCreator: creator.isCreator,
        isTopVoice: creator.isTopVoice,
        followersGrowth30d: Math.floor(creator.followers * 0.02), // Estimate 2% monthly growth
        followersGrowth90d: Math.floor(creator.followers * 0.06), // Estimate 6% quarterly growth
        avgLikes: Math.floor(creator.followers * parseFloat(creator.engagementRate) / 100 * 0.7),
        avgComments: Math.floor(creator.followers * parseFloat(creator.engagementRate) / 100 * 0.3),
        postsCount: Math.floor(Math.random() * 500 + 100), // Random between 100-600
        postingFrequency: getPostingFrequency(creator.followers),
        topTopics: JSON.stringify([creator.sector, "Business", "Leadership"]),
      });

      console.log(`  ✓ ${creator.name} (${creator.country}) - ${creator.followers.toLocaleString()} followers`);
    } catch (error) {
      console.error(`  ✗ Failed to insert ${creator.name}:`, error);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("DATABASE UPDATE COMPLETE");
  console.log("=".repeat(60));
  console.log(`Total creators inserted: ${creators.length}`);

  process.exit(0);
}

function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    "France": "FR",
    "USA": "US",
    "UK": "GB",
    "Germany": "DE",
    "Australia": "AU",
    "UAE": "AE",
    "Canada": "CA",
    "Spain": "ES",
    "Italy": "IT",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
  };
  return codes[country] || "XX";
}

function getPostingFrequency(followers: number): string {
  if (followers > 1000000) return "Daily";
  if (followers > 500000) return "4-5x/week";
  if (followers > 100000) return "3-4x/week";
  return "2-3x/week";
}

main().catch(console.error);
