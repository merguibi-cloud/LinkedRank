import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Flame,
  Zap,
  Target,
  Crown,
  Medal,
  Award,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

const badges: Badge[] = [
  {
    id: "first-post",
    name: "Premier Pas",
    description: "Générez votre premier post LinkedIn",
    icon: Sparkles,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    unlocked: true,
    rarity: "common",
    unlockedAt: "20/12/2024",
  },
  {
    id: "streak-7",
    name: "Flamme Ardente",
    description: "Publiez 7 jours consécutifs",
    icon: Flame,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    unlocked: true,
    rarity: "rare",
    unlockedAt: "25/12/2024",
  },
  {
    id: "viral-post",
    name: "Viral Star",
    description: "Atteignez 10K vues sur un post",
    icon: TrendingUp,
    color: "text-rose",
    bgColor: "bg-rose/20",
    unlocked: true,
    rarity: "epic",
    unlockedAt: "26/12/2024",
  },
  {
    id: "engagement-master",
    name: "Maître de l'Engagement",
    description: "Obtenez 500 réactions sur un post",
    icon: MessageSquare,
    color: "text-violet-light",
    bgColor: "bg-violet/20",
    unlocked: false,
    progress: 342,
    maxProgress: 500,
    rarity: "epic",
  },
  {
    id: "network-builder",
    name: "Bâtisseur de Réseau",
    description: "Gagnez 1000 nouveaux abonnés",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    unlocked: false,
    progress: 756,
    maxProgress: 1000,
    rarity: "rare",
  },
  {
    id: "consistent-creator",
    name: "Créateur Régulier",
    description: "Publiez 30 posts en un mois",
    icon: Calendar,
    color: "text-gold",
    bgColor: "bg-gold/20",
    unlocked: false,
    progress: 18,
    maxProgress: 30,
    rarity: "rare",
  },
  {
    id: "top-voice",
    name: "Top Voice",
    description: "Soyez reconnu comme expert de votre domaine",
    icon: Crown,
    color: "text-gold",
    bgColor: "bg-gradient-to-br from-gold/20 to-amber-500/20",
    unlocked: false,
    rarity: "legendary",
  },
  {
    id: "influencer",
    name: "Influenceur LinkedIn",
    description: "Atteignez 50K abonnés",
    icon: Trophy,
    color: "text-gold",
    bgColor: "bg-gradient-to-br from-gold/20 to-orange-500/20",
    unlocked: false,
    rarity: "legendary",
  },
];

const rarityConfig = {
  common: {
    label: "Commun",
    color: "text-gray-400",
    borderColor: "border-gray-500/30",
  },
  rare: {
    label: "Rare",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  epic: {
    label: "Épique",
    color: "text-violet-light",
    borderColor: "border-violet/30",
  },
  legendary: {
    label: "Légendaire",
    color: "text-gold",
    borderColor: "border-gold/30",
  },
};

export function GamificationBadges() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalPoints = badges.filter(b => b.unlocked).reduce((sum, b) => {
    const points = { common: 10, rare: 25, epic: 50, legendary: 100 };
    return sum + points[b.rarity];
  }, 0);

  const filteredBadges = badges.filter(badge => {
    if (filter === "unlocked") return badge.unlocked;
    if (filter === "locked") return !badge.unlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold" />
            Vos Badges
          </h3>
          <p className="text-sm text-white/60 mt-1">
            {unlockedCount}/{badges.length} débloqués · {totalPoints} points
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-violet/20 text-violet-light border border-violet/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:border-white/20"
              }`}
            >
              {f === "all" ? "Tous" : f === "unlocked" ? "Débloqués" : "À débloquer"}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Progression globale</span>
          <span className="text-sm font-medium text-violet-light">
            {Math.round((unlockedCount / badges.length) * 100)}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet to-rose rounded-full"
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const rarity = rarityConfig[badge.rarity];
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedBadge(badge)}
              className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                badge.unlocked
                  ? `${badge.bgColor} ${rarity.borderColor} hover:border-opacity-50`
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {/* Rarity indicator */}
              <div className={`absolute top-2 right-2 text-[10px] font-medium ${rarity.color}`}>
                {rarity.label}
              </div>

              {/* Icon */}
              <div className={`relative w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                badge.unlocked ? badge.bgColor : "bg-white/10"
              }`}>
                {badge.unlocked ? (
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                ) : (
                  <Lock className="w-6 h-6 text-white/30" />
                )}
                {badge.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Name */}
              <h4 className={`text-center font-semibold mb-1 ${
                badge.unlocked ? "text-white" : "text-white/50"
              }`}>
                {badge.name}
              </h4>

              {/* Progress bar for locked badges */}
              {!badge.unlocked && badge.progress !== undefined && badge.maxProgress && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet to-rose rounded-full"
                      style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/40 text-center mt-1">
                    {badge.progress}/{badge.maxProgress}
                  </div>
                </div>
              )}

              {/* Unlocked date */}
              {badge.unlocked && badge.unlockedAt && (
                <div className="text-[10px] text-white/40 text-center mt-1">
                  Débloqué le {badge.unlockedAt}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Badge detail modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm p-6 rounded-3xl border ${
                selectedBadge.unlocked
                  ? `${selectedBadge.bgColor} ${rarityConfig[selectedBadge.rarity].borderColor}`
                  : "bg-gray-900 border-white/10"
              }`}
            >
              <div className={`w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center ${
                selectedBadge.unlocked ? selectedBadge.bgColor : "bg-white/10"
              }`}>
                {selectedBadge.unlocked ? (
                  <selectedBadge.icon className={`w-12 h-12 ${selectedBadge.color}`} />
                ) : (
                  <Lock className="w-10 h-10 text-white/30" />
                )}
              </div>

              <div className={`text-center text-sm font-medium mb-2 ${rarityConfig[selectedBadge.rarity].color}`}>
                {rarityConfig[selectedBadge.rarity].label}
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                {selectedBadge.name}
              </h3>

              <p className="text-white/70 text-center mb-4">
                {selectedBadge.description}
              </p>

              {selectedBadge.unlocked ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Débloqué le {selectedBadge.unlockedAt}
                  </div>
                </div>
              ) : selectedBadge.progress !== undefined && selectedBadge.maxProgress ? (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Progression</span>
                    <span className="text-white">
                      {selectedBadge.progress}/{selectedBadge.maxProgress}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet to-rose rounded-full"
                      style={{ width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/50 text-sm">
                  Continuez à utiliser LinkedAgents pour débloquer ce badge !
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GamificationBadges;
