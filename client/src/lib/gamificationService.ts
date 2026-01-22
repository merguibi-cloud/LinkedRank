// Service de gamification connecté aux données réelles

export interface UserGamificationData {
  xp: number;
  level: number;
  streak: number;
  credits: number;
  badges: string[];
  completedChallenges: string[];
  totalPosts: number;
  totalEngagement: number;
  totalViews: number;
  lastPostDate: Date | null;
}

export interface XPAction {
  type: string;
  xp: number;
  description: string;
}

// Actions qui donnent des XP
export const XP_ACTIONS: Record<string, XPAction> = {
  post_published: { type: "post_published", xp: 100, description: "Post publié" },
  carousel_created: { type: "carousel_created", xp: 150, description: "Carrousel créé" },
  engagement_100: { type: "engagement_100", xp: 50, description: "100 engagements reçus" },
  engagement_1000: { type: "engagement_1000", xp: 200, description: "1000 engagements reçus" },
  views_1000: { type: "views_1000", xp: 75, description: "1000 vues atteintes" },
  views_10000: { type: "views_10000", xp: 300, description: "10K vues atteintes" },
  views_100000: { type: "views_100000", xp: 1000, description: "100K vues atteintes" },
  comment_replied: { type: "comment_replied", xp: 25, description: "Commentaire répondu" },
  streak_day: { type: "streak_day", xp: 50, description: "Jour de streak" },
  streak_7: { type: "streak_7", xp: 200, description: "Streak de 7 jours" },
  streak_30: { type: "streak_30", xp: 500, description: "Streak de 30 jours" },
  challenge_completed: { type: "challenge_completed", xp: 150, description: "Défi complété" },
  badge_unlocked: { type: "badge_unlocked", xp: 300, description: "Badge débloqué" },
  viral_post: { type: "viral_post", xp: 500, description: "Post viral (10K+ vues)" },
  first_post: { type: "first_post", xp: 250, description: "Premier post" },
  weekly_goal: { type: "weekly_goal", xp: 200, description: "Objectif hebdo atteint" },
  daily_login: { type: "daily_login", xp: 25, description: "Connexion quotidienne" },
  profile_complete: { type: "profile_complete", xp: 100, description: "Profil complété" },
  referral: { type: "referral", xp: 500, description: "Parrainage validé" }
};

// Niveaux avec leurs seuils
export const LEVELS = [
  { level: 1, name: "Débutant", minXp: 0, maxXp: 500, color: "gray", emoji: "🌱" },
  { level: 2, name: "Apprenti", minXp: 500, maxXp: 1500, color: "green", emoji: "🌿" },
  { level: 3, name: "Créateur", minXp: 1500, maxXp: 3500, color: "blue", emoji: "✨" },
  { level: 4, name: "Expert", minXp: 3500, maxXp: 7000, color: "purple", emoji: "🔮" },
  { level: 5, name: "Maître", minXp: 7000, maxXp: 12000, color: "yellow", emoji: "⭐" },
  { level: 6, name: "Champion", minXp: 12000, maxXp: 20000, color: "orange", emoji: "🏆" },
  { level: 7, name: "Légende", minXp: 20000, maxXp: 35000, color: "red", emoji: "🔥" },
  { level: 8, name: "Icône", minXp: 35000, maxXp: 50000, color: "pink", emoji: "💎" },
  { level: 9, name: "Influenceur", minXp: 50000, maxXp: 100000, color: "cyan", emoji: "🚀" },
  { level: 10, name: "Titan LinkedIn", minXp: 100000, maxXp: 999999, color: "amber", emoji: "👑" }
];

// Badges disponibles
export const BADGES = [
  { id: "first_post", name: "Premier Pas", description: "Publiez votre premier post", requirement: 1, type: "posts", xpReward: 250, emoji: "🚀" },
  { id: "streak_7", name: "Flamme Ardente", description: "Maintenez un streak de 7 jours", requirement: 7, type: "streak", xpReward: 300, emoji: "🔥" },
  { id: "streak_14", name: "Feu Persistant", description: "Maintenez un streak de 14 jours", requirement: 14, type: "streak", xpReward: 500, emoji: "🔥" },
  { id: "streak_30", name: "Feu Éternel", description: "Maintenez un streak de 30 jours", requirement: 30, type: "streak", xpReward: 1000, emoji: "🌟" },
  { id: "engagement_1k", name: "Engageur", description: "Atteignez 1000 engagements", requirement: 1000, type: "engagement", xpReward: 400, emoji: "👍" },
  { id: "engagement_10k", name: "Super Engageur", description: "Atteignez 10K engagements", requirement: 10000, type: "engagement", xpReward: 800, emoji: "❤️" },
  { id: "engagement_100k", name: "Méga Engageur", description: "Atteignez 100K engagements", requirement: 100000, type: "engagement", xpReward: 2000, emoji: "💖" },
  { id: "views_10k", name: "10K Club", description: "Atteignez 10K vues totales", requirement: 10000, type: "views", xpReward: 300, emoji: "👀" },
  { id: "views_100k", name: "100K Club", description: "Atteignez 100K vues totales", requirement: 100000, type: "views", xpReward: 1000, emoji: "🎯" },
  { id: "views_1m", name: "Million Club", description: "Atteignez 1M vues totales", requirement: 1000000, type: "views", xpReward: 5000, emoji: "🏅" },
  { id: "posts_10", name: "Créateur Actif", description: "Publiez 10 posts", requirement: 10, type: "posts", xpReward: 350, emoji: "✍️" },
  { id: "posts_50", name: "Créateur Prolifique", description: "Publiez 50 posts", requirement: 50, type: "posts", xpReward: 750, emoji: "📝" },
  { id: "posts_100", name: "Roi du Contenu", description: "Publiez 100 posts", requirement: 100, type: "posts", xpReward: 1500, emoji: "👑" },
  { id: "viral_post", name: "Post Viral", description: "Un post dépasse 10K vues", requirement: 1, type: "viral", xpReward: 500, emoji: "⚡" },
  { id: "carousel_master", name: "Maître Carrousel", description: "Créez 10 carrousels", requirement: 10, type: "carousels", xpReward: 400, emoji: "🎠" },
  { id: "early_bird", name: "Lève-tôt", description: "Publiez 10 posts avant 8h", requirement: 10, type: "early_posts", xpReward: 300, emoji: "🌅" },
  { id: "night_owl", name: "Oiseau de Nuit", description: "Publiez 10 posts après 20h", requirement: 10, type: "night_posts", xpReward: 300, emoji: "🦉" },
  { id: "community_builder", name: "Bâtisseur", description: "Répondez à 100 commentaires", requirement: 100, type: "replies", xpReward: 450, emoji: "🏗️" }
];

