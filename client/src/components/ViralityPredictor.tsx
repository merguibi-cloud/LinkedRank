import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Clock,
  Hash,
} from "lucide-react";

interface ViralityPrediction {
  score: number;
  level: "low" | "medium" | "high" | "viral";
  factors: {
    name: string;
    score: number;
    tip: string;
    icon: React.ReactNode;
  }[];
  suggestions: string[];
  estimatedReach: {
    min: number;
    max: number;
  };
  estimatedEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface ViralityPredictorProps {
  initialContent?: string;
  onPredictionChange?: (prediction: ViralityPrediction) => void;
}

export function ViralityPredictor({ initialContent = "", onPredictionChange }: ViralityPredictorProps) {
  const [content, setContent] = useState(initialContent);
  const [prediction, setPrediction] = useState<ViralityPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = (text: string): ViralityPrediction => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const hasQuestion = text.includes("?");
    const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(text);
    const hasHashtags = text.includes("#");
    const hashtagCount = (text.match(/#\w+/g) || []).length;
    const hasCTA = /comment|partagez|dites|répondez|cliquez|découvrez|rejoignez/i.test(text);
    const hasHook = text.split("\n")[0]?.length < 100 && text.split("\n")[0]?.length > 20;
    const hasNumbers = /\d+/.test(text);
    const hasStory = /il y a|j'ai|mon|ma|mes|notre|quand|lorsque/i.test(text);
    const lineBreaks = (text.match(/\n/g) || []).length;
    const hasGoodFormatting = lineBreaks >= 3 && lineBreaks <= 15;

    // Calcul des scores individuels
    const hookScore = hasHook ? 85 : words > 0 ? 50 : 0;
    const lengthScore = words >= 100 && words <= 300 ? 90 : words >= 50 && words <= 400 ? 70 : words > 0 ? 40 : 0;
    const engagementScore = (hasQuestion ? 30 : 0) + (hasCTA ? 40 : 0) + (hasEmoji ? 15 : 0);
    const formattingScore = hasGoodFormatting ? 85 : lineBreaks > 0 ? 60 : 30;
    const hashtagScore = hashtagCount >= 3 && hashtagCount <= 5 ? 90 : hashtagCount > 0 && hashtagCount <= 7 ? 70 : hashtagCount === 0 ? 50 : 40;
    const storytellingScore = hasStory ? 85 : hasNumbers ? 70 : 50;

    // Score global
    const totalScore = Math.round(
      (hookScore * 0.25 + lengthScore * 0.15 + engagementScore * 0.2 + formattingScore * 0.15 + hashtagScore * 0.1 + storytellingScore * 0.15)
    );

    // Niveau de viralité
    let level: "low" | "medium" | "high" | "viral" = "low";
    if (totalScore >= 80) level = "viral";
    else if (totalScore >= 65) level = "high";
    else if (totalScore >= 45) level = "medium";

    // Facteurs détaillés
    const factors = [
      {
        name: "Accroche",
        score: hookScore,
        tip: hookScore < 70 ? "Ajoutez une première ligne percutante de 20-100 caractères" : "Excellente accroche !",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        name: "Longueur",
        score: lengthScore,
        tip: lengthScore < 70 ? "Visez 100-300 mots pour un engagement optimal" : "Longueur idéale !",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        name: "Engagement",
        score: Math.min(engagementScore + 15, 100),
        tip: engagementScore < 50 ? "Ajoutez une question ou un appel à l'action" : "Bon potentiel d'engagement !",
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        name: "Formatage",
        score: formattingScore,
        tip: formattingScore < 70 ? "Utilisez des sauts de ligne pour aérer le texte" : "Mise en forme claire !",
        icon: <Target className="w-4 h-4" />,
      },
      {
        name: "Hashtags",
        score: hashtagScore,
        tip: hashtagScore < 70 ? "Utilisez 3-5 hashtags pertinents" : "Bonne utilisation des hashtags !",
        icon: <Hash className="w-4 h-4" />,
      },
      {
        name: "Storytelling",
        score: storytellingScore,
        tip: storytellingScore < 70 ? "Racontez une histoire personnelle ou utilisez des chiffres" : "Narration engageante !",
        icon: <Lightbulb className="w-4 h-4" />,
      },
    ];

    // Suggestions d'amélioration
    const suggestions: string[] = [];
    if (!hasHook) suggestions.push("Commencez par une accroche percutante");
    if (!hasQuestion) suggestions.push("Posez une question pour inciter aux commentaires");
    if (!hasCTA) suggestions.push("Ajoutez un appel à l'action clair");
    if (hashtagCount === 0) suggestions.push("Ajoutez 3-5 hashtags pertinents");
    if (!hasGoodFormatting) suggestions.push("Aérez votre texte avec des sauts de ligne");
    if (!hasEmoji) suggestions.push("Utilisez 1-2 emojis pour attirer l'attention");
    if (words < 100) suggestions.push("Développez votre contenu (visez 100-300 mots)");

    // Estimations
    const baseReach = 500;
    const reachMultiplier = totalScore / 50;
    const estimatedReach = {
      min: Math.round(baseReach * reachMultiplier * 0.7),
      max: Math.round(baseReach * reachMultiplier * 1.5),
    };

    const estimatedEngagement = {
      likes: Math.round(estimatedReach.max * 0.03 * (totalScore / 100)),
      comments: Math.round(estimatedReach.max * 0.01 * (totalScore / 100)),
      shares: Math.round(estimatedReach.max * 0.005 * (totalScore / 100)),
    };

    return {
      score: totalScore,
      level,
      factors,
      suggestions: suggestions.slice(0, 4),
      estimatedReach,
      estimatedEngagement,
    };
  };

  useEffect(() => {
    if (content.length > 20) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const newPrediction = analyzeContent(content);
        setPrediction(newPrediction);
        onPredictionChange?.(newPrediction);
        setIsAnalyzing(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPrediction(null);
    }
  }, [content, onPredictionChange]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "viral":
        return "bg-gradient-to-r from-violet to-rose text-white";
      case "high":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-gold/20 text-gold border-gold/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "viral":
        return "Potentiel Viral 🚀";
      case "high":
        return "Fort Potentiel";
      case "medium":
        return "Potentiel Moyen";
      default:
        return "À Améliorer";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-gold";
    if (score >= 40) return "text-orange-400";
    return "text-rose";
  };

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-light" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Prédicteur de Viralité</CardTitle>
              <p className="text-xs text-white/50">Analysez le potentiel de votre post</p>
            </div>
          </div>
          {prediction && (
            <Badge className={getLevelColor(prediction.level)}>
              {getLevelText(prediction.level)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de texte */}
        <div className="space-y-2">
          <Textarea
            placeholder="Collez ou écrivez votre post LinkedIn ici pour analyser son potentiel viral..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-white/5 border-white/10 resize-none"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>{content.split(/\s+/).filter(Boolean).length} mots</span>
            <span>{content.length} caractères</span>
          </div>
        </div>

        {/* Résultats de l'analyse */}
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-light animate-pulse" />
              <span className="text-white/60">Analyse en cours...</span>
            </div>
          </div>
        )}

        {prediction && !isAnalyzing && (
          <div className="space-y-6">
            {/* Score global */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet/20 to-rose/20 border border-violet/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">Score de viralité</span>
                <span className={`text-3xl font-bold ${getScoreColor(prediction.score)}`}>
                  {prediction.score}%
                </span>
              </div>
              <Progress value={prediction.score} className="h-2" />
            </div>

            {/* Estimations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-white">
                  {prediction.estimatedReach.min.toLocaleString()}-{prediction.estimatedReach.max.toLocaleString()}
                </p>
                <p className="text-xs text-white/50">Vues estimées</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <Heart className="w-5 h-5 text-rose mx-auto mb-1" />
                <p className="text-lg font-semibold text-white">{prediction.estimatedEngagement.likes}</p>
                <p className="text-xs text-white/50">Likes estimés</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <MessageSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-white">{prediction.estimatedEngagement.comments}</p>
                <p className="text-xs text-white/50">Commentaires</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <Share2 className="w-5 h-5 text-gold mx-auto mb-1" />
                <p className="text-lg font-semibold text-white">{prediction.estimatedEngagement.shares}</p>
                <p className="text-xs text-white/50">Partages</p>
              </div>
            </div>

            {/* Facteurs détaillés */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-white/50" />
                Analyse détaillée
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {prediction.factors.map((factor) => (
                  <div
                    key={factor.name}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-white/50">{factor.icon}</div>
                        <span className="text-sm text-white">{factor.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(factor.score)}`}>
                        {factor.score}%
                      </span>
                    </div>
                    <Progress value={factor.score} className="h-1 mb-2" />
                    <p className="text-xs text-white/40">{factor.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {prediction.suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-gold" />
                  Suggestions d'amélioration
                </h4>
                <div className="space-y-2">
                  {prediction.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-gold/10 border border-gold/20"
                    >
                      <AlertCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white/80">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message de succès si score élevé */}
            {prediction.score >= 75 && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Excellent potentiel !</p>
                  <p className="text-xs text-white/60">
                    Votre post a toutes les chances de bien performer. Publiez-le aux heures de pointe (mardi-jeudi, 8h-10h).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message si pas de contenu */}
        {!prediction && !isAnalyzing && content.length <= 20 && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">
              Écrivez au moins 20 caractères pour lancer l'analyse
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ViralityPredictor;
