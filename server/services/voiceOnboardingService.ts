import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  userProfiles,
  autoPublishSettings,
  autoPublishSchedule,
} from "../../drizzle/schema";
import { initializeUserAgents } from "./agentService";

export const ONBOARDING_QUESTIONS = [
  {
    id: "intro",
    question:
      "Parlez-moi de vous : quel est votre métier et le nom de votre entreprise ou activité ?",
    options: undefined as readonly string[] | undefined,
  },
  {
    id: "sector",
    question:
      "Dans quel secteur travaillez-vous ? Par exemple tech, BTP, conseil ou santé.",
    options: undefined as readonly string[] | undefined,
  },
  {
    id: "audience",
    question:
      "Qui voulez-vous toucher sur LinkedIn ? Décrivez votre client ou lecteur idéal.",
    options: undefined as readonly string[] | undefined,
  },
  {
    id: "goals",
    question:
      "Quels sont vos objectifs ? Trouver des clients, gagner en visibilité, recruter, ou devenir une référence ?",
    options: ["Trouver des clients", "Gagner en visibilité", "Recruter", "Devenir une référence"],
  },
  {
    id: "topics",
    question:
      "Quels contenus aimez-vous publier ? Conseils, histoires, coulisses, témoignages clients ?",
    options: ["Conseils", "Histoires", "Coulisses", "Témoignages clients"],
  },
  {
    id: "tone",
    question:
      "Quel ton préférez-vous ? Professionnel, décontracté, inspirant, pédagogique ou provocateur ?",
    options: ["Professionnel", "Décontracté", "Inspirant", "Pédagogique", "Provocateur"],
  },
  {
    id: "frequency",
    question:
      "À quelle fréquence voulez-vous publier ? Tous les jours, plusieurs fois par semaine, ou une fois par semaine ?",
    options: ["Tous les jours", "Plusieurs fois par semaine", "Une fois par semaine"],
  },
  {
    id: "language",
    question:
      "Dans quelle langue publier ? Français, anglais, arabe, espagnol ou allemand ?",
    options: ["Français", "Anglais", "Arabe", "Espagnol", "Allemand"],
  },
  {
    id: "avoid",
    question:
      "Y a-t-il des sujets que vous préférez éviter ?",
    options: undefined as readonly string[] | undefined,
  },
  {
    id: "unique",
    question:
      "Pour finir, qu'est-ce qui vous rend unique dans votre domaine ?",
    options: undefined as readonly string[] | undefined,
  },
] as const;

export type OnboardingAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type ExtractedOnboardingProfile = {
  companyName: string;
  industry: string;
  sector: string;
  targetAudience: string;
  personalBio: string;
  expertise: string[];
  preferredTone: "professional" | "casual" | "inspirational" | "educational" | "provocative";
  preferredLanguages: string[];
  contentGoals: string[];
  businessGoals: string;
  uniqueSellingPoints: string;
  contentTopics: string[];
  contentTypes: string[];
  avoidTopics: string[];
  postsPerWeek: number;
  language: "FR" | "EN" | "AR" | "ES" | "DE";
  personalContext: string;
};

function extractMessageText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part.type === "text" ? part.text : ""))
      .join("");
  }
  return "";
}

function buildScheduleFromFrequency(postsPerWeek: number) {
  const slots: { dayOfWeek: number; publishTime: string; isActive: boolean }[] = [];

  if (postsPerWeek >= 7) {
    for (let day = 1; day <= 7; day++) {
      slots.push({ dayOfWeek: day % 7, publishTime: "09:00", isActive: true });
    }
  } else if (postsPerWeek >= 5) {
    [1, 2, 3, 4, 5].forEach((day) =>
      slots.push({ dayOfWeek: day, publishTime: "09:00", isActive: true })
    );
  } else if (postsPerWeek >= 3) {
    [1, 3, 5].forEach((day) =>
      slots.push({ dayOfWeek: day, publishTime: "09:00", isActive: true })
    );
  } else if (postsPerWeek >= 2) {
    [2, 4].forEach((day) =>
      slots.push({ dayOfWeek: day, publishTime: "09:00", isActive: true })
    );
  } else {
    slots.push({ dayOfWeek: 3, publishTime: "09:00", isActive: true });
  }

  return slots;
}

