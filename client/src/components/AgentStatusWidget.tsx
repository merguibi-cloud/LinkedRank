import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Bot,
  CheckCircle2,
  Clock,
  ChevronRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { AGENTS_ROSTER, COLOR_CLASSES } from "@/lib/agentsRoster";

const statusConfig = {
  available: {
    label: "Disponible",
    color: "bg-emerald-500",
    icon: CheckCircle2,
  },
  coming_soon: {
    label: "Arrive bientôt",
    color: "bg-amber-500/80",
    icon: Clock,
  },
};

export function AgentStatusWidget() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const availableAgents = AGENTS_ROSTER.filter(a => a.availability === "available");
  const availableCount = availableAgents.length;
  const comingSoonAgents = AGENTS_ROSTER.filter(a => a.availability === "coming_soon");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 shadow-lg shadow-violet-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Votre Équipe IA</h3>
            <p className="text-xs text-white/50">
              {availableCount} agent{availableCount > 1 ? "s" : ""} disponible{availableCount > 1 ? "s" : ""} · {comingSoonAgents.length} bientôt
            </p>
          </div>
        </div>
        <Link href="/meet-the-agents">
          <span className="text-sm text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1">
            Voir l&apos;équipe
            <ChevronRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      <div className="space-y-2">
        {availableAgents.map(agent => (
          <Link key={agent.id} href={agent.ctaHref ?? "/generate"}>
            <div className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              agent.id === "scheduler"
                ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/30 hover:border-amber-400/50"
                : "bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 border-violet-500/30 hover:border-violet-400/50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${agent.gradient} text-xl shadow-md`}>
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{agent.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Disponible
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{agent.role}</p>
                </div>
                <Sparkles className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                  agent.id === "scheduler" ? "text-amber-400" : "text-violet-400"
                }`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {comingSoonAgents.map(agent => {
          const status = statusConfig.coming_soon;
          const colors = COLOR_CLASSES[agent.color];
          const isExpanded = expandedAgent === agent.id;

          return (
            <motion.div
              key={agent.id}
              layout
              onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
              className="group p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 cursor-pointer transition-all opacity-75 hover:opacity-90"
            >
              <div className="flex items-center gap-3">
                <div className={`relative p-2 rounded-xl bg-gradient-to-br ${agent.gradient} grayscale-[40%]`}>
                  <span className="text-lg">{agent.emoji}</span>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${status.color} rounded-full border-2 border-background`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white/80">{agent.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/50 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{agent.role}</p>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <p className="text-sm text-white/50 mb-2">{agent.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.skills.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${colors.border} ${colors.text} bg-black/20`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentStatusWidget;
