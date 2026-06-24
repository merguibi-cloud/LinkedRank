import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  FileText,
  Bot,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface UpcomingPublication {
  id: string;
  scheduledFor: string;
  type: "queued" | "recurring" | "one_shot";
  status: "pending" | "projected";
  content: string | null;
  imageUrl: string | null;
  source: string | null;
  queueId: number | null;
  dayLabel: string;
  timeLabel: string;
  relativeLabel: string;
}

interface UpcomingGroup {
  dateKey: string;
  dayLabel: string;
  items: UpcomingPublication[];
}

interface UpcomingMeta {
  isEnabled: boolean;
  scheduleCount: number;
  pendingCount: number;
  projectedCount: number;
  days: number;
}

interface UpcomingPublicationsViewProps {
  days?: number;
  onRefresh?: () => void;
  compact?: boolean;
}

const TYPE_CONFIG = {
  queued: {
    label: "Planifié",
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  recurring: {
    label: "Auto récurrent",
    icon: Bot,
    color: "text-violet-light",
    bg: "bg-violet/10 border-violet/30",
  },
  one_shot: {
    label: "Date précise",
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
};

export function UpcomingPublicationsView({
  days = 7,
  onRefresh,
  compact = false,
}: UpcomingPublicationsViewProps) {
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<UpcomingGroup[]>([]);
  const [meta, setMeta] = useState<UpcomingMeta | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadUpcoming = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auto-publish/upcoming?days=${days}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setGrouped(data.grouped || []);
        setMeta(data.meta || null);
        onRefresh?.();
      }
    } catch {
      toast.error("Impossible de charger les publications à venir");
    } finally {
      setLoading(false);
    }
  }, [days, onRefresh]);

  useEffect(() => {
    void loadUpcoming();
    const interval = window.setInterval(loadUpcoming, 60000);
    return () => window.clearInterval(interval);
  }, [loadUpcoming]);

  const handleCancel = async (queueId: number) => {
    setCancellingId(queueId);
    try {
      const res = await fetch(`/api/schedule/${queueId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Publication annulée");
        await loadUpcoming();
      } else {
        toast.error("Impossible d'annuler");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-rose/20"
        >
          <Sparkles className="h-6 w-6 text-violet-light" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Prévision de vos publications...</p>
      </div>
    );
  }

  const totalCount = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-6">
      {!compact && meta && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            {
              label: "À venir",
              value: totalCount,
              icon: Calendar,
              color: "from-violet to-rose",
            },
            {
              label: "Planifiés",
              value: meta.pendingCount,
              icon: FileText,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "Auto IA",
              value: meta.projectedCount,
              icon: Bot,
              color: "from-emerald-500 to-teal-500",
            },
            {
              label: "Créneaux",
              value: meta.scheduleCount,
              icon: Clock,
              color: "from-amber-500 to-orange-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}
              >
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-light" />
              Publications des {days} prochains jours
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta?.isEnabled
                ? "L'IA génère et publie automatiquement selon votre configuration"
                : "Activez l'auto-publication pour voir les créneaux projetés"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadUpcoming()}
            className="border-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      )}

      {totalCount === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10">
            <Calendar className="h-7 w-7 text-violet-light" />
          </div>
          <p className="text-white font-medium">Aucune publication prévue</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Configurez votre planning et activez l'auto-publication, ou planifiez un
            aperçu depuis l'onglet « Aperçu & Test ».
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group, groupIndex) => (
            <motion.div
              key={group.dateKey}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.06 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span className="text-sm font-medium text-violet-light capitalize shrink-0">
                  {group.dayLabel}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-violet/20">
                {group.items.map((item, itemIndex) => {
                  const config = TYPE_CONFIG[item.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.06 + itemIndex * 0.04 }}
                      className="relative rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-violet/30 transition-colors group"
                    >
                      <div className="absolute -left-[21px] top-5 h-3 w-3 rounded-full bg-violet border-2 border-background" />

                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white">
                              {item.timeLabel}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}
                            >
                              {config.label}
                            </span>
                            {item.status === "projected" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                IA auto
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {item.relativeLabel}
                            </span>
                          </div>

                          {item.content ? (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {item.content}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2 italic flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-violet-light" />
                              Contenu généré automatiquement à l'heure prévue
                            </p>
                          )}

                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="mt-2 h-16 w-24 rounded-lg object-cover border border-white/10"
                            />
                          )}
                        </div>

                        {item.queueId && item.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                            disabled={cancellingId === item.queueId}
                            onClick={() => void handleCancel(item.queueId!)}
                          >
                            {cancellingId === item.queueId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export { UpcomingPublicationsView as default };
