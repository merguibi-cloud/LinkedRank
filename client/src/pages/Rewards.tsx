import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Gift, 
  Coins, 
  Trophy,
  Star,
  TrendingUp,
  History,
  Sparkles,
  Crown,
  Target,
  Zap
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { RewardsShop } from "@/components/RewardsShop";
import { ShareableBadge } from "@/components/BadgeShareCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BADGES, LEVELS, calculateLevel, calculateProgress, type Reward } from "@/lib/gamificationService";

export default function Rewards() {
  const [activeTab, setActiveTab] = useState("shop");
  
  // Données utilisateur (simulées - à connecter aux vraies données)
  const [userData, setUserData] = useState({
    xp: 4850,
    credits: 1250,
    totalCreditsEarned: 2500,
    purchasedRewards: ["boost_timing"],
    unlockedBadges: ["first_post", "streak_7", "engagement_1k", "views_10k", "posts_10"],
    totalPosts: 47,
    totalEngagement: 15420,
    totalViews: 125000,
    streak: 12
  });

  const [purchaseHistory, setPurchaseHistory] = useState([
    { id: 1, reward: "Timing Optimal", cost: 200, date: "2025-01-15", type: "boost" },
    { id: 2, reward: "50 crédits bonus", cost: 0, date: "2025-01-10", type: "bonus" }
  ]);

  const level = calculateLevel(userData.xp);
  const { progress, xpToNext } = calculateProgress(userData.xp);

  const handlePurchase = (reward: Reward) => {
    setUserData(prev => ({
      ...prev,
      credits: prev.credits - reward.cost,
      purchasedRewards: [...prev.purchasedRewards, reward.id]
    }));
    setPurchaseHistory(prev => [
      { id: Date.now(), reward: reward.name, cost: reward.cost, date: new Date().toISOString().split('T')[0], type: reward.type },
      ...prev
    ]);
  };

  // Calculer la progression de chaque badge
  const getBadgeProgress = (badge: typeof BADGES[0]) => {
    switch (badge.type) {
      case "posts": return userData.totalPosts;
      case "streak": return userData.streak;
      case "engagement": return userData.totalEngagement;
      case "views": return userData.totalViews;
      default: return 0;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crédits */}
          <Card className="glass-card border-amber-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{userData.credits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Crédits disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP */}
          <Card className="glass-card border-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{userData.xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Niveau */}
          <Card className="glass-card border-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                  {level.emoji}
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">Niv. {level.level}</p>
                  <p className="text-xs text-muted-foreground">{level.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="glass-card border-green-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{userData.unlockedBadges.length}/{BADGES.length}</p>
                  <p className="text-xs text-muted-foreground">Badges débloqués</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress to next level */}
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <span className="font-medium">{level.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-primary font-bold">{xpToNext.toLocaleString()}</span> XP pour niveau {level.level + 1}
              </div>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{userData.xp.toLocaleString()} XP</span>
              <span>{LEVELS[level.level]?.maxXp.toLocaleString() || "Max"} XP</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Boutique</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          {/* Boutique */}
          <TabsContent value="shop" className="mt-6">
            <RewardsShop 
              userCredits={userData.credits}
              onPurchase={handlePurchase}
              purchasedRewards={userData.purchasedRewards}
            />
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-6">
            <div className="space-y-6">
              {/* Badges débloqués */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  Badges débloqués ({userData.unlockedBadges.length})
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BADGES.filter(b => userData.unlockedBadges.includes(b.id)).map(badge => (
                    <ShareableBadge
                      key={badge.id}
                      badge={badge}
                      unlocked={true}
                      userXp={userData.xp}
                      userName="Youssef Koutari"
                    />
                  ))}
                </div>
              </div>

              {/* Badges à débloquer */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  Badges à débloquer ({BADGES.length - userData.unlockedBadges.length})
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BADGES.filter(b => !userData.unlockedBadges.includes(b.id)).map(badge => (
                    <ShareableBadge
                      key={badge.id}
                      badge={badge}
                      unlocked={false}
                      userXp={userData.xp}
                      userName="Youssef Koutari"
                      progress={getBadgeProgress(badge)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des récompenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === "bonus" ? "bg-green-500/20" : "bg-primary/20"
                        }`}>
                          {item.type === "bonus" ? (
                            <Gift className="w-5 h-5 text-green-400" />
                          ) : (
                            <Zap className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.reward}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={item.cost === 0 ? "text-green-400 border-green-500/30" : ""}>
                        {item.cost === 0 ? "Gratuit" : `-${item.cost} crédits`}
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-2xl font-bold text-amber-400">{userData.totalCreditsEarned.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Crédits gagnés au total</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <p className="text-2xl font-bold text-purple-400">{purchaseHistory.length}</p>
                    <p className="text-xs text-muted-foreground">Récompenses obtenues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How to earn credits */}
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Comment gagner des crédits ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { action: "Publier un post", credits: 10, icon: "📝" },
                { action: "Créer un carrousel", credits: 15, icon: "🎠" },
                { action: "Maintenir le streak", credits: 5, icon: "🔥" },
                { action: "Débloquer un badge", credits: 30, icon: "🏆" },
                { action: "Atteindre 1K vues", credits: 8, icon: "👀" },
                { action: "Recevoir 100 likes", credits: 5, icon: "❤️" },
                { action: "Compléter un défi", credits: 20, icon: "🎯" },
                { action: "Parrainer un ami", credits: 50, icon: "👥" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-amber-400">+{item.credits} crédits</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
