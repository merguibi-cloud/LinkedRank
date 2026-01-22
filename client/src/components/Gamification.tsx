import { useState, useEffect } from "react";
import { 
  Trophy, Flame, Star, Zap, Target, Award, Crown, Rocket, 
  Medal, Gift, Sparkles, TrendingUp, Users, MessageSquare,
  Calendar, CheckCircle2, Lock, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: "posts" | "engagement" | "streak" | "special";
}

interface UserLevel {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  currentXP: number;
  color: string;
  icon: React.ReactNode;
}

interface StreakData {
  current: number;
  longest: number;
  lastPostDate: Date | null;
  isActive: boolean;
}

// Badge definitions
const badgeDefinitions: Omit<Badge, "currentProgress" | "unlocked" | "unlockedAt">[] = [
  // Posts badges
  { id: "first_post", name: "Premier Pas", description: "Publiez votre premier post", icon: <Rocket className="w-6 h-6" />, color: "from-blue-500 to-cyan-500", requirement: 1, category: "posts" },
  { id: "posts_10", name: "Créateur Actif", description: "Publiez 10 posts", icon: <Zap className="w-6 h-6" />, color: "from-violet to-purple-500", requirement: 10, category: "posts" },
  { id: "posts_50", name: "Machine à Contenu", description: "Publiez 50 posts", icon: <Target className="w-6 h-6" />, color: "from-amber-500 to-orange-500", requirement: 50, category: "posts" },
  { id: "posts_100", name: "Légende LinkedIn", description: "Publiez 100 posts", icon: <Crown className="w-6 h-6" />, color: "from-yellow-400 to-amber-500", requirement: 100, category: "posts" },
  { id: "posts_500", name: "Influenceur Elite", description: "Publiez 500 posts", icon: <Trophy className="w-6 h-6" />, color: "from-rose to-pink-500", requirement: 500, category: "posts" },
  
  // Engagement badges
  { id: "likes_100", name: "Apprécié", description: "Recevez 100 likes", icon: <Star className="w-6 h-6" />, color: "from-pink-500 to-rose-500", requirement: 100, category: "engagement" },
  { id: "likes_1000", name: "Populaire", description: "Recevez 1000 likes", icon: <Award className="w-6 h-6" />, color: "from-emerald-500 to-teal-500", requirement: 1000, category: "engagement" },
  { id: "comments_50", name: "Conversationnel", description: "Recevez 50 commentaires", icon: <MessageSquare className="w-6 h-6" />, color: "from-blue-500 to-indigo-500", requirement: 50, category: "engagement" },
  { id: "viral_post", name: "Viral", description: "Un post dépasse 10K vues", icon: <TrendingUp className="w-6 h-6" />, color: "from-red-500 to-orange-500", requirement: 1, category: "engagement" },
  
  // Streak badges
  { id: "streak_7", name: "Semaine Parfaite", description: "7 jours de publication consécutifs", icon: <Flame className="w-6 h-6" />, color: "from-orange-500 to-red-500", requirement: 7, category: "streak" },
  { id: "streak_30", name: "Mois de Feu", description: "30 jours de publication consécutifs", icon: <Flame className="w-6 h-6" />, color: "from-red-500 to-rose-600", requirement: 30, category: "streak" },
  { id: "streak_100", name: "Inarrêtable", description: "100 jours de publication consécutifs", icon: <Flame className="w-6 h-6" />, color: "from-amber-400 to-red-600", requirement: 100, category: "streak" },
  
  // Special badges
  { id: "early_adopter", name: "Early Adopter", description: "Parmi les premiers utilisateurs", icon: <Gift className="w-6 h-6" />, color: "from-violet to-rose", requirement: 1, category: "special" },
  { id: "agent_master", name: "Maître des Agents", description: "Utilisez tous les agents IA", icon: <Sparkles className="w-6 h-6" />, color: "from-cyan-500 to-blue-500", requirement: 5, category: "special" },
  { id: "network_builder", name: "Networker", description: "Connectez-vous avec 100 créateurs", icon: <Users className="w-6 h-6" />, color: "from-green-500 to-emerald-500", requirement: 100, category: "special" },
];

