/**
 * Catalogue éditorial LinkedIn — angles, accroches et piliers thématiques.
 * Aligné sur linkedinPostMethodology, AutoPublish et les formats ai.ts.
 */

import type { LearningContext } from "./agentLearningService";
import { AVAILABLE_THEMES } from "./contentGenerator";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ContentAngleId =
  | "story"
  | "tips"
  | "question"
  | "citation"
  | "controversial"
  | "listicle"
  | "case_study"
  | "behind_scenes"
  | "industry_news"
  | "announcement"
  | "motivation"
  | "insight"
  | "educational";

export type GeneratableFormat = "text" | "carousel" | "infographic" | "poll";

export interface ContentAngle {
  id: ContentAngleId;
  name: string;
  emoji: string;
  description: string;
  /** Référence méthodologie LinkedIn (5 étapes / CIT) */
  methodology: string;
  /** Clé FORMAT_PROMPTS dans ai.ts */
  aiFormat: string;
  /** Mots-clés de sujet compatibles */
  topicKeywords: string[];
  bestTones: string[];
  engagementGoal: "comments" | "saves" | "shares" | "reach";
  dwellTime: "high" | "medium" | "low";
  /** Format visuel recommandé si le contenu le permet */
  preferredMedia?: GeneratableFormat;
}

export interface HookType {
  id: string;
  name: string;
  template: string;
  example: string;
  bestAngles: ContentAngleId[];
}

export interface TopicPillar {
  id: string;
  name: string;
  category: string;
  suggestedAngles: ContentAngleId[];
  sampleTopics: string[];
}

export interface ContentChoice {
  topic: string;
  angle: ContentAngle;
  hook: HookType;
  format: GeneratableFormat;
  tone: string;
  rationale: string;
}

// ─── Catalogue des angles ────────────────────────────────────────────────────

