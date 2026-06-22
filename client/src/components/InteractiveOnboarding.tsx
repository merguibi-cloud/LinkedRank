import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSelector, USER_PROFILES, type UserProfile } from "./ProfileSelector";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  label: string;
  title: string;
  description: string;
  points: string[];
  action?: {
    label: string;
    href: string;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    label: "Introduction",
    title: "Bienvenue sur LinkedAgents",
    description:
      "Une plateforme pour structurer votre présence LinkedIn — création, publication et suivi, au même endroit.",
    points: [
      "Workflow guidé de la idée à la publication",
      "Contenu calibré sur votre secteur",
      "Planification aux créneaux les plus efficaces",
    ],
  },
  {
    id: "generator",
    label: "Création",
    title: "Produisez du contenu rapidement",
    description:
      "Le générateur vous accompagne en quatre étapes : configuration, rédaction, visuel et publication.",
    points: [
      "Posts, carrousels et visuels en un flux unique",
      "Ton et style ajustables",
      "Inspiration depuis les meilleurs créateurs de votre niche",
    ],
    action: { label: "Ouvrir le générateur", href: "/generate" },
  },
  {
    id: "autopublish",
    label: "Publication",
    title: "Programmez vos posts",
    description:
      "Connectez LinkedIn une fois, puis laissez la plateforme publier selon votre calendrier.",
    points: [
      "Créneaux personnalisés par jour et par heure",
      "Suggestions basées sur votre audience",
      "Publication sans action manuelle",
    ],
    action: { label: "Configurer la publication", href: "/auto-publish" },
  },
  {
    id: "dashboard",
    label: "Analyse",
    title: "Mesurez ce qui fonctionne",
    description:
      "Un tableau de bord clair pour suivre votre activité et ajuster votre stratégie.",
    points: [
      "Vue d'ensemble de vos publications",
      "Historique et statut de chaque post",
      "Recommandations adaptées à votre profil",
    ],
    action: { label: "Voir le dashboard", href: "/dashboard" },
  },
];

const STEP_LABELS = [...ONBOARDING_STEPS.map((s) => s.label), "Profil"];

interface InteractiveOnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

function StepProgress({
  current,
  total,
  onStepClick,
}: {
  current: number;
  total: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onStepClick(index)}
          aria-label={`Étape ${index + 1} : ${STEP_LABELS[index]}`}
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            index === current ? "w-8 bg-foreground" : "w-4",
            index < current ? "bg-foreground/40" : index === current ? "" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

function OnboardingStepContent({ step }: { step: OnboardingStep }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl md:text-[1.65rem] font-semibold text-foreground font-sans leading-snug tracking-tight">
          {step.title}
        </h2>
        <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-lg">
          {step.description}
        </p>
      </div>

      <ul className="space-y-3 border-t border-border/50 pt-6">
        {step.points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-sm text-foreground/80 leading-relaxed"
          >
            <span className="mt-2 h-px w-3 shrink-0 bg-foreground/30" aria-hidden />
            {point}
          </li>
        ))}
      </ul>

      {step.action && (
        <a
          href={step.action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors border-b border-transparent hover:border-foreground/30 pb-px"
        >
          {step.action.label}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

export function InteractiveOnboarding({ onComplete, onSkip }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = ONBOARDING_STEPS.length + 1;
  const isProfileStep = currentStep === ONBOARDING_STEPS.length;
  const activeStep = !isProfileStep ? ONBOARDING_STEPS[currentStep] : null;

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedProfile) return;

    setIsCompleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onComplete(selectedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card border border-border/60 sm:rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-border/40">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-foreground font-sans tracking-tight">
                  LinkedAgents
                </p>
                <StepProgress
                  current={currentStep}
                  total={totalSteps}
                  onStepClick={goToStep}
                />
              </div>
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -mr-2"
              >
                Passer
              </button>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-8 py-8 min-h-[340px]">
              <AnimatePresence mode="wait">
                {!isProfileStep && activeStep ? (
                  <motion.div
                    key={activeStep.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-muted-foreground mb-6 tabular-nums">
                      {String(currentStep + 1).padStart(2, "0")}{" "}
                      <span className="text-muted-foreground/40 mx-1">/</span>{" "}
                      {String(totalSteps).padStart(2, "0")}
                      <span className="mx-2 text-muted-foreground/30">·</span>
                      {activeStep.label}
                    </p>
                    <OnboardingStepContent step={activeStep} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProfileSelector
                      onSelect={setSelectedProfile}
                      selectedProfile={selectedProfile?.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-border/40 bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-muted-foreground hover:text-foreground -ml-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>

              {!isProfileStep ? (
                <Button size="sm" onClick={handleNext} className="rounded-lg px-5">
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  disabled={!selectedProfile || isCompleting}
                  className="rounded-lg px-5"
                >
                  {isCompleting ? "Finalisation…" : "Terminer"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Hook pour gérer l'état de l'onboarding
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("auth_token") || document.cookie.includes("auth");

    const hasCompletedOnboarding =
      localStorage.getItem("linkedagents_onboarding_completed") ||
      localStorage.getItem("linkedrank_voice_onboarding_completed");
    const savedProfile = localStorage.getItem("linkedagents_user_profile");

    if (isLoggedIn && !hasCompletedOnboarding && window.location.pathname !== "/onboarding") {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }

    if (savedProfile) {
      const profile = USER_PROFILES.find((p) => p.id === savedProfile);
      if (profile) {
        setUserProfile(profile);
      }
    }
  }, []);

  const completeOnboarding = (profile: UserProfile) => {
    localStorage.setItem("linkedagents_onboarding_completed", "true");
    localStorage.setItem("linkedagents_user_profile", profile.id);
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("linkedagents_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("linkedagents_onboarding_completed");
    localStorage.removeItem("linkedagents_user_profile");
    setUserProfile(null);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    userProfile,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
