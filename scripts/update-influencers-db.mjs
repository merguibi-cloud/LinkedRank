import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

// Load enriched creators data
const creatorsPath = join(process.cwd(), "scripts/top_creators_enriched.json");
const creatorsData = JSON.parse(readFileSync(creatorsPath, "utf-8"));
const creators = creatorsData.creators || [];

console.log("🚀 Updating influencers in database...");
console.log(`📊 Found ${creators.length} creators to process`);

function formatFollowers(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

async function updateInfluencers() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  let updated = 0;
  let inserted = 0;
  let errors = 0;
  
  for (const creator of creators) {
    try {
      const linkedinUrl = creator.linkedinUrl || `https://www.linkedin.com/in/${creator.linkedinUsername}/`;
      
      // Try to update or insert
      await connection.execute(
        `INSERT INTO linkedin_influencers 
         (name, linkedinUrl, headline, profilePicture, country, industry, 
          followers, avgLikes, avgComments, engagementRate, 
          followersGrowth30d, isVerified, topTopics)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         followers = VALUES(followers),
         headline = VALUES(headline),
         profilePicture = VALUES(profilePicture),
         engagementRate = VALUES(engagementRate),
         updatedAt = NOW()`,
        [
          creator.name,
          linkedinUrl,
          creator.headline || creator.jobTitle || "",
          creator.profilePicture || null,
          creator.country || "Unknown",
          creator.sector || "General",
          creator.followers || 0,
          Math.round((creator.followers || 0) * 0.01), // avg likes estimate
          Math.round((creator.followers || 0) * 0.001), // avg comments estimate
          String(parseFloat(creator.engagementRate) || 1.0),
          2000, // followers growth estimate (2.0%)
          creator.isVerified ? 1 : 0,
          JSON.stringify(creator.topTopics || [creator.sector || "general"])
        ]
      );
      
      updated++;
      console.log(`✅ Processed: ${creator.name} (${formatFollowers(creator.followers)})`);
    } catch (error) {
      errors++;
      console.error(`❌ Error for ${creator.name}: ${error.message}`);
    }
  }
  
  await connection.end();
  
  console.log("\\n" + "=".repeat(50));
  console.log("🎉 Database update complete!");
  console.log(`   Processed: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log("=".repeat(50));
}

updateInfluencers().catch(console.error);