export const CONTENT_ANGLES: ContentAngle[] = [
  {
    id: "story",
    name: "Storytelling",
    emoji: "📖",
    description: "Récit personnel avec situation → problème → solution → leçon",
    methodology: "Étape 1 — Storytelling : romancer un aboutissement ou un échec, conclure par une leçon",
    aiFormat: "story",
    topicKeywords: ["échec", "réussite", "parcours", "leçon", "expérience", "galère", "déclic"],
    bestTones: ["inspirational", "casual", "professional"],
    engagementGoal: "comments",
    dwellTime: "high",
  },
  {
    id: "tips",
    name: "Conseils pratiques",
    emoji: "💡",
    description: "5-7 conseils actionnables, chacun commençant par un verbe",
    methodology: "Étape 1 — Conseil/valeur : tips, découvertes, outils pour asseoir l'expertise",
    aiFormat: "tips",
    topicKeywords: ["comment", "étapes", "guide", "conseils", "méthode", "astuces", "productivité"],
    bestTones: ["educational", "professional", "casual"],
    engagementGoal: "saves",
    dwellTime: "high",
    preferredMedia: "carousel",
  },
  {
    id: "question",
    name: "Question engageante",
    emoji: "❓",
    description: "Question provocante dès l'accroche, CTA discussion en fin de post",
    methodology: "Étape 4 — CTA interactif : inviter sincèrement au commentaire",
    aiFormat: "question",
    topicKeywords: ["débat", "avis", "choix", "vous", "préférez", "pensez"],
    bestTones: ["casual", "provocative", "professional"],
    engagementGoal: "comments",
    dwellTime: "medium",
    preferredMedia: "poll",
  },
  {
    id: "citation",
    name: "Citation inspirante",
    emoji: "✨",
    description: "Citation percutante + développement court + lien avec l'expérience pro",
    methodology: "Méthode CIT — Court : ~150 mots avec citation et chiffres-clés",
    aiFormat: "citation",
    topicKeywords: ["mindset", "motivation", "leadership", "succès", "résilience"],
    bestTones: ["inspirational", "professional"],
    engagementGoal: "reach",
    dwellTime: "medium",
  },
  {
    id: "controversial",
    name: "Opinion tranchée",
    emoji: "🔥",
    description: "Affirmation forte, argumentation, invitation au débat respectueux",
    methodology: "Étape 1 — Coup de gueule : position forte sur une idée reçue",
    aiFormat: "controversial",
    topicKeywords: ["mythe", "erreur", "vérité", "contre", "stop", "faux"],
    bestTones: ["provocative", "professional"],
    engagementGoal: "comments",
    dwellTime: "high",
  },
  {
    id: "listicle",
    name: "Liste numérotée",
    emoji: "📋",
    description: "X choses apprises / erreurs évitées — format scannable",
    methodology: "Étape 3 — Un paragraphe = une idée, structure aérée pour le mobile",
    aiFormat: "listicle",
    topicKeywords: ["leçons", "erreurs", "habitudes", "choses", "liste", "top"],
    bestTones: ["educational", "casual", "professional"],
    engagementGoal: "saves",
    dwellTime: "high",
    preferredMedia: "carousel",
  },
  {
    id: "case_study",
    name: "Étude de cas",
    emoji: "📊",
    description: "Analyse détaillée d'un succès ou échec avec chiffres concrets",
    methodology: "Étape 3 — Valeur utile : chiffres-clés et preuves pour crédibiliser",
    aiFormat: "infographic",
    topicKeywords: ["résultat", "client", "projet", "ROI", "transformation", "avant/après"],
    bestTones: ["professional", "educational"],
    engagementGoal: "saves",
    dwellTime: "high",
    preferredMedia: "infographic",
  },
  {
    id: "behind_scenes",
    name: "Coulisses",
    emoji: "🎬",
    description: "Transparence sur le quotidien, les process ou les coulisses du métier",
    methodology: "Étape 1 — Authenticité : parler de l'expérience vécue sans trop se mettre en avant",
    aiFormat: "story",
    topicKeywords: ["quotidien", "process", "équipe", "coulisses", "réalité", "transparence"],
    bestTones: ["casual", "inspirational"],
    engagementGoal: "comments",
    dwellTime: "medium",
  },
  {
    id: "industry_news",
    name: "Actualités secteur",
    emoji: "📰",
    description: "Commentaire d'actualité avec prise de position d'expert",
    methodology: "Méthode CIT — Tendance : sujet d'actualité, montrer la maîtrise du secteur",
    aiFormat: "story",
    topicKeywords: ["tendance", "actualité", "marché", "évolution", "2025", "2026", "IA"],
    bestTones: ["professional", "educational", "provocative"],
    engagementGoal: "reach",
    dwellTime: "medium",
  },
  {
    id: "announcement",
    name: "Annonce",
    emoji: "📢",
    description: "Nouvelle importante partagée avec enthousiasme et valeur pour l'audience",
    methodology: "Étape 1 — Une idée forte centrée sur la valeur pour l'audience",
    aiFormat: "story",
    topicKeywords: ["lancement", "nouveau", "fierté", "annonce", "recrutement", "partenariat"],
    bestTones: ["inspirational", "professional", "casual"],
    engagementGoal: "reach",
    dwellTime: "low",
  },
  {
    id: "motivation",
    name: "Motivation",
    emoji: "🚀",
    description: "Message inspirant qui pousse à l'action, souvent avec une réflexion profonde",
    methodology: "Étape 2 — Accroche émotionnelle qui donne envie de lire",
    aiFormat: "citation",
    topicKeywords: ["mindset", "persévérance", "objectif", "rêve", "action", "courage"],
    bestTones: ["inspirational", "casual"],
    engagementGoal: "shares",
    dwellTime: "medium",
  },
  {
    id: "insight",
    name: "Insight / Observation",
    emoji: "🎯",
    description: "Analyse unique ou observation que peu de gens font sur un sujet",
    methodology: "Étape 3 — Apporter une vraie valeur : prise de recul ou façon de penser",
    aiFormat: "story",
    topicKeywords: ["observation", "réflexion", "analyse", "pattern", "vérité", "insight"],
    bestTones: ["professional", "provocative", "educational"],
    engagementGoal: "comments",
    dwellTime: "high",
  },
  {
    id: "educational",
    name: "Éducatif / Tutoriel",
    emoji: "🎓",
    description: "Explication structurée d'un concept ou d'une méthode",
    methodology: "Étape 1 — Conseil/valeur : asseoir la légitimité d'expert",
    aiFormat: "tips",
    topicKeywords: ["comprendre", "apprendre", "expliquer", "tutoriel", "définition", "framework"],
    bestTones: ["educational", "professional"],
    engagementGoal: "saves",
    dwellTime: "high",
    preferredMedia: "carousel",
  },
];

// ─── Accroches (Étape 2 méthodologie) ───────────────────────────────────────

