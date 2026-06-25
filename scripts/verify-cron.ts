import "dotenv/config";
import { getDb, closeDb } from "../server/db.ts";
import { autoPublishQueue, autoPublishHistory } from "../drizzle/schema.ts";
import { desc, eq, gte } from "drizzle-orm";

const db = await getDb();
if (!db) {
  console.error("DB indisponible");
  process.exit(1);
}

const since = new Date(Date.now() - 6 * 60 * 60 * 1000);

const history = await db
  .select({
    id: autoPublishHistory.id,
    status: autoPublishHistory.status,
    publishedAt: autoPublishHistory.publishedAt,
    createdAt: autoPublishHistory.createdAt,
    errorMessage: autoPublishHistory.errorMessage,
  })
  .from(autoPublishHistory)
  .where(gte(autoPublishHistory.createdAt, since))
  .orderBy(desc(autoPublishHistory.createdAt))
  .limit(8);

const pending = await db
  .select({
    id: autoPublishQueue.id,
    scheduledFor: autoPublishQueue.scheduledFor,
    status: autoPublishQueue.status,
  })
  .from(autoPublishQueue)
  .where(eq(autoPublishQueue.status, "pending"))
  .orderBy(autoPublishQueue.scheduledFor)
  .limit(6);

const failed = await db
  .select({
    id: autoPublishQueue.id,
    scheduledFor: autoPublishQueue.scheduledFor,
    errorMessage: autoPublishQueue.errorMessage,
  })
  .from(autoPublishQueue)
  .where(eq(autoPublishQueue.status, "failed"))
  .orderBy(desc(autoPublishQueue.scheduledFor))
  .limit(5);

const recent = await db
  .select({
    id: autoPublishQueue.id,
    status: autoPublishQueue.status,
    scheduledFor: autoPublishQueue.scheduledFor,
    publishedAt: autoPublishQueue.publishedAt,
    errorMessage: autoPublishQueue.errorMessage,
  })
  .from(autoPublishQueue)
  .orderBy(desc(autoPublishQueue.id))
  .limit(10);

console.log(JSON.stringify({ history, pending, failed, recent }, null, 2));
await closeDb();
