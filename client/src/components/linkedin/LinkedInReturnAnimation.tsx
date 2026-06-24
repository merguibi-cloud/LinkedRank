import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Bot, CheckCircle2, Linkedin, XCircle } from "lucide-react";
import { useEffect } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "La connexion LinkedIn a échoué. Réessayez.",
  auth_init_failed: "Impossible de démarrer la connexion LinkedIn.",
  invalid_state: "Session expirée. Relancez la connexion.",
  missing_params: "Réponse LinkedIn incomplète.",
  session_required: "Connectez-vous d'abord à LinkedAgents.",
  user_not_found: "Compte introuvable.",
  access_denied: "Vous avez refusé l'accès LinkedIn.",
};

interface LinkedInReturnAnimationProps {
  type: "success" | "error";
  errorCode?: string;
  profileName?: string | null;
  onComplete: () => void;
}

export function LinkedInReturnAnimation({
  type,
  errorCode,
  profileName,
  onComplete,
}: LinkedInReturnAnimationProps) {
  const errorMessage =
    (errorCode && ERROR_MESSAGES[errorCode]) ||
    errorCode ||
    "Une erreur est survenue lors de la connexion.";

  useEffect(() => {
    if (type !== "success") return;

    const duration = 2200;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#0077B5", "#8b5cf6", "#f43f5e", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#0077B5", "#8b5cf6", "#f43f5e", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    const timer = window.setTimeout(onComplete, 3200);
    return () => window.clearTimeout(timer);
  }, [type, onComplete]);

  useEffect(() => {
    if (type !== "error") return;
    const timer = window.setTimeout(onComplete, 4000);
    return () => window.clearTimeout(timer);
  }, [type, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#0077B5]/15 blur-[120px]" />
          <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-violet/20 blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center px-6 max-w-md text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {type === "success" ? (
            <>
              <div className="relative mb-8">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ gap: 48 }}
                  animate={{ gap: 12 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose"
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Bot className="h-7 w-7 text-white" />
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </motion.div>

                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0077B5]"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Linkedin className="h-7 w-7 text-white" />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="absolute -inset-4 rounded-3xl border border-emerald-500/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                />
              </div>

              <motion.h1
                className="text-2xl sm:text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                LinkedIn connecté !
              </motion.h1>

              <motion.p
                className="mt-3 text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                {profileName ? (
                  <>
                    Bienvenue <span className="text-white font-medium">{profileName}</span> —
                    vous pouvez publier depuis LinkedAgents.
                  </>
                ) : (
                  "Votre compte est lié. Vous pouvez publier directement depuis LinkedAgents."
                )}
              </motion.p>
            </>
          ) : (
            <>
              <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <XCircle className="h-10 w-10 text-red-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-white">Connexion interrompue</h1>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{errorMessage}</p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