// Récompenses disponibles dans la boutique
export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: "template" | "feature" | "boost" | "cosmetic";
  icon: string;
  available: boolean;
}

export const REWARDS: Reward[] = [
  { id: "template_premium_1", name: "Template Premium 'Viral'", description: "Accès au template de post viral le plus performant", cost: 500, type: "template", icon: "📄", available: true },
  { id: "template_premium_2", name: "Template Premium 'Storytelling'", description: "Template de storytelling émotionnel", cost: 500, type: "template", icon: "📖", available: true },
  { id: "template_carousel", name: "Pack Carrousels Pro", description: "5 templates de carrousels premium", cost: 1000, type: "template", icon: "🎠", available: true },
  { id: "boost_visibility", name: "Boost Visibilité", description: "Analyse IA avancée pour optimiser votre prochain post", cost: 300, type: "boost", icon: "🚀", available: true },
  { id: "boost_timing", name: "Timing Optimal", description: "Recommandation personnalisée du meilleur moment pour publier", cost: 200, type: "boost", icon: "⏰", available: true },
  { id: "feature_ab_test", name: "A/B Test Illimité", description: "Tests A/B illimités pendant 7 jours", cost: 800, type: "feature", icon: "🔬", available: true },
  { id: "feature_analytics", name: "Analytics Pro", description: "Accès aux analytics avancés pendant 7 jours", cost: 600, type: "feature", icon: "📊", available: true },
  { id: "cosmetic_badge_gold", name: "Badge Doré", description: "Badge doré exclusif sur votre profil", cost: 2000, type: "cosmetic", icon: "🏅", available: true },
  { id: "cosmetic_theme_dark", name: "Thème Exclusif", description: "Thème visuel exclusif pour votre dashboard", cost: 1500, type: "cosmetic", icon: "🎨", available: true },
  { id: "coaching_session", name: "Session Coaching IA", description: "Analyse approfondie de votre stratégie LinkedIn", cost: 1000, type: "feature", icon: "🎓", available: true }
];

// Calculer le niveau à partir des XP
export function calculateLevel(xp: number): typeof LEVELS[0] {
  return LEVELS.find(l => xp >= l.minXp && xp < l.maxXp) || LEVELS[0];
}

// Calculer la progression vers le niveau suivant
export function calculateProgress(xp: number): { progress: number; xpToNext: number } {
  const level = calculateLevel(xp);
  const progress = ((xp - level.minXp) / (level.maxXp - level.minXp)) * 100;
  const xpToNext = level.maxXp - xp;
  return { progress, xpToNext };
}

// Vérifier les badges débloqués
export function checkUnlockedBadges(data: UserGamificationData): string[] {
  const unlockedBadges: string[] = [];
  
  BADGES.forEach(badge => {
    let value = 0;
    switch (badge.type) {
      case "posts":
        value = data.totalPosts;
        break;
      case "streak":
        value = data.streak;
        break;
      case "engagement":
        value = data.totalEngagement;
        break;
      case "views":
        value = data.totalViews;
        break;
      default:
        value = 0;
    }
    
    if (value >= badge.requirement && !data.badges.includes(badge.id)) {
      unlockedBadges.push(badge.id);
    }
  });
  
  return unlockedBadges;
}

// Calculer le streak
export function calculateStreak(lastPostDate: Date | null, currentStreak: number): number {
  if (!lastPostDate) return 0;
  
  const now = new Date();
  const lastPost = new Date(lastPostDate);
  const diffDays = Math.floor((now.getTime() - lastPost.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0 || diffDays === 1) {
    return currentStreak;
  } else {
    return 0; // Streak broken
  }
}

// Convertir XP en crédits (1 crédit = 10 XP gagnés)
export function xpToCredits(xpGained: number): number {
  return Math.floor(xpGained / 10);
}

// Générer le texte de partage LinkedIn pour un badge
export function generateBadgeShareText(badge: typeof BADGES[0], level: typeof LEVELS[0]): string {
  return `🎉 Je viens de débloquer le badge "${badge.name}" ${badge.emoji} sur LinkedAgents !

${badge.description}

📊 Niveau actuel : ${level.name} ${level.emoji}

Rejoignez-moi sur LinkedAgents pour booster votre présence LinkedIn avec des agents IA ! 🚀

#LinkedAgents #LinkedIn #PersonalBranding #ContentCreator`;
}

// Générer l'URL de partage LinkedIn
export function generateLinkedInShareUrl(text: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://www.linkedin.com/sharing/share-offsite/?url=https://linkedagents.com&text=${encodedText}`;
}
