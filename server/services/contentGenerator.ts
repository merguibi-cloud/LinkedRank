/**
 * AI Content Generator Service
 * Generates personalized LinkedIn posts based on user profile and context
 */

import { invokeLLM } from "../_core/llm";
import {
  LINKEDIN_ENGAGEMENT_METHOD,
  LINKEDIN_CIT_METHOD,
  LINKEDIN_ALGORITHM_TIPS,
  LINKEDIN_POST_STRUCTURE_CHECKLIST,
} from "./linkedinPostMethodology";

export interface UserContext {
  companyName?: string;
  industry?: string;
  sector?: string;
  products?: string[];
  services?: string[];
  targetAudience?: string;
  personalBio?: string;
  expertise?: string[];
  achievements?: string;
  businessGoals?: string;
  uniqueSellingPoints?: string;
}

export interface LearningContext {
  insightsSummary?: string;
  topPerformingTopics?: string[];
  underperformingTopics?: string[];
  bestTones?: string[];
  avoidPatterns?: string[];
  successfulExamples?: string[];
  failedExamples?: string[];
  bestPostingTimes?: string[];
  approvalRate?: number;
}

export interface GenerationRequest {
  theme: string;
  tone: "professional" | "casual" | "inspirational" | "educational" | "provocative";
  language: "FR" | "EN" | "AR" | "ES" | "DE";
  userContext: UserContext;
  additionalInstructions?: string;
  postType?: "story" | "tips" | "question" | "announcement" | "motivation" | "insight";
  learningContext?: LearningContext;
}

export interface MediaContext {
  id: number;
  title?: string;
  description?: string;
  aiDescription?: string;
  fileUrl: string;
  mediaType: "image" | "video" | "document";
  tags?: string[];
}

export interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  suggestedMedia?: string;
  callToAction?: string;
}

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: "formel, expert, crédible, avec des données et des faits",
  casual: "décontracté, accessible, conversationnel, comme un ami qui partage",
  inspirational: "motivant, émotionnel, qui pousse à l'action, storytelling puissant",
  educational: "pédagogique, structuré, avec des conseils pratiques et actionnables",
  provocative: "audacieux, qui challenge les idées reçues, qui fait réagir",
};

const POST_TYPE_TEMPLATES: Record<string, string> = {
  story: "Raconte une histoire personnelle ou professionnelle avec une leçon à la fin",
  tips: "Donne 3-5 conseils pratiques et actionnables sur le sujet",
  question: "Pose une question engageante qui invite à la discussion",
  announcement: "Annonce quelque chose d'important avec enthousiasme",
  motivation: "Inspire et motive avec une citation ou une réflexion profonde",
  insight: "Partage une observation ou une analyse unique sur le sujet",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  FR: "Écris en français. Utilise un style direct et percutant adapté à LinkedIn France.",
  EN: "Write in English. Use a direct, impactful style suited for international LinkedIn.",
  AR: "اكتب بالعربية. استخدم أسلوبًا مباشرًا ومؤثرًا يناسب LinkedIn في الشرق الأوسط.",
  ES: "Escribe en español. Usa un estilo directo e impactante adecuado para LinkedIn.",
  DE: "Schreibe auf Deutsch. Verwende einen direkten, wirkungsvollen Stil für LinkedIn.",
};

function extractMessageText(
  rawContent: string | Array<{ text?: string; type?: string }> | undefined
): string {
  if (!rawContent) return "";
  if (typeof rawContent === "string") return rawContent;
  return rawContent
    .map(part => (typeof part === "string" ? part : part.text ?? ""))
    .join("");
}

function parseGeneratedContentJson(text: string): GeneratedContent {
  const trimmed = text.trim();
  const candidates = [
    trimmed,
    trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as GeneratedContent;
    } catch {
      // continue
    }

    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as GeneratedContent;
      } catch {
        // continue
      }
    }
  }

  throw new Error("Impossible de lire la réponse de l'IA. Réessayez.");
}

