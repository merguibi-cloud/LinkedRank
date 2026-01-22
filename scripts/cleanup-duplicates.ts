import { getDb } from '../server/db';
import { linkedinInfluencers } from '../drizzle/schema';
import { sql, eq } from 'drizzle-orm';

async function cleanupDuplicates() {
  console.log('🔍 Recherche des doublons...');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }
  
  // Get all influencers
  const allInfluencers = await db.select().from(linkedinInfluencers).orderBy(linkedinInfluencers.name);
  
  console.log(`Total créateurs: ${allInfluencers.length}`);
  
  // Group by linkedinUsername to find duplicates
  const byUsername: Record<string, typeof allInfluencers> = {};
  for (const inf of allInfluencers) {
    const key = inf.linkedinUsername || inf.name;
    if (!byUsername[key]) {
      byUsername[key] = [];
    }
    byUsername[key].push(inf);
  }
  
  // Find duplicates
  const duplicates = Object.entries(byUsername).filter(([_, list]) => list.length > 1);
  
  console.log(`\n📊 Doublons trouvés: ${duplicates.length}`);
  
  let deletedCount = 0;
  
  for (const [username, list] of duplicates) {
    console.log(`\n🔄 ${username}: ${list.length} entrées`);
    
    // Keep the one with the most followers, delete others
    list.sort((a, b) => (b.followers || 0) - (a.followers || 0));
    const keep = list[0];
    const toDelete = list.slice(1);
    
    console.log(`  ✅ Garde: ID ${keep.id} - ${keep.name} (${keep.followers} followers)`);
    
    for (const dup of toDelete) {
      console.log(`  ❌ Supprime: ID ${dup.id} - ${dup.name} (${dup.followers} followers)`);
      await db.delete(linkedinInfluencers).where(eq(linkedinInfluencers.id, dup.id));
      deletedCount++;
    }
  }
  
  console.log(`\n✅ Nettoyage terminé: ${deletedCount} doublons supprimés`);
  
  // Count remaining
  const remaining = await db.select({ count: sql<number>`COUNT(*)` }).from(linkedinInfluencers);
  console.log(`📊 Créateurs restants: ${remaining[0].count}`);
  
  process.exit(0);
}

cleanupDuplicates().catch(console.error);
