import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  Target,
  Calendar,
  Briefcase,
  TrendingUp,
  Check,
  Sparkles,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  icon: React.ReactNode;
  options: {
    id: string;
    label: string;
    description: string;
    value: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "objective",
    question: "Quel est votre objectif principal sur LinkedIn ?",
    description: "Cela nous aide à personnaliser vos recommandations",
    icon: <Target className="w-8 h-8" />,
    options: [
      {
        id: "visibility",
        label: "Augmenter ma visibilité",
        description: "Développer mon personal branding",
        value: "visibility"
      },
      {
        id: "leads",
        label: "Générer des leads",
        description: "Attirer des clients potentiels",
        value: "leads"
      },
      {
        id: "recruitment",
        label: "Recruter des talents",
        description: "Attirer les meilleurs candidats",
        value: "recruitment"
      },
      {
        id: "network",
        label: "Développer mon réseau",
        description: "Créer des connexions de qualité",
        value: "network"
      }
    ]
  },
  {
    id: "frequency",
    question: "À quelle fréquence souhaitez-vous publier ?",
    description: "Nous adapterons vos objectifs en conséquence",
    icon: <Calendar className="w-8 h-8" />,
    options: [
      {
        id: "daily",
        label: "Tous les jours",
        description: "7 posts par semaine",
        value: "daily"
      },
      {
        id: "frequent",
        label: "3-5 fois par semaine",
        description: "Présence régulière",
        value: "frequent"
      },
      {
        id: "weekly",
        label: "1-2 fois par semaine",
        description: "Qualité avant quantité",
        value: "weekly"
      },
      {
        id: "occasional",
        label: "Occasionnellement",
        description: "Quand j'ai quelque chose à dire",
        value: "occasional"
      }
    ]
  },
  {
    id: "industry",
    question: "Dans quel secteur travaillez-vous ?",
    description: "Pour des contenus adaptés à votre industrie",
    icon: <Briefcase className="w-8 h-8" />,
    options: [
      {
        id: "tech",
        label: "Tech / Digital",
        description: "Startups, SaaS, IA, Dev",
        value: "tech"
      },
      {
        id: "consulting",
        label: "Conseil / Services",
        description: "Consulting, coaching, formation",
        value: "consulting"
      },
      {
        id: "finance",
        label: "Finance / Immobilier",
        description: "Banque, assurance, investissement",
        value: "finance"
      },
      {
        id: "other",
        label: "Autre secteur",
        description: "Industrie, santé, commerce...",
        value: "other"
      }
    ]
  },
  {
    id: "experience",
    question: "Quel est votre niveau sur LinkedIn ?",
    description: "Pour adapter nos conseils à votre expérience",
    icon: <TrendingUp className="w-8 h-8" />,
    options: [
      {
        id: "beginner",
        label: "Débutant",
        description: "Je commence à publier",
        value: "beginner"
      },
      {
        id: "intermediate",
        label: "Intermédiaire",
        description: "Je publie régulièrement",
        value: "intermediate"
      },
      {
        id: "advanced",
        label: "Avancé",
        description: "J'ai une audience établie",
        value: "advanced"
      },
      {
        id: "expert",
        label: "Expert / Influenceur",
        description: "+10K followers",
        value: "expert"
      }
    ]
  }
];

interface ProfileQuizProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip?: () => void;
}

export function ProfileQuiz({ onComplete, onSkip }: ProfileQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;

  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOption(optionId);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (isLastStep) {
      // Lancer les confettis
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete(answers);
    } else {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSelectedOption(answers[QUIZ_QUESTIONS[currentStep - 1].id] || null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Personnalisation avancée</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentStep + 1} sur {QUIZ_QUESTIONS.length}
              </p>
            </div>
          </div>
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Passer
            </Button>
          )}
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Question Card */}
        <Card className="glass-card border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
          <CardContent className="relative p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Question Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    {currentQuestion.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {currentQuestion.question}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentQuestion.description}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id, option.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedOption === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/50 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">
                            {option.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        {selectedOption === option.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                className={isLastStep ? "bg-gradient-to-r from-primary to-purple-500" : ""}
              >
                {isLastStep ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {QUIZ_QUESTIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index < currentStep) {
                  setCurrentStep(index);
                  setSelectedOption(answers[QUIZ_QUESTIONS[index].id] || null);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50 cursor-pointer"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </motion.div>
      </div>
    </div>
  );
}

// Hook pour gérer l'état du quiz
export function useProfileQuiz() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const completeQuiz = (answers: Record<string, string>) => {
    localStorage.setItem("linkedagents_quiz_answers", JSON.stringify(answers));
    setQuizAnswers(answers);
    setShowQuiz(false);
  };

  const skipQuiz = () => {
    setShowQuiz(false);
  };

  // Charger les réponses existantes
  useState(() => {
    const saved = localStorage.getItem("linkedagents_quiz_answers");
    if (saved) {
      setQuizAnswers(JSON.parse(saved));
    }
  });

  return {
    showQuiz,
    quizAnswers,
    startQuiz,
    completeQuiz,
    skipQuiz
  };
}

// Fonction pour obtenir les recommandations basées sur les réponses du quiz
export function getQuizRecommendations(answers: Record<string, string>) {
  const recommendations: string[] = [];

  // Recommandations basées sur l'objectif
  switch (answers.objective) {
    case "visibility":
      recommendations.push("Publiez du contenu éducatif et inspirant");
      recommendations.push("Utilisez des carrousels pour plus d'engagement");
      break;
    case "leads":
      recommendations.push("Partagez des études de cas et témoignages");
      recommendations.push("Incluez des CTA subtils dans vos posts");
      break;
    case "recruitment":
      recommendations.push("Montrez la culture de votre entreprise");
      recommendations.push("Partagez des témoignages d'employés");
      break;
    case "network":
      recommendations.push("Commentez activement les posts de votre secteur");
      recommendations.push("Posez des questions pour engager la conversation");
      break;
  }

  // Recommandations basées sur la fréquence
  switch (answers.frequency) {
    case "daily":
      recommendations.push("Utilisez l'Auto-Publish pour maintenir le rythme");
      break;
    case "frequent":
      recommendations.push("Planifiez vos posts à l'avance avec le calendrier");
      break;
    case "weekly":
      recommendations.push("Concentrez-vous sur des posts longs et détaillés");
      break;
    case "occasional":
      recommendations.push("Privilégiez la qualité et le storytelling");
      break;
  }

  // Recommandations basées sur le niveau
  switch (answers.experience) {
    case "beginner":
      recommendations.push("Commencez par le Coaching IA pour progresser");
      break;
    case "intermediate":
      recommendations.push("Testez l'A/B Testing pour optimiser vos posts");
      break;
    case "advanced":
      recommendations.push("Explorez les Live Analytics pour affiner votre stratégie");
      break;
    case "expert":
      recommendations.push("Utilisez les agents autonomes pour scaler");
      break;
  }

  return recommendations;
}
