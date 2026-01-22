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
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";

interface DailyChallenge {
  id: string;
  title: string;
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
}

export function GamificationWidget() {
  const [, setLocation] = useLocation();
  const [xp, setXp] = useState(4850);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(12);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const [dailyChallenges] = useState<DailyChallenge[]>([
    { id: "1", title: "Publier un post", progress: 1, target: 1, xpReward: 100, completed: true },
    { id: "2", title: "Répondre à 5 commentaires", progress: 3, target: 5, xpReward: 75, completed: false },
    { id: "3", title: "Envoyer 3 invitations", progress: 2, target: 3, xpReward: 50, completed: false }
  ]);

  const LEVELS = [
    { level: 1, name: "Débutant", minXp: 0, maxXp: 500 },
    { level: 2, name: "Apprenti", minXp: 500, maxXp: 1500 },
    { level: 3, name: "Créateur", minXp: 1500, maxXp: 3500 },
    { level: 4, name: "Expert", minXp: 3500, maxXp: 7000 },
    { level: 5, name: "Maître", minXp: 7000, maxXp: 12000 },
    { level: 6, name: "Champion", minXp: 12000, maxXp: 20000 },
    { level: 7, name: "Légende", minXp: 20000, maxXp: 35000 },
    { level: 8, name: "Icône", minXp: 35000, maxXp: 50000 },
    { level: 9, name: "Influenceur", minXp: 50000, maxXp: 100000 },
    { level: 10, name: "Titan LinkedIn", minXp: 100000, maxXp: 999999 }
  ];

  const currentLevel = LEVELS.find(l => xp >= l.minXp && xp < l.maxXp) || LEVELS[0];
  const xpProgress = ((xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp)) * 100;
  const xpToNextLevel = currentLevel.maxXp - xp;

  const completedChallenges = dailyChallenges.filter(c => c.completed).length;
  const totalChallenges = dailyChallenges.length;

  return (
    <Card className="glass-card border-primary/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
      <CardContent className="relative p-4">
        {/* Header avec niveau et XP */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{level}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{currentLevel.name}</p>
              <p className="text-xs text-muted-foreground">{xp.toLocaleString()} XP</p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{streak}</span>
          </div>
        </div>

        {/* Barre de progression XP */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progression</span>
            <span className="text-primary font-medium">{xpToNextLevel.toLocaleString()} XP restants</span>
          </div>
          <div className="relative">
            <Progress value={xpProgress} className="h-2" />
          </div>
        </div>

        {/* Défis du jour */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Défis du jour
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {completedChallenges}/{totalChallenges}
            </Badge>
          </div>
          <div className="space-y-2">
            {dailyChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`flex items-center justify-between p-2 rounded-lg ${challenge.completed ? "bg-green-500/10" : "bg-secondary/30"}`}
              >
                <div className="flex items-center gap-2">
                  {challenge.completed ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{challenge.progress}/{challenge.target}</span>
                    </div>
                  )}
                  <span className={`text-xs ${challenge.completed ? "text-green-400 line-through" : "text-foreground"}`}>
                    {challenge.title}
                  </span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${challenge.completed ? "bg-green-500/10 text-green-400" : ""}`}>
                  +{challenge.xpReward} XP
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton voir plus */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => setLocation("/gamification")}
        >
          Voir tous les défis et badges
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
