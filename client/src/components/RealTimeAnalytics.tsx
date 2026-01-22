import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Users,
  Clock,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Bell,
  Target,
  Sparkles,
  Globe,
  MapPin,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "like" | "comment" | "share" | "follow" | "view";
  user: string;
  avatar: string;
  content?: string;
  timestamp: Date;
  postTitle?: string;
}

interface TopPost {
  id: string;
  title: string;
  impressions: number;
  engagement: number;
  trend: "up" | "down" | "stable";
  publishedAt: Date;
}

export function RealTimeAnalytics() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { id: "1", name: "Vues en direct", value: 3847, previousValue: 3520, unit: "", icon: <Eye className="w-5 h-5" />, color: "text-blue-400" },
    { id: "2", name: "Engagement", value: 6.2, previousValue: 5.8, unit: "%", icon: <ThumbsUp className="w-5 h-5" />, color: "text-green-400" },
    { id: "3", name: "Nouveaux abonnés", value: 47, previousValue: 38, unit: "", icon: <Users className="w-5 h-5" />, color: "text-purple-400" },
    { id: "4", name: "Commentaires", value: 89, previousValue: 72, unit: "", icon: <MessageSquare className="w-5 h-5" />, color: "text-yellow-400" }
  ]);

  const [activities, setActivities] = useState<RecentActivity[]>([
    { id: "1", type: "like", user: "Marie Dupont", avatar: "👩‍💼", timestamp: new Date(Date.now() - 30000), postTitle: "5 astuces pour booster votre engagement" },
    { id: "2", type: "comment", user: "Thomas Martin", avatar: "👨‍💻", content: "Super article ! J'applique ça dès demain 🚀", timestamp: new Date(Date.now() - 120000), postTitle: "5 astuces pour booster votre engagement" },
    { id: "3", type: "follow", user: "Sophie Bernard", avatar: "👩‍🎨", timestamp: new Date(Date.now() - 180000) },
    { id: "4", type: "share", user: "Pierre Leroy", avatar: "👨‍🔬", timestamp: new Date(Date.now() - 300000), postTitle: "Comment j'ai généré 50 leads en 1 semaine" },
    { id: "5", type: "like", user: "Julie Moreau", avatar: "👩‍⚕️", timestamp: new Date(Date.now() - 420000), postTitle: "Comment j'ai généré 50 leads en 1 semaine" },
    { id: "6", type: "view", user: "12 personnes", avatar: "👥", timestamp: new Date(Date.now() - 600000), postTitle: "POV: Tu découvres que l'IA peut poster à ta place" }
  ]);

  const [topPosts, setTopPosts] = useState<TopPost[]>([
    { id: "1", title: "5 astuces pour booster votre engagement LinkedIn", impressions: 28450, engagement: 7.2, trend: "up", publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: "2", title: "Comment j'ai généré 50 leads en 1 semaine", impressions: 18920, engagement: 6.1, trend: "up", publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: "3", title: "POV: Tu découvres que l'IA peut poster à ta place", impressions: 15340, engagement: 5.4, trend: "up", publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  ]);

  const [audienceData] = useState({
    topLocations: [
      { name: "France", percentage: 45 },
      { name: "Belgique", percentage: 15 },
      { name: "Suisse", percentage: 12 },
      { name: "Canada", percentage: 10 },
      { name: "Autres", percentage: 18 }
    ],
    topIndustries: [
      { name: "Tech & IT", percentage: 32 },
      { name: "Marketing", percentage: 24 },
      { name: "Finance", percentage: 18 },
      { name: "Consulting", percentage: 14 },
      { name: "Autres", percentage: 12 }
    ],
    peakHours: [
      { hour: "8h-9h", activity: 85 },
      { hour: "12h-13h", activity: 92 },
      { hour: "17h-18h", activity: 78 },
      { hour: "20h-21h", activity: 65 }
    ]
  });

  // Simulation de mise à jour en temps réel
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        previousValue: metric.value,
        value: metric.value + Math.floor(Math.random() * 10) - 3
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like": return <ThumbsUp className="w-4 h-4 text-blue-400" />;
      case "comment": return <MessageSquare className="w-4 h-4 text-green-400" />;
      case "share": return <Share2 className="w-4 h-4 text-purple-400" />;
      case "follow": return <Users className="w-4 h-4 text-yellow-400" />;
      case "view": return <Eye className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "like": return `a aimé "${activity.postTitle}"`;
      case "comment": return `a commenté "${activity.postTitle}"`;
      case "share": return `a partagé "${activity.postTitle}"`;
      case "follow": return "vous suit maintenant";
      case "view": return `ont vu "${activity.postTitle}"`;
      default: return "";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "À l'instant";
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statut live */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics en Temps Réel</h2>
            <p className="text-muted-foreground">Suivez vos performances en direct</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={isLive ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${isLive ? "bg-red-400" : "bg-gray-400"}`} />
            {isLive ? "EN DIRECT" : "PAUSE"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "Pause" : "Reprendre"}
          </Button>
        </div>
      </div>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const change = metric.value - metric.previousValue;
          const isPositive = change >= 0;
          return (
            <motion.div
              key={metric.id}
              initial={{ scale: 1 }}
              animate={{ scale: change !== 0 ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-border/50 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={metric.color}>{metric.icon}</span>
                    {change !== 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}
                      >
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(change)}
                      </motion.span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value.toLocaleString()}{metric.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <Card className="glass-card border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Activité en direct
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Mis à jour {formatTimeAgo(lastUpdate)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium text-foreground text-sm">{activity.user}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getActivityText(activity)}
                      </p>
                      {activity.content && (
                        <p className="text-sm text-foreground/80 mt-1 italic">"{activity.content}"</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Top posts */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Posts performants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                <div className="flex items-start gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{post.title}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {post.impressions.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      {post.engagement}%
                    </span>
                  </div>
                  <span className={`flex items-center gap-1 ${
                    post.trend === "up" ? "text-green-400" : 
                    post.trend === "down" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {post.trend === "up" ? <TrendingUp className="w-3 h-3" /> : 
                     post.trend === "down" ? <TrendingDown className="w-3 h-3" /> : 
                     <Activity className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights audience */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Localisation */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              Localisation de l'audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audienceData.topLocations.map((location, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{location.name}</span>
                  <span className="text-muted-foreground">{location.percentage}%</span>
                </div>
                <Progress value={location.percentage} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Industries */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Secteurs d'activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audienceData.topIndustries.map((industry, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{industry.name}</span>
                  <span className="text-muted-foreground">{industry.percentage}%</span>
                </div>
                <Progress value={industry.percentage} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Heures de pointe */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              Heures de pointe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audienceData.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-16">{hour.hour}</span>
                <div className="flex-1">
                  <Progress value={hour.activity} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground w-10">{hour.activity}%</span>
              </div>
            ))}
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Meilleur moment pour publier : 12h-13h
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
