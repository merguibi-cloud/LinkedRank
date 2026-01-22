import mysql from 'mysql2/promise';

async function removeDuplicates() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Checking for duplicates...');
  
  // Find all duplicate names
  const [duplicates] = await connection.execute(`
    SELECT name, COUNT(*) as cnt 
    FROM linkedin_influencers 
    GROUP BY name 
    HAVING cnt > 1
  `);
  
  console.log(`Found ${duplicates.length} names with duplicates`);
  
  let totalDeleted = 0;
  
  for (const dup of duplicates) {
    // Get all entries for this name, keep the one with highest followers or most recent
    const [entries] = await connection.execute(`
      SELECT id, name, followers, createdAt 
      FROM linkedin_influencers 
      WHERE name = ? 
      ORDER BY followers DESC, createdAt DESC
    `, [dup.name]);
    
    if (entries.length > 1) {
      // Keep the first one (highest followers), delete the rest
      const keepId = entries[0].id;
      const deleteIds = entries.slice(1).map(e => e.id);
      
      console.log(`Keeping ${dup.name} (id: ${keepId}, followers: ${entries[0].followers}), deleting ${deleteIds.length} duplicates`);
      
      await connection.execute(`
        DELETE FROM linkedin_influencers 
        WHERE id IN (${deleteIds.join(',')})
      `);
      
      totalDeleted += deleteIds.length;
    }
  }
  
  console.log(`\nTotal deleted: ${totalDeleted} duplicates`);
  
  // Count remaining
  const [count] = await connection.execute('SELECT COUNT(*) as total FROM linkedin_influencers');
  console.log(`Remaining creators: ${count[0].total}`);
  
  await connection.end();
}

removeDuplicates().catch(console.error);