function fallbackExtract(answers: OnboardingAnswer[]): ExtractedOnboardingProfile {
  const byId = Object.fromEntries(answers.map((a) => [a.questionId, a.answer]));
  const allText = answers.map((a) => a.answer.toLowerCase()).join(" ");

  const detectTone = (): ExtractedOnboardingProfile["preferredTone"] => {
    if (allText.includes("décontract") || allText.includes("casual")) return "casual";
    if (allText.includes("inspir")) return "inspirational";
    if (allText.includes("pédagog") || allText.includes("éducat")) return "educational";
    if (allText.includes("provoc")) return "provocative";
    return "professional";
  };

  const detectFrequency = (): number => {
    if (allText.includes("tous les jours") || allText.includes("quotidien")) return 7;
    if (allText.includes("plusieurs") || allText.includes("3 fois")) return 3;
    if (allText.includes("semaine") && allText.includes("une")) return 1;
    return 3;
  };

  const detectLanguage = (): ExtractedOnboardingProfile["language"] => {
    if (allText.includes("anglais") || allText.includes("english")) return "EN";
    if (allText.includes("arabe")) return "AR";
    if (allText.includes("espagnol")) return "ES";
    if (allText.includes("allemand")) return "DE";
    return "FR";
  };

  const topics: string[] = [];
  if (allText.includes("conseil")) topics.push("Conseils pratiques");
  if (allText.includes("histoire") || allText.includes("story")) topics.push("Storytelling");
  if (allText.includes("coulisse")) topics.push("Coulisses");
  if (allText.includes("témoignage")) topics.push("Témoignages clients");
  if (topics.length === 0) topics.push("Conseils pratiques", "Expertise métier");

  const goals: string[] = [];
  if (allText.includes("client") || allText.includes("lead")) goals.push("Générer des clients");
  if (allText.includes("visibilit") || allText.includes("notoriété")) goals.push("Augmenter ma visibilité");
  if (allText.includes("recrut")) goals.push("Recruter des talents");
  if (goals.length === 0) goals.push("Développer mon activité");

  return {
    companyName: byId.intro?.split(",")[0]?.trim() || "Mon activité",
    industry: byId.sector || "Services",
    sector: byId.sector || "Services",
    targetAudience: byId.audience || "Professionnels de mon secteur",
    personalBio: byId.intro || "",
    expertise: topics,
    preferredTone: detectTone(),
    preferredLanguages: [detectLanguage()],
    contentGoals: goals,
    businessGoals: byId.goals || "",
    uniqueSellingPoints: byId.unique || "",
    contentTopics: topics,
    contentTypes: ["tips", "story", "insight"],
    avoidTopics: byId.avoid ? [byId.avoid] : [],
    postsPerWeek: detectFrequency(),
    language: detectLanguage(),
    personalContext: answers.map((a) => `${a.question}: ${a.answer}`).join("\n"),
  };
}

