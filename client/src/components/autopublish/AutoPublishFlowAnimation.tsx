import { motion } from "framer-motion";
import { Bot, Linkedin, Sparkles, Send, Loader2 } from "lucide-react";

const PHASE_LABELS: Record<string, string[]> = {
  generating: [
    "Analyse de votre configuration...",
    "Génération du contenu par l'IA...",
    "Optimisation pour LinkedIn...",
  ],
  publishing: [
    "Connexion à LinkedIn...",
    "Publication en cours...",
    "Diffusion sur votre réseau...",
  ],
  scheduling: [
    "Enregistrement du post...",
    "Planification automatique...",
    "Ajout à votre calendrier...",
  ],
};

export type AutoPublishFlowPhase =
  | "generating"
  | "publishing"
  | "scheduling";

interface AutoPublishFlowAnimationProps {
  phase: AutoPublishFlowPhase;
  phaseIndex?: number;
}

export function AutoPublishFlowAnimation({
  phase,
  phaseIndex = 0,
}: AutoPublishFlowAnimationProps) {
  const labels = PHASE_LABELS[phase];
  const label = labels[Math.min(phaseIndex, labels.length - 1)];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet/15 via-background to-[#0077B5]/15" />
      <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-violet/20 blur-[100px] animate-pulse" />
      <div className="absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-[#0077B5]/20 blur-[90px] animate-pulse" />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-md text-center">
        <div className="relative flex items-center justify-center w-full h-36 mb-8">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 140"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M 60 70 Q 160 30 260 70"
              stroke="url(#publishGradient)"
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.2 }}
            />
            <defs>
              <linearGradient id="publishGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#0077B5" />
              </linearGradient>
            </defs>
          </svg>

          <motion.div
            className="absolute"
            style={{ left: "12%", top: "42%" }}
            animate={{ left: ["12%", "50%", "78%"], top: ["42%", "18%", "42%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-4 w-4 text-violet-light" />
          </motion.div>

          <motion.div
            className="absolute left-[8%] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-xl shadow-violet/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="h-7 w-7 text-white" />
          </motion.div>

          <motion.div
            className="absolute left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {phase === "generating" ? (
              <Sparkles className="h-5 w-5 text-violet-light" />
            ) : (
              <Send className="h-5 w-5 text-rose" />
            )}
          </motion.div>

          <motion.div
            className="absolute right-[8%] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0077B5] shadow-xl shadow-[#0077B5]/40"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Linkedin className="h-7 w-7 text-white" />
          </motion.div>
        </div>

        <motion.h2
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold text-white mb-2"
        >
          {label}
        </motion.h2>

        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-light" />
          {phase === "generating"
            ? "L'IA adapte le contenu à vos objectifs"
            : phase === "scheduling"
              ? "Votre post sera publié automatiquement"
              : "Publication sécurisée via OAuth"}
        </p>

        <div className="mt-8 w-56 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet via-rose to-[#0077B5] rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
