import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { resolvePostAuthRedirect } from "@/lib/postAuthGate";
import { PROFILE_ONBOARDING_KEY } from "@/lib/gettingStartedJourney";
import { cn } from "@/lib/utils";
import {
  Bot,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Hash,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

const WELCOME_STEP = {
  id: "welcome",
  label: "Bienvenue",
  title: "Bienvenue sur LinkedAgents",
  description:
    "Quelques questions pour calibrer votre contenu sur votre activité.",
  chips: [
    { icon: Sparkles, label: "Contenu généré par IA" },
    { icon: Calendar, label: "Publication planifiée" },
    { icon: BarChart3, label: "Suivi de performance" },
  ],
} as const;

const INTRO_STEPS = [WELCOME_STEP] as const;

const QUESTION_ICONS: Record<string, typeof Briefcase> = {
  intro: Briefcase,
  goals: Target,
  topics: Hash,
  frequency: Calendar,
};

type Question = {
  id: string;
  question: string;
  options?: readonly string[];
  selectionMode: "none" | "single" | "multiple";
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet to-rose"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Étape {current + 1} sur {total}
      </p>
    </div>
  );
}

function WelcomeStepContent() {
  return (
    <div className="space-y-7 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-lg shadow-violet/30"
      >
        <Bot className="h-8 w-8 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white leading-snug tracking-tight">
          {WELCOME_STEP.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {WELCOME_STEP.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {WELCOME_STEP.chips.map((chip, index) => {
          const Icon = chip.icon;
          return (
            <motion.span
              key={chip.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-violet-light" />
              {chip.label}
            </motion.span>
          );
        })}
      </div>
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
  const Icon = QUESTION_ICONS[question.id] ?? Briefcase;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-rose/20">
          <Icon className="h-5 w-5 text-violet-light" />
        </div>
        <h2 className="text-xl font-semibold text-white text-center leading-snug tracking-tight">
          {question.question}
        </h2>
        {question.selectionMode !== "none" && (
          <p className="text-sm text-muted-foreground text-center">
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
          className="bg-white/5 border-white/10 resize-none focus:border-violet/50"
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
                "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-left transition-all",
                isSelected(option)
                  ? "border-violet bg-violet/15 text-white shadow-sm shadow-violet/20"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-violet/40 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isSelected(option)
                    ? "border-violet bg-violet text-white"
                    : "border-white/20"
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

  const [isCompleting, setIsCompleting] = useState(false);

  const finalizeMutation = trpc.onboarding.finalize.useMutation({
    onSuccess: async () => {
      localStorage.setItem(PROFILE_ONBOARDING_KEY, "true");
      setIsCompleting(true);
      // Let Onboarding.tsx's own effect — reacting to this status refetch —
      // decide what comes next (LinkedIn connect, if needed, then dashboard)
      // through the shared gate, instead of redirecting from here too. The
      // "isCompleting" screen covers the gap while that resolves (it checks
      // onboarding + LinkedIn status, each a network round trip) so the
      // user isn't left looking at the last question while it works.
      await utils.onboarding.getStatus.invalidate();
    },
    onError: (err) => {
      setIsCompleting(false);
      toast.error(err.message || "Erreur lors de l'analyse");
    },
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
    // Mark the profile step as settled so the post-auth gate doesn't keep
    // routing the user back here on every future login.
    localStorage.setItem(PROFILE_ONBOARDING_KEY, "true");
    void resolvePostAuthRedirect("/dashboard", utils).then(destination => {
      window.location.href = destination;
    });
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

  if (isCompleting) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-violet/15 via-background to-rose/10" />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-violet/20 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-rose/15 blur-[90px]" />

        <div className="relative min-h-full flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-lg shadow-violet/30"
            >
              <Check className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">Profil configuré !</h2>
            <p className="text-sm text-muted-foreground">
              Préparation de votre espace...
            </p>
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-violet-light" />
          </motion.div>
        </div>
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;
  const isSubmitting = finalizeMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-violet/15 via-background to-rose/10" />
      <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-violet/20 blur-[100px]" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-rose/15 blur-[90px]" />

      <div className="relative min-h-full flex items-end sm:items-center justify-center p-0 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl sm:rounded-2xl shadow-2xl shadow-violet/10 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-white/10">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-rose">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">LinkedAgents</span>
                </div>
                <ProgressBar current={currentStep} total={totalSteps} />
              </div>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground hover:text-white transition-colors px-2 py-1 shrink-0"
              >
                Passer
              </button>
            </div>

            <div className="px-6 sm:px-8 py-8 min-h-[320px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isIntroStep ? INTRO_STEPS[currentStep].id : currentQuestion?.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {isIntroStep ? (
                    <WelcomeStepContent />
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

            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-white/10 bg-white/[0.02]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className="text-muted-foreground hover:text-white -ml-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canContinue() || isSubmitting}
                className="btn-gradient rounded-lg px-5"
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
                ) : isIntroStep ? (
                  <>
                    Commencer
                    <ChevronRight className="w-4 h-4 ml-1" />
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
