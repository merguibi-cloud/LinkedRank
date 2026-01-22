import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Flame,
  Crown,
  Medal,
  Gift,
  Sparkles,
  TrendingUp,
  Calendar,
  MessageSquare,
  Users,
  Eye,
  Share2,
  Award,
  Lock,
  CheckCircle,
  ChevronRight,
  Rocket,
  Heart,
  ThumbsUp,
  BookOpen,
  Lightbulb,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Types
interface UserStats {
  xp: number;
  level: number;
  streak: number;
  totalPosts: number;
  totalEngagement: number;
  totalViews: number;
  badges: string[];
  completedChallenges: string[];
}

interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  progress: number;
  target: number;
  deadline: string;
  type: "daily" | "weekly" | "special";
  completed: boolean;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

// Données de gamification
const LEVELS = [
  { level: 1, name: "Débutant", minXp: 0, maxXp: 500, color: "text-gray-400", bg: "bg-gray-500/20" },
  { level: 2, name: "Apprenti", minXp: 500, maxXp: 1500, color: "text-green-400", bg: "bg-green-500/20" },
  { level: 3, name: "Créateur", minXp: 1500, maxXp: 3500, color: "text-blue-400", bg: "bg-blue-500/20" },
  { level: 4, name: "Expert", minXp: 3500, maxXp: 7000, color: "text-purple-400", bg: "bg-purple-500/20" },
  { level: 5, name: "Maître", minXp: 7000, maxXp: 12000, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { level: 6, name: "Champion", minXp: 12000, maxXp: 20000, color: "text-orange-400", bg: "bg-orange-500/20" },
  { level: 7, name: "Légende", minXp: 20000, maxXp: 35000, color: "text-red-400", bg: "bg-red-500/20" },
  { level: 8, name: "Icône", minXp: 35000, maxXp: 50000, color: "text-pink-400", bg: "bg-pink-500/20" },
  { level: 9, name: "Influenceur", minXp: 50000, maxXp: 100000, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  { level: 10, name: "Titan LinkedIn", minXp: 100000, maxXp: 999999, color: "text-amber-400", bg: "bg-amber-500/20" }
];

const XP_ACTIONS = {
  post_published: 100,
  carousel_created: 150,
  engagement_received: 10,
  comment_replied: 25,
  streak_day: 50,
  challenge_completed: 200,
  badge_unlocked: 300,
  viral_post: 500,
  first_post: 250,
  weekly_goal: 150
};

export function GamificationSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 4850,
    level: 4,
    streak: 12,
    totalPosts: 47,
    totalEngagement: 15420,
    totalViews: 125000,
    badges: ["first_post", "streak_7", "engagement_1k", "viral_post"],
    completedChallenges: ["daily_post", "weekly_5posts"]
  });

  const [badges] = useState<GameBadge[]>([
    { id: "first_post", name: "Premier Pas", description: "Publiez votre premier post", icon: <Rocket className="w-6 h-6" />, color: "text-green-400", requirement: "1 post publié", xpReward: 250, unlocked: true, progress: 1, maxProgress: 1 },
    { id: "streak_7", name: "Flamme Ardente", description: "Maintenez un streak de 7 jours", icon: <Flame className="w-6 h-6" />, color: "text-orange-400", requirement: "7 jours consécutifs", xpReward: 300, unlocked: true, progress: 7, maxProgress: 7 },
    { id: "streak_30", name: "Feu Éternel", description: "Maintenez un streak de 30 jours", icon: <Flame className="w-6 h-6" />, color: "text-red-400", requirement: "30 jours consécutifs", xpReward: 1000, unlocked: false, progress: 12, maxProgress: 30 },
    { id: "engagement_1k", name: "Engageur", description: "Atteignez 1000 engagements", icon: <ThumbsUp className="w-6 h-6" />, color: "text-blue-400", requirement: "1000 engagements", xpReward: 400, unlocked: true, progress: 1000, maxProgress: 1000 },
    { id: "engagement_10k", name: "Super Engageur", description: "Atteignez 10 000 engagements", icon: <Heart className="w-6 h-6" />, color: "text-pink-400", requirement: "10 000 engagements", xpReward: 800, unlocked: true, progress: 15420, maxProgress: 10000 },
    { id: "viral_post", name: "Post Viral", description: "Un post dépasse 10K vues", icon: <Zap className="w-6 h-6" />, color: "text-yellow-400", requirement: "10K vues sur un post", xpReward: 500, unlocked: true, progress: 1, maxProgress: 1 },
    { id: "carousel_master", name: "Maître Carrousel", description: "Créez 10 carrousels", icon: <BookOpen className="w-6 h-6" />, color: "text-purple-400", requirement: "10 carrousels créés", xpReward: 350, unlocked: false, progress: 6, maxProgress: 10 },
    { id: "views_100k", name: "100K Club", description: "Atteignez 100K vues totales", icon: <Eye className="w-6 h-6" />, color: "text-cyan-400", requirement: "100K vues totales", xpReward: 1000, unlocked: true, progress: 125000, maxProgress: 100000 },
    { id: "community_builder", name: "Bâtisseur", description: "Répondez à 100 commentaires", icon: <MessageSquare className="w-6 h-6" />, color: "text-emerald-400", requirement: "100 réponses", xpReward: 450, unlocked: false, progress: 67, maxProgress: 100 },
    { id: "influencer", name: "Influenceur", description: "Atteignez 5000 abonnés", icon: <Users className="w-6 h-6" />, color: "text-indigo-400", requirement: "5000 abonnés", xpReward: 2000, unlocked: false, progress: 3240, maxProgress: 5000 },
    { id: "content_king", name: "Roi du Contenu", description: "Publiez 100 posts", icon: <Crown className="w-6 h-6" />, color: "text-amber-400", requirement: "100 posts publiés", xpReward: 1500, unlocked: false, progress: 47, maxProgress: 100 },
    { id: "early_bird", name: "Lève-tôt", description: "Publiez 10 posts avant 8h", icon: <Timer className="w-6 h-6" />, color: "text-sky-400", requirement: "10 posts matinaux", xpReward: 300, unlocked: false, progress: 3, maxProgress: 10 }
  ]);

  const [challenges] = useState<Challenge[]>([
    { id: "daily_post", title: "Post du jour", description: "Publiez un post aujourd'hui", icon: <Sparkles className="w-5 h-5" />, xpReward: 100, progress: 1, target: 1, deadline: "Aujourd'hui", type: "daily", completed: true },
    { id: "daily_engage", title: "Engagez-vous", description: "Répondez à 5 commentaires", icon: <MessageSquare className="w-5 h-5" />, xpReward: 75, progress: 3, target: 5, deadline: "Aujourd'hui", type: "daily", completed: false },
    { id: "daily_connect", title: "Réseautage", description: "Envoyez 3 invitations", icon: <Users className="w-5 h-5" />, xpReward: 50, progress: 2, target: 3, deadline: "Aujourd'hui", type: "daily", completed: false },
    { id: "weekly_5posts", title: "Créateur actif", description: "Publiez 5 posts cette semaine", icon: <Target className="w-5 h-5" />, xpReward: 300, progress: 5, target: 5, deadline: "Cette semaine", type: "weekly", completed: true },
    { id: "weekly_carousel", title: "Maître visuel", description: "Créez 2 carrousels", icon: <BookOpen className="w-5 h-5" />, xpReward: 250, progress: 1, target: 2, deadline: "Cette semaine", type: "weekly", completed: false },
    { id: "weekly_viral", title: "Chasseur de viralité", description: "Obtenez 5K vues sur un post", icon: <TrendingUp className="w-5 h-5" />, xpReward: 400, progress: 3200, target: 5000, deadline: "Cette semaine", type: "weekly", completed: false },
    { id: "special_streak", title: "🔥 Défi Streak", description: "Maintenez votre streak 14 jours", icon: <Flame className="w-5 h-5" />, xpReward: 500, progress: 12, target: 14, deadline: "2 jours restants", type: "special", completed: false }
  ]);

  const [leaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, name: "Marie Dupont", avatar: "👩‍💼", xp: 45200, level: 8, streak: 45 },
    { rank: 2, name: "Thomas Martin", avatar: "👨‍💻", xp: 38900, level: 7, streak: 32 },
    { rank: 3, name: "Sophie Bernard", avatar: "👩‍🎨", xp: 31500, level: 7, streak: 28 },
    { rank: 4, name: "Pierre Leroy", avatar: "👨‍🔬", xp: 25800, level: 6, streak: 21 },
    { rank: 5, name: "Julie Moreau", avatar: "👩‍⚕️", xp: 19200, level: 5, streak: 18 },
    { rank: 6, name: "Vous", avatar: "🎯", xp: 4850, level: 4, streak: 12, isCurrentUser: true },
    { rank: 7, name: "Lucas Petit", avatar: "👨‍🎓", xp: 4200, level: 3, streak: 8 },
    { rank: 8, name: "Emma Richard", avatar: "👩‍💻", xp: 3800, level: 3, streak: 6 }
  ]);

  const currentLevel = LEVELS.find(l => userStats.xp >= l.minXp && userStats.xp < l.maxXp) || LEVELS[0];
  const nextLevel = LEVELS[currentLevel.level] || LEVELS[LEVELS.length - 1];
  const xpProgress = ((userStats.xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp)) * 100;
  const xpToNextLevel = currentLevel.maxXp - userStats.xp;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const claimReward = (challengeId: string, xp: number) => {
    setUserStats(prev => ({ ...prev, xp: prev.xp + xp }));
    triggerConfetti();
    toast.success(`+${xp} XP gagnés ! 🎉`);
  };

  return (
    <div className="space-y-6">
      {/* Header avec niveau et XP */}
      <Card className="glass-card border-primary/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10" />
        <CardContent className="relative p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Avatar et niveau */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl">
                  🎯
                </div>
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${currentLevel.bg} border border-current`}>
                <span className={`text-xs font-bold ${currentLevel.color}`}>Niv. {currentLevel.level}</span>
              </div>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-bold text-foreground">Youssef Koutari</h2>
                <Badge className={`${currentLevel.bg} ${currentLevel.color} border-current`}>
                  {currentLevel.name}
                </Badge>
              </div>
              
              {/* Barre XP */}
              <div className="space-y-2 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP: {userStats.xp.toLocaleString()}</span>
                  <span className="text-primary font-medium">{xpToNextLevel.toLocaleString()} XP pour niveau {currentLevel.level + 1}</span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-3" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">{Math.round(xpProgress)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{userStats.streak}</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{badges.filter(b => b.unlocked).length}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{challenges.filter(c => c.completed).length}</p>
                <p className="text-xs text-muted-foreground">Défis</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Défis</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Medal className="w-4 h-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Classement</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Actions XP */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Comment gagner des XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(XP_ACTIONS).slice(0, 8).map(([action, xp]) => (
                  <div key={action} className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                    <p className="text-lg font-bold text-primary">+{xp} XP</p>
                    <p className="text-xs text-muted-foreground capitalize">{action.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Défis du jour */}
          <Card className="glass-card border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-5 h-5" />
                Défis du jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.filter(c => c.type === "daily").map((challenge) => (
                <div key={challenge.id} className={`p-4 rounded-lg border ${challenge.completed ? "bg-green-500/10 border-green-500/30" : "bg-secondary/20 border-border/50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${challenge.completed ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
                        {challenge.completed ? <CheckCircle className="w-5 h-5" /> : challenge.icon}
                      </div>
                      <div>
                        <p className={`font-medium ${challenge.completed ? "text-green-400" : "text-foreground"}`}>{challenge.title}</p>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {challenge.completed ? (
                        <Badge className="bg-green-500/20 text-green-400">Complété ✓</Badge>
                      ) : (
                        <>
                          <p className="text-sm text-primary font-medium">+{challenge.xpReward} XP</p>
                          <p className="text-xs text-muted-foreground">{challenge.progress}/{challenge.target}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {!challenge.completed && (
                    <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5 mt-3" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prochain niveau */}
          <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Prochain niveau : {nextLevel.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Plus que {xpToNextLevel.toLocaleString()} XP pour débloquer de nouvelles fonctionnalités !
                  </p>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400">Récompense : Badge exclusif + 500 XP bonus</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Défis */}
        <TabsContent value="challenges" className="space-y-6 mt-6">
          {["daily", "weekly", "special"].map((type) => (
            <Card key={type} className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {type === "daily" && <Calendar className="w-5 h-5 text-blue-400" />}
                  {type === "weekly" && <Target className="w-5 h-5 text-purple-400" />}
                  {type === "special" && <Star className="w-5 h-5 text-yellow-400" />}
                  Défis {type === "daily" ? "quotidiens" : type === "weekly" ? "hebdomadaires" : "spéciaux"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.filter(c => c.type === type).map((challenge) => (
                  <motion.div 
                    key={challenge.id} 
                    className={`p-4 rounded-lg border ${challenge.completed ? "bg-green-500/10 border-green-500/30" : "bg-secondary/20 border-border/50"}`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${challenge.completed ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
                          {challenge.completed ? <CheckCircle className="w-5 h-5" /> : challenge.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${challenge.completed ? "text-green-400 line-through" : "text-foreground"}`}>{challenge.title}</p>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={challenge.completed ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}>
                          +{challenge.xpReward} XP
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{challenge.deadline}</p>
                      </div>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {challenge.progress.toLocaleString()}/{challenge.target.toLocaleString()}
                      </span>
                      {challenge.completed && !userStats.completedChallenges.includes(challenge.id) && (
                        <Button size="sm" onClick={() => claimReward(challenge.id, challenge.xpReward)}>
                          <Gift className="w-4 h-4 mr-1" />
                          Réclamer
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl border text-center ${badge.unlocked ? "bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30" : "bg-secondary/20 border-border/50 opacity-60"}`}
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${badge.unlocked ? badge.color.replace("text-", "bg-").replace("-400", "-500/20") : "bg-gray-500/20"}`}>
                  {badge.unlocked ? (
                    <span className={badge.color}>{badge.icon}</span>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <h4 className={`font-semibold mb-1 ${badge.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{badge.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                {!badge.unlocked && (
                  <>
                    <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">{badge.progress}/{badge.maxProgress}</p>
                  </>
                )}
                <Badge variant="outline" className={badge.unlocked ? "bg-primary/10 text-primary mt-2" : "bg-gray-500/10 text-gray-400 mt-2"}>
                  +{badge.xpReward} XP
                </Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Classement */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Classement de la semaine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-lg ${user.isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-secondary/20"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    user.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                    user.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                    user.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {user.rank <= 3 ? ["🥇", "🥈", "🥉"][user.rank - 1] : user.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${user.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {user.name} {user.isCurrentUser && "(Vous)"}
                    </p>
                    <p className="text-xs text-muted-foreground">Niveau {user.level} • {user.streak} jours de streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{user.xp.toLocaleString()} XP</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
