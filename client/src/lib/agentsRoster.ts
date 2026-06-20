export type AgentAvailability = "available" | "coming_soon";

export type AgentRosterEntry = {
  id: string;
  backendType: string;
  name: string;
  role: string;
  emoji: string;
  avatar: string;
  color: string;
  gradient: string;
  personality: string;
  description: string;
  skills: string[];
  quote: string;
  bestFor: string;
  availability: AgentAvailability;
  ctaHref?: string;
  ctaLabel?: string;
};

export const AGENTS_ROSTER: AgentRosterEntry[] = [
  {
    id: "content-creator",
    backendType: "content_creator",
    name: "Léa",
    role: "Créatrice de Contenu",
    emoji: "✨",
    avatar: "👩‍💻",
    color: "violet",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    personality: "Créative et inspirante",
    description:
      "Léa rédige vos posts LinkedIn, adapte le ton à votre audience et génère des visuels sur mesure.",
    skills: ["Storytelling", "Hooks viraux", "Copywriting", "Visuels IA"],
    quote: "Chaque post est une opportunité de connecter !",
    bestFor: "Créer du contenu engageant",
    availability: "available",
    ctaHref: "/generate",
    ctaLabel: "Créer avec Léa",
  },
  {
    id: "trend-hunter",
    backendType: "trend_hunter",
    name: "Max",
    role: "Chasseur de Tendances",
    emoji: "🔥",
    avatar: "🕵️",
    color: "rose",
    gradient: "from-rose-500 to-red-600",
    personality: "Curieux et avant-gardiste",
    description:
      "Max surveille les tendances LinkedIn 24/7 et identifie les sujets qui vont buzzer.",
    skills: ["Veille tendances", "Analyse virale", "Prédiction"],
    quote: "Les tendances de demain, je les repère aujourd'hui !",
    bestFor: "Rester à la pointe",
    availability: "coming_soon",
  },
  {
    id: "engagement-booster",
    backendType: "engagement_manager",
    name: "Emma",
    role: "Booster d'Engagement",
    emoji: "💬",
    avatar: "🤝",
    color: "green",
    gradient: "from-emerald-500 to-teal-600",
    personality: "Sociable et empathique",
    description:
      "Emma optimise vos interactions et vous aide à construire une communauté engagée.",
    skills: ["Réponses intelligentes", "Community", "Networking"],
    quote: "Chaque commentaire est une chance de créer une connexion !",
    bestFor: "Développer votre réseau",
    availability: "coming_soon",
  },
  {
    id: "analytics-guru",
    backendType: "growth_strategist",
    name: "Alex",
    role: "Analyste Performance",
    emoji: "📊",
    avatar: "🧠",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    personality: "Méthodique et perspicace",
    description:
      "Alex analyse vos données en profondeur pour identifier ce qui fonctionne.",
    skills: ["Data analysis", "Reporting", "Optimisation"],
    quote: "Les données racontent une histoire !",
    bestFor: "Améliorer vos performances",
    availability: "coming_soon",
  },
  {
    id: "scheduler",
    backendType: "network_builder",
    name: "Sam",
    role: "Planificateur Intelligent",
    emoji: "📅",
    avatar: "⏰",
    color: "gold",
    gradient: "from-amber-500 to-orange-600",
    personality: "Organisé et fiable",
    description:
      "Sam planifie vos publications aux moments optimaux pour maximiser la portée.",
    skills: ["Timing optimal", "Planification", "Automatisation"],
    quote: "Le bon contenu au bon moment !",
    bestFor: "Publier régulièrement",
    availability: "coming_soon",
  },
];

export const AVAILABLE_AGENT_TYPES = new Set(
  AGENTS_ROSTER.filter(a => a.availability === "available").map(a => a.backendType)
);

export function isAgentAvailable(backendType: string): boolean {
  return AVAILABLE_AGENT_TYPES.has(backendType);
}

export function getAgentByBackendType(backendType: string): AgentRosterEntry | undefined {
  return AGENTS_ROSTER.find(a => a.backendType === backendType);
}

export const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  violet: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-300",
    glow: "shadow-violet-500/20",
  },
  rose: {
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    text: "text-rose-300",
    glow: "shadow-rose-500/20",
  },
  green: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/20",
  },
  blue: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-300",
    glow: "shadow-blue-500/20",
  },
  gold: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-300",
    glow: "shadow-amber-500/20",
  },
};
