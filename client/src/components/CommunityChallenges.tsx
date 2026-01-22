import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Users, 
  Clock, 
  Flame,
  Crown,
  Medal,
  Star,
  Zap,
  Gift,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "daily" | "weekly" | "special";
  goal: number;
  current: number;
  reward: number;
  participants: number;
  endsAt: Date;
  isJoined: boolean;
  difficulty: "easy" | "medium" | "hard";
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  badge?: string;
  isCurrentUser?: boolean;
}

// Défis actifs
const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: "1",
    title: "Marathon de Posts",
    description: "Publiez 5 posts cette semaine pour dominer le classement",
    icon: "🏃",
    type: "weekly",
    goal: 5,
    current: 3,
    reward: 1000,
    participants: 247,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isJoined: true,
    difficulty: "medium"
  },
  {
    id: "2",
    title: "Roi de l'Engagement",
    description: "Obtenez 500 réactions sur vos posts cette semaine",
    icon: "👑",
    type: "weekly",
    goal: 500,
    current: 312,
    reward: 1500,
    participants: 189,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isJoined: true,
    difficulty: "hard"
  },
  {
    id: "3",
    title: "Défi Carrousel",
    description: "Créez 3 carrousels engageants",
    icon: "🎠",
    type: "weekly",
    goal: 3,
    current: 1,
    reward: 750,
    participants: 156,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isJoined: false,
    difficulty: "easy"
  },
  {
    id: "4",
    title: "Streak Master",
    description: "Maintenez un streak de 7 jours consécutifs",
    icon: "🔥",
    type: "special",
    goal: 7,
    current: 5,
    reward: 2000,
    participants: 89,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isJoined: true,
    difficulty: "hard"
  }
];

// Classement
const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Marie Dupont", avatar: "👩‍💼", score: 4850, badge: "👑" },
  { rank: 2, name: "Thomas Martin", avatar: "👨‍💻", score: 4320, badge: "🥈" },
  { rank: 3, name: "Sophie Bernard", avatar: "👩‍🎨", score: 3980, badge: "🥉" },
  { rank: 4, name: "Lucas Petit", avatar: "👨‍🔬", score: 3650 },
  { rank: 5, name: "Emma Leroy", avatar: "👩‍🏫", score: 3420 },
  { rank: 6, name: "Youssef Koutari", avatar: "🚀", score: 3180, isCurrentUser: true },
  { rank: 7, name: "Julie Moreau", avatar: "👩‍⚕️", score: 2950 },
  { rank: 8, name: "Antoine Dubois", avatar: "👨‍🎤", score: 2780 },
  { rank: 9, name: "Camille Roux", avatar: "👩‍💻", score: 2650 },
  { rank: 10, name: "Pierre Blanc", avatar: "👨‍🍳", score: 2480 }
];

// Défis passés
const PAST_CHALLENGES = [
  {
    id: "p1",
    title: "Semaine de l'Innovation",
    icon: "💡",
    yourRank: 12,
    totalParticipants: 234,
    reward: 500,
    date: "15-22 Déc 2024"
  },
  {
    id: "p2",
    title: "Challenge Viral",
    icon: "🚀",
    yourRank: 5,
    totalParticipants: 189,
    reward: 1200,
    date: "8-15 Déc 2024"
  },
  {
    id: "p3",
    title: "Marathon Networking",
    icon: "🤝",
    yourRank: 3,
    totalParticipants: 156,
    reward: 1800,
    date: "1-8 Déc 2024"
  }
];

export function CommunityChallenges() {
  const [challenges, setChallenges] = useState(ACTIVE_CHALLENGES);
  const [selectedTab, setSelectedTab] = useState("active");

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, isJoined: true, participants: c.participants + 1 } : c
    ));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    toast.success("🎯 Vous avez rejoint le défi !");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10 border-green-500/30";
      case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "hard": return "text-red-500 bg-red-500/10 border-red-500/30";
      default: return "";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Facile";
      case "medium": return "Moyen";
      case "hard": return "Difficile";
      default: return "";
    }
  };

  const getTimeRemaining = (endsAt: Date) => {
    const diff = endsAt.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">3</p>
                <p className="text-xs text-muted-foreground">Défis actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Medal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">#6</p>
                <p className="text-xs text-muted-foreground">Classement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">12</p>
                <p className="text-xs text-muted-foreground">Défis complétés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">5,200</p>
                <p className="text-xs text-muted-foreground">Crédits gagnés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Défis actifs
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Classement
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Défis actifs */}
        <TabsContent value="active" className="space-y-4">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card overflow-hidden ${challenge.isJoined ? "border-primary/30" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Icon et infos */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-3xl">
                        {challenge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{challenge.title}</h3>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {getDifficultyLabel(challenge.difficulty)}
                          </Badge>
                          {challenge.isJoined && (
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              Inscrit
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {challenge.description}
                        </p>
                        
                        {/* Progression */}
                        {challenge.isJoined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="font-medium">
                                {challenge.current}/{challenge.goal}
                              </span>
                            </div>
                            <Progress 
                              value={(challenge.current / challenge.goal) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats et action */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {challenge.participants}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Clock className="w-4 h-4" />
                          {getTimeRemaining(challenge.endsAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          <Gift className="w-3 h-3 mr-1" />
                          {challenge.reward} crédits
                        </Badge>
                        
                        {!challenge.isJoined && (
                          <Button 
                            onClick={() => joinChallenge(challenge.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Rejoindre
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Classement */}
        <TabsContent value="leaderboard">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Classement de la semaine
              </CardTitle>
              <CardDescription>
                Les meilleurs performers de cette semaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LEADERBOARD.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      entry.isCurrentUser 
                        ? "bg-primary/10 border border-primary/30" 
                        : entry.rank <= 3 
                          ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
                          : "bg-secondary/20 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? "bg-amber-500 text-black" :
                        entry.rank === 2 ? "bg-gray-300 text-black" :
                        entry.rank === 3 ? "bg-amber-700 text-white" :
                        "bg-secondary text-foreground"
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                        {entry.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.name}</span>
                          {entry.badge && <span>{entry.badge}</span>}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Vous</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {entry.rank <= 3 ? "Top performer" : "Participant actif"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Récompenses du top 3 */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-purple-500/10 border border-amber-500/30">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Récompenses du Top 3
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥇</div>
                    <p className="text-sm font-medium">1ère place</p>
                    <p className="text-amber-500 font-bold">3,000 crédits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥈</div>
                    <p className="text-sm font-medium">2ème place</p>
                    <p className="text-gray-400 font-bold">1,500 crédits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥉</div>
                    <p className="text-sm font-medium">3ème place</p>
                    <p className="text-amber-700 font-bold">750 crédits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Défis passés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PAST_CHALLENGES.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                        {challenge.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">#{challenge.yourRank}</p>
                        <p className="text-xs text-muted-foreground">
                          sur {challenge.totalParticipants}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        +{challenge.reward} crédits
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommunityChallenges;
