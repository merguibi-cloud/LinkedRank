import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Zap,
  Target,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Filter,
  ChevronRight,
  Flame,
  Star,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";

// Types
interface ViralityPrediction {
  score: number;
  label: "Faible" | "Moyen" | "Élevé" | "Viral";
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    score: number;
    suggestion?: string;
  }[];
}

interface TimeSlotPerformance {
  hour: number;
  day: string;
  engagement: number;
  impressions: number;
  isOptimal: boolean;
}

interface CompetitorData {
  name: string;
  avatar?: string;
  followers: number;
  avgEngagement: number;
  postsPerWeek: number;
  topContent: string;
  trend: "up" | "down" | "stable";
}

interface ContentPerformance {
  type: string;
  icon: string;
  avgEngagement: number;
  avgImpressions: number;
  bestTime: string;
  trend: number;
}

// Mock data
const MOCK_VIRALITY_PREDICTION: ViralityPrediction = {
  score: 78,
  label: "Élevé",
  factors: [
    { name: "Hook accrocheur", impact: "positive", score: 92, suggestion: "Excellent ! Votre première ligne capte l'attention" },
    { name: "Longueur optimale", impact: "positive", score: 85 },
    { name: "Emojis bien placés", impact: "positive", score: 88 },
    { name: "Call-to-action", impact: "neutral", score: 65, suggestion: "Ajoutez une question pour encourager les commentaires" },
    { name: "Hashtags pertinents", impact: "negative", score: 45, suggestion: "Réduisez à 3-5 hashtags ciblés" },
    { name: "Heure de publication", impact: "positive", score: 90, suggestion: "8h30 est un excellent horaire" },
  ],
};

const MOCK_OPTIMAL_TIMES: TimeSlotPerformance[] = [
  { hour: 7, day: "Lundi", engagement: 4.2, impressions: 1200, isOptimal: false },
  { hour: 8, day: "Lundi", engagement: 6.8, impressions: 2100, isOptimal: true },
  { hour: 9, day: "Lundi", engagement: 5.5, impressions: 1800, isOptimal: false },
  { hour: 12, day: "Mardi", engagement: 7.2, impressions: 2400, isOptimal: true },
  { hour: 17, day: "Mardi", engagement: 6.5, impressions: 2000, isOptimal: true },
  { hour: 8, day: "Mercredi", engagement: 7.8, impressions: 2600, isOptimal: true },
  { hour: 18, day: "Mercredi", engagement: 6.9, impressions: 2200, isOptimal: true },
  { hour: 8, day: "Jeudi", engagement: 6.2, impressions: 1900, isOptimal: false },
  { hour: 12, day: "Jeudi", engagement: 5.8, impressions: 1700, isOptimal: false },
  { hour: 8, day: "Vendredi", engagement: 5.0, impressions: 1500, isOptimal: false },
];

const MOCK_COMPETITORS: CompetitorData[] = [
  {
    name: "Marie Dupont",
    followers: 45000,
    avgEngagement: 5.2,
    postsPerWeek: 4,
    topContent: "Storytelling personnel",
    trend: "up",
  },
  {
    name: "Pierre Martin",
    followers: 32000,
    avgEngagement: 4.8,
    postsPerWeek: 5,
    topContent: "Conseils pratiques",
    trend: "stable",
  },
  {
    name: "Sophie Laurent",
    followers: 28000,
    avgEngagement: 6.1,
    postsPerWeek: 3,
    topContent: "Études de cas",
    trend: "up",
  },
  {
    name: "Thomas Petit",
    followers: 52000,
    avgEngagement: 3.9,
    postsPerWeek: 7,
    topContent: "Actualités secteur",
    trend: "down",
  },
];

const MOCK_CONTENT_PERFORMANCE: ContentPerformance[] = [
  { type: "Storytelling", icon: "📖", avgEngagement: 7.2, avgImpressions: 3200, bestTime: "8h30", trend: 15 },
  { type: "Conseils", icon: "💡", avgEngagement: 5.8, avgImpressions: 2800, bestTime: "12h00", trend: 8 },
  { type: "Carrousels", icon: "🎠", avgEngagement: 8.5, avgImpressions: 4100, bestTime: "17h30", trend: 25 },
  { type: "Opinions", icon: "🎯", avgEngagement: 6.4, avgImpressions: 2500, bestTime: "9h00", trend: -5 },
  { type: "Behind the scenes", icon: "🎬", avgEngagement: 4.9, avgImpressions: 1900, bestTime: "18h00", trend: 12 },
];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

