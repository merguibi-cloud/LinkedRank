import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Target,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserProfile, useProfileTips } from "@/contexts/UserProfileContext";

interface PersonalizedTipsProps {
  feature: string;
  compact?: boolean;
}

export function PersonalizedTips({ feature, compact = false }: PersonalizedTipsProps) {
  const { profile } = useUserProfile();
  const tips = useProfileTips(feature);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Rotation automatique des conseils
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex(prev => (prev + 1) % tips.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

  if (!profile || tips.length === 0 || isDismissed) {
    return null;
  }

  const nextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex(prev => (prev - 1 + tips.length) % tips.length);
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">
            {tips[currentTipIndex]}
          </p>
        </div>
        {tips.length > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={prevTip} className="p-1 hover:bg-primary/20 rounded">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground">
              {currentTipIndex + 1}/{tips.length}
            </span>
            <button onClick={nextTip} className="p-1 hover:bg-primary/20 rounded">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="glass-card border-primary/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                Conseil pour vous
                <Badge variant="outline" className="text-[10px] py-0">
                  {profile.name}
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground">
                Personnalisé selon votre profil
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
          >
            <Star className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{tips[currentTipIndex]}</p>
          </motion.div>
        </AnimatePresence>

        {tips.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <Button variant="ghost" size="sm" onClick={prevTip}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <div className="flex gap-1">
              {tips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTipIndex ? "w-4 bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={nextTip}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Widget de bienvenue personnalisé
export function WelcomeWidget() {
  const { profile } = useUserProfile();
  const [isVisible, setIsVisible] = useState(true);

  if (!profile || !isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-primary/30 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradient} opacity-30`} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-background/50 border border-border/50 flex items-center justify-center ${profile.color}`}>
                {profile.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Bienvenue, {profile.name} ! 👋
                </h3>
                <p className="text-muted-foreground mt-1">
                  Votre expérience LinkedAgents est personnalisée pour vous aider à atteindre vos objectifs.
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <Target className="w-5 h-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Vos objectifs</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {profile.objectives.map((obj, i) => (
                  <li key={i}>• {obj}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <Sparkles className="w-5 h-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Fonctionnalités recommandées</h4>
              <div className="flex flex-wrap gap-1">
                {profile.recommendedFeatures.map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <Lightbulb className="w-5 h-5 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">Premier conseil</h4>
              <p className="text-xs text-muted-foreground">
                {profile.tips[0]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
