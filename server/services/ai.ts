import { callDataApi } from "../_core/dataApi";

interface GeneratePostParams {
  sector?: string;
  targetAudience?: string;
  tone?: string;
  language?: string;
  viralityLevel?: string;
  contentLength?: string;
  includeEmojis?: boolean;
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
  personalContext?: string;
  inspirationFrom?: string;
  topic?: string;
  contentFormat?: string; // NEW: citation, carousel, infographic, story, tips, question
}

const TONE_PROMPTS: Record<string, string> = {
  professional: "Utilise un ton professionnel et expert, avec un vocabulaire précis et des arguments solides.",
  casual: "Utilise un ton décontracté et accessible, comme si tu parlais à un ami.",
  inspirational: "Utilise un ton inspirant et motivant, avec des messages positifs et encourageants.",
  educational: "Utilise un ton pédagogue et informatif, en expliquant les concepts clairement.",
  provocative: "Utilise un ton audacieux et engageant, avec des affirmations qui font réagir.",
};

const VIRALITY_PROMPTS: Record<string, string> = {
  low: "Crée un contenu classique et informatif, axé sur la valeur.",
  medium: "Crée un contenu équilibré entre valeur et engagement, avec un hook accrocheur.",
  high: "Crée un contenu optimisé pour la viralité avec un hook très accrocheur, des phrases courtes et percutantes, et une structure qui incite à l'engagement.",
};

const LENGTH_PROMPTS: Record<string, string> = {
  short: "Le post doit faire environ 500-800 caractères (court et percutant).",
  medium: "Le post doit faire environ 1000-1500 caractères (longueur standard).",
  long: "Le post doit faire environ 2000-2500 caractères (post détaillé et approfondi).",
};

// NEW: Content format prompts for diversity
const FORMAT_PROMPTS: Record<string, string> = {
  citation: `FORMAT: CITATION INSPIRANTE
- Commence par une citation percutante (ta propre citation ou une citation célèbre réinterprétée)
- Développe brièvement le sens de cette citation
- Relie-la à ton expérience ou au contexte professionnel
- Termine par une réflexion ou question ouverte`,

  carousel: `FORMAT: CARROUSEL (SLIDES TEXTUELLES)
- Structure le contenu en 5-7 slides numérotées
- Slide 1: Titre accrocheur + hook
- Slides 2-6: Un point clé par slide avec explication courte
- Slide finale: Conclusion + call-to-action
- Utilise le format: "📌 Slide X: [Titre]" puis le contenu
- Chaque slide doit être autonome et percutante`,

  infographic: `FORMAT: INFOGRAPHIE TEXTUELLE
- Présente des données, statistiques ou faits marquants
- Utilise des chiffres et pourcentages impactants
- Structure avec des bullets points visuels (→, •, ✓)
- Inclus une source ou contexte pour crédibiliser
- Format: "📊 [Titre]" puis liste de faits/stats`,

  story: `FORMAT: STORYTELLING
- Raconte une histoire personnelle ou un cas concret
- Structure: Situation initiale → Problème → Solution → Leçon
- Utilise le "Je" et des détails concrets
- Crée de l'émotion et de l'identification
- Termine par la morale ou l'enseignement`,

  tips: `FORMAT: CONSEILS PRATIQUES
- Liste de 5-7 conseils actionnables
- Chaque conseil commence par un verbe d'action
- Utilise des numéros ou bullets visuels
- Conseils concrets et applicables immédiatement
- Format: "💡 X conseils pour [objectif]:"`,

  question: `FORMAT: QUESTION ENGAGEANTE
- Pose une question provocante ou réflexive dès le début
- Développe le contexte et les enjeux
- Partage ton point de vue ou expérience
- Invite explicitement à la discussion
- Termine par une question ouverte pour les commentaires`,

  controversial: `FORMAT: OPINION TRANCHÉE
- Commence par une affirmation forte/controversée
- Développe ton argumentation avec des preuves
- Anticipe et réponds aux objections
- Assume ta position tout en restant respectueux
- Invite au débat constructif`,

  listicle: `FORMAT: LISTE NUMÉROTÉE
- Titre: "X choses que j'ai apprises sur [sujet]"
- Liste numérotée de 7-10 points
- Chaque point: une phrase + une explication courte
- Mélange conseils, observations et leçons
- Conclusion synthétique`,
};

