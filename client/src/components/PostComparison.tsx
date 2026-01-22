import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";

interface PostData {
  id: string;
  content: string;
  date: string;
  time: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
}

const samplePosts: PostData[] = [
  {
    id: "1",
    content: "🚀 Il y a 3 ans, j'ai quitté mon CDI pour lancer ma startup...",
    date: "20/12/2024",
    time: "08:30",
    views: 45678,
    likes: 1234,
    comments: 156,
    shares: 89,
    engagement: 8.7,
  },
  {
    id: "2",
    content: "5 erreurs que j'aurais aimé éviter en tant qu'entrepreneur...",
    date: "18/12/2024",
    time: "12:00",
    views: 23456,
    likes: 567,
    comments: 78,
    shares: 34,
    engagement: 5.2,
  },
  {
    id: "3",
    content: "L'IA va-t-elle remplacer les créateurs de contenu ?...",
    date: "15/12/2024",
    time: "18:00",
    views: 67890,
    likes: 2345,
    comments: 234,
    shares: 156,
    engagement: 12.3,
  },
];

export function PostComparison() {
  const [selectedPosts, setSelectedPosts] = useState<[PostData | null, PostData | null]>([
    samplePosts[0],
    samplePosts[2],
  ]);

  const togglePost = (post: PostData, slot: 0 | 1) => {
    const newSelection = [...selectedPosts] as [PostData | null, PostData | null];
    newSelection[slot] = post;
    setSelectedPosts(newSelection);
  };

  const getComparison = (value1: number, value2: number) => {
    if (value1 > value2) return { icon: TrendingUp, color: "text-emerald-400", diff: `+${((value1 - value2) / value2 * 100).toFixed(1)}%` };
    if (value1 < value2) return { icon: TrendingDown, color: "text-rose", diff: `-${((value2 - value1) / value2 * 100).toFixed(1)}%` };
    return { icon: Minus, color: "text-white/50", diff: "0%" };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const metrics = [
    { key: "views", label: "Vues", icon: Eye },
    { key: "likes", label: "Likes", icon: Heart },
    { key: "comments", label: "Commentaires", icon: MessageSquare },
    { key: "shares", label: "Partages", icon: Share2 },
    { key: "engagement", label: "Engagement", icon: BarChart3, suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-light" />
            Comparateur de Posts
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Analysez les performances de vos posts
          </p>
        </div>
      </div>

      {/* Post selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {[0, 1].map((slot) => (
          <div key={slot} className="space-y-3">
            <label className="text-sm text-white/70">
              Post {slot + 1}
            </label>
            <select
              value={selectedPosts[slot]?.id || ""}
              onChange={(e) => {
                const post = samplePosts.find(p => p.id === e.target.value);
                if (post) togglePost(post, slot as 0 | 1);
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet/50"
            >
              {samplePosts.map((post) => (
                <option key={post.id} value={post.id} className="bg-gray-900">
                  {post.date} - {post.content.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison cards */}
      {selectedPosts[0] && selectedPosts[1] && (
        <div className="grid md:grid-cols-2 gap-6">
          {selectedPosts.map((post, index) => (
            <motion.div
              key={post?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-2xl border ${
                index === 0 
                  ? "bg-violet/5 border-violet/20" 
                  : "bg-rose/5 border-rose/20"
              }`}
            >
              {/* Post preview */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                  <Calendar className="w-3 h-3" />
                  {post?.date}
                  <Clock className="w-3 h-3 ml-2" />
                  {post?.time}
                </div>
                <p className="text-sm text-white/80 line-clamp-3">
                  {post?.content}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {metrics.map((metric) => {
                  const value = post?.[metric.key as keyof PostData] as number;
                  const otherValue = selectedPosts[index === 0 ? 1 : 0]?.[metric.key as keyof PostData] as number;
                  const comparison = index === 0 ? getComparison(value, otherValue) : null;

                  return (
                    <div key={metric.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        <metric.icon className="w-4 h-4" />
                        <span className="text-sm">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {formatNumber(value)}{metric.suffix || ""}
                        </span>
                        {comparison && (
                          <span className={`text-xs ${comparison.color}`}>
                            {comparison.diff}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Insights */}
      {selectedPosts[0] && selectedPosts[1] && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet/10 to-rose/10 border border-violet/20">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Insights IA
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            {selectedPosts[0].engagement > selectedPosts[1].engagement ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Le post du {selectedPosts[0].date} a un meilleur engagement (+{((selectedPosts[0].engagement - selectedPosts[1].engagement) / selectedPosts[1].engagement * 100).toFixed(0)}%)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-light">→</span>
                  L'heure de publication ({selectedPosts[0].time}) semble plus efficace
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Le post du {selectedPosts[1].date} a un meilleur engagement (+{((selectedPosts[1].engagement - selectedPosts[0].engagement) / selectedPosts[0].engagement * 100).toFixed(0)}%)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-light">→</span>
                  Le sujet de l'IA génère plus d'interactions
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className="text-gold">💡</span>
              Conseil : Combinez les éléments gagnants des deux posts pour maximiser l'impact
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PostComparison;
