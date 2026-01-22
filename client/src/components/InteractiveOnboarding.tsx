import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  X,
  Sparkles,
  Bot,
  PenTool,
  BarChart3,
  Zap,
  Trophy,
  Target,
  Check,
  Play,
  Rocket,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProfileSelector, USER_PROFILES, type UserProfile } from "./ProfileSelector";
import confetti from "canvas-confetti";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tips: string[];
  action?: {
    label: string;
    href: string;
  };
}

// Onboarding simplifié en 4 étapes pour une meilleure expérience utilisateur
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur LinkedAgents ! 🎉",
    description: "Votre équipe d'agents IA pour dominer LinkedIn. Créez du contenu viral, publiez automatiquement et analysez vos performances.",
    icon: <Rocket className="w-12 h-12" />,
    color: "from-primary to-purple-500",
    tips: [
      "Agents IA qui travaillent 24/7 pour vous",
      "Contenu personnalisé selon votre secteur",
      "Publication automatique aux meilleurs moments"
    ]
  },
  {
    id: "generator",
    title: "Créez du Contenu en 1 Clic",
    description: "Notre IA analyse les meilleurs posts de votre secteur et génère du contenu optimisé pour l'engagement.",
    icon: <PenTool className="w-12 h-12" />,
    color: "from-pink-500 to-rose-500",
    tips: [
      "Posts, carrousels et images générés par l'IA",
      "Personnalisez le ton et le style",
      "Inspirez-vous des top créateurs"
    ],
    action: { label: "Créer mon premier post", href: "/generate" }
  },
  {
    id: "autopublish",
    title: "Publiez Automatiquement",
    description: "Configurez vos créneaux et laissez LinkedAgents publier pour vous. Plus besoin d'y penser !",
    icon: <Zap className="w-12 h-12" />,
    color: "from-yellow-500 to-orange-500",
    tips: [
      "Choisissez vos jours et heures",
      "L'IA optimise les créneaux",
      "Publiez même en dormant"
    ],
    action: { label: "Configurer Auto-Publish", href: "/auto-publish" }
  },
  {
    id: "dashboard",
    title: "Suivez Vos Performances",
    description: "Dashboard complet avec analytics, badges et récompenses. Progressez et débloquez des fonctionnalités premium.",
    icon: <BarChart3 className="w-12 h-12" />,
    color: "from-green-500 to-emerald-500",
    tips: [
      "Métriques en temps réel",
      "Gagnez des XP et des badges",
      "Conseils personnalisés"
    ],
    action: { label: "Voir mon dashboard", href: "/dashboard" }
  }
];

interface InteractiveOnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

export function InteractiveOnboarding({ onComplete, onSkip }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = ONBOARDING_STEPS.length + 1; // +1 for profile selection
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowProfileSelector(true);
    }
  };

  const handlePrev = () => {
    if (showProfileSelector) {
      setShowProfileSelector(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const handleComplete = async () => {
    if (!selectedProfile) return;
    
    setIsCompleting(true);
    
    // Celebration confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete(selectedProfile);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Guide de démarrage</h1>
              <p className="text-sm text-muted-foreground">
                Étape {showProfileSelector ? totalSteps : currentStep + 1} sur {totalSteps}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            <X className="w-4 h-4 mr-2" />
            Passer
          </Button>
        </div>

        {/* Progress */}
        <Progress value={showProfileSelector ? 100 : progress} className="h-2 mb-6" />

        {/* Content */}
        <AnimatePresence mode="wait">
          {!showProfileSelector ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} opacity-10`} />
                <CardContent className="relative p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left: Icon & Title */}
                    <div className="text-center md:text-left">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className={`inline-flex w-24 h-24 rounded-2xl bg-gradient-to-br ${currentStepData.color} p-1 mb-6`}
                      >
                        <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center text-primary">
                          {currentStepData.icon}
                        </div>
                      </motion.div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        {currentStepData.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {currentStepData.description}
                      </p>
                      
                      {currentStepData.action && (
                        <Button 
                          className="mt-6"
                          onClick={() => window.open(currentStepData.action!.href, "_blank")}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {currentStepData.action.label}
                        </Button>
                      )}
                    </div>
                    
                    {/* Right: Tips */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Ce que vous allez découvrir
                      </h3>
                      {currentStepData.tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-8">
                  <ProfileSelector 
                    onSelect={handleProfileSelect}
                    selectedProfile={selectedProfile?.id}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 && !showProfileSelector}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          {/* Step indicators */}
          <div className="hidden md:flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setShowProfileSelector(false);
                  setCurrentStep(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep && !showProfileSelector
                    ? "w-6 bg-primary"
                    : index < currentStep || showProfileSelector
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
            <button
              onClick={() => setShowProfileSelector(true)}
              className={`w-2 h-2 rounded-full transition-all ${
                showProfileSelector ? "w-6 bg-primary" : "bg-muted"
              }`}
            />
          </div>
          
          {!showProfileSelector ? (
            <Button onClick={handleNext}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!selectedProfile || isCompleting}
              className="bg-gradient-to-r from-primary to-purple-500"
            >
              {isCompleting ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Personnalisation...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Commencer l'aventure
                </>
              )}
            </Button>
          )}
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
    // Vérifier si l'utilisateur est connecté (présence du token)
    const isLoggedIn = localStorage.getItem("auth_token") || document.cookie.includes("auth");
    
    // Vérifier si l'utilisateur a déjà complété l'onboarding
    const hasCompletedOnboarding = localStorage.getItem("linkedagents_onboarding_completed");
    const savedProfile = localStorage.getItem("linkedagents_user_profile");
    
    // Afficher l'onboarding SEULEMENT si l'utilisateur est connecté ET n'a pas complété l'onboarding
    // Pour les visiteurs non connectés, ne pas afficher l'onboarding
    if (isLoggedIn && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
    
    if (savedProfile) {
      const profile = USER_PROFILES.find(p => p.id === savedProfile);
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
    resetOnboarding
  };
}
