import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  Eye,
  Share2,
  Award,
  Zap,
  ChevronRight,
  Sparkles,
  BookOpen,
  Trophy,
  Star,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
}

interface CoachingTip {
  id: string;
  category: "hook" | "content" | "cta" | "timing" | "format";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  example?: string;
  completed: boolean;
}

interface WeeklyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export function AICoachingPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [coachingScore, setCoachingScore] = useState(85);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const metrics: PerformanceMetric[] = [
    { name: "Engagement moyen", current: 5.8, previous: 4.2, target: 6.0, unit: "%" },
    { name: "Portée moyenne", current: 18500, previous: 12500, target: 20000, unit: "" },
    { name: "Commentaires/post", current: 67, previous: 45, target: 80, unit: "" },
    { name: "Partages/post", current: 24, previous: 12, target: 30, unit: "" },
    { name: "Clics profil", current: 285, previous: 180, target: 350, unit: "" },
    { name: "Nouveaux abonnés/sem", current: 520, previous: 340, target: 600, unit: "" }
  ];

  const [tips, setTips] = useState<CoachingTip[]>([
    {
      id: "1",
      category: "hook",
      priority: "high",
      title: "Améliorez vos accroches",
      description: "Vos 3 premières lignes captent seulement 45% de l'attention. Utilisez des questions ou des statistiques choc.",
      impact: "+35% d'engagement estimé",
      example: "❌ 'Voici mes conseils pour LinkedIn'\n✅ '87% des créateurs font cette erreur. Êtes-vous l'un d'eux ?'",
      completed: false
    },
    {
      id: "2",
      category: "timing",
      priority: "high",
      title: "Optimisez vos horaires",
      description: "Vos posts du mercredi performent 2x mieux. Concentrez vos meilleurs contenus ce jour-là.",
      impact: "+50% de portée estimée",
      completed: false
    },
    {
      id: "3",
      category: "cta",
      priority: "medium",
      title: "Renforcez vos appels à l'action",
      description: "Vos posts sans CTA ont 60% moins de commentaires. Ajoutez une question engageante à la fin.",
      impact: "+40% de commentaires estimés",
      example: "Ajoutez : 'Et vous, quelle est votre expérience ? Dites-le moi en commentaire 👇'",
      completed: true
    },
    {
      id: "4",
      category: "format",
      priority: "medium",
      title: "Variez vos formats",
      description: "90% de vos posts sont du texte seul. Les carrousels génèrent 3x plus d'engagement.",
      impact: "+200% d'engagement sur carrousels",
      completed: false
    },
    {
      id: "5",
      category: "content",
      priority: "low",
      title: "Partagez plus d'histoires personnelles",
      description: "Vos posts storytelling ont 2.5x plus d'engagement. Racontez vos échecs et apprentissages.",
      impact: "+150% d'engagement estimé",
      completed: false
    }
  ]);

  const weeklyGoals: WeeklyGoal[] = [
    { id: "1", title: "Posts publiés", target: 5, current: 4, unit: "posts", completed: false },
    { id: "2", title: "Commentaires répondus", target: 50, current: 48, unit: "réponses", completed: false },
    { id: "3", title: "Connexions envoyées", target: 20, current: 20, unit: "invitations", completed: true },
    { id: "4", title: "Engagement généré", target: 500, current: 520, unit: "interactions", completed: true }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hook": return <Zap className="w-4 h-4" />;
      case "content": return <BookOpen className="w-4 h-4" />;
      case "cta": return <MessageSquare className="w-4 h-4" />;
      case "timing": return <Clock className="w-4 h-4" />;
      case "format": return <BarChart3 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hook": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "content": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "cta": return "text-green-400 bg-green-500/10 border-green-500/30";
      case "timing": return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case "format": return "text-pink-400 bg-pink-500/10 border-pink-500/30";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const toggleTipCompleted = (tipId: string) => {
    setTips(prev => prev.map(tip => 
      tip.id === tipId ? { ...tip, completed: !tip.completed } : tip
    ));
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: "Expert", color: "text-green-400", bg: "bg-green-500/20" };
    if (score >= 75) return { level: "Avancé", color: "text-blue-400", bg: "bg-blue-500/20" };
    if (score >= 60) return { level: "Intermédiaire", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    return { level: "Débutant", color: "text-orange-400", bg: "bg-orange-500/20" };
  };

  const scoreInfo = getScoreLevel(coachingScore);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Coaching IA</h2>
            <p className="text-muted-foreground">Analyse personnalisée pour améliorer vos performances</p>
          </div>
        </div>
        <Badge variant="outline" className={`${scoreInfo.bg} ${scoreInfo.color} border-current`}>
          <Trophy className="w-3 h-3 mr-1" />
          Niveau {scoreInfo.level}
        </Badge>
      </div>

      {/* Score global */}
      <Card className="glass-card border-emerald-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        <CardContent className="relative p-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Score circulaire */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-8 border-secondary flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${coachingScore * 4.52} 452`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">{coachingScore}</span>
                  <span className="text-lg text-muted-foreground">/100</span>
                  <p className="text-sm text-emerald-400 font-medium mt-1">Score LinkedIn</p>
                </div>
              </div>
            </div>

            {/* Métriques clés */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.slice(0, 6).map((metric, index) => {
                const change = ((metric.current - metric.previous) / metric.previous * 100).toFixed(0);
                const isPositive = metric.current >= metric.previous;
                return (
                  <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{metric.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {metric.current.toLocaleString()}{metric.unit}
                      </span>
                      <span className={`text-xs flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(Number(change))}%
                      </span>
                    </div>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-1 mt-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Objectif: {metric.target.toLocaleString()}{metric.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Conseils
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Objectifs
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Points forts et à améliorer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Points forts */}
            <Card className="glass-card border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Vos points forts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Régularité de publication</p>
                    <p className="text-sm text-muted-foreground">Vous publiez en moyenne 4.2 posts/semaine, c'est excellent !</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Engagement communautaire</p>
                    <p className="text-sm text-muted-foreground">Vous répondez à 85% des commentaires dans l'heure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Croissance constante</p>
                    <p className="text-sm text-muted-foreground">+12% d'abonnés ce mois-ci vs le mois dernier</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* À améliorer */}
            <Card className="glass-card border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Axes d'amélioration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <XCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Accroches trop faibles</p>
                    <p className="text-sm text-muted-foreground">Seulement 45% de rétention sur les 3 premières lignes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <XCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Manque de diversité</p>
                    <p className="text-sm text-muted-foreground">90% de vos posts sont du texte seul</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <XCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Horaires non optimaux</p>
                    <p className="text-sm text-muted-foreground">Vos posts du lundi ont 40% moins de portée</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prochaine action recommandée */}
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Action prioritaire de la semaine</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez un carrousel sur votre expertise principale. Les carrousels génèrent en moyenne 
                    <strong className="text-primary"> 3x plus d'engagement</strong> que vos posts texte actuels.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Zap className="w-4 h-4 mr-2" />
                    Créer un carrousel maintenant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conseils */}
        <TabsContent value="tips" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {tips.filter(t => t.completed).length}/{tips.length} conseils appliqués
            </p>
            <Progress value={(tips.filter(t => t.completed).length / tips.length) * 100} className="w-32 h-2" />
          </div>

          {tips.map((tip) => (
            <motion.div
              key={tip.id}
              layout
              className={`glass-card rounded-xl border p-4 ${tip.completed ? "border-green-500/30 bg-green-500/5" : "border-border/50"}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTipCompleted(tip.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    tip.completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-muted-foreground hover:border-primary"
                  }`}
                >
                  {tip.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(tip.category)}>
                      {getCategoryIcon(tip.category)}
                      <span className="ml-1 capitalize">{tip.category}</span>
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(tip.priority)}>
                      {tip.priority === "high" ? "Priorité haute" : tip.priority === "medium" ? "Priorité moyenne" : "Priorité basse"}
                    </Badge>
                  </div>
                  
                  <h4 className={`font-semibold mb-1 ${tip.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {tip.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">{tip.impact}</span>
                  </div>

                  {tip.example && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 mt-2">
                      <p className="text-xs text-muted-foreground whitespace-pre-line">{tip.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* Objectifs */}
        <TabsContent value="goals" className="space-y-6 mt-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Objectifs de la semaine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={`font-medium ${goal.completed ? "text-green-400" : "text-foreground"}`}>
                        {goal.title}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className={`h-2 ${goal.completed ? "[&>div]:bg-green-500" : ""}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Récompenses */}
          <Card className="glass-card border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Award className="w-5 h-5" />
                Récompenses à débloquer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="font-medium text-foreground">Semaine Parfaite</p>
                  <p className="text-xs text-muted-foreground mt-1">Atteignez tous vos objectifs</p>
                  <Progress value={75} className="h-1 mt-2" />
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="font-medium text-foreground">Post Viral</p>
                  <p className="text-xs text-muted-foreground mt-1">Dépassez 50K impressions</p>
                  <Progress value={45} className="h-1 mt-2" />
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="font-medium text-foreground">Engagement Master</p>
                  <p className="text-xs text-muted-foreground mt-1">Atteignez 5% d'engagement</p>
                  <Progress value={84} className="h-1 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
