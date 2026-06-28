import "dotenv/config";
import { getDb, closeDb } from "../server/db.ts";
import {
  autoPublishSettings,
  autoPublishSchedule,
  userProfiles,
  autoPublishQueue,
} from "../drizzle/schema.ts";
import { eq, desc } from "drizzle-orm";
import {
  parseInspirationTopics,
  buildLinkedInPostParams,
} from "../server/services/autoPublishGeneration.ts";

const userId = Number(process.argv[2] || 580);

const db = await getDb();
if (!db) throw new Error("DB indisponible");

const [s] = await db
  .select()
  .from(autoPublishSettings)
  .where(eq(autoPublishSettings.userId, userId));
const [p] = await db
  .select()
  .from(userProfiles)
  .where(eq(userProfiles.userId, userId));
const sched = await db
  .select()
  .from(autoPublishSchedule)
  .where(eq(autoPublishSchedule.userId, userId));
const [lastPost] = await db
  .select({ content: autoPublishQueue.content })
  .from(autoPublishQueue)
  .where(eq(autoPublishQueue.userId, userId))
  .orderBy(desc(autoPublishQueue.id))
  .limit(1);

if (!s) {
  console.log("❌ Aucune config auto-publication pour user", userId);
  await closeDb();
  process.exit(1);
}

const topics = parseInspirationTopics(s);
const params = buildLinkedInPostParams(s, []);

console.log(
  JSON.stringify(
    {
      resume: {
        automationActive: s.isEnabled,
        linkedinSettingsUtilises: true,
        reponsesPrisesEnCompte:
          Boolean(s.sector) &&
          (topics.objectives.length > 0 || topics.contentTypes.length > 0),
      },
      config: {
        sector: s.sector,
        targetAudience: s.targetAudience,
        tone: s.tone,
        language: s.language,
        personalContext: s.personalContext?.slice(0, 250),
        avoidTopics: s.avoidTopics,
        objectives: topics.objectives,
        contentTypes: topics.contentTypes,
        includeImage: topics.includeImage,
        imageType: topics.imageType,
      },
      profilOnboarding: {
        sector: p?.sector ?? null,
        contentGoals: p?.contentGoals ?? null,
      },
      planning: sched.map((x) => ({
        jour: x.dayOfWeek,
        heure: x.publishTime,
        actif: x.isActive,
      })),
      ceQueLIARecoit: {
        sector: params.sector,
        tone: params.tone,
        topic: params.topic,
        contentFormat: params.contentFormat,
        personalContext: params.personalContext?.slice(0, 250),
      },
      dernierPost: lastPost?.content?.slice(0, 150) ?? null,
    },
    null,
    2
  )
);

await closeDb();
