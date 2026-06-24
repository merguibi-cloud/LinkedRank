import "dotenv/config";
import { createScriptPostgresClient } from "../server/_core/database";

async function main() {
  const sql = createScriptPostgresClient();

  try {
    const tables = await sql<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;

    console.log(`Suppression de ${tables.length} table(s)...`);
    for (const { tablename } of tables) {
      await sql.unsafe(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
      console.log(`  - ${tablename}`);
    }
    console.log("Base Supabase vidée avec succès.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
