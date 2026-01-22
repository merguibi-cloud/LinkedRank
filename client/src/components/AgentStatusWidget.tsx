import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Bot,
  Sparkles,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "working" | "idle" | "paused";
  lastAction?: string;
  lastActionTime?: string;
  tasksCompleted: number;
  color: string;
}

const agents: Agent[] = [
  {
    id: "lea",
    name: "Léa",
    emoji: "👩‍💻",
    role: "Créatrice de Contenu",
    status: "active",
    lastAction: "Post généré sur l'IA",
    lastActionTime: "Il y a 5 min",
    tasksCompleted: 12,
    color: "from-violet to-purple-600",
  },
  {
    id: "max",
    name: "Max",
    emoji: "🕵️",
    role: "Chasseur de Tendances",
    status: "working",
    lastAction: "Analyse des tendances...",
    lastActionTime: "En cours",
    tasksCompleted: 8,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "emma",
    name: "Emma",
    emoji: "🤝",
    role: "Booster d'Engagement",
    status: "active",
    lastAction: "3 réponses suggérées",
    lastActionTime: "Il y a 12 min",
    tasksCompleted: 45,
    color: "from-gold to-amber-600",
  },
  {
    id: "alex",
    name: "Alex",
    emoji: "🧠",
    role: "Analyste Performance",
    status: "idle",
    lastAction: "Rapport hebdo prêt",
    lastActionTime: "Il y a 2h",
    tasksCompleted: 5,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "sam",
    name: "Sam",
    emoji: "⏰",
    role: "Planificateur",
    status: "active",
    lastAction: "3 posts planifiés",
    lastActionTime: "Il y a 30 min",
    tasksCompleted: 28,
    color: "from-rose to-pink-600",
  },
];

const statusConfig = {
  active: {
    label: "Actif",
    color: "bg-emerald-500",
    icon: CheckCircle2,
  },
  working: {
    label: "En cours",
    color: "bg-gold",
    icon: Zap,
  },
  idle: {
    label: "En attente",
    color: "bg-blue-500",
    icon: Clock,
  },
  paused: {
    label: "Pause",
    color: "bg-white/30",
    icon: AlertCircle,
  },
};

export function AgentStatusWidget() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [animatedTasks, setAnimatedTasks] = useState<Record<string, number>>({});

  useEffect(() => {
    // Animate task counters
    const timers: NodeJS.Timeout[] = [];
    agents.forEach((agent) => {
      let current = 0;
      const increment = Math.ceil(agent.tasksCompleted / 20);
      const timer = setInterval(() => {
        current = Math.min(current + increment, agent.tasksCompleted);
        setAnimatedTasks((prev) => ({ ...prev, [agent.id]: current }));
        if (current >= agent.tasksCompleted) {
          clearInterval(timer);
        }
      }, 50);
      timers.push(timer);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  const activeCount = agents.filter((a) => a.status === "active" || a.status === "working").length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet to-rose">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Votre Équipe IA</h3>
            <p className="text-xs text-white/50">
              {activeCount} agents actifs · {totalTasks} tâches
            </p>
          </div>
        </div>
        <Link href="/agents/meet">
          <span className="text-sm text-violet-light hover:text-violet transition-colors flex items-center gap-1">
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Agent list */}
      <div className="space-y-2">
        {agents.map((agent) => {
          const status = statusConfig[agent.status];
          const isExpanded = expandedAgent === agent.id;

          return (
            <motion.div
              key={agent.id}
              layout
              onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
              className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`relative p-2 rounded-xl bg-gradient-to-br ${agent.color}`}>
                  <span className="text-lg">{agent.emoji}</span>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${status.color} rounded-full border-2 border-background`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{agent.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}/20 text-white/80`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{agent.role}</p>
                </div>

                {/* Tasks count */}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {animatedTasks[agent.id] || 0}
                  </div>
                  <div className="text-[10px] text-white/40">tâches</div>
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Dernière action:</span>
                        <span className="text-white">{agent.lastAction}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-white/60">Quand:</span>
                        <span className="text-white/80">{agent.lastActionTime}</span>
                      </div>
                      <Link href="/agents/meet">
                        <button className="w-full mt-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors">
                          Configurer {agent.name}
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-lg font-bold text-emerald-400">{activeCount}</div>
          <div className="text-[10px] text-white/50">Actifs</div>
        </div>
        <div className="p-3 rounded-xl bg-violet/10 border border-violet/20 text-center">
          <div className="text-lg font-bold text-violet-light">{totalTasks}</div>
          <div className="text-[10px] text-white/50">Tâches</div>
        </div>
        <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-center">
          <div className="text-lg font-bold text-gold">24/7</div>
          <div className="text-[10px] text-white/50">Disponible</div>
        </div>
      </div>
    </div>
  );
}

export default AgentStatusWidget;
