import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SmartSuggestions } from "@/components/SmartSuggestions";
import { ViralityPredictor } from "@/components/ViralityPredictor";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Zap,
  Eye,
  Heart,
  ArrowUp,
  ArrowDown,
  Clock,
  Crown,
  MessageSquare,
} from "lucide-react";

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");

  // Données simulées pour les statistiques
  const stats = {
    totalViews: 125000,
    viewsGrowth: 23.5,
    totalEngagement: 8500,
    engagementGrowth: 15.2,
    followers: 2847,
    followersGrowth: 12.8,
    postsThisMonth: 12,
    avgEngagementRate: 6.8,
  };

  const topPosts = [
    {
      id: "1",
      title: "L'IA va transformer votre façon de travailler",
      views: 15200,
      likes: 450,
      comments: 89,
      shares: 34,
      date: "15 Dec 2024",
    },
    {
      id: "2",
      title: "5 erreurs qui tuent votre croissance LinkedIn",
      views: 12800,
      likes: 380,
      comments: 67,
      shares: 28,
      date: "12 Dec 2024",
    },
    {
      id: "3",
      title: "Mon parcours de 0 à 10K abonnés",
      views: 11500,
      likes: 520,
      comments: 95,
      shares: 45,
      date: "8 Dec 2024",
    },
  ];

  const weeklyData = [
    { day: "Lun", views: 2500, engagement: 180 },
    { day: "Mar", views: 4200, engagement: 320 },
    { day: "Mer", views: 3800, engagement: 280 },
    { day: "Jeu", views: 5100, engagement: 410 },
    { day: "Ven", views: 3200, engagement: 240 },
    { day: "Sam", views: 1800, engagement: 120 },
    { day: "Dim", views: 1500, engagement: 90 },
  ];

  const maxViews = Math.max(...weeklyData.map((d) => d.views));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-violet-light" />
              Analytics Avancées
            </h1>
            <p className="text-white/60 mt-1">
              Analysez vos performances et optimisez votre stratégie
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.viewsGrowth}% ce mois
            </Badge>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    stats.viewsGrowth > 0
                      ? "border-green-500/30 text-green-400"
                      : "border-rose/30 text-rose"
                  }`}
                >
                  {stats.viewsGrowth > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {stats.viewsGrowth}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {(stats.totalViews / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-white/50">Vues totales</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-rose" />
                <Badge
                  variant="outline"
                  className="text-xs border-green-500/30 text-green-400"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  {stats.engagementGrowth}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {(stats.totalEngagement / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-white/50">Engagements</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <Badge
                  variant="outline"
                  className="text-xs border-green-500/30 text-green-400"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  {stats.followersGrowth}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.followers.toLocaleString()}
              </p>
              <p className="text-xs text-white/50">Abonnés</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-gold" />
                <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                  Top 10%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{stats.avgEngagementRate}%</p>
              <p className="text-xs text-white/50">Taux d'engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de contenu */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-violet">
              <Sparkles className="w-4 h-4 mr-2" />
              Suggestions IA
            </TabsTrigger>
            <TabsTrigger value="virality" className="data-[state=active]:bg-violet">
              <TrendingUp className="w-4 h-4 mr-2" />
              Prédicteur
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphique hebdomadaire */}
              <Card className="bg-card/50 border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Performance hebdomadaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {weeklyData.map((data) => (
                      <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-violet/50 rounded-t-lg transition-all hover:bg-violet"
                          style={{ height: `${(data.views / maxViews) * 100}%` }}
                        />
                        <span className="text-xs text-white/50">{data.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-violet" />
                      <span className="text-sm text-white/60">Vues</span>
                    </div>
                    <div className="text-sm text-white/60">
                      Total: {weeklyData.reduce((acc, d) => acc + d.views, 0).toLocaleString()} vues
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top posts */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-gold" />
                    <CardTitle className="text-white">Top Posts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-gold/20 text-gold"
                              : index === 1
                              ? "bg-white/20 text-white"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{post.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(post.views / 1000).toFixed(1)}K
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Insights rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-violet/20 to-violet/5 border-violet/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-violet-light" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Meilleur moment</p>
                      <p className="text-lg font-semibold text-white">Mardi 9h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gold/20 to-gold/5 border-gold/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/30 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Format gagnant</p>
                      <p className="text-lg font-semibold text-white">Carrousel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Tendance</p>
                      <p className="text-lg font-semibold text-white">+23% /mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Suggestions IA */}
          <TabsContent value="suggestions">
            <SmartSuggestions />
          </TabsContent>

          {/* Prédicteur de viralité */}
          <TabsContent value="virality">
            <ViralityPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