// Available content formats for random selection
const CONTENT_FORMATS = ["citation", "carousel", "infographic", "story", "tips", "question", "controversial", "listicle"];

export async function generateLinkedInPost(params: GeneratePostParams): Promise<string> {
  const {
    sector = "Business",
    targetAudience = "professionnels",
    tone = "professional",
    language = "FR",
    viralityLevel = "medium",
    contentLength = "medium",
    includeEmojis = true,
    includeHashtags = true,
    includeCallToAction = true,
    personalContext = "",
    inspirationFrom = "",
    topic = "",
    contentFormat = "", // If empty, will be randomly selected
  } = params;

  // Select a random format if not specified
  const selectedFormat = contentFormat || CONTENT_FORMATS[Math.floor(Math.random() * CONTENT_FORMATS.length)];
  const formatPrompt = FORMAT_PROMPTS[selectedFormat] || FORMAT_PROMPTS.story;

  const languageInstruction = language === "FR" 
    ? "Écris en français." 
    : language === "EN" 
    ? "Write in English."
    : language === "AR"
    ? "اكتب بالعربية."
    : language === "ES"
    ? "Escribe en español."
    : "Schreibe auf Deutsch.";

  const prompt = `Tu es un expert en création de contenu LinkedIn viral. Génère un post LinkedIn performant.

CONTEXTE:
- Secteur: ${sector}
- Audience cible: ${targetAudience}
${personalContext ? `- Contexte personnel: ${personalContext}` : ""}
${inspirationFrom ? `- S'inspirer du style de: ${inspirationFrom}` : ""}
${topic ? `- Sujet spécifique: ${topic}` : ""}

${formatPrompt}

STYLE:
${TONE_PROMPTS[tone] || TONE_PROMPTS.professional}
${VIRALITY_PROMPTS[viralityLevel] || VIRALITY_PROMPTS.medium}
${LENGTH_PROMPTS[contentLength] || LENGTH_PROMPTS.medium}

INSTRUCTIONS:
- ${languageInstruction}
${includeEmojis ? "- Utilise des emojis de manière stratégique (2-4 emojis bien placés)." : "- N'utilise PAS d'emojis."}
${includeHashtags ? "- Termine avec 3-5 hashtags pertinents." : "- N'inclus PAS de hashtags."}
${includeCallToAction ? "- Termine par une question ou un appel à l'action engageant." : ""}
- Commence par un hook accrocheur (première ligne très impactante)
- Utilise des sauts de ligne pour aérer le texte
- Structure le post pour faciliter la lecture (phrases courtes, paragraphes courts)

IMPORTANT: Génère UNIQUEMENT le contenu du post, sans introduction ni explication. Respecte strictement le FORMAT demandé.`;

  try {
    // Use the Forge API for generation
    const response = await fetch(process.env.BUILT_IN_FORGE_API_URL + "/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.9, // Increased for more variety
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    return generatedContent.trim();
  } catch (error) {
    console.error("Error generating post:", error);
    throw error;
  }
}

export async function generateMultiplePosts(params: GeneratePostParams, count: number = 5): Promise<string[]> {
  const posts: string[] = [];
  
  // Use different formats for each post to ensure diversity
  const formatsToUse = [...CONTENT_FORMATS].sort(() => Math.random() - 0.5).slice(0, count);
  
  for (let i = 0; i < count; i++) {
    try {
      const format = formatsToUse[i % formatsToUse.length];
      const post = await generateLinkedInPost({ ...params, contentFormat: format });
      posts.push(post);
    } catch (error) {
      console.error(`Error generating post ${i + 1}:`, error);
    }
  }
  
  return posts;
}

// Export available formats for frontend
export const AVAILABLE_FORMATS = CONTENT_FORMATS;
