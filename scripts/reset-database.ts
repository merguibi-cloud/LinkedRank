import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL manquant dans .env");
  }

  const sql = postgres(url, { prepare: false, max: 1 });

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