function buildLearningPromptSection(learning?: LearningContext): string {
  if (!learning) return "";

  const parts: string[] = ["\n\nAPPRENTISSAGE PERSONNALISÉ (basé sur l'historique de cet utilisateur):"];

  if (learning.insightsSummary) {
    parts.push(`- Synthèse: ${learning.insightsSummary}`);
  }
  if (learning.topPerformingTopics?.length) {
    parts.push(`- Sujets qui ont bien marché: ${learning.topPerformingTopics.join(", ")}`);
  }
  if (learning.underperformingTopics?.length) {
    parts.push(`- Sujets peu performants à éviter: ${learning.underperformingTopics.join(", ")}`);
  }
  if (learning.bestTones?.length) {
    parts.push(`- Tons efficaces: ${learning.bestTones.join(", ")}`);
  }
  if (learning.avoidPatterns?.length) {
    parts.push(`- À ne pas reproduire: ${learning.avoidPatterns.join(", ")}`);
  }
  if (learning.successfulExamples?.length) {
    parts.push(`- Exemples de posts réussis: ${learning.successfulExamples.join(" | ")}`);
  }
  if (learning.failedExamples?.length) {
    parts.push(`- Exemples de posts faibles: ${learning.failedExamples.join(" | ")}`);
  }
  if (learning.bestPostingTimes?.length) {
    parts.push(`- Meilleurs créneaux: ${learning.bestPostingTimes.join(", ")}`);
  }

  parts.push(
    "\nUtilise ces données pour proposer un contenu plus pertinent et adapté à cet utilisateur."
  );

  return parts.join("\n");
}

