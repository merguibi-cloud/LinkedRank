import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLinkedInConnectUrl } from "@/const";
import { PROFILE_ONBOARDING_KEY } from "@/lib/gettingStartedJourney";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const INTRO_STEPS = [
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
] as const;

const QUESTION_LABELS: Record<string, string> = {
  intro: "Activité",
  goals: "Objectifs",
  topics: "Contenu",
  frequency: "Rythme",
};

type Question = {
  id: string;
  question: string;
  options?: readonly string[];
  selectionMode: "none" | "single" | "multiple";
};

function StepProgress({
  current,
  total,
  onStepClick,
  labels,
}: {
  current: number;
  total: number;
  onStepClick: (index: number) => void;
  labels: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onStepClick(index)}
          aria-label={`Étape ${index + 1} : ${labels[index] ?? ""}`}
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

function IntroStepContent({
  step,
}: {
  step: (typeof INTRO_STEPS)[number];
}) {
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

      {"action" in step && step.action && (
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

function QuestionStepContent({
  question,
  textDraft,
  onTextChange,
  selectedAnswer,
  onToggleOption,
  isSelected,
}: {
  question: Question;
  textDraft: string;
  onTextChange: (value: string) => void;
  selectedAnswer: string;
  onToggleOption: (option: string) => void;
  isSelected: (option: string) => boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Personnalisez votre contenu
        </p>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug tracking-tight">
          {question.question}
        </h2>
        {question.selectionMode !== "none" && (
          <p className="text-sm text-muted-foreground">
            {question.selectionMode === "single"
              ? "Sélectionnez une option"
              : "Sélectionnez une ou plusieurs options"}
          </p>
        )}
      </div>

      {question.selectionMode === "none" ? (
        <Textarea
          value={textDraft}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Ex : Consultant marketing freelance, j'accompagne les PME du secteur tech..."
          rows={4}
          className="bg-background/50 border-border/60 resize-none"
          autoFocus
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options?.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onToggleOption(option)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-left transition-all",
                isSelected(option)
                  ? "border-violet bg-violet/15 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-violet/40 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  isSelected(option)
                    ? "border-violet bg-violet text-white"
                    : "border-border"
                )}
              >
                {isSelected(option) && <Check className="w-3 h-3" />}
              </span>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileOnboarding() {
  const utils = trpc.useUtils();

  const { data: questions = [], isLoading: loadingQuestions } =
    trpc.onboarding.getQuestions.useQuery();

  const finalizeMutation = trpc.onboarding.finalize.useMutation({
    onSuccess: async () => {
      localStorage.setItem(PROFILE_ONBOARDING_KEY, "true");
      await utils.onboarding.getStatus.invalidate();
      toast.success("Profil analysé — connectez LinkedIn pour continuer");
      window.location.href = getLinkedInConnectUrl("/dashboard");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'analyse"),
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textDraft, setTextDraft] = useState("");

  const introCount = INTRO_STEPS.length;
  const questionCount = questions.length;
  const totalSteps = introCount + questionCount;
  const isIntroStep = currentStep < introCount;
  const questionIndex = currentStep - introCount;
  const currentQuestion = !isIntroStep
    ? (questions[questionIndex] as Question | undefined)
    : undefined;

  const stepLabels = [
    ...INTRO_STEPS.map((s) => s.label),
    ...questions.map((q) => QUESTION_LABELS[q.id] ?? "Profil"),
  ];

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? "" : "";

  const canContinue = () => {
    if (isIntroStep) return true;
    if (!currentQuestion) return false;
    if (currentQuestion.selectionMode === "none") {
      return textDraft.trim().length >= 10;
    }
    return currentAnswer.trim().length > 0;
  };

  const saveCurrentAnswer = () => {
    if (!currentQuestion) return;
    const value =
      currentQuestion.selectionMode === "none"
        ? textDraft.trim()
        : currentAnswer;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps && index <= currentStep) {
      if (!isIntroStep && currentQuestion) {
        saveCurrentAnswer();
      }
      setCurrentStep(index);
      if (index >= introCount) {
        const q = questions[index - introCount] as Question;
        setTextDraft(
          q.selectionMode === "none" ? answers[q.id] ?? "" : ""
        );
      }
    }
  };

  const handleNext = () => {
    if (!canContinue()) return;

    if (isIntroStep) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((s) => s + 1);
        const nextQ = questions[0] as Question | undefined;
        if (nextQ?.selectionMode === "none") {
          setTextDraft(answers[nextQ.id] ?? "");
        }
      }
      return;
    }

    if (!currentQuestion) return;
    saveCurrentAnswer();

    if (questionIndex < questions.length - 1) {
      const next = questions[questionIndex + 1] as Question;
      setCurrentStep((s) => s + 1);
      setTextDraft(next.selectionMode === "none" ? answers[next.id] ?? "" : "");
      return;
    }

    const payload = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer:
        q.id === currentQuestion.id
          ? currentQuestion.selectionMode === "none"
            ? textDraft.trim()
            : currentAnswer
          : answers[q.id] ?? "",
    }));

    finalizeMutation.mutate({ answers: payload });
  };

  const handleBack = () => {
    if (currentStep === 0) return;

    if (!isIntroStep && currentQuestion) {
      saveCurrentAnswer();
    }

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);

    if (prevStep >= introCount) {
      const prev = questions[prevStep - introCount] as Question;
      setTextDraft(
        prev.selectionMode === "none" ? answers[prev.id] ?? "" : ""
      );
    }
  };

  const handleSkip = () => {
    window.location.href = "/dashboard";
  };

  const toggleOption = (option: string) => {
    if (!currentQuestion || currentQuestion.selectionMode === "none") return;

    if (currentQuestion.selectionMode === "single") {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
      return;
    }

    const existing = (answers[currentQuestion.id] ?? "")
      .split(", ")
      .filter(Boolean);
    const next = existing.includes(option)
      ? existing.filter((o) => o !== option)
      : [...existing, option];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: next.join(", "),
    }));
  };

  const isSelected = (option: string) => {
    if (!currentQuestion) return false;
    if (currentQuestion.selectionMode === "single") {
      return answers[currentQuestion.id] === option;
    }
    return (answers[currentQuestion.id] ?? "").split(", ").includes(option);
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-light" />
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;
  const isSubmitting = finalizeMutation.isPending;
  const stepLabel = isIntroStep
    ? INTRO_STEPS[currentStep].label
    : currentQuestion
      ? QUESTION_LABELS[currentQuestion.id] ?? "Profil"
      : "Profil";

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card border border-border/60 sm:rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-border/40">
              <div className="space-y-3">
                <p className="text-[13px] font-medium text-foreground font-sans tracking-tight">
                  LinkedAgents
                </p>
                <StepProgress
                  current={currentStep}
                  total={totalSteps}
                  onStepClick={goToStep}
                  labels={stepLabels}
                />
              </div>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -mr-2"
              >
                Passer
              </button>
            </div>

            <div className="px-6 sm:px-8 py-8 min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isIntroStep ? INTRO_STEPS[currentStep].id : currentQuestion?.id}
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
                    {stepLabel}
                  </p>

                  {isIntroStep ? (
                    <IntroStepContent step={INTRO_STEPS[currentStep]} />
                  ) : currentQuestion ? (
                    <QuestionStepContent
                      question={currentQuestion}
                      textDraft={textDraft}
                      onTextChange={setTextDraft}
                      selectedAnswer={currentAnswer}
                      onToggleOption={toggleOption}
                      isSelected={isSelected}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-border/40 bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className="text-muted-foreground hover:text-foreground -ml-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canContinue() || isSubmitting}
                className="rounded-lg px-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse IA...
                  </>
                ) : isLastStep && !isIntroStep ? (
                  <>
                    Analyser mon profil
                    <Sparkles className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
