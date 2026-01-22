import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, 
  Copy, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Target,
  Clock,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface TestVariant {
  id: string;
  name: string;
  content: string;
  predictedScore: number;
  metrics: {
    engagement: number;
    reach: number;
    clicks: number;
    shares: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  status: "draft" | "running" | "completed";
  variantA: TestVariant;
  variantB: TestVariant;
  winner?: "A" | "B";
  startDate?: Date;
  endDate?: Date;
  totalImpressions: number;
}

export function ABTestingPanel() {
  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testResults, setTestResults] = useState<ABTest | null>(null);
  const [activeTests, setActiveTests] = useState<ABTest[]>([
    {
      id: "1",
      name: "Test Hook Accrocheur",
      status: "completed",
      variantA: {
        id: "a1",
        name: "Version A - Question",
        content: "Vous voulez doubler votre engagement LinkedIn en 30 jours ? Voici ma méthode...",
        predictedScore: 78,
        metrics: { engagement: 5.4, reach: 22500, clicks: 680, shares: 92 }
      },
      variantB: {
        id: "b1",
        name: "Version B - Statistique",
        content: "87% des créateurs LinkedIn font cette erreur. Voici comment l'éviter...",
        predictedScore: 92,
        metrics: { engagement: 7.8, reach: 38200, clicks: 1120, shares: 178 }
      },
      winner: "B",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      totalImpressions: 60700
    },
    {
      id: "2",
      name: "Test CTA Final",
      status: "running",
      variantA: {
        id: "a2",
        name: "Version A - Direct",
        content: "Commentez 'GUIDE' pour recevoir mon template gratuit 👇",
        predictedScore: 75,
        metrics: { engagement: 5.2, reach: 18200, clicks: 480, shares: 62 }
      },
      variantB: {
        id: "b2",
        name: "Version B - Engagement",
        content: "Quel est votre plus grand défi sur LinkedIn ? Dites-le moi en commentaire 💬",
        predictedScore: 82,
        metrics: { engagement: 6.1, reach: 24800, clicks: 610, shares: 95 }
      },
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      totalImpressions: 43000
    }
  ]);

  const analyzeVariants = async () => {
    if (!variantA.trim() || !variantB.trim()) {
      toast.error("Veuillez remplir les deux versions du post");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulation d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2500));

    const scoreA = Math.floor(Math.random() * 30) + 50;
    const scoreB = Math.floor(Math.random() * 30) + 50;
    
    const newTest: ABTest = {
      id: Date.now().toString(),
      name: `Test ${new Date().toLocaleDateString('fr-FR')}`,
      status: "draft",
      variantA: {
        id: `a-${Date.now()}`,
        name: "Version A",
        content: variantA,
        predictedScore: scoreA,
        metrics: {
          engagement: parseFloat((Math.random() * 3 + 2).toFixed(1)),
          reach: Math.floor(Math.random() * 10000 + 5000),
          clicks: Math.floor(Math.random() * 300 + 100),
          shares: Math.floor(Math.random() * 50 + 10)
        }
      },
      variantB: {
        id: `b-${Date.now()}`,
        name: "Version B",
        content: variantB,
        predictedScore: scoreB,
        metrics: {
          engagement: parseFloat((Math.random() * 3 + 2).toFixed(1)),
          reach: Math.floor(Math.random() * 10000 + 5000),
          clicks: Math.floor(Math.random() * 300 + 100),
          shares: Math.floor(Math.random() * 50 + 10)
        }
      },
      totalImpressions: 0
    };

    setTestResults(newTest);
    setIsAnalyzing(false);
    toast.success("Analyse terminée ! Consultez les prédictions");
  };

  const launchTest = () => {
    if (!testResults) return;
    
    const launchedTest: ABTest = {
      ...testResults,
      status: "running",
      startDate: new Date()
    };
    
    setActiveTests(prev => [launchedTest, ...prev]);
    setTestResults(null);
    setVariantA("");
    setVariantB("");
    toast.success("Test A/B lancé ! Les résultats seront disponibles sous 48h");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">A/B Testing</h2>
            <p className="text-muted-foreground">Testez 2 versions de votre post pour maximiser l'engagement</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
          <Zap className="w-3 h-3 mr-1" />
          IA Prédictive
        </Badge>
      </div>

      {/* Création de test */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Créer un nouveau test A/B
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version A */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">A</div>
                  Version A
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(variantA);
                    toast.success("Copié !");
                  }}
                  disabled={!variantA}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={variantA}
                onChange={(e) => setVariantA(e.target.value)}
                placeholder="Écrivez la première version de votre post..."
                className="min-h-[150px] bg-secondary/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground">{variantA.length} caractères</p>
            </div>

            {/* Version B */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-400">B</div>
                  Version B
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(variantB);
                    toast.success("Copié !");
                  }}
                  disabled={!variantB}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={variantB}
                onChange={(e) => setVariantB(e.target.value)}
                placeholder="Écrivez la deuxième version de votre post..."
                className="min-h-[150px] bg-secondary/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground">{variantB.length} caractères</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={analyzeVariants}
              disabled={isAnalyzing || !variantA.trim() || !variantB.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Analyser les deux versions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats de l'analyse */}
      <AnimatePresence>
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-card border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Prédictions IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Prédiction Version A */}
                  <div className={`p-4 rounded-xl border ${getScoreBg(testResults.variantA.predictedScore)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">A</div>
                        Version A
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(testResults.variantA.predictedScore)}`}>
                        {testResults.variantA.predictedScore}%
                      </span>
                    </div>
                    <Progress value={testResults.variantA.predictedScore} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="text-foreground font-medium">{testResults.variantA.metrics.engagement}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Portée:</span>
                        <span className="text-foreground font-medium">{testResults.variantA.metrics.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Clics:</span>
                        <span className="text-foreground font-medium">{testResults.variantA.metrics.clicks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Partages:</span>
                        <span className="text-foreground font-medium">{testResults.variantA.metrics.shares}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prédiction Version B */}
                  <div className={`p-4 rounded-xl border ${getScoreBg(testResults.variantB.predictedScore)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-400">B</div>
                        Version B
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(testResults.variantB.predictedScore)}`}>
                        {testResults.variantB.predictedScore}%
                      </span>
                    </div>
                    <Progress value={testResults.variantB.predictedScore} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="text-foreground font-medium">{testResults.variantB.metrics.engagement}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Portée:</span>
                        <span className="text-foreground font-medium">{testResults.variantB.metrics.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Clics:</span>
                        <span className="text-foreground font-medium">{testResults.variantB.metrics.clicks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Partages:</span>
                        <span className="text-foreground font-medium">{testResults.variantB.metrics.shares}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommandation */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Recommandation IA</h4>
                      <p className="text-sm text-muted-foreground">
                        {testResults.variantA.predictedScore > testResults.variantB.predictedScore ? (
                          <>La <strong className="text-blue-400">Version A</strong> a un potentiel de viralité supérieur de {testResults.variantA.predictedScore - testResults.variantB.predictedScore}%. Nous recommandons de tester les deux versions pour confirmer cette prédiction.</>
                        ) : testResults.variantB.predictedScore > testResults.variantA.predictedScore ? (
                          <>La <strong className="text-pink-400">Version B</strong> a un potentiel de viralité supérieur de {testResults.variantB.predictedScore - testResults.variantA.predictedScore}%. Nous recommandons de tester les deux versions pour confirmer cette prédiction.</>
                        ) : (
                          <>Les deux versions ont un potentiel similaire. Un test A/B permettra de déterminer laquelle performe le mieux auprès de votre audience.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setTestResults(null)}>
                    Annuler
                  </Button>
                  <Button onClick={launchTest} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Zap className="w-4 h-4 mr-2" />
                    Lancer le test A/B
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tests actifs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Tests en cours et terminés
        </h3>
        
        <div className="space-y-4">
          {activeTests.map((test) => (
            <Card key={test.id} className="glass-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground">{test.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={
                        test.status === "completed" 
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : test.status === "running"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                      }
                    >
                      {test.status === "completed" ? "Terminé" : test.status === "running" ? "En cours" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {test.totalImpressions.toLocaleString()} impressions
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Version A */}
                  <div className={`p-4 rounded-lg border ${test.winner === "A" ? "border-green-500/50 bg-green-500/5" : "border-border/50 bg-secondary/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">A</div>
                        {test.variantA.name}
                      </span>
                      {test.winner === "A" && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Gagnant
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{test.variantA.content}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {test.variantA.metrics.engagement}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {test.variantA.metrics.reach.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {test.variantA.metrics.shares}
                      </span>
                    </div>
                  </div>

                  {/* Version B */}
                  <div className={`p-4 rounded-lg border ${test.winner === "B" ? "border-green-500/50 bg-green-500/5" : "border-border/50 bg-secondary/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-bold text-pink-400">B</div>
                        {test.variantB.name}
                      </span>
                      {test.winner === "B" && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Gagnant
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{test.variantB.content}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {test.variantB.metrics.engagement}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {test.variantB.metrics.reach.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {test.variantB.metrics.shares}
                      </span>
                    </div>
                  </div>
                </div>

                {test.status === "completed" && test.winner && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-400">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      La Version {test.winner} a généré {test.winner === "A" 
                        ? Math.round((test.variantA.metrics.engagement / test.variantB.metrics.engagement - 1) * 100)
                        : Math.round((test.variantB.metrics.engagement / test.variantA.metrics.engagement - 1) * 100)
                      }% d'engagement supplémentaire
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
