import "dotenv/config";
import { getDb, closeDb } from "../server/db.ts";
import { autoPublishQueue } from "../drizzle/schema.ts";
import { eq, inArray } from "drizzle-orm";

const db = await getDb();
if (!db) throw new Error("DB indisponible");

const stuck = await db
  .select({ id: autoPublishQueue.id, status: autoPublishQueue.status })
  .from(autoPublishQueue)
  .where(eq(autoPublishQueue.status, "publishing"));

if (stuck.length === 0) {
  console.log("Aucun post bloqué en publishing.");
  await closeDb();
  process.exit(0);
}

const ids = stuck.map((row) => row.id);
await db
  .update(autoPublishQueue)
  .set({ status: "pending", updatedAt: new Date(), errorMessage: null })
  .where(inArray(autoPublishQueue.id, ids));

const rows = await db
  .select({
    id: autoPublishQueue.id,
    status: autoPublishQueue.status,
    scheduledFor: autoPublishQueue.scheduledFor,
  })
  .from(autoPublishQueue)
  .where(inArray(autoPublishQueue.id, ids));

console.log(`${rows.length} post(s) débloqué(s):`, rows);
await closeDb();
