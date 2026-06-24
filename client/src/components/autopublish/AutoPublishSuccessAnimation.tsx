import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Linkedin, Calendar, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface AutoPublishSuccessAnimationProps {
  title?: string;
  message?: string;
  onComplete: () => void;
}

export function AutoPublishSuccessAnimation({
  title = "Publié sur LinkedIn !",
  message = "Votre contenu est en ligne. Vos agents continuent de travailler pour vous.",
  onComplete,
}: AutoPublishSuccessAnimationProps) {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#0077B5", "#8b5cf6", "#f43f5e", "#10b981"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#0077B5", "#8b5cf6", "#f43f5e", "#10b981"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    const timer = window.setTimeout(onComplete, 2800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center px-6 max-w-md text-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0077B5] shadow-xl shadow-[#0077B5]/40">
              <Linkedin className="h-10 w-10 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 border-4 border-background"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.35 }}
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mt-3 text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function AutoPublishScheduledAnimation({
  dateLabel,
  timeLabel,
  onComplete,
}: {
  dateLabel: string;
  timeLabel: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2500);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center px-6 max-w-sm text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
      >
        <motion.div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Calendar className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Post planifié !</h2>
        <p className="mt-2 text-muted-foreground">
          Publication automatique le{" "}
          <span className="text-white font-medium">{dateLabel}</span> à{" "}
          <span className="text-white font-medium">{timeLabel}</span>
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-violet-light">
          <Sparkles className="h-4 w-4" />
          L'IA publiera pour vous au bon moment
        </div>
      </motion.div>
    </motion.div>
  );
}