export const HOOK_TYPES: HookType[] = [
  {
    id: "intriguing_question",
    name: "Question intrigante",
    template: "Pose une question qui crée une tension ou une curiosité immédiate",
    example: "Et vous, vous osez dire non à votre boss ?",
    bestAngles: ["question", "controversial", "insight"],
  },
  {
    id: "surprising_stat",
    name: "Statistique surprenante",
    template: "Ouvre avec un chiffre-clé contre-intuitif ou choquant",
    example: "87 % des managers échouent à cette compétence. Et vous ?",
    bestAngles: ["case_study", "tips", "educational", "industry_news"],
  },
  {
    id: "personal_anecdote",
    name: "Anecdote personnelle",
    template: "Commence par un moment vécu, concret et sensoriel",
    example: "Hier, j'ai failli ne pas cliquer sur ce mail. Et pourtant, il a changé ma semaine.",
    bestAngles: ["story", "behind_scenes", "announcement"],
  },
  {
    id: "bold_statement",
    name: "Phrase forte",
    template: "Affirmation percutante qui challenge une idée reçue",
    example: "Le multitasking est le plus grand mensonge de la productivité moderne.",
    bestAngles: ["controversial", "insight", "motivation"],
  },
  {
    id: "counter_intuition",
    name: "Contre-intuition",
    template: "Révèle que ce que tout le monde croit est faux",
    example: "Publier tous les jours sur LinkedIn vous fait PERDRE de la visibilité.",
    bestAngles: ["controversial", "tips", "listicle"],
  },
  {
    id: "numbered_promise",
    name: "Promesse chiffrée",
    template: "Annonce le nombre de leçons/conseils que le lecteur va obtenir",
    example: "7 erreurs que j'ai faites en 10 ans d'entrepreneuriat (et comment les éviter).",
    bestAngles: ["listicle", "tips", "educational"],
  },
];

// ─── Piliers thématiques ─────────────────────────────────────────────────────

export const TOPIC_PILLARS: TopicPillar[] = AVAILABLE_THEMES.map((theme) => ({
  id: theme.id,
  name: theme.name,
  category: theme.category,
  suggestedAngles: getDefaultAnglesForCategory(theme.category),
  sampleTopics: buildSampleTopics(theme.id, theme.name),
}));

function getDefaultAnglesForCategory(category: string): ContentAngleId[] {
  const map: Record<string, ContentAngleId[]> = {
    business: ["tips", "case_study", "insight", "controversial", "story"],
    personal: ["story", "motivation", "tips", "citation", "listicle"],
    tech: ["industry_news", "educational", "insight", "tips", "controversial"],
    career: ["story", "tips", "question", "insight", "behind_scenes"],
    industry: ["case_study", "industry_news", "educational", "insight"],
    regional: ["industry_news", "story", "insight", "tips"],
  };
  return map[category] || ["tips", "story", "insight"];
}

function buildSampleTopics(id: string, name: string): string[] {
  const templates: Record<string, string[]> = {
    entrepreneurship: [
      "Les 3 erreurs que j'ai faites en lançant ma première boîte",
      "Pourquoi la plupart des startups échouent avant le product-market fit",
      "Comment j'ai trouvé mes premiers clients sans budget marketing",
    ],
    leadership: [
      "Ce que personne ne vous dit sur le management à distance",
      "La différence entre un boss et un leader (vu sur le terrain)",
      "Comment donner du feedback sans démotiver son équipe",
    ],
    ai: [
      "L'IA ne remplacera pas votre job. Mais quelqu'un qui l'utilise, oui.",
      "5 usages concrets de l'IA que j'applique chaque semaine",
      "Pourquoi 90 % des entreprises ratent leur transformation IA",
    ],
    productivity: [
      "Ma méthode pour finir ma journée à 18h sans culpabiliser",
      "Le mythe de la productivité : ce que j'ai arrêté de faire",
      "3 rituels du matin qui ont changé ma semaine de travail",
    ],
    marketing: [
      "Ce qui fonctionne vraiment sur LinkedIn en 2026 (données à l'appui)",
      "Pourquoi votre personal branding ne génère pas de leads",
      "Le contenu qui convertit vs le contenu qui fait des likes",
    ],
    networking: [
      "Comment j'ai construit un réseau de 500 personnes utiles en 1 an",
      "Le networking ne devrait pas ressembler à du spam",
      "La question que je pose à chaque nouvelle connexion LinkedIn",
    ],
  };

  if (templates[id]) return templates[id];

  return [
    `Ce que j'ai appris sur ${name.toLowerCase()} cette année`,
    `3 conseils pratiques en ${name.toLowerCase()} que personne ne partage`,
    `Mon avis tranché sur l'avenir du ${name.toLowerCase()}`,
  ];
}

