import { useGettingStartedJourney } from "@/hooks/useGettingStartedJourney";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import { Link } from "wouter";

type GettingStartedJourneyProps = {
  variant?: "card" | "compact";
  className?: string;
};

export function GettingStartedJourney({
  variant = "card",
  className,
}: GettingStartedJourneyProps) {
  const {
    steps,
    currentStep,
    progress,
    isLoading,
    showJourney,
    dismiss,
    completedCount,
  } = useGettingStartedJourney();

  if (!showJourney) return null;

  if (variant === "compact") {
    if (!currentStep) return null;
    return (
      <div
        className={cn(
          "rounded-xl border border-violet/30 bg-gradient-to-r from-violet/10 to-rose/5 px-4 py-3",
          className
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-violet-light">
              Étape {currentStep.number} sur {steps.length}
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {currentStep.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {currentStep.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row shrink-0">
            <Link href={currentStep.href}>
              <Button size="sm" className="btn-gradient w-full sm:w-auto">
                {currentStep.cta}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            {currentStep.secondaryAction && (
              <Link href={currentStep.secondaryAction.href}>
                <Button size="sm" variant="outline" className="w-full sm:w-auto border-violet/30">
                  {currentStep.secondaryAction.cta}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet to-rose transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/10 via-card/60 to-rose/5 overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 p-5 md:p-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 text-violet-light text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            Votre parcours en 4 étapes
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {isLoading
              ? "Chargement de votre progression…"
              : currentStep
                ? `Prochaine étape : ${currentStep.title.toLowerCase()}`
                : "Presque terminé !"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            De l'inscription à votre premier post — on vous guide étape par étape.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-muted-foreground hover:text-white p-1 -mr-1 shrink-0"
          aria-label="Masquer le guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 md:px-6 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{completedCount} sur {steps.length} terminées</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-violet to-rose transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Mise à jour…
          </div>
        ) : (
          steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                step.current
                  ? "bg-violet/15 border border-violet/30"
                  : step.completed
                    ? "opacity-70"
                    : "bg-card/30 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  step.completed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : step.current
                      ? "bg-violet text-white"
                      : "bg-white/5 text-muted-foreground"
                )}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.current ? "text-white" : "text-foreground/80"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {step.description}
                </p>
              </div>
              {step.current && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Link href={step.href}>
                    <Button size="sm" className="btn-gradient">
                      {step.cta}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  {step.secondaryAction && (
                    <Link href={step.secondaryAction.href}>
                      <Button size="sm" variant="outline" className="border-violet/30">
                        {step.secondaryAction.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {currentStep && !isLoading && (
          <div className="flex flex-col gap-2 sm:hidden pt-2">
            <Link href={currentStep.href}>
              <Button className="btn-gradient w-full">
                {currentStep.cta}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            {currentStep.secondaryAction && (
              <Link href={currentStep.secondaryAction.href}>
                <Button variant="outline" className="w-full border-violet/30">
                  {currentStep.secondaryAction.cta}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