export async function generateLinkedInPost(request: GenerationRequest): Promise<GeneratedContent> {
  const { theme, tone, language, userContext, additionalInstructions, postType = "insight", learningContext } = request;

  const contextParts: string[] = [];
  
  if (userContext.companyName) {
    contextParts.push(`Entreprise: ${userContext.companyName}`);
  }
  if (userContext.industry) {
    contextParts.push(`Secteur: ${userContext.industry}`);
  }
  if (userContext.products?.length) {
    contextParts.push(`Produits/Services: ${userContext.products.join(", ")}`);
  }
  if (userContext.targetAudience) {
    contextParts.push(`Audience cible: ${userContext.targetAudience}`);
  }
  if (userContext.expertise?.length) {
    contextParts.push(`Expertise: ${userContext.expertise.join(", ")}`);
  }
  if (userContext.businessGoals) {
    contextParts.push(`Objectifs: ${userContext.businessGoals}`);
  }
  if (userContext.uniqueSellingPoints) {
    contextParts.push(`Points forts: ${userContext.uniqueSellingPoints}`);
  }

  const userContextStr = contextParts.length > 0 
    ? `\n\nContexte de l'utilisateur:\n${contextParts.join("\n")}`
    : "";

  const systemPrompt = `Tu es un expert en création de contenu LinkedIn viral. Tu crées des posts qui génèrent de l'engagement (likes, commentaires, partages, dwell time) en appliquant rigoureusement les méthodologies ci-dessous.

${LINKEDIN_ENGAGEMENT_METHOD}

${LINKEDIN_CIT_METHOD}

${LINKEDIN_ALGORITHM_TIPS}

Contraintes supplémentaires:
- Le post doit faire environ 120 à 180 mots (~150 mots idéal)
- Pas de liens dans le corps du texte

${LINKEDIN_POST_STRUCTURE_CHECKLIST}

${LANGUAGE_INSTRUCTIONS[language]}

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour:
{
  "title": "Titre court du post (max 50 caractères)",
  "content": "Le contenu complet du post LinkedIn",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "suggestedMedia": "Description d'une image ou vidéo suggérée",
  "callToAction": "L'action que tu veux que les lecteurs fassent"
}`;

  const learningSection = buildLearningPromptSection(learningContext);

  const userPrompt = `Génère un post LinkedIn sur le thème: "${theme}"

Type de post: ${POST_TYPE_TEMPLATES[postType]}
Ton souhaité: ${TONE_DESCRIPTIONS[tone]}
${userContextStr}
${learningSection}
${additionalInstructions ? `\nInstructions supplémentaires: ${additionalInstructions}` : ""}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 8192,
      temperature: 0.8,
      responseFormat: { type: "json_object" },
    });

    const finishReason = response.choices[0]?.finish_reason;
    const content = extractMessageText(response.choices[0]?.message?.content);

    if (!content) {
      throw new Error("La réponse de l'IA est vide. Réessayez.");
    }

    if (finishReason === "length") {
      console.warn("[ContentGenerator] Réponse tronquée par la limite de tokens");
    }

    const parsed = parseGeneratedContentJson(content);
    
    // Validate required fields
    if (!parsed.content) {
      throw new Error("Generated content is empty");
    }

    return {
      title: parsed.title || theme,
      content: parsed.content,
      hashtags: parsed.hashtags || [],
      suggestedMedia: parsed.suggestedMedia,
      callToAction: parsed.callToAction,
    };
  } catch (error) {
    console.error("Content generation error:", error);
    throw error instanceof Error ? error : new Error("Erreur inconnue lors de la génération");
  }
}

export async function generatePostFromMedia(
  request: GenerationRequest & { media: MediaContext }
): Promise<GeneratedContent> {
  const { media, theme, tone, language, userContext, additionalInstructions, postType = "insight" } = request;

  const contextParts: string[] = [];
  if (userContext.companyName) contextParts.push(`Entreprise: ${userContext.companyName}`);
  if (userContext.industry) contextParts.push(`Secteur: ${userContext.industry}`);
  if (userContext.expertise?.length) contextParts.push(`Expertise: ${userContext.expertise.join(", ")}`);

  const userContextStr = contextParts.length > 0
    ? `\n\nContexte de l'utilisateur:\n${contextParts.join("\n")}`
    : "";

  const mediaContext = [
    media.title && `Titre du média: ${media.title}`,
    media.description && `Description: ${media.description}`,
    media.aiDescription && `Analyse IA du visuel: ${media.aiDescription}`,
    media.tags?.length && `Tags: ${media.tags.join(", ")}`,
    `Type: ${media.mediaType}`,
  ].filter(Boolean).join("\n");

  const systemPrompt = `Tu es un expert en création de contenu LinkedIn viral. L'utilisateur a téléversé un visuel dans sa médiathèque et veut un post qui l'accompagne parfaitement.

${LINKEDIN_ENGAGEMENT_METHOD}

${LINKEDIN_CIT_METHOD}

Règles spécifiques au média:
- Le post doit compléter et mettre en valeur le visuel/média fourni
- Environ 120 à 180 mots, pas de liens dans le corps du texte

${LINKEDIN_POST_STRUCTURE_CHECKLIST}

${LANGUAGE_INSTRUCTIONS[language]}

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide:
{
  "title": "Titre court (max 50 caractères)",
  "content": "Contenu complet du post LinkedIn",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "suggestedMedia": "${media.fileUrl}",
  "callToAction": "Action souhaitée"
}`;

  const userPrompt = `Crée un post LinkedIn pour accompagner ce média.

Thématique: "${theme}"
Type: ${POST_TYPE_TEMPLATES[postType]}
Ton: ${TONE_DESCRIPTIONS[tone]}

Informations sur le média:
${mediaContext}
${userContextStr}
${additionalInstructions ? `\nInstructions: ${additionalInstructions}` : ""}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens: 8192,
    temperature: 0.8,
    responseFormat: { type: "json_object" },
  });

  const content = extractMessageText(response.choices[0]?.message?.content);
  if (!content) throw new Error("La réponse de l'IA est vide.");

  const parsed = parseGeneratedContentJson(content);
  return {
    title: parsed.title || media.title || theme,
    content: parsed.content,
    hashtags: parsed.hashtags || [],
    suggestedMedia: media.mediaType === "image" ? media.fileUrl : parsed.suggestedMedia,
    callToAction: parsed.callToAction,
  };
}

export async function generateMultiplePosts(
  request: GenerationRequest,
  count: number = 3
): Promise<GeneratedContent[]> {
  const posts: GeneratedContent[] = [];
  const postTypes: Array<GenerationRequest["postType"]> = ["story", "tips", "question", "motivation", "insight"];
  
  for (let i = 0; i < count; i++) {
    const postType = postTypes[i % postTypes.length];
    const post = await generateLinkedInPost({ ...request, postType });
    posts.push(post);
  }
  
  return posts;
}

export const AVAILABLE_THEMES = [
  // Business & Entrepreneurship
  { id: "entrepreneurship", name: "Entrepreneuriat", nameEn: "Entrepreneurship", category: "business" },
  { id: "leadership", name: "Leadership", nameEn: "Leadership", category: "business" },
  { id: "sales", name: "Vente & Commercial", nameEn: "Sales", category: "business" },
  { id: "marketing", name: "Marketing", nameEn: "Marketing", category: "business" },
  { id: "startup", name: "Startups", nameEn: "Startups", category: "business" },
  { id: "growth", name: "Croissance", nameEn: "Growth", category: "business" },
  
  // Personal Development
  { id: "mindset", name: "Mindset", nameEn: "Mindset", category: "personal" },
  { id: "productivity", name: "Productivité", nameEn: "Productivity", category: "personal" },
  { id: "success", name: "Succès", nameEn: "Success", category: "personal" },
  { id: "motivation", name: "Motivation", nameEn: "Motivation", category: "personal" },
  { id: "resilience", name: "Résilience", nameEn: "Resilience", category: "personal" },
  
  // Tech & Innovation
  { id: "ai", name: "Intelligence Artificielle", nameEn: "Artificial Intelligence", category: "tech" },
  { id: "tech", name: "Technologie", nameEn: "Technology", category: "tech" },
  { id: "innovation", name: "Innovation", nameEn: "Innovation", category: "tech" },
  { id: "digital", name: "Digital", nameEn: "Digital", category: "tech" },
  
  // Career & Work
  { id: "career", name: "Carrière", nameEn: "Career", category: "career" },
  { id: "hiring", name: "Recrutement", nameEn: "Hiring", category: "career" },
  { id: "remote", name: "Travail à distance", nameEn: "Remote Work", category: "career" },
  { id: "networking", name: "Networking", nameEn: "Networking", category: "career" },
  
  // Industry Specific
  { id: "education", name: "Éducation", nameEn: "Education", category: "industry" },
  { id: "finance", name: "Finance", nameEn: "Finance", category: "industry" },
  { id: "healthcare", name: "Santé", nameEn: "Healthcare", category: "industry" },
  { id: "retail", name: "Retail", nameEn: "Retail", category: "industry" },
  
  // Regional
  { id: "mena", name: "Marché MENA", nameEn: "MENA Market", category: "regional" },
  { id: "france", name: "Business en France", nameEn: "Business in France", category: "regional" },
  { id: "international", name: "International", nameEn: "International", category: "regional" },
];

export const AVAILABLE_TONES = [
  { id: "professional", name: "Professionnel", nameEn: "Professional", description: "Formel et expert" },
  { id: "casual", name: "Décontracté", nameEn: "Casual", description: "Accessible et conversationnel" },
  { id: "inspirational", name: "Inspirant", nameEn: "Inspirational", description: "Motivant et émotionnel" },
  { id: "educational", name: "Éducatif", nameEn: "Educational", description: "Pédagogique et structuré" },
  { id: "provocative", name: "Provocateur", nameEn: "Provocative", description: "Audacieux et challengeant" },
];

export const AVAILABLE_LANGUAGES = [
  { id: "FR", name: "Français", flag: "🇫🇷" },
  { id: "EN", name: "English", flag: "🇬🇧" },
  { id: "AR", name: "العربية", flag: "🇸🇦" },
  { id: "ES", name: "Español", flag: "🇪🇸" },
  { id: "DE", name: "Deutsch", flag: "🇩🇪" },
];
