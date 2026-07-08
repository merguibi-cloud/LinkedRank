import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function main() {
  const tokenCheck = await client.unsafe(`
    SELECT
      COUNT(*) FILTER (WHERE ls."accessToken" IS NOT NULL AND ls."isConnected" = true) AS has_token,
      COUNT(*) FILTER (WHERE ls."accessToken" IS NULL OR ls.id IS NULL)                AS no_token,
      COUNT(*) FILTER (WHERE ls."isConnected" = false AND ls.id IS NOT NULL)            AS disconnected
    FROM (SELECT DISTINCT "userId" FROM auto_publish_queue WHERE status = 'failed') aq
    LEFT JOIN linkedin_settings ls ON ls."userId" = aq."userId"
  `);
  console.log("\n── ROOT CAUSE CHECK ─────────────────────");
  console.log(`  Users with valid LinkedIn token : ${tokenCheck[0].has_token}`);
  console.log(`  Users with no token at all      : ${tokenCheck[0].no_token}`);
  console.log(`  Users disconnected from LinkedIn: ${tokenCheck[0].disconnected}`);

  const errors = await client.unsafe(`
    SELECT "errorMessage", COUNT(*) AS count
    FROM auto_publish_queue
    WHERE status = 'failed'
    GROUP BY "errorMessage"
    ORDER BY count DESC
    LIMIT 20
  `);

  console.log("\n── AUTO-PUBLISH FAILURE BREAKDOWN ──────");
  for (const r of errors) {
    console.log(`\n  [${r.count}x] ${r.errorMessage ?? "(no message)"}`);
  }

  const recent = await client.unsafe(`
    SELECT aq."errorMessage", aq."scheduledFor", aq."retryCount", u.email
    FROM auto_publish_queue aq
    LEFT JOIN users u ON u.id = aq."userId"
    WHERE aq.status = 'failed'
    ORDER BY aq."updatedAt" DESC
    LIMIT 10
  `);

  console.log("\n── MOST RECENT FAILURES ─────────────────");
  for (const r of recent) {
    console.log(`  ${String(r.email ?? "?").padEnd(35)} retries: ${r.retryCount} | ${r.errorMessage}`);
  }
}

main().then(() => client.end()).catch(async (e) => { console.error(e); await client.end(); });
