import { readFileSync } from "node:fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!dbUrl) {
  console.error("DATABASE_URL manquant");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false },
});
await client.connect();

const queue = await client.query(`
  SELECT id, "userId", LEFT(content, 50) AS preview,
         "imageUrl", "imageKey", "mediaLibraryId", status, "scheduledFor"
  FROM auto_publish_queue
  WHERE status = 'pending'
  ORDER BY "scheduledFor" ASC
  LIMIT 10
`);

const posts = await client.query(`
  SELECT id, "userId", title, status, "imageUrl", "imageKey", "mediaLibraryId", "createdAt"
  FROM generated_posts
  ORDER BY "createdAt" DESC
  LIMIT 10
`);

const media = await client.query(`
  SELECT id, "userId", LEFT("fileUrl", 80) AS "fileUrl", "fileKey"
  FROM media_library
  ORDER BY id DESC
  LIMIT 5
`);

console.log("=== QUEUE ===");
console.table(queue.rows);
console.log("=== POSTS ===");
console.table(posts.rows);
console.log("=== MEDIA ===");
console.table(media.rows);

await client.end();
