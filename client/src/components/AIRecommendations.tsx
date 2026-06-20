import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Users,
  Lightbulb,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Zap,
  Calendar,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
  id: string;
  type: "content" | "timing" | "engagement" | "growth";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  impact: string;
  icon: React.ElementType;
}

const recommendations: Recommendation[] = [];

const typeColors = {
  content: { bg: "bg-violet/10", text: "text-violet-light", border: "border-violet/20" },
  timing: { bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/20" },
  engagement: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/20" },
  growth: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
};

const priorityLabels = {
  high: { label: "Priorité haute", color: "text-rose" },
  medium: { label: "Priorité moyenne", color: "text-gold" },
  low: { label: "Optionnel", color: "text-white/50" },
};

export function AIRecommendations() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeRecommendations = recommendations.filter(
    (r) => !dismissedIds.includes(r.id) && !completedIds.includes(r.id)
  );

  const handleDismiss = (id: string) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const handleComplete = (id: string) => {
    setCompletedIds([...completedIds, id]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDismissedIds([]);
      setCompletedIds([]);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            Recommandations IA
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Actions personnalisées pour booster vos performances
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Recommendations list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activeRecommendations.map((rec, index) => {
            const colors = typeColors[rec.type];
            const priority = priorityLabels[rec.priority];

            return (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl bg-white/5 border ${colors.border} hover:bg-white/[0.07] transition-colors`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <rec.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <span className={`text-xs ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet to-rose hover:opacity-90"
                        onClick={() => handleComplete(rec.id)}
                      >
                        {rec.action}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {rec.impact}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleComplete(rec.id)}
                      className="p-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 transition-colors"
                      title="Marquer comme fait"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      title="Ignorer"
                    >
                      <X className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {activeRecommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Pas encore de recommandations
            </h4>
            <p className="text-sm text-white/60 mb-4">
              Générez des posts et connectez LinkedIn pour recevoir des suggestions personnalisées basées sur votre activité.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/generate"}>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer un post
            </Button>
          </motion.div>
        )}
      </div>

      {/* Completed section */}
      {completedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-400/5 border border-emerald-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-emerald-400">
              {completedIds.length} action(s) complétée(s)
            </span>
          </div>
          <p className="text-sm text-white/60">
            Excellent travail ! Continuez comme ça pour maximiser votre croissance.
          </p>
        </div>
      )}
    </div>
  );
}

export default AIRecommendations;
