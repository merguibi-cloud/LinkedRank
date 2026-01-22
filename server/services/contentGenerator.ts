/**
 * AI Content Generator Service
 * Generates personalized LinkedIn posts based on user profile and context
 */

import { invokeLLM } from "../_core/llm";

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

export interface GenerationRequest {
  theme: string;
  tone: "professional" | "casual" | "inspirational" | "educational" | "provocative";
  language: "FR" | "EN" | "AR" | "ES" | "DE";
  userContext: UserContext;
  additionalInstructions?: string;
  postType?: "story" | "tips" | "question" | "announcement" | "motivation" | "insight";
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

export async function generateLinkedInPost(request: GenerationRequest): Promise<GeneratedContent> {
  const { theme, tone, language, userContext, additionalInstructions, postType = "insight" } = request;

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

  const systemPrompt = `Tu es un expert en création de contenu LinkedIn viral. Tu crées des posts qui génèrent de l'engagement (likes, commentaires, partages).

Règles de formatage LinkedIn:
- Commence par un hook puissant (première ligne accrocheuse)
- Utilise des phrases courtes et percutantes
- Ajoute des sauts de ligne pour aérer le texte
- Utilise des emojis avec parcimonie (1-3 max)
- Termine par un call-to-action ou une question
- Le post doit faire entre 150 et 300 mots
- Pas de liens dans le corps du texte

${LANGUAGE_INSTRUCTIONS[language]}`;

  const userPrompt = `Génère un post LinkedIn sur le thème: "${theme}"

Type de post: ${POST_TYPE_TEMPLATES[postType]}
Ton souhaité: ${TONE_DESCRIPTIONS[tone]}
${userContextStr}
${additionalInstructions ? `\nInstructions supplémentaires: ${additionalInstructions}` : ""}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "title": "Titre court du post (max 50 caractères)",
  "content": "Le contenu complet du post LinkedIn",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "suggestedMedia": "Description d'une image ou vidéo suggérée",
  "callToAction": "L'action que tu veux que les lecteurs fassent"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1500,
    });

    const rawContent = response.choices[0]?.message?.content || "";
    const content = typeof rawContent === "string" ? rawContent : (rawContent[0] as { text?: string })?.text || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
    
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
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
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