// Level definitions
const levelDefinitions: Omit<UserLevel, "currentXP">[] = [
  { level: 1, name: "Débutant", minXP: 0, maxXP: 100, color: "from-gray-400 to-gray-500", icon: <Star className="w-5 h-5" /> },
  { level: 2, name: "Apprenti", minXP: 100, maxXP: 300, color: "from-green-400 to-emerald-500", icon: <Zap className="w-5 h-5" /> },
  { level: 3, name: "Créateur", minXP: 300, maxXP: 600, color: "from-blue-400 to-cyan-500", icon: <Target className="w-5 h-5" /> },
  { level: 4, name: "Expert", minXP: 600, maxXP: 1000, color: "from-violet to-purple-500", icon: <Award className="w-5 h-5" /> },
  { level: 5, name: "Maître", minXP: 1000, maxXP: 1500, color: "from-amber-400 to-orange-500", icon: <Medal className="w-5 h-5" /> },
  { level: 6, name: "Champion", minXP: 1500, maxXP: 2500, color: "from-rose to-pink-500", icon: <Trophy className="w-5 h-5" /> },
  { level: 7, name: "Légende", minXP: 2500, maxXP: 5000, color: "from-yellow-400 to-amber-500", icon: <Crown className="w-5 h-5" /> },
  { level: 8, name: "Icône", minXP: 5000, maxXP: 10000, color: "from-red-500 to-rose-600", icon: <Rocket className="w-5 h-5" /> },
];

// Badge Card Component
export function BadgeCard({ badge, onClick }: { badge: Badge; onClick?: () => void }) {
  const progress = Math.min((badge.currentProgress / badge.requirement) * 100, 100);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all",
        badge.unlocked 
          ? "bg-gradient-to-br border-white/20 shadow-lg" 
          : "bg-card/50 border-white/5 opacity-60"
      )}
      style={badge.unlocked ? { 
        background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
      } : undefined}
      onClick={onClick}
    >
      {/* Glow effect for unlocked badges */}
      {badge.unlocked && (
        <div 
          className={cn("absolute inset-0 rounded-xl opacity-20 blur-xl", `bg-gradient-to-br ${badge.color}`)}
        />
      )}
      
      <div className="relative flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          badge.unlocked 
            ? `bg-gradient-to-br ${badge.color}` 
            : "bg-white/5"
        )}>
          {badge.unlocked ? (
            badge.icon
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-sm",
            badge.unlocked ? "text-white" : "text-muted-foreground"
          )}>
            {badge.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {badge.description}
          </p>
          
          {/* Progress bar */}
          {!badge.unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{badge.currentProgress}/{badge.requirement}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn("h-full rounded-full bg-gradient-to-r", badge.color)}
                />
              </div>
            </div>
          )}
          
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Débloqué le {new Date(badge.unlockedAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Level Progress Component
export function LevelProgress({ userXP }: { userXP: number }) {
  const currentLevel = levelDefinitions.find(l => userXP >= l.minXP && userXP < l.maxXP) || levelDefinitions[levelDefinitions.length - 1];
  const nextLevel = levelDefinitions.find(l => l.level === currentLevel.level + 1);
  
  const progressInLevel = userXP - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;
  const progress = (progressInLevel / levelRange) * 100;
  
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br",
            currentLevel.color
          )}>
            {currentLevel.icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Niveau {currentLevel.level}</p>
            <h3 className="text-xl font-bold text-white">{currentLevel.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{userXP.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">XP Total</p>
        </div>
      </div>
      
      {nextLevel && (
        <>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Prochain niveau: {nextLevel.name}</span>
            <span className="text-white font-medium">{currentLevel.maxXP - userXP} XP restants</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full bg-gradient-to-r", currentLevel.color)}
            />
          </div>
        </>
      )}
      
      {!nextLevel && (
        <div className="flex items-center gap-2 text-amber-400">
          <Crown className="w-5 h-5" />
          <span className="font-medium">Niveau maximum atteint !</span>
        </div>
      )}
    </div>
  );
}

// Streak Display Component
export function StreakDisplay({ streak }: { streak: StreakData }) {
  const getStreakColor = (days: number) => {
    if (days >= 100) return "from-amber-400 to-red-600";
    if (days >= 30) return "from-red-500 to-rose-600";
    if (days >= 7) return "from-orange-500 to-red-500";
    return "from-amber-500 to-orange-500";
  };
  
  const getStreakEmoji = (days: number) => {
    if (days >= 100) return "🏆";
    if (days >= 30) return "🔥🔥🔥";
    if (days >= 7) return "🔥🔥";
    if (days >= 1) return "🔥";
    return "❄️";
  };
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "p-6 rounded-2xl border relative overflow-hidden",
        streak.isActive 
          ? "bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-500/30" 
          : "bg-card/50 border-white/10"
      )}
    >
      {/* Animated fire background for active streaks */}
      {streak.isActive && streak.current >= 7 && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/20 to-transparent"
          />
        </div>
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br",
            streak.isActive ? getStreakColor(streak.current) : "from-gray-500 to-gray-600"
          )}>
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Streak actuel</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-white">{streak.current}</span>
              <span className="text-lg text-muted-foreground">jours</span>
              <span className="text-2xl">{getStreakEmoji(streak.current)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Record</p>
          <p className="text-2xl font-bold text-white">{streak.longest} jours</p>
        </div>
      </div>
      
      {!streak.isActive && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Publiez aujourd'hui pour maintenir votre streak !
          </p>
        </div>
      )}
      
      {streak.isActive && streak.current >= 7 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-1">
            {[...Array(Math.min(streak.current, 7))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background flex items-center justify-center"
              >
                <Flame className="w-3 h-3 text-white" />
              </motion.div>
            ))}
          </div>
          <span className="text-sm text-orange-400 font-medium">
            {streak.current >= 30 ? "Incroyable !" : streak.current >= 7 ? "Super !" : ""}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Achievement Celebration Modal
