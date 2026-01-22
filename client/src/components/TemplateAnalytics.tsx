import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare,
  Share2,
  Trophy,
  Flame,
  Target,
  Zap,
  Crown,
  Star
} from "lucide-react";

interface TemplateStats {
  id: string;
  name: string;
  sector: string;
  usageCount: number;
  avgEngagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  conversionRate: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  rank: number;
}

const SECTORS = [
  { id: "all", label: "Tous les secteurs", icon: "🌐" },
  { id: "tech", label: "Tech & Digital", icon: "💻" },
  { id: "finance", label: "Finance & Banque", icon: "💰" },
  { id: "rh", label: "RH & Recrutement", icon: "👥" },
  { id: "marketing", label: "Marketing", icon: "📢" },
  { id: "sante", label: "Santé", icon: "🏥" },
  { id: "immobilier", label: "Immobilier", icon: "🏠" },
  { id: "juridique", label: "Juridique", icon: "⚖️" },
  { id: "commerce", label: "Commerce", icon: "🛒" }
];

const MOCK_TEMPLATE_STATS: TemplateStats[] = [
  {
    id: "1",
    name: "Annonce de lancement produit",
    sector: "tech",
    usageCount: 2847,
    avgEngagement: 8.7,
    avgLikes: 342,
    avgComments: 67,
    avgShares: 45,
    conversionRate: 12.3,
    trend: "up",
    trendPercent: 23,
    rank: 1
  },
  {
    id: "2",
    name: "Storytelling carrière",
    sector: "rh",
    usageCount: 2156,
    avgEngagement: 9.2,
    avgLikes: 456,
    avgComments: 89,
    avgShares: 34,
    conversionRate: 15.7,
    trend: "up",
    trendPercent: 18,
    rank: 2
  },
  {
    id: "3",
    name: "Analyse de marché",
    sector: "finance",
    usageCount: 1893,
    avgEngagement: 7.4,
    avgLikes: 287,
    avgComments: 52,
    avgShares: 67,
    conversionRate: 9.8,
    trend: "up",
    trendPercent: 12,
    rank: 3
  },
  {
    id: "4",
    name: "Étude de cas client",
    sector: "marketing",
    usageCount: 1654,
    avgEngagement: 8.1,
    avgLikes: 312,
    avgComments: 45,
    avgShares: 56,
    conversionRate: 11.2,
    trend: "stable",
    trendPercent: 2,
    rank: 4
  },
  {
    id: "5",
    name: "Conseils bien-être",
    sector: "sante",
    usageCount: 1432,
    avgEngagement: 7.8,
    avgLikes: 267,
    avgComments: 78,
    avgShares: 23,
    conversionRate: 8.5,
    trend: "up",
    trendPercent: 15,
    rank: 5
  },
  {
    id: "6",
    name: "Tendances immobilier",
    sector: "immobilier",
    usageCount: 1287,
    avgEngagement: 6.9,
    avgLikes: 198,
    avgComments: 34,
    avgShares: 45,
    conversionRate: 7.2,
    trend: "down",
    trendPercent: -5,
    rank: 6
  },
  {
    id: "7",
    name: "Actualité juridique",
    sector: "juridique",
    usageCount: 987,
    avgEngagement: 6.2,
    avgLikes: 156,
    avgComments: 28,
    avgShares: 34,
    conversionRate: 6.8,
    trend: "stable",
    trendPercent: 1,
    rank: 7
  },
  {
    id: "8",
    name: "Stratégie e-commerce",
    sector: "commerce",
    usageCount: 876,
    avgEngagement: 7.1,
    avgLikes: 234,
    avgComments: 41,
    avgShares: 28,
    conversionRate: 9.1,
    trend: "up",
    trendPercent: 8,
    rank: 8
  }
];

const GLOBAL_STATS = {
  totalUsage: 13132,
  avgEngagement: 7.9,
  topSector: "Tech & Digital",
  growthRate: 34
};

export function TemplateAnalytics() {
  const [selectedSector, setSelectedSector] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  const filteredStats = selectedSector === "all" 
    ? MOCK_TEMPLATE_STATS 
    : MOCK_TEMPLATE_STATS.filter(t => t.sector === selectedSector);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics des Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Performance des templates par secteur
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  <span className="flex items-center gap-2">
                    <span>{sector.icon}</span>
                    <span>{sector.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{GLOBAL_STATS.totalUsage.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Utilisations totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{GLOBAL_STATS.avgEngagement}%</p>
                  <p className="text-xs text-muted-foreground">Engagement moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{GLOBAL_STATS.topSector}</p>
                  <p className="text-xs text-muted-foreground">Secteur #1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{GLOBAL_STATS.growthRate}%</p>
                  <p className="text-xs text-muted-foreground">Croissance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Classement des templates */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Top Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStats.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getRankIcon(template.rank)}
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {SECTORS.find(s => s.id === template.sector)?.icon}{" "}
                        {SECTORS.find(s => s.id === template.sector)?.label}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(template.trend)}`}>
                    {template.trend === "up" && <TrendingUp className="w-4 h-4" />}
                    {template.trend === "down" && <TrendingUp className="w-4 h-4 rotate-180" />}
                    <span className="text-sm font-medium">
                      {template.trendPercent > 0 ? "+" : ""}{template.trendPercent}%
                    </span>
                  </div>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{template.usageCount.toLocaleString()} utilisations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{template.avgLikes} likes moy.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{template.avgComments} commentaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-green-500" />
                    <span>{template.avgShares} partages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span>{template.conversionRate}% conversion</span>
                  </div>
                </div>

                {/* Barre d'engagement */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Score d'engagement</span>
                    <span className="font-medium">{template.avgEngagement}/10</span>
                  </div>
                  <Progress value={template.avgEngagement * 10} className="h-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graphique de performance par secteur */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Performance par secteur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SECTORS.filter(s => s.id !== "all").map((sector, index) => {
              const sectorStats = MOCK_TEMPLATE_STATS.filter(t => t.sector === sector.id);
              const avgEngagement = sectorStats.length > 0 
                ? sectorStats.reduce((acc, t) => acc + t.avgEngagement, 0) / sectorStats.length 
                : 0;
              const totalUsage = sectorStats.reduce((acc, t) => acc + t.usageCount, 0);
              
              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 text-center text-xl">{sector.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{sector.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {totalUsage.toLocaleString()} utilisations
                      </span>
                    </div>
                    <Progress value={avgEngagement * 10} className="h-2" />
                  </div>
                  <div className="w-16 text-right">
                    <Badge variant={avgEngagement >= 8 ? "default" : "secondary"}>
                      {avgEngagement.toFixed(1)}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplateAnalytics;
