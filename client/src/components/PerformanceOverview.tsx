import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  Zap,
  Target,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const metrics: MetricCard[] = [
  {
    label: "Impressions totales",
    value: "245.8K",
    change: 23.5,
    icon: Eye,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    label: "Engagement moyen",
    value: "8.7%",
    change: 12.3,
    icon: Heart,
    color: "text-rose",
    bgColor: "bg-rose/10",
  },
  {
    label: "Commentaires",
    value: "1,234",
    change: -5.2,
    icon: MessageSquare,
    color: "text-violet-light",
    bgColor: "bg-violet/10",
  },
  {
    label: "Partages",
    value: "567",
    change: 45.8,
    icon: Share2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
];

const weeklyData = [
  { day: "Lun", posts: 2, engagement: 8.5 },
  { day: "Mar", posts: 1, engagement: 7.2 },
  { day: "Mer", posts: 3, engagement: 12.1 },
  { day: "Jeu", posts: 2, engagement: 9.8 },
  { day: "Ven", posts: 1, engagement: 6.5 },
  { day: "Sam", posts: 0, engagement: 0 },
  { day: "Dim", posts: 1, engagement: 5.2 },
];

const topPerformingPosts = [
  {
    id: 1,
    excerpt: "🚀 Il y a 3 ans, j'ai quitté mon CDI...",
    views: 45678,
    engagement: 12.3,
  },
  {
    id: 2,
    excerpt: "L'IA va-t-elle remplacer les créateurs ?...",
    views: 34567,
    engagement: 10.8,
  },
  {
    id: 3,
    excerpt: "5 erreurs que j'aurais aimé éviter...",
    views: 23456,
    engagement: 9.5,
  },
];

export function PerformanceOverview() {
  const maxEngagement = Math.max(...weeklyData.map((d) => d.engagement));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-light" />
            Vue d'ensemble
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Performances des 30 derniers jours
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/50">Période:</span>
          <select className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet/50">
            <option value="30">30 jours</option>
            <option value="7">7 jours</option>
            <option value="90">90 jours</option>
          </select>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.change >= 0 ? "text-emerald-400" : "text-rose"
                }`}
              >
                {metric.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-white/50">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-4">
          Engagement cette semaine
        </h4>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: day.engagement > 0
                    ? `${(day.engagement / maxEngagement) * 100}%`
                    : "4px",
                }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`w-full rounded-t-lg ${
                  day.engagement > 0
                    ? "bg-gradient-to-t from-violet to-violet-light"
                    : "bg-white/10"
                }`}
              />
              <span className="text-xs text-white/50">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            <span className="text-white font-medium">10 posts</span> publiés
          </div>
          <div className="text-sm text-white/60">
            Engagement moyen:{" "}
            <span className="text-emerald-400 font-medium">8.5%</span>
          </div>
        </div>
      </div>

      {/* Top performing posts */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold" />
          Posts les plus performants
        </h4>
        <div className="space-y-3">
          {topPerformingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? "bg-gold/20 text-gold"
                    : index === 1
                    ? "bg-gray-400/20 text-gray-400"
                    : "bg-amber-700/20 text-amber-700"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{post.excerpt}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {(post.views / 1000).toFixed(1)}K vues
                </div>
                <div className="text-xs text-emerald-400">
                  {post.engagement}% engagement
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-emerald-400">Point fort</span>
          </div>
          <p className="text-sm text-white/80">
            Vos posts du mercredi performent 40% mieux que la moyenne
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet/10 to-violet/5 border border-violet/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-violet-light" />
            <span className="font-medium text-violet-light">Conseil</span>
          </div>
          <p className="text-sm text-white/80">
            Publiez plus le matin (8h-10h) pour maximiser l'engagement
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-gold" />
            <span className="font-medium text-gold">Objectif</span>
          </div>
          <p className="text-sm text-white/80">
            Plus que 3 posts pour atteindre votre objectif hebdomadaire
          </p>
        </div>
      </div>
    </div>
  );
}

export default PerformanceOverview;
