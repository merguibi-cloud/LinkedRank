/**
 * Enrichit les créateurs : username, photo, headline depuis top_creators_enriched.json
 * Usage: pnpm exec tsx scripts/sync-influencer-avatars.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { linkedinInfluencers } from "../drizzle/schema";

type EnrichedCreator = {
  name: string;
  linkedinUsername?: string;
  profilePicture?: string;
  headline?: string;
  linkedinUrl?: string;
  followers?: number;
  country?: string;
  sector?: string;
  engagementRate?: string;
  isVerified?: boolean;
  isTopVoice?: boolean;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

async function main() {
  const dataPath = path.resolve(
    process.cwd(),
    "scripts/top_creators_enriched.json"
  );

  if (!fs.existsSync(dataPath)) {
    console.error("Fichier introuvable:", dataPath);
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("Base de données indisponible");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as {
    creators: EnrichedCreator[];
  };

  const byName = new Map(
    data.creators.map((c) => [normalizeName(c.name), c])
  );

  const existing = await db.select().from(linkedinInfluencers);
  let updated = 0;

  for (const row of existing) {
    const enriched = byName.get(normalizeName(row.name));
    if (!enriched) continue;

    const username =
      enriched.linkedinUsername || row.linkedinUsername || undefined;
    const profilePicture =
      enriched.profilePicture?.trim() ||
      (username ? `https://unavatar.io/linkedin/${username}` : undefined);

    await db
      .update(linkedinInfluencers)
      .set({
        linkedinUsername: username,
        linkedinUrl: enriched.linkedinUrl || row.linkedinUrl,
        profilePicture: profilePicture || row.profilePicture,
        headline: enriched.headline || row.headline,
        sector: enriched.sector || row.sector,
        country: enriched.country || row.country,
        followers: enriched.followers || row.followers,
        engagementRate: enriched.engagementRate || row.engagementRate,
        isVerified: enriched.isVerified ?? row.isVerified,
        isTopVoice: enriched.isTopVoice ?? row.isTopVoice,
        updatedAt: new Date(),
      })
      .where(eq(linkedinInfluencers.id, row.id));

    updated++;
  }

  // Unavatar pour les lignes avec username mais sans photo
  const withUsernameNoPic = await db
    .select({ id: linkedinInfluencers.id, username: linkedinInfluencers.linkedinUsername })
    .from(linkedinInfluencers)
    .where(sql`(${linkedinInfluencers.profilePicture} is null or ${linkedinInfluencers.profilePicture} = '') and ${linkedinInfluencers.linkedinUsername} is not null`);

  for (const row of withUsernameNoPic) {
    if (!row.username) continue;
    await db
      .update(linkedinInfluencers)
      .set({
        profilePicture: `https://unavatar.io/linkedin/${row.username}`,
        updatedAt: new Date(),
      })
      .where(eq(linkedinInfluencers.id, row.id));
  }

  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      withPic: sql<number>`sum(case when ${linkedinInfluencers.profilePicture} is not null and ${linkedinInfluencers.profilePicture} != '' then 1 else 0 end)`,
      withUsername: sql<number>`sum(case when ${linkedinInfluencers.linkedinUsername} is not null and ${linkedinInfluencers.linkedinUsername} != '' then 1 else 0 end)`,
    })
    .from(linkedinInfluencers);

  console.log(`✅ Créateurs enrichis: ${updated}`);
  console.log(`📊 Avec photo: ${stats[0]?.withPic}/${stats[0]?.total}`);
  console.log(`📊 Avec username: ${stats[0]?.withUsername}/${stats[0]?.total}`);
}

main().catch(console.error);