export async function extractProfileFromAnswers(
  answers: OnboardingAnswer[]
): Promise<{ profile: ExtractedOnboardingProfile; usedFallback: boolean }> {
  const conversation = answers
    .map((a) => `Q: ${a.question}\nR: ${a.answer}`)
    .join("\n\n");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Tu es un assistant qui structure les réponses d'onboarding vocal pour LinkedIn.
Analyse la conversation et extrais un profil structuré pour automatiser la création de contenu.
Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "companyName": "nom entreprise ou activité",
  "industry": "industrie",
  "sector": "secteur",
  "targetAudience": "audience cible",
  "personalBio": "bio courte",
  "expertise": ["domaine1", "domaine2"],
  "preferredTone": "professional|casual|inspirational|educational|provocative",
  "preferredLanguages": ["FR"],
  "contentGoals": ["objectif1"],
  "businessGoals": "objectifs business",
  "uniqueSellingPoints": "ce qui différencie",
  "contentTopics": ["sujet1", "sujet2"],
  "contentTypes": ["tips", "story", "insight", "question", "listicle"],
  "avoidTopics": ["sujet à éviter"],
  "postsPerWeek": 3,
  "language": "FR|EN|AR|ES|DE",
  "personalContext": "résumé complet pour personnaliser l'IA"
}`,
        },
        { role: "user", content: conversation },
      ],
      maxTokens: 4096,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const content = extractMessageText(response.choices[0]?.message?.content);
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(content) as ExtractedOnboardingProfile;
    return {
      profile: {
        ...fallbackExtract(answers),
        ...parsed,
        preferredLanguages: parsed.preferredLanguages?.length
          ? parsed.preferredLanguages
          : ["FR"],
        contentGoals: parsed.contentGoals?.length ? parsed.contentGoals : ["Développer mon activité"],
        contentTopics: parsed.contentTopics?.length ? parsed.contentTopics : ["Expertise métier"],
      },
      usedFallback: false,
    };
  } catch (error) {
    console.error("[VoiceOnboarding] LLM extraction failed, using fallback:", error);
    return { profile: fallbackExtract(answers), usedFallback: true };
  }
}

export async function saveOnboardingProfile(
  userId: number,
  profile: ExtractedOnboardingProfile
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const profileData = {
    companyName: profile.companyName,
    industry: profile.industry,
    sector: profile.sector,
    targetAudience: profile.targetAudience,
    personalBio: profile.personalBio,
    expertise: JSON.stringify(profile.expertise),
    preferredTone: profile.preferredTone,
    preferredLanguages: JSON.stringify(profile.preferredLanguages),
    contentGoals: JSON.stringify(profile.contentGoals),
    businessGoals: profile.businessGoals,
    uniqueSellingPoints: profile.uniqueSellingPoints,
  };

  const [existingProfile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existingProfile) {
    await db
      .update(userProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...profileData });
  }

  const inspirationTopics = JSON.stringify({
    objectives: profile.contentGoals,
    contentTypes: profile.contentTypes,
    topics: profile.contentTopics,
    imageType: "ai",
    includeImage: true,
  });

  const autoSettings = {
    isEnabled: true,
    sector: profile.sector,
    targetAudience: profile.targetAudience,
    tone: profile.preferredTone,
    language: profile.language,
    viralityLevel: "medium" as const,
    contentLength: "medium" as const,
    includeEmojis: true,
    includeHashtags: true,
    includeCallToAction: true,
    personalContext: profile.personalContext,
    inspirationTopics,
    avoidTopics: JSON.stringify(profile.avoidTopics),
    inspirationCreators: JSON.stringify([]),
  };

  const [existingAuto] = await db
    .select()
    .from(autoPublishSettings)
    .where(eq(autoPublishSettings.userId, userId))
    .limit(1);

  if (existingAuto) {
    await db
      .update(autoPublishSettings)
      .set(autoSettings)
      .where(eq(autoPublishSettings.userId, userId));
  } else {
    await db.insert(autoPublishSettings).values({ userId, ...autoSettings });
  }

  const schedule = buildScheduleFromFrequency(profile.postsPerWeek);

  await db.delete(autoPublishSchedule).where(eq(autoPublishSchedule.userId, userId));

  if (schedule.length > 0) {
    await db.insert(autoPublishSchedule).values(
      schedule.map((slot) => ({
        userId,
        dayOfWeek: slot.dayOfWeek,
        publishTime: slot.publishTime,
        isActive: slot.isActive,
      }))
    );
  }

  await initializeUserAgents(userId);

  return { success: true, schedule };
}

export async function isOnboardingComplete(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return !!(profile?.contentGoals && profile?.sector);
}
