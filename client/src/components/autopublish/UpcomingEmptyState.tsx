import { motion } from "framer-motion";
import { Bot, Calendar, ChevronRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UpcomingEmptyStateProps {
  isAutoEnabled: boolean;
  hasSchedule: boolean;
  hasObjectives?: boolean;
  onToggleAuto?: (enabled: boolean) => void;
  onGoToSchedule: () => void;
  onGoToObjectives: () => void;
  onGoToPreview: () => void;
}

export function UpcomingEmptyState({
  isAutoEnabled,
  hasSchedule,
  hasObjectives = false,
  onToggleAuto,
  onGoToSchedule,
  onGoToObjectives,
  onGoToPreview,
}: UpcomingEmptyStateProps) {
  const steps = [
    {
      icon: Sparkles,
      title: "Définir vos objectifs",
      desc: "Secteur, ton, types de contenu",
      done: hasObjectives,
      action: onGoToObjectives,
    },
    {
      icon: Calendar,
      title: "Configurer le planning",
      desc: "Choisissez jours et heures de publication",
      done: hasSchedule,
      action: onGoToSchedule,
    },
    {
      icon: Zap,
      title: "Activer l'auto-publication",
      desc: "L'IA publie pour vous automatiquement",
      done: isAutoEnabled,
      action: () => (onToggleAuto ? onToggleAuto(!isAutoEnabled) : onGoToSchedule()),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-dashed border-violet/30 bg-gradient-to-br from-violet/5 via-transparent to-rose/5 p-8 sm:p-12 text-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-xl shadow-violet/25"
        >
          <Bot className="h-10 w-10 text-white" />
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Aucune publication prévue
        </h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Créez votre première automatisation en 3 étapes. Votre agent IA préparera
          et publiera sur LinkedIn — vous verrez ici le compte à rebours.
        </p>

        {onToggleAuto && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] mb-8 text-left">
            <div>
              <Label htmlFor="empty-auto-toggle" className="text-sm font-medium text-white">
                Publication automatique
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAutoEnabled ? "Active — publications selon le planning" : "Inactive — activez quand vous êtes prêt"}
              </p>
            </div>
            <Switch
              id="empty-auto-toggle"
              checked={isAutoEnabled}
              onCheckedChange={onToggleAuto}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        )}

        <div className="space-y-3 mb-8 text-left">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.button
                key={step.title}
                type="button"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={step.action}
                className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-violet/40 ${
                  step.done
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-white/[0.03] hover:bg-violet/5"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    step.done
                      ? "bg-emerald-500/20"
                      : "bg-gradient-to-br from-violet/20 to-rose/20"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${step.done ? "text-emerald-400" : "text-violet-light"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="btn-gradient" onClick={onGoToSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Configurer le planning
          </Button>
          <Button variant="outline" className="border-white/10" onClick={onGoToPreview}>
            Tester un aperçu manuel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
