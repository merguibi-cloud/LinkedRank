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
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UpcomingCountdownHero } from "./UpcomingCountdownHero";
import { UpcomingEmptyState } from "./UpcomingEmptyState";
import { resolveDisplayImageUrl } from "@/lib/imageUrl";

export interface UpcomingPublication {
  id: string;
  scheduledFor: string;
  type: "queued" | "recurring" | "one_shot";
  status: "pending" | "projected";
  content: string | null;
  imageUrl: string | null;
  source: string | null;
  queueId: number | null;
  generatedPostId: number | null;
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
  compact?: boolean;
  isAutoEnabled?: boolean;
  hasSchedule?: boolean;
  hasObjectives?: boolean;
  refreshToken?: number;
  onToggleAuto?: (enabled: boolean) => void;
  onGoToSchedule?: () => void;
  onGoToObjectives?: () => void;
  onGoToPreview?: () => void;
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

const LOAD_TIMEOUT_MS = 12000;

export function UpcomingPublicationsView({
  days = 7,
  compact = false,
  isAutoEnabled = false,
  hasSchedule = false,
  hasObjectives = false,
  refreshToken = 0,
  onToggleAuto,
  onGoToSchedule,
  onGoToObjectives,
  onGoToPreview,
}: UpcomingPublicationsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [grouped, setGrouped] = useState<UpcomingGroup[]>([]);
  const [publications, setPublications] = useState<UpcomingPublication[]>([]);
  const [meta, setMeta] = useState<UpcomingMeta | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());
  const markImageBroken = (id: string) =>
    setBrokenImageIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const loadUpcoming = useCallback(async () => {
    setLoading(true);
    setError(false);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

    try {
      const res = await fetch(`/api/auto-publish/upcoming?days=${days}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const data = await res.json();

      if (res.ok) {
        setGrouped(data.grouped || []);
        setPublications(data.publications || []);
        setMeta(data.meta || null);
      } else if (res.status === 401) {
        setError(false);
        setGrouped([]);
        setPublications([]);
        setMeta(null);
      } else {
        setError(true);
        setGrouped([]);
        setPublications([]);
      }
    } catch {
      setError(true);
      setGrouped([]);
      setPublications([]);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void loadUpcoming();
    const interval = window.setInterval(loadUpcoming, 60000);
    return () => window.clearInterval(interval);
  }, [loadUpcoming, refreshToken]);

  const nextPublication = useMemo(() => {
    const now = Date.now();
    const upcoming = publications
      .filter((p) => new Date(p.scheduledFor).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      );
    return upcoming[0] ?? null;
  }, [publications]);

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
      <div className="relative flex flex-col items-center justify-center py-20 gap-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-violet/15 blur-[80px] animate-pulse" />
          <div className="absolute right-1/3 bottom-1/3 h-32 w-32 rounded-full bg-rose/10 blur-[60px] animate-pulse" />
        </div>

        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-lg shadow-violet/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Calcul de vos prochaines publications...
        </motion.p>

        <div className="w-40 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full w-1/2 bg-gradient-to-r from-violet to-rose rounded-full"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <p className="text-white font-medium">Impossible de charger les prévisions</p>
        <Button variant="outline" className="border-white/10" onClick={() => void loadUpcoming()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  const totalCount = grouped.reduce((sum, g) => sum + g.items.length, 0);

  if (totalCount === 0) {
    return (
      <UpcomingEmptyState
        isAutoEnabled={isAutoEnabled || (meta?.isEnabled ?? false)}
        hasSchedule={hasSchedule || (meta?.scheduleCount ?? 0) > 0}
        hasObjectives={hasObjectives}
        onToggleAuto={onToggleAuto}
        onGoToSchedule={onGoToSchedule ?? (() => {})}
        onGoToObjectives={onGoToObjectives ?? (() => {})}
        onGoToPreview={onGoToPreview ?? (() => {})}
      />
    );
  }

  return (
    <div className="space-y-6">
      {onToggleAuto && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <div>
            <Label htmlFor="upcoming-auto-toggle" className="text-sm font-medium text-white">
              Publication automatique
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAutoEnabled || meta?.isEnabled
                ? "L'IA publie selon votre planning"
                : "Activée pour lancer les publications récurrentes"}
            </p>
          </div>
          <Switch
            id="upcoming-auto-toggle"
            checked={isAutoEnabled || Boolean(meta?.isEnabled)}
            onCheckedChange={onToggleAuto}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      )}

      {nextPublication && <UpcomingCountdownHero next={nextPublication} />}

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
                : "Activez l'auto-publication pour les créneaux récurrents"}
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
                const isNext = nextPublication?.id === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.06 + itemIndex * 0.04 }}
                    className={`relative rounded-xl border p-4 transition-colors group ${
                      isNext
                        ? "border-violet/40 bg-violet/10 shadow-lg shadow-violet/10"
                        : "border-white/10 bg-white/[0.03] hover:border-violet/30"
                    }`}
                  >
                    <div
                      className={`absolute -left-[21px] top-5 h-3 w-3 rounded-full border-2 border-background ${
                        isNext ? "bg-violet animate-pulse" : "bg-violet"
                      }`}
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">{item.timeLabel}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}
                          >
                            {config.label}
                          </span>
                          {isNext && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet/20 border border-violet/40 text-violet-light">
                              Prochaine
                            </span>
                          )}
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
                            Contenu généré automatiquement à l&apos;heure prévue
                          </p>
                        )}

                        {item.imageUrl && !brokenImageIds.has(item.id) ? (
                          <img
                            src={resolveDisplayImageUrl(item.imageUrl) ?? item.imageUrl}
                            alt=""
                            className="mt-2 h-16 w-24 rounded-lg object-cover border border-white/10"
                            onError={() => markImageBroken(item.id)}
                          />
                        ) : item.imageUrl ? (
                          <div className="mt-2 h-16 w-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        ) : null}
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
    </div>
  );
}

export { UpcomingPublicationsView as default };
