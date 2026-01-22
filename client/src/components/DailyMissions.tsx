import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  MessageSquare, 
  FileText, 
  Heart, 
  Zap,
  Gift,
  Clock,
  CheckCircle2,
  Star,
  Flame,
  Trophy,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  creditsReward: number;
  type: "comment" | "post" | "react" | "engage" | "create";
  progress: number;
  goal: number;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
}

// Missions du jour
const generateDailyMissions = (): Mission[] => [
  {
    id: "mission_1",
    title: "Commentateur actif",
    description: "Laissez 3 commentaires pertinents sur des posts",
    icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
    xpReward: 50,
    creditsReward: 25,
    type: "comment",
    progress: 2,
    goal: 3,
    completed: false,
    difficulty: "easy"
  },
  {
    id: "mission_2",
    title: "Créateur du jour",
    description: "Publiez un post sur LinkedIn",
    icon: <FileText className="w-5 h-5 text-green-500" />,
    xpReward: 100,
    creditsReward: 50,
    type: "post",
    progress: 0,
    goal: 1,
    completed: false,
    difficulty: "medium"
  },
  {
    id: "mission_3",
    title: "Engageur social",
    description: "Réagissez à 10 publications",
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    xpReward: 30,
    creditsReward: 15,
    type: "react",
    progress: 7,
    goal: 10,
    completed: false,
    difficulty: "easy"
  }
];

// Missions bonus
const BONUS_MISSIONS: Mission[] = [
  {
    id: "bonus_1",
    title: "Carrousel Master",
    description: "Créez un carrousel avec au moins 5 slides",
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    xpReward: 200,
    creditsReward: 100,
    type: "create",
    progress: 0,
    goal: 1,
    completed: false,
    difficulty: "hard"
  },
  {
    id: "bonus_2",
    title: "Networking Pro",
    description: "Connectez-vous avec 5 nouvelles personnes",
    icon: <Target className="w-5 h-5 text-amber-500" />,
    xpReward: 150,
    creditsReward: 75,
    type: "engage",
    progress: 3,
    goal: 5,
    completed: false,
    difficulty: "medium"
  }
];

export function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>(generateDailyMissions());
  const [bonusMissions, setBonusMissions] = useState<Mission[]>(BONUS_MISSIONS);
  const [missionStreak, setMissionStreak] = useState(5);
  const [totalXPToday, setTotalXPToday] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Calculer le temps jusqu'au reset
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const completeMission = (missionId: string, isBonusMission: boolean = false) => {
    const updateMissions = isBonusMission ? setBonusMissions : setMissions;
    const missionsList = isBonusMission ? bonusMissions : missions;
    
    const mission = missionsList.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Simuler la complétion
    updateMissions(prev => prev.map(m => 
      m.id === missionId 
        ? { ...m, progress: m.goal, completed: true }
        : m
    ));

    // Ajouter les XP
    setTotalXPToday(prev => prev + mission.xpReward);

    // Animation confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    toast.success(
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <div>
          <p className="font-semibold">Mission complétée !</p>
          <p className="text-sm text-muted-foreground">
            +{mission.xpReward} XP | +{mission.creditsReward} crédits
          </p>
        </div>
      </div>
    );

    // Vérifier si toutes les missions quotidiennes sont complétées
    const allCompleted = missions.filter(m => m.id !== missionId).every(m => m.completed);
    if (allCompleted && !isBonusMission) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 }
        });
        toast.success(
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold">Toutes les missions complétées ! 🎉</p>
              <p className="text-sm text-muted-foreground">
                Bonus de streak : +100 XP
              </p>
            </div>
          </div>
        );
        setTotalXPToday(prev => prev + 100);
        setMissionStreak(prev => prev + 1);
      }, 1000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "medium": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "hard": return "bg-red-500/20 text-red-500 border-red-500/30";
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

  const completedCount = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{completedCount}/{totalMissions}</p>
                <p className="text-xs text-muted-foreground">Missions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{totalXPToday}</p>
                <p className="text-xs text-muted-foreground">XP aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{missionStreak}</p>
                <p className="text-xs text-muted-foreground">Jours de streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{timeUntilReset}</p>
                <p className="text-xs text-muted-foreground">Avant reset</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression globale */}
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-amber-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Progression du jour</h3>
              <p className="text-sm text-muted-foreground">
                Complétez toutes les missions pour un bonus de streak !
              </p>
            </div>
            <Badge className={completedCount === totalMissions ? "bg-green-500" : "bg-primary"}>
              {completedCount === totalMissions ? "Complété !" : `${completedCount}/${totalMissions}`}
            </Badge>
          </div>
          <Progress value={(completedCount / totalMissions) * 100} className="h-3" />
          
          {completedCount === totalMissions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">Félicitations !</p>
                  <p className="text-sm text-muted-foreground">
                    Vous avez complété toutes les missions du jour. Revenez demain !
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Missions quotidiennes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Missions du jour
          </CardTitle>
          <CardDescription>
            Complétez ces 3 missions pour gagner des XP et des crédits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all ${
                mission.completed 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-secondary/20 border-border/30 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  mission.completed ? "bg-green-500/20" : "bg-primary/20"
                }`}>
                  {mission.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    mission.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{mission.title}</h4>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {getDifficultyLabel(mission.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {mission.description}
                  </p>
                  
                  {!mission.completed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{mission.progress}/{mission.goal}</span>
                      </div>
                      <Progress 
                        value={(mission.progress / mission.goal) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold mb-1">
                    <Zap className="w-4 h-4" />
                    +{mission.xpReward} XP
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <Gift className="w-3 h-3" />
                    +{mission.creditsReward}
                  </div>
                  
                  {!mission.completed && mission.progress >= mission.goal && (
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => completeMission(mission.id)}
                    >
                      Réclamer
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Missions bonus */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Missions bonus
            <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
              Optionnel
            </Badge>
          </CardTitle>
          <CardDescription>
            Des défis supplémentaires pour les plus motivés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bonusMissions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all ${
                mission.completed 
                  ? "bg-purple-500/10 border-purple-500/30" 
                  : "bg-secondary/20 border-border/30 hover:border-purple-500/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  mission.completed ? "bg-purple-500/20" : "bg-purple-500/10"
                }`}>
                  {mission.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-purple-500" />
                  ) : (
                    mission.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{mission.title}</h4>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {getDifficultyLabel(mission.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {mission.description}
                  </p>
                  
                  {!mission.completed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{mission.progress}/{mission.goal}</span>
                      </div>
                      <Progress 
                        value={(mission.progress / mission.goal) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-purple-500 font-semibold mb-1">
                    <Zap className="w-4 h-4" />
                    +{mission.xpReward} XP
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <Gift className="w-3 h-3" />
                    +{mission.creditsReward}
                  </div>
                  
                  {!mission.completed && mission.progress >= mission.goal && (
                    <Button 
                      size="sm" 
                      className="mt-2 bg-purple-500 hover:bg-purple-600"
                      onClick={() => completeMission(mission.id, true)}
                    >
                      Réclamer
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Streak bonus info */}
      <Card className="glass-card border-orange-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Streak de missions : {missionStreak} jours 🔥</h3>
              <p className="text-sm text-muted-foreground">
                Complétez toutes les missions quotidiennes pour maintenir votre streak et gagner des bonus !
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                  +10% XP par jour de streak
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  Prochain palier : 7 jours
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DailyMissions;
