import { motion } from "framer-motion";
import { Bot, Calendar, Clock, Linkedin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { UpcomingPublication } from "./UpcomingPublicationsView";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function getCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

interface UpcomingCountdownHeroProps {
  next: UpcomingPublication;
}

export function UpcomingCountdownHero({ next }: UpcomingCountdownHeroProps) {
  const target = new Date(next.scheduledFor);
  const [countdown, setCountdown] = useState(() => getCountdown(target));

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [next.scheduledFor]);

  const units = [
    { value: countdown.days, label: "jours" },
    { value: countdown.hours, label: "heures" },
    { value: countdown.minutes, label: "min" },
    { value: countdown.seconds, label: "sec" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/15 via-background to-[#0077B5]/10 p-6 sm:p-8 mb-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 h-48 w-48 rounded-full bg-violet/20 blur-[80px] animate-pulse" />
        <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-[#0077B5]/15 blur-[70px] animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Animation LinkedIn-style */}
          <div className="relative flex items-center justify-center w-full lg:w-48 h-28 shrink-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80" fill="none" aria-hidden>
              <motion.path
                d="M 30 40 Q 100 10 170 40"
                stroke="url(#countdownGrad)"
                strokeWidth="2"
                strokeDasharray="5 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2 }}
              />
              <defs>
                <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#0077B5" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              className="absolute"
              animate={{ left: ["12%", "50%", "82%"], top: ["35%", "8%", "35%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-light" />
            </motion.div>

            <motion.div
              className="absolute left-[8%] flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose shadow-lg shadow-violet/30"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="h-6 w-6 text-white" />
            </motion.div>

            <motion.div
              className="absolute right-[8%] flex h-12 w-12 items-center justify-center rounded-xl bg-[#0077B5] shadow-lg shadow-[#0077B5]/30"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            >
              <Linkedin className="h-6 w-6 text-white" />
            </motion.div>
          </div>

          {/* Countdown */}
          <div className="flex-1 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-violet-light mb-1 flex items-center justify-center lg:justify-start gap-2"
            >
              <Clock className="h-4 w-4" />
              Prochaine publication dans
            </motion.p>

            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 my-4">
              {units.map((unit, i) => (
                <motion.div
                  key={unit.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    key={unit.value}
                    initial={{ y: -4, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl border border-white/15 bg-white/5 backdrop-blur"
                  >
                    <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                      {pad(unit.value)}
                    </span>
                  </motion.div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 uppercase tracking-wide">
                    {unit.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm"
            >
              <span className="text-white font-medium capitalize">{next.dayLabel}</span>
              <span className="text-muted-foreground">à</span>
              <span className="text-white font-medium">{next.timeLabel}</span>
              {next.status === "projected" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Génération IA automatique
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Barre de progression animée */}
        <div className="mt-6 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-violet via-rose to-[#0077B5] rounded-full"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