// Generate heatmap data
const generateHeatmapData = () => {
  const data: { day: number; hour: number; value: number }[] = [];
  DAYS.forEach((_, dayIndex) => {
    HOURS.forEach((hour) => {
      // Higher engagement during work hours on weekdays
      let baseValue = Math.random() * 30 + 10;
      if (dayIndex < 5) { // Weekdays
        if (hour >= 8 && hour <= 9) baseValue += 40;
        if (hour >= 12 && hour <= 13) baseValue += 30;
        if (hour >= 17 && hour <= 18) baseValue += 35;
      }
      data.push({ day: dayIndex, hour, value: Math.min(100, baseValue) });
    });
  });
  return data;
};

const HEATMAP_DATA = generateHeatmapData();

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<"virality" | "timing" | "competitors" | "content">("virality");
  const [postContent, setPostContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<ViralityPrediction | null>(null);

  const handleAnalyzePost = async () => {
    if (!postContent.trim()) {
      toast.error("Veuillez entrer du contenu à analyser");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a score based on content length and features
    const hasEmoji = postContent.includes("\uD83D") || postContent.includes("\uD83C") || /[\u2600-\u26FF]/.test(postContent);
    const hasQuestion = postContent.includes("?");
    const hasHashtag = postContent.includes("#");
    const wordCount = postContent.split(/\s+/).length;
    
    let score = 50;
    if (hasEmoji) score += 10;
    if (hasQuestion) score += 15;
    if (hasHashtag) score += 5;
    if (wordCount > 50 && wordCount < 200) score += 15;
    if (postContent.length > 100) score += 5;
    
    score = Math.min(100, Math.max(0, score + Math.random() * 20 - 10));
    
    const label = score >= 80 ? "Viral" : score >= 60 ? "Élevé" : score >= 40 ? "Moyen" : "Faible";
    
    setPrediction({
      ...MOCK_VIRALITY_PREDICTION,
      score: Math.round(score),
      label: label as any,
    });
    
    setIsAnalyzing(false);
    toast.success("Analyse terminée !");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "negative": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendIcon = (trend: string | number) => {
    if (typeof trend === "number") {
      if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
      if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 50) return "bg-green-400";
    if (value >= 30) return "bg-yellow-400";
    if (value >= 15) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Analytics Avancés
            </h1>
            <p className="text-muted-foreground mt-1">
              Prédictions de viralité, meilleurs horaires et analyse concurrentielle
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24.5K</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Impressions
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+12%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6.8%</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Taux d'engagement
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+0.5%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+847</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Nouveaux abonnés
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+23%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">78</p>
                  <p className="text-xs text-muted-foreground">
                    Score viralité moyen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="virality" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Score Viralité
            </TabsTrigger>
            <TabsTrigger value="timing" className="gap-2">
              <Clock className="h-4 w-4" />
              Meilleurs Horaires
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <Users className="h-4 w-4" />
              Concurrents
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Contenu
            </TabsTrigger>
          </TabsList>

          {/* Virality Score Tab */}
          <TabsContent value="virality" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Post Analyzer */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Analyseur de Viralité
                  </CardTitle>
                  <CardDescription>
                    Collez votre post pour prédire son potentiel viral
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    placeholder="Collez votre post LinkedIn ici..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleAnalyzePost}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyser le potentiel viral
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Prediction Results */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Prédiction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prediction ? (
                    <div className="space-y-6">
                      {/* Score Circle */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              className="text-muted/30"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={`${prediction.score * 4.4} 440`}
                              className={getScoreColor(prediction.score)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${getScoreColor(prediction.score)}`}>
                              {prediction.score}
                            </span>
                            <span className="text-sm text-muted-foreground">{prediction.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Factors */}
                      <div className="space-y-3">
                        {prediction.factors.map((factor, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getImpactIcon(factor.impact)}
                                <span className="text-sm">{factor.name}</span>
                              </div>
                              <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                                {factor.score}%
                              </span>
                            </div>
                            <Progress value={factor.score} className="h-1.5" />
                            {factor.suggestion && (
                              <p className="text-xs text-muted-foreground pl-6">
                                💡 {factor.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        Entrez votre post pour voir la prédiction
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Heatmap */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Carte de chaleur d'engagement
                  </CardTitle>
                  <CardDescription>
                    Les meilleurs moments pour publier selon votre audience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      {/* Hours header */}
                      <div className="flex mb-2">
                        <div className="w-12" />
                        {HOURS.map((hour) => (
                          <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                            {hour}h
                          </div>
                        ))}
                      </div>
                      
                      {/* Days rows */}
                      {DAYS.map((day, dayIndex) => (
                        <div key={day} className="flex items-center mb-1">
                          <div className="w-12 text-xs text-muted-foreground">{day}</div>
                          {HOURS.map((hour) => {
                            const cell = HEATMAP_DATA.find(d => d.day === dayIndex && d.hour === hour);
                            return (
                              <div
                                key={hour}
                                className={`flex-1 h-8 mx-0.5 rounded ${getHeatmapColor(cell?.value || 0)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                title={`${day} ${hour}h - Engagement: ${cell?.value.toFixed(0)}%`}
                              />
                            );
                          })}
                        </div>
                      ))}
                      
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <span className="text-xs text-muted-foreground">Faible</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded bg-red-400" />
                          <div className="w-4 h-4 rounded bg-orange-400" />
                          <div className="w-4 h-4 rounded bg-yellow-400" />
                          <div className="w-4 h-4 rounded bg-green-400" />
                          <div className="w-4 h-4 rounded bg-green-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">Élevé</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Times */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Créneaux optimaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MOCK_OPTIMAL_TIMES.filter(t => t.isOptimal).slice(0, 5).map((slot, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{slot.day}</p>
                            <p className="text-sm text-muted-foreground">{slot.hour}h00</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">{slot.engagement}%</p>
                          <p className="text-xs text-muted-foreground">{slot.impressions} imp.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Analyse concurrentielle
                </CardTitle>
                <CardDescription>
                  Comparez vos performances avec les créateurs de votre secteur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Créateur</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Abonnés</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Engagement</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Posts/sem</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Top contenu</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Your row */}
                      <tr className="border-b border-border bg-primary/5">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="font-medium">Vous</span>
                            </div>
                            <span className="font-medium">Votre profil</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-medium">12,500</td>
                        <td className="text-right py-4 px-4 font-medium text-green-500">6.8%</td>
                        <td className="text-right py-4 px-4">4</td>
                        <td className="py-4 px-4">Carrousels</td>
                        <td className="text-center py-4 px-4">{getTrendIcon("up")}</td>
                      </tr>
                      {MOCK_COMPETITORS.map((competitor, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm">{competitor.name.charAt(0)}</span>
                              </div>
                              <span>{competitor.name}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">{(competitor.followers / 1000).toFixed(1)}K</td>
                          <td className="text-right py-4 px-4">{competitor.avgEngagement}%</td>
                          <td className="text-right py-4 px-4">{competitor.postsPerWeek}</td>
                          <td className="py-4 px-4">{competitor.topContent}</td>
                          <td className="text-center py-4 px-4">{getTrendIcon(competitor.trend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Point fort</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Votre taux d'engagement est supérieur à 75% des créateurs de votre secteur
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Opportunité</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Augmentez votre fréquence de publication pour rivaliser avec les top créateurs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Recommandation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les carrousels performent bien - continuez à en créer régulièrement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Performance Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_CONTENT_PERFORMANCE.map((content, index) => (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{content.icon}</span>
                        <div>
                          <p className="font-medium">{content.type}</p>
                          <p className="text-xs text-muted-foreground">Meilleur horaire: {content.bestTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(content.trend)}
                        <span className={`text-sm ${content.trend > 0 ? "text-green-500" : content.trend < 0 ? "text-red-500" : "text-gray-500"}`}>
                          {content.trend > 0 ? "+" : ""}{content.trend}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{content.avgEngagement}%</p>
                        <p className="text-xs text-muted-foreground">Engagement moyen</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{(content.avgImpressions / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-muted-foreground">Impressions moy.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Tips */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="font-medium mb-2">🎠 Doublez les carrousels</p>
                    <p className="text-sm text-muted-foreground">
                      Vos carrousels ont 25% d'engagement en plus que la moyenne. Passez de 1 à 2 par semaine.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-medium mb-2">📖 Storytelling le matin</p>
                    <p className="text-sm text-muted-foreground">
                      Publiez vos histoires personnelles à 8h30 pour maximiser l'engagement (+15%).
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="font-medium mb-2">🎯 Réduisez les opinions</p>
                    <p className="text-sm text-muted-foreground">
                      Les posts d'opinion ont baissé de 5%. Privilégiez le contenu éducatif.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="font-medium mb-2">🎬 Testez les coulisses</p>
                    <p className="text-sm text-muted-foreground">
                      Le contenu "behind the scenes" est en hausse (+12%). Montrez votre quotidien.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
