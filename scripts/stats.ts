import "dotenv/config";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

async function query(sql: string) {
  return client.unsafe(sql);
}

async function main() {
  console.log("\n========================================");
  console.log("       LINKEDRANK — USAGE REPORT");
  console.log("========================================\n");

  // ── USERS ──────────────────────────────────────────────────────────────────
  const [userStats] = await query(`
    SELECT
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours')  AS last_24h,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days')    AS last_7d,
      COUNT(*) FILTER (WHERE "lastSignedIn" > NOW() - INTERVAL '24 hours') AS active_24h,
      COUNT(*) FILTER (WHERE "lastSignedIn" > NOW() - INTERVAL '7 days')   AS active_7d
    FROM users
  `);

  console.log("── USERS ───────────────────────────────");
  console.log(`  Total registered  : ${userStats.total}`);
  console.log(`  Signed up (24h)   : ${userStats.last_24h}`);
  console.log(`  Signed up (7d)    : ${userStats.last_7d}`);
  console.log(`  Active (24h)      : ${userStats.active_24h}`);
  console.log(`  Active (7d)       : ${userStats.active_7d}`);

  const planRows = await query(`
    SELECT COALESCE("subscriptionPlan", 'none') AS plan, COUNT(*) AS count
    FROM users GROUP BY plan ORDER BY count DESC
  `);
  console.log(`  Plans:`);
  for (const r of planRows) console.log(`    ${String(r.plan).padEnd(12)} ${r.count}`);

  // ── AI GENERATIONS ─────────────────────────────────────────────────────────
  const [genStats] = await query(`
    SELECT
      COUNT(*)                                                AS total,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours') AS last_24h,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days')   AS last_7d,
      COUNT(DISTINCT "userId")                                AS unique_users
    FROM generated_posts
  `);

  console.log("\n── AI GENERATIONS (posts) ──────────────");
  console.log(`  Total generated   : ${genStats.total}`);
  console.log(`  Last 24h          : ${genStats.last_24h}`);
  console.log(`  Last 7d           : ${genStats.last_7d}`);
  console.log(`  Unique users      : ${genStats.unique_users}`);

  const topGenUsers = await query(`
    SELECT u.email, u.name, COUNT(*) AS generations
    FROM generated_posts gp
    JOIN users u ON u.id = gp."userId"
    GROUP BY u.id, u.email, u.name
    ORDER BY generations DESC LIMIT 5
  `);
  console.log(`  Top users by generations:`);
  for (const r of topGenUsers)
    console.log(`    ${String(r.email ?? r.name ?? '?').padEnd(35)} ${r.generations}x`);

  // ── AGENT TASKS ────────────────────────────────────────────────────────────
  const [taskStats] = await query(`
    SELECT
      COUNT(*)                                                         AS total,
      COUNT(*) FILTER (WHERE status = 'completed')                     AS completed,
      COUNT(*) FILTER (WHERE status = 'pending')                       AS pending,
      COUNT(*) FILTER (WHERE status = 'failed')                        AS failed,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours') AS last_24h
    FROM agent_tasks
  `);

  console.log("\n── AGENT TASKS ─────────────────────────");
  console.log(`  Total             : ${taskStats.total}`);
  console.log(`  Completed         : ${taskStats.completed}`);
  console.log(`  Pending           : ${taskStats.pending}`);
  console.log(`  Failed            : ${taskStats.failed}`);
  console.log(`  Last 24h          : ${taskStats.last_24h}`);

  // ── CAROUSELS ──────────────────────────────────────────────────────────────
  const [carouselStats] = await query(`
    SELECT COUNT(*) AS total, COUNT(DISTINCT "userId") AS unique_users
    FROM generated_carousels
  `);
  console.log("\n── CAROUSELS ───────────────────────────");
  console.log(`  Total generated   : ${carouselStats.total}`);
  console.log(`  Unique users      : ${carouselStats.unique_users}`);

  // ── PUBLISHED TO LINKEDIN ──────────────────────────────────────────────────
  const [publishStats] = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'published')  AS published,
      COUNT(*) FILTER (WHERE status = 'scheduled')  AS scheduled,
      COUNT(*) FILTER (WHERE status = 'draft')      AS drafts,
      COALESCE(SUM(likes), 0)                        AS total_likes,
      COALESCE(SUM(comments), 0)                     AS total_comments
    FROM generated_posts
  `);
  console.log("\n── LINKEDIN PUBLISHING ─────────────────");
  console.log(`  Published         : ${publishStats.published}`);
  console.log(`  Scheduled         : ${publishStats.scheduled}`);
  console.log(`  Drafts            : ${publishStats.drafts}`);
  console.log(`  Total likes       : ${publishStats.total_likes}`);
  console.log(`  Total comments    : ${publishStats.total_comments}`);

  // ── AUTO-PUBLISH ───────────────────────────────────────────────────────────
  const [apStats] = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'published') AS published,
      COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
      COUNT(*) FILTER (WHERE status = 'failed')    AS failed,
      COUNT(DISTINCT "userId")                      AS unique_users
    FROM auto_publish_queue
  `);
  console.log("\n── AUTO-PUBLISH QUEUE ──────────────────");
  console.log(`  Published         : ${apStats.published}`);
  console.log(`  Pending           : ${apStats.pending}`);
  console.log(`  Failed            : ${apStats.failed}`);
  console.log(`  Unique users      : ${apStats.unique_users}`);

  // ── MEDIA LIBRARY ──────────────────────────────────────────────────────────
  const [mediaStats] = await query(`
    SELECT COUNT(*) AS total, COUNT(DISTINCT "userId") AS unique_users,
           COALESCE(SUM("fileSize"), 0) AS total_bytes
    FROM media_library
  `);
  const totalMB = Math.round(Number(mediaStats.total_bytes) / 1024 / 1024);
  console.log("\n── MEDIA LIBRARY ───────────────────────");
  console.log(`  Total files       : ${mediaStats.total}`);
  console.log(`  Unique users      : ${mediaStats.unique_users}`);
  console.log(`  Storage used      : ${totalMB} MB`);

  // ── AI SPEND (real data) ───────────────────────────────────────────────────
  const [spendStats] = await query(`
    SELECT
      COUNT(*)                                                          AS calls,
      COALESCE(SUM("totalTokens"), 0)                                   AS total_tokens,
      COALESCE(SUM("promptTokens"), 0)                                  AS prompt_tokens,
      COALESCE(SUM("completionTokens"), 0)                              AS completion_tokens,
      COALESCE(SUM("costUsd"::numeric), 0)                              AS total_cost,
      COALESCE(SUM("costUsd"::numeric) FILTER (WHERE "createdAt" > NOW() - INTERVAL '24 hours'), 0) AS cost_24h,
      COALESCE(SUM("costUsd"::numeric) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days'), 0)   AS cost_7d
    FROM token_usage
  `);

  const topSpenders = await query(`
    SELECT u.email, u.name,
           COUNT(*)                          AS calls,
           SUM(tu."totalTokens")             AS tokens,
           SUM(tu."costUsd"::numeric)        AS cost
    FROM token_usage tu
    LEFT JOIN users u ON u.id = tu."userId"
    GROUP BY tu."userId", u.email, u.name
    ORDER BY cost DESC LIMIT 5
  `);

  const byModel = await query(`
    SELECT model, COUNT(*) AS calls, SUM("totalTokens") AS tokens, SUM("costUsd"::numeric) AS cost
    FROM token_usage GROUP BY model ORDER BY cost DESC
  `);

  const byEndpoint = await query(`
    SELECT COALESCE(endpoint, 'unknown') AS endpoint,
           COUNT(*) AS calls,
           SUM("costUsd"::numeric) AS cost
    FROM token_usage GROUP BY endpoint ORDER BY cost DESC LIMIT 10
  `);

  console.log("\n── AI SPEND (real) ─────────────────────");
  console.log(`  Total calls       : ${spendStats.calls}`);
  console.log(`  Total tokens      : ${Number(spendStats.total_tokens).toLocaleString()}`);
  console.log(`  Total cost        : $${Number(spendStats.total_cost).toFixed(4)}`);
  console.log(`  Cost (24h)        : $${Number(spendStats.cost_24h).toFixed(4)}`);
  console.log(`  Cost (7d)         : $${Number(spendStats.cost_7d).toFixed(4)}`);

  if (byModel.length > 0) {
    console.log(`  By model:`);
    for (const r of byModel)
      console.log(`    ${String(r.model).padEnd(28)} ${String(r.calls).padStart(5)} calls  $${Number(r.cost).toFixed(4)}`);
  }

  if (byEndpoint.length > 0) {
    console.log(`  By feature:`);
    for (const r of byEndpoint)
      console.log(`    ${String(r.endpoint).padEnd(28)} ${String(r.calls).padStart(5)} calls  $${Number(r.cost).toFixed(4)}`);
  }

  if (topSpenders.length > 0) {
    console.log(`  Top spenders:`);
    for (const r of topSpenders)
      console.log(`    ${String(r.email ?? r.name ?? 'anonymous').padEnd(35)} $${Number(r.cost).toFixed(4)}`);
  }

  console.log("\n========================================\n");
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