export function AchievementCelebration({ 
  badge, 
  isOpen, 
  onClose 
}: { 
  badge: Badge | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!badge) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative p-8 rounded-3xl bg-card border border-white/20 text-center max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -20, 
                    x: Math.random() * 400 - 200,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: 400,
                    rotate: Math.random() * 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "absolute w-3 h-3 rounded-sm",
                    ["bg-violet", "bg-rose", "bg-amber-400", "bg-emerald-400", "bg-cyan-400"][i % 5]
                  )}
                  style={{ left: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
            
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                badge.color
              )}
            >
              {badge.icon}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 Nouveau Badge Débloqué !
              </h2>
              <h3 className={cn(
                "text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2",
                badge.color
              )}>
                {badge.name}
              </h3>
              <p className="text-muted-foreground mb-6">
                {badge.description}
              </p>
              
              <button
                onClick={onClose}
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r transition-all hover:opacity-90",
                  badge.color
                )}
              >
                Continuer
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Gamification Dashboard Component
export function GamificationDashboard({ 
  userStats 
}: { 
  userStats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    currentStreak: number;
    longestStreak: number;
    lastPostDate: Date | null;
    xp: number;
    agentsUsed: number;
    connectionsCount: number;
    hasViralPost: boolean;
    isEarlyAdopter: boolean;
  }
}) {
  const [celebratingBadge, setCelebratingBadge] = useState<Badge | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Calculate badges with progress
  const badges: Badge[] = badgeDefinitions.map(def => {
    let currentProgress = 0;
    let unlocked = false;
    
    switch (def.id) {
      case "first_post":
      case "posts_10":
      case "posts_50":
      case "posts_100":
      case "posts_500":
        currentProgress = userStats.totalPosts;
        break;
      case "likes_100":
      case "likes_1000":
        currentProgress = userStats.totalLikes;
        break;
      case "comments_50":
        currentProgress = userStats.totalComments;
        break;
      case "viral_post":
        currentProgress = userStats.hasViralPost ? 1 : 0;
        break;
      case "streak_7":
      case "streak_30":
      case "streak_100":
        currentProgress = userStats.longestStreak;
        break;
      case "early_adopter":
        currentProgress = userStats.isEarlyAdopter ? 1 : 0;
        break;
      case "agent_master":
        currentProgress = userStats.agentsUsed;
        break;
      case "network_builder":
        currentProgress = userStats.connectionsCount;
        break;
    }
    
    unlocked = currentProgress >= def.requirement;
    
    return {
      ...def,
      currentProgress,
      unlocked,
      unlockedAt: unlocked ? new Date() : undefined,
    };
  });
  
  const streak: StreakData = {
    current: userStats.currentStreak,
    longest: userStats.longestStreak,
    lastPostDate: userStats.lastPostDate,
    isActive: userStats.currentStreak > 0,
  };
  
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const categories = ["all", "posts", "engagement", "streak", "special"];
  const filteredBadges = selectedCategory === "all" 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);
  
  return (
    <div className="space-y-8">
      {/* Level Progress */}
      <LevelProgress userXP={userStats.xp} />
      
      {/* Streak */}
      <StreakDisplay streak={streak} />
      
      {/* Badges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Badges</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount}/{badges.length} débloqués
            </p>
          </div>
          
          {/* Category filter */}
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  selectedCategory === cat
                    ? "bg-violet text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {cat === "all" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => (
            <BadgeCard 
              key={badge.id} 
              badge={badge}
              onClick={() => badge.unlocked && setCelebratingBadge(badge)}
            />
          ))}
        </div>
      </div>
      
      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        badge={celebratingBadge}
        isOpen={!!celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
      />
    </div>
  );
}

// Compact Streak Widget for Dashboard
export function StreakWidget({ streak, className }: { streak: number; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30",
        className
      )}
    >
      <Flame className="w-5 h-5 text-orange-400" />
      <span className="text-lg font-bold text-white">{streak}</span>
      <span className="text-sm text-orange-400">jours</span>
      {streak >= 7 && <span className="text-lg">🔥</span>}
    </motion.div>
  );
}

// XP Gain Animation
export function XPGainAnimation({ 
  amount, 
  onComplete 
}: { 
  amount: number; 
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: -30, scale: 1 }}
      exit={{ opacity: 0, y: -60 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onComplete}
      className="fixed bottom-20 right-8 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-violet to-rose text-white font-bold shadow-lg"
    >
      +{amount} XP
    </motion.div>
  );
}
