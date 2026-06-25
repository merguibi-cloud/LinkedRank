import "dotenv/config";
import { getDb, closeDb } from "../server/db.ts";
import { autoPublishQueue } from "../drizzle/schema.ts";
import { eq, inArray } from "drizzle-orm";

const db = await getDb();
if (!db) throw new Error("DB indisponible");

await db
  .update(autoPublishQueue)
  .set({ status: "pending", updatedAt: new Date(), errorMessage: null })
  .where(
    inArray(autoPublishQueue.id, [74, 75])
  );

const rows = await db
  .select({
    id: autoPublishQueue.id,
    status: autoPublishQueue.status,
    scheduledFor: autoPublishQueue.scheduledFor,
  })
  .from(autoPublishQueue)
  .where(inArray(autoPublishQueue.id, [74, 75]));

console.log("Posts débloqués:", rows);
await closeDb();
