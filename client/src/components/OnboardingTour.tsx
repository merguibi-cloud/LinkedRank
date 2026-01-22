import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Zap, Target, 
  Rocket, CheckCircle2, Trophy, Bot, BarChart3, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPath?: string;
  highlight?: string;
  action?: string;
  tip?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur LinkedAgents ! 🚀",
    description: "Découvrez comment créer du contenu LinkedIn qui performe grâce à l'IA. Ce tour rapide vous montrera les fonctionnalités clés.",
    icon: <Sparkles className="w-8 h-8" />,
    tip: "Durée estimée : 2 minutes",
  },
  {
    id: "generator",
    title: "Générateur de Posts IA",
    description: "Créez des posts LinkedIn engageants en quelques secondes. Choisissez un thème, un ton, et laissez l'IA faire le reste.",
    icon: <Zap className="w-8 h-8" />,
    targetPath: "/generator",
    action: "Générer mon premier post",
    tip: "Astuce : Utilisez le ton 'Inspirant' pour plus d'engagement",
  },
  {
    id: "agents",
    title: "Agents IA Autonomes",
    description: "5 agents spécialisés travaillent pour vous : génération de contenu, détection de tendances, analyse de performance...",
    icon: <Bot className="w-8 h-8" />,
    targetPath: "/agents",
    action: "Découvrir les agents",
    tip: "Activez le mode autonome pour une publication automatique",
  },
  {
    id: "carousels",
    title: "Créateur de Carrousels",
    description: "Transformez vos idées en carrousels LinkedIn professionnels. Design moderne, export PDF inclus.",
    icon: <Target className="w-8 h-8" />,
    targetPath: "/carousels",
    action: "Créer un carrousel",
    tip: "Les carrousels génèrent 3x plus d'engagement que les posts texte",
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Analysez le potentiel viral de vos posts, trouvez les meilleurs horaires de publication, et suivez vos concurrents.",
    icon: <BarChart3 className="w-8 h-8" />,
    targetPath: "/analytics",
    action: "Voir les analytics",
    tip: "Publiez entre 8h-9h ou 17h-18h pour maximiser la portée",
  },
  {
    id: "schedule",
    title: "Planification & Auto-Publish",
    description: "Planifiez vos publications à l'avance et laissez LinkedAgents publier automatiquement pour vous.",
    icon: <Calendar className="w-8 h-8" />,
    targetPath: "/schedule",
    action: "Planifier mes posts",
    tip: "Configurez une routine de 3 posts/semaine pour commencer",
  },
  {
    id: "complete",
    title: "Vous êtes prêt ! 🎉",
    description: "Vous avez découvert les fonctionnalités essentielles. Commencez à créer du contenu qui performe !",
    icon: <Trophy className="w-8 h-8" />,
    action: "Commencer maintenant",
    tip: "+100 XP bonus pour avoir complété le tour !",
  },
];

export function OnboardingTour({ 
  isOpen, 
  onClose,
  onComplete 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  
  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;
  
  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      onClose();
      // Navigate to generator to start
      setLocation("/generator");
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  const handleGoToStep = (path: string) => {
    onClose();
    setLocation(path);
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-white/10 rounded-3xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-violet to-rose"
            />
          </div>
          
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {/* Content */}
          <div className="p-8 pt-12">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentStep 
                      ? "w-8 bg-gradient-to-r from-violet to-rose" 
                      : i < currentStep 
                        ? "bg-violet" 
                        : "bg-white/20"
                  )}
                />
              ))}
            </div>
            
            {/* Icon */}
            <motion.div
              key={step.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center text-white"
            >
              {step.icon}
            </motion.div>
            
            {/* Title & Description */}
            <motion.div
              key={`content-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-3">
                {step.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
            
            {/* Tip */}
            {step.tip && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-3 rounded-xl bg-violet/10 border border-violet/20"
              >
                <p className="text-sm text-violet-light flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  {step.tip}
                </p>
              </motion.div>
            )}
            
            {/* Action button for specific steps */}
            {step.targetPath && !isLastStep && (
              <Button
                onClick={() => handleGoToStep(step.targetPath!)}
                variant="outline"
                className="w-full mb-4 border-violet/30 hover:bg-violet/10"
              >
                {step.action}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstStep}
                className={cn(isFirstStep && "invisible")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
              
              <Button
                onClick={handleNext}
                className="btn-gradient"
              >
                {isLastStep ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    {step.action}
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
            
            {/* Skip link */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Passer le tour
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  
  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (completed) {
      setHasCompletedTour(true);
    }
  }, []);
  
  const startTour = () => setShowTour(true);
  const closeTour = () => setShowTour(false);
  
  const completeTour = () => {
    localStorage.setItem("onboarding_completed", "true");
    setHasCompletedTour(true);
    setShowTour(false);
  };
  
  const resetTour = () => {
    localStorage.removeItem("onboarding_completed");
    setHasCompletedTour(false);
  };
  
  return {
    showTour,
    hasCompletedTour,
    startTour,
    closeTour,
    completeTour,
    resetTour,
  };
}

// Floating help button
export function OnboardingHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-violet to-rose text-white font-medium shadow-lg shadow-violet/25 hover:shadow-violet/40 transition-shadow"
    >
      <Sparkles className="w-5 h-5" />
      <span className="hidden sm:inline">Besoin d'aide ?</span>
    </motion.button>
  );
}
