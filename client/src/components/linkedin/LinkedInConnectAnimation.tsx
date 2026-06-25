import { motion } from "framer-motion";
import { Bot, Linkedin, Lock, Shield } from "lucide-react";

const PHASE_LABELS = [
  "Connexion sécurisée en cours...",
  "Redirection vers LinkedIn...",
  "Autorisez l'accès pour publier vos contenus",
];

interface LinkedInConnectAnimationProps {
  phase: number;
  onSkip?: () => void;
}

export function LinkedInConnectAnimation({
  phase,
  onSkip,
}: LinkedInConnectAnimationProps) {
  const label = PHASE_LABELS[Math.min(phase, PHASE_LABELS.length - 1)];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0077B5]/15 via-background to-violet/20" />
      <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#0077B5]/20 blur-[100px] animate-pulse" />
      <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-violet/25 blur-[90px] animate-pulse" />

      <div className="relative z-10 flex flex-col items-center px-6 max-w-md text-center">
        <div className="relative flex items-center justify-center w-full h-32 mb-10">
          {/* Ligne de connexion */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 120"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M 70 60 L 250 60"
              stroke="url(#linkGradient)"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <defs>
              <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#0077B5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Particule voyageuse */}
          <motion.div
            className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-lg shadow-[#0077B5]/50"
            initial={{ left: "18%", top: "50%" }}
            animate={{ left: ["18%", "82%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ marginTop: -5 }}
          />

          {/* Logo LinkedAgents */}
          <motion.div
            className="absolute left-[8%] flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose shadow-xl shadow-violet/30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <Bot className="h-8 w-8 text-white" />
          </motion.div>

          {/* Logo LinkedIn */}
          <motion.div
            className="absolute right-[8%] flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0077B5] shadow-xl shadow-[#0077B5]/40"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.25 }}
          >
            <Linkedin className="h-8 w-8 text-white" />
          </motion.div>

          {/* Anneaux pulsants */}
          <motion.div
            className="absolute left-[8%] h-16 w-16 rounded-2xl border-2 border-violet/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-[8%] h-16 w-16 rounded-2xl border-2 border-[#0077B5]/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        <motion.h1
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold text-white mb-3"
        >
          {label}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          OAuth2 sécurisé — vos identifiants ne sont jamais stockés en clair
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-4 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Chiffré
          </span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-violet-light" />
            RGPD
          </span>
        </motion.div>

        <div className="mt-10 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet to-[#0077B5] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.8, ease: "easeInOut" }}
          />
        </div>

        {onSkip && (
          <motion.button
            type="button"
            onClick={onSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-muted-foreground hover:text-white hover:underline transition-colors"
          >
            Passer pour l'instant
          </motion.button>
        )}
      </div>
    </div>
  );
}