// ─── Mix éditorial hebdomadaire ──────────────────────────────────────────────

/** Rotation équilibrée sur une semaine type (lun-ven) */
export const WEEKLY_EDITORIAL_MIX: ContentAngleId[] = [
  "story",        // Lundi — connexion émotionnelle
  "tips",         // Mardi — valeur actionnable
  "insight",      // Mercredi — expertise
  "question",     // Jeudi — engagement
  "case_study",   // Vendredi — preuve sociale
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getAngleById(id: ContentAngleId): ContentAngle {
  return CONTENT_ANGLES.find((a) => a.id === id) ?? CONTENT_ANGLES[0];
}

export function pickHookForAngle(angleId: ContentAngleId): HookType {
  const compatible = HOOK_TYPES.filter((h) => h.bestAngles.includes(angleId));
  const pool = compatible.length > 0 ? compatible : HOOK_TYPES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Infère l'angle d'un post publié à partir de son contenu */
export function inferAngleFromContent(content: string): ContentAngleId | null {
  const lower = content.toLowerCase();
  const patterns: Array<{ angle: ContentAngleId; signals: RegExp[] }> = [
    { angle: "question", signals: [/\?$/, /et vous/i, /qu'en pensez/i, /votre avis/i] },
    { angle: "listicle", signals: [/^\d+[\.\)]/m, /choses que j'ai/i, /erreurs? (que|à)/i] },
    { angle: "tips", signals: [/conseils?/i, /astuces?/i, /comment /i, /💡/] },
    { angle: "case_study", signals: [/\d+%/, /résultat/i, /client/i, /ROI/i, /avant.*après/i] },
    { angle: "controversial", signals: [/stop /i, /faux/i, /mythe/i, /personne ne/i] },
    { angle: "citation", signals: [/^["«]/m, /citation/i] },
    { angle: "announcement", signals: [/fiers? de/i, /lancement/i, /heureux de/i, /annonce/i] },
    { angle: "behind_scenes", signals: [/coulisses/i, /en coulisses/i, /quotidien/i] },
    { angle: "industry_news", signals: [/actualité/i, /tendance/i, /2025|2026/i] },
  ];

  for (const { angle, signals } of patterns) {
    if (signals.some((r) => r.test(lower))) return angle;
  }
  if (/j'ai |je me souviens|il y a \d+ an/i.test(lower)) return "story";
  return null;
}

interface PickAngleOptions {
  topic: string;
  recentAngles?: ContentAngleId[];
  anglePerformance?: Partial<Record<ContentAngleId, number>>;
  preferredAngles?: ContentAngleId[];
}

/** Choisit l'angle le plus adapté au sujet et aux performances passées */
export function pickContentAngle(options: PickAngleOptions): ContentAngle {
  const { topic, recentAngles = [], anglePerformance = {}, preferredAngles = [] } = options;
  const topicLower = topic.toLowerCase();

  const scored = CONTENT_ANGLES.map((angle) => {
    let score = 0;

    // Compatibilité sujet ↔ angle
    if (angle.topicKeywords.some((k) => topicLower.includes(k))) score += 30;

    // Performance historique de cet angle
    score += anglePerformance[angle.id] ?? 0;

    // Angles préférés (profil / apprentissage)
    if (preferredAngles.includes(angle.id)) score += 20;

    // Diversité : pénaliser les angles récents
    const recentIndex = recentAngles.indexOf(angle.id);
    if (recentIndex !== -1) score -= (recentAngles.length - recentIndex) * 15;

    // Légère randomisation pour éviter la répétition
    score += Math.random() * 10;

    return { angle, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].angle;
}

interface PickTopicOptions {
  profileTopics?: string[];
  topPerformingTopics?: string[];
  underperformingTopics?: string[];
  avoidTopics?: string[];
  recentTopics?: string[];
  industry?: string;
}

/** Choisit un sujet pertinent en s'appuyant sur le profil et les publications */
export function pickTopic(options: PickTopicOptions): string {
  const {
    profileTopics = [],
    topPerformingTopics = [],
    underperformingTopics = [],
    avoidTopics = [],
    recentTopics = [],
    industry,
  } = options;

  const candidates: string[] = [];

  // Priorité aux sujets performants
  for (const t of topPerformingTopics) {
    if (!isTopicBlocked(t, underperformingTopics, avoidTopics, recentTopics)) {
      candidates.push(t);
    }
  }

  // Piliers thématiques du profil
  for (const pillar of TOPIC_PILLARS) {
    if (profileTopics.some((p) => p.toLowerCase().includes(pillar.id) || p.toLowerCase().includes(pillar.name.toLowerCase()))) {
      candidates.push(...pillar.sampleTopics);
    }
  }

  // Sujets du profil directement
  candidates.push(...profileTopics);

  // Sujets génériques par secteur
  if (industry) {
    const industryPillar = TOPIC_PILLARS.find(
      (p) => p.name.toLowerCase().includes(industry.toLowerCase()) || p.id === industry.toLowerCase()
    );
    if (industryPillar) candidates.push(...industryPillar.sampleTopics);
  }

  // Fallback : tous les sample topics
  if (candidates.length < 5) {
    for (const pillar of TOPIC_PILLARS) {
      candidates.push(...pillar.sampleTopics);
    }
  }

  const filtered = candidates.filter(
    (t) => !isTopicBlocked(t, underperformingTopics, avoidTopics, recentTopics)
  );

  const pool = filtered.length > 0 ? filtered : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function isTopicBlocked(
  topic: string,
  underperforming: string[],
  avoid: string[],
  recent: string[]
): boolean {
  const lower = topic.toLowerCase();
  return (
    recent.some((r) => r && lower.includes(r.toLowerCase())) ||
    avoid.some((a) => a && lower.includes(a.toLowerCase())) ||
    underperforming.some((u) => u && lower.includes(u.toLowerCase()))
  );
}

/** Détermine le format média (texte, carrousel, etc.) */
export function pickMediaFormat(
  angle: ContentAngle,
  formatPerformance?: Partial<Record<GeneratableFormat, number>>
): GeneratableFormat {
  if (angle.preferredMedia) {
    const perf = formatPerformance?.[angle.preferredMedia] ?? 0;
    const textPerf = formatPerformance?.text ?? 0;
    if (perf >= textPerf || !formatPerformance || Object.keys(formatPerformance).length === 0) {
      return angle.preferredMedia;
    }
  }

  if (formatPerformance && Object.keys(formatPerformance).length > 0) {
    const sorted = (Object.entries(formatPerformance) as [GeneratableFormat, number][])
      .sort(([, a], [, b]) => b - a);
    if (sorted[0][1] > 0) return sorted[0][0];
  }

  return "text";
}

/** Mappe format média + angle vers la clé ai.ts */
export function resolveAiFormat(format: GeneratableFormat, angle: ContentAngle): string {
  if (format === "carousel") return "carousel";
  if (format === "infographic") return "infographic";
  return angle.aiFormat;
}

/** Construit le contexte personnel enrichi pour generateLinkedInPost */
export function buildPersonalContext(params: {
  angle: ContentAngle;
  hook: HookType;
  learning?: LearningContext;
  profile?: {
    companyName?: string;
    industry?: string;
    personalBio?: string;
    expertise?: string;
  };
  pastPostPreviews?: string[];
}): string {
  const { angle, hook, learning, profile, pastPostPreviews = [] } = params;
  const parts: string[] = [];

  parts.push(`ANGLE ÉDITORIAL: ${angle.emoji} ${angle.name} — ${angle.description}`);
  parts.push(`MÉTHODOLOGIE: ${angle.methodology}`);
  parts.push(`ACCROCHE RECOMMANDÉE (${hook.name}): ${hook.template}. Exemple: "${hook.example}"`);

  if (profile?.companyName) parts.push(`Entreprise: ${profile.companyName}`);
  if (profile?.industry) parts.push(`Secteur: ${profile.industry}`);
  if (profile?.personalBio) parts.push(`Bio: ${profile.personalBio}`);
  if (profile?.expertise) parts.push(`Expertise: ${profile.expertise}`);

  if (learning?.insightsSummary) {
    parts.push(`APPRENTISSAGE DES PUBLICATIONS: ${learning.insightsSummary}`);
  }
  if (learning?.successfulExamples?.length) {
    parts.push(`Posts qui ont marché: ${learning.successfulExamples.join(" | ")}`);
  }
  if (learning?.avoidPatterns?.length) {
    parts.push(`À éviter: ${learning.avoidPatterns.join(", ")}`);
  }
  if (pastPostPreviews.length > 0) {
    parts.push(`Style des posts récents publiés: ${pastPostPreviews.slice(0, 3).join(" /// ")}`);
  }

  return parts.join("\n");
}

/** Génère un choix éditorial complet */
export function buildContentChoice(params: {
  topic?: string;
  profileTopics?: string[];
  industry?: string;
  learning?: LearningContext;
  avoidTopics?: string[];
  recentTopics?: string[];
  recentAngles?: ContentAngleId[];
  anglePerformance?: Partial<Record<ContentAngleId, number>>;
  formatPerformance?: Partial<Record<GeneratableFormat, number>>;
  preferredTone?: string;
}): ContentChoice {
  const topic =
    params.topic ||
    pickTopic({
      profileTopics: params.profileTopics,
      topPerformingTopics: params.learning?.topPerformingTopics,
      underperformingTopics: params.learning?.underperformingTopics,
      avoidTopics: params.avoidTopics,
      recentTopics: params.recentTopics,
      industry: params.industry,
    });

  const angle = pickContentAngle({
    topic,
    recentAngles: params.recentAngles,
    anglePerformance: params.anglePerformance,
    preferredAngles: inferPreferredAngles(params.learning),
  });

  const hook = pickHookForAngle(angle.id);
  const format = pickMediaFormat(angle, params.formatPerformance);

  const tone =
    params.preferredTone ||
    params.learning?.bestTones?.[0] ||
    angle.bestTones[0] ||
    "professional";

  const rationale = [
    `Sujet "${topic}"`,
    `angle ${angle.name} (${angle.engagementGoal})`,
    `accroche ${hook.name}`,
    format !== "text" ? `format ${format}` : null,
    params.learning?.topPerformingTopics?.includes(topic) ? "thème performant" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return { topic, angle, hook, format, tone, rationale };
}

function inferPreferredAngles(learning?: LearningContext): ContentAngleId[] {
  if (!learning?.successfulExamples?.length) return [];
  const angles: ContentAngleId[] = [];
  for (const example of learning.successfulExamples) {
    const inferred = inferAngleFromContent(example);
    if (inferred) angles.push(inferred);
  }
  return angles;
}

/** Mix éditorial pour un calendrier sur N jours ouvrés */
export function getEditorialMix(workingDays: number): ContentAngleId[] {
  const mix: ContentAngleId[] = [];
  for (let i = 0; i < workingDays; i++) {
    mix.push(WEEKLY_EDITORIAL_MIX[i % WEEKLY_EDITORIAL_MIX.length]);
  }
  return mix;
}

/** Calcule les scores de performance par angle depuis les posts publiés */
export function computeAnglePerformance(
  posts: Array<{ content: string; likes?: number | null; comments?: number | null; shares?: number | null }>
): Partial<Record<ContentAngleId, number>> {
  const scores: Partial<Record<ContentAngleId, number>> = {};

  for (const post of posts) {
    const angleId = inferAngleFromContent(post.content);
    if (!angleId) continue;
    const engagement = (post.likes || 0) + (post.comments || 0) * 3 + (post.shares || 0) * 5;
    scores[angleId] = (scores[angleId] || 0) + engagement;
  }

  return scores;
}

/** Calcule les scores de performance par format média */
export function computeFormatPerformance(
  posts: Array<{ content: string; likes?: number | null; comments?: number | null; shares?: number | null }>
): Partial<Record<GeneratableFormat, number>> {
  const scores: Partial<Record<GeneratableFormat, number>> = {
    text: 0,
    carousel: 0,
    infographic: 0,
    poll: 0,
  };

  for (const post of posts) {
    const engagement = (post.likes || 0) + (post.comments || 0) * 3 + (post.shares || 0) * 5;
    const content = post.content.toLowerCase();

    if (/slide \d|📌 slide/i.test(content)) {
      scores.carousel! += engagement;
    } else if (/📊|statistique|%\s|chiffre/i.test(content)) {
      scores.infographic! += engagement;
    } else if (/\?$/.test(content.trim()) && content.length < 500) {
      scores.poll! += engagement;
    } else {
      scores.text! += engagement;
    }
  }

  return scores;
}
