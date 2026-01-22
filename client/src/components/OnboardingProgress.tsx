import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChevronRight, 
  User, 
  Link2, 
  Bot, 
  Sparkles,
  X,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

export function OnboardingProgress() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "profile",
      title: "Complétez votre profil",
      description: "Ajoutez votre photo et bio",
      icon: User,
      completed: true,
    },
    {
      id: "linkedin",
      title: "Connectez LinkedIn",
      description: "Autorisez la publication",
      icon: Link2,
      completed: true,
    },
    {
      id: "agent",
      title: "Activez un agent IA",
      description: "Choisissez votre premier agent",
      icon: Bot,
      completed: false,
      action: () => window.location.href = "/agents",
      actionLabel: "Activer",
    },
    {
      id: "generate",
      title: "Générez votre premier post",
      description: "Laissez l'IA créer pour vous",
      icon: Sparkles,
      completed: false,
      action: () => window.location.href = "/generate",
      actionLabel: "Générer",
    },
  ]);

  useEffect(() => {
    // Check if onboarding should be shown
    const onboardingDismissed = localStorage.getItem("onboardingDismissed");
    const completedSteps = steps.filter(s => s.completed).length;
    
    if (!onboardingDismissed && completedSteps < steps.length) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("onboardingDismissed", "true");
  };

  const handleComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className={cn(
          "fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-48px)]",
          "rounded-2xl bg-card border border-white/10 shadow-2xl overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-violet/20 to-rose/20 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              <h3 className="font-semibold text-white">Démarrage rapide</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isMinimized ? "rotate-90" : "-rotate-90"
                  )} 
                />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {completedCount}/{steps.length}
            </span>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      step.completed 
                        ? "bg-emerald/10 border border-emerald/20" 
                        : "bg-white/5 border border-white/10 hover:border-violet/30"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      step.completed 
                        ? "bg-emerald/20" 
                        : "bg-violet/20"
                    )}>
                      {step.completed ? (
                        <Check className="w-4 h-4 text-emerald" />
                      ) : (
                        <step.icon className="w-4 h-4 text-violet-light" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        step.completed ? "text-emerald line-through" : "text-white"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>

                    {!step.completed && step.action && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={step.action}
                        className="text-violet-light hover:text-white hover:bg-violet/20"
                      >
                        {step.actionLabel}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Reward hint */}
              {completedCount < steps.length && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
                    <p className="text-xs text-gold text-center">
                      🎁 Complétez toutes les étapes pour débloquer 50 crédits bonus !
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
