import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Zap,
  Globe,
  Activity,
} from "lucide-react";

interface StatItem {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  suffix?: string;
}

export function LiveStats() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: "views",
      label: "Vues totales",
      value: 45678,
      change: 12.5,
      icon: Eye,
      color: "text-blue-400",
    },
    {
      id: "engagement",
      label: "Engagement",
      value: 8.7,
      change: 2.3,
      icon: Heart,
      color: "text-rose",
      suffix: "%",
    },
    {
      id: "followers",
      label: "Nouveaux abonnés",
      value: 234,
      change: 18.2,
      icon: Users,
      color: "text-emerald-400",
    },
    {
      id: "posts",
      label: "Posts publiés",
      value: 47,
      change: 5.0,
      icon: Share2,
      color: "text-violet-light",
    },
  ]);

  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.id === "engagement" 
          ? Math.round((stat.value + (Math.random() - 0.5) * 0.2) * 10) / 10
          : Math.round(stat.value + (Math.random() - 0.3) * 10),
        change: Math.round((stat.change + (Math.random() - 0.5) * 2) * 10) / 10,
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-violet-light" />
            {isLive && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
              />
            )}
          </div>
          <h3 className="font-semibold text-white">Statistiques en direct</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            Mis à jour {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isLive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/5 text-white/60 border border-white/10"
            }`}
          >
            {isLive ? "🟢 Live" : "⏸️ Pause"}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            layout
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.change >= 0 ? "text-emerald-400" : "text-rose"
              }`}>
                <TrendingUp className={`w-3 h-3 ${stat.change < 0 ? "rotate-180" : ""}`} />
                {stat.change >= 0 ? "+" : ""}{stat.change}%
              </div>
            </div>
            <div className="space-y-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl font-bold text-white"
                >
                  {formatNumber(stat.value)}{stat.suffix || ""}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-white/60">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini chart simulation */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">Performance 7 derniers jours</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet" />
              Vues
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose" />
              Engagement
            </span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-20">
          {[65, 45, 78, 52, 89, 67, 95].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-violet to-rose opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-white/40">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveStats;
