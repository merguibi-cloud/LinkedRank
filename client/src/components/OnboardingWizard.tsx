import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Rocket,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  BarChart3,
  Play,
  Star,
} from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tips: string[];
  action?: {
    label: string;
    href: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Bienvenue sur LinkedAgents ! 🎉",
    description: "Découvrez comment vos agents IA vont transformer votre présence LinkedIn en quelques minutes.",
    icon: Rocket,
    color: "from-violet to-purple-600",
    tips: [
      "LinkedAgents utilise 5 agents IA spécialisés",
      "Chaque agent a une mission précise",
      "Vous gardez le contrôle total sur les publications",
    ],
  },
  {
    id: 2,
    title: "Rencontrez votre équipe IA",
    description: "5 agents travaillent 24/7 pour développer votre présence LinkedIn.",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    tips: [
      "👩‍💻 Léa - Crée du contenu captivant",
      "🕵️ Max - Détecte les tendances virales",
      "🤝 Emma - Booste votre engagement",
      "🧠 Alex - Analyse vos performances",
      "⏰ Sam - Planifie au meilleur moment",
    ],
    action: {
      label: "Rencontrer mon équipe",
      href: "/agents/meet",
    },
  },
  {
    id: 3,
    title: "Générez votre premier post",
    description: "Laissez Léa créer un post LinkedIn personnalisé en quelques secondes.",
    icon: Sparkles,
    color: "from-gold to-amber-600",
    tips: [
      "Choisissez une thématique qui vous passionne",
      "Sélectionnez le ton qui vous correspond",
      "L'IA s'adapte à votre style unique",
    ],
    action: {
      label: "Générer un post",
      href: "/generate",
    },
  },
  {
    id: 4,
    title: "Analysez et optimisez",
    description: "Utilisez le prédicteur de viralité pour maximiser l'impact de vos posts.",
    icon: BarChart3,
    color: "from-blue-500 to-cyan-600",
    tips: [
      "Score de viralité en temps réel",
      "Suggestions d'amélioration personnalisées",
      "Estimations de vues et d'engagement",
    ],
    action: {
      label: "Voir les analytics",
      href: "/analytics/advanced",
    },
  },
  {
    id: 5,
    title: "Vous êtes prêt ! 🚀",
    description: "Votre équipe d'agents IA est maintenant à votre service. Commencez à dominer LinkedIn !",
    icon: Star,
    color: "from-rose to-pink-600",
    tips: [
      "Publiez régulièrement pour maximiser la visibilité",
      "Engagez avec votre communauté",
      "Analysez vos performances chaque semaine",
    ],
    action: {
      label: "Aller au Dashboard",
      href: "/dashboard",
    },
  },
];

interface OnboardingWizardProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function OnboardingWizard({ onComplete, forceShow = false }: OnboardingWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("linkedagents_onboarding_completed");
    if (!hasCompletedOnboarding || forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("linkedagents_onboarding_completed", "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("linkedagents_onboarding_completed", "true");
    setIsOpen(false);
    onComplete?.();
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-violet to-rose"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 pt-8 pb-4">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-gradient-to-r from-violet to-rose"
                    : index < currentStep
                    ? "bg-violet"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${step.color} mb-6`}>
                  <step.icon className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
                  {step.description}
                </p>

                {/* Tips */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8">
                  <div className="space-y-3">
                    {step.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 text-left"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-white/80">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                {step.action && (
                  <a
                    href={step.action.href}
                    onClick={handleComplete}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors mb-6"
                  >
                    <Play className="w-4 h-4" />
                    {step.action.label}
                  </a>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              <span className="text-white/40 text-sm">
                {currentStep + 1} / {onboardingSteps.length}
              </span>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-violet to-rose hover:opacity-90"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    Terminer
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Passer l'introduction
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OnboardingWizard;
