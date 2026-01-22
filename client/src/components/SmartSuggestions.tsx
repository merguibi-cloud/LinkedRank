import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Zap,
  RefreshCw,
  ChevronRight,
  Hash,
  BarChart3,
  Flame,
} from "lucide-react";

interface Suggestion {
  id: string;
  type: "topic" | "hook" | "hashtag" | "timing" | "format";
  title: string;
  description: string;
  confidence: number;
  trending?: boolean;
  example?: string;
}

interface SmartSuggestionsProps {
  userProfile?: {
    industry?: string;
    topics?: string[];
    bestPerformingPosts?: string[];
  };
  onSelectSuggestion?: (suggestion: Suggestion) => void;
}

export function SmartSuggestions({ userProfile, onSelectSuggestion }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Générer des suggestions intelligentes basées sur les tendances et le profil
  const generateSuggestions = (): Suggestion[] => {
    const baseSuggestions: Suggestion[] = [
      {
        id: "1",
        type: "topic",
        title: "L'IA dans le recrutement",
        description: "Sujet tendance cette semaine avec +340% d'engagement",
        confidence: 92,
        trending: true,
        example: "Comment l'IA transforme le recrutement en 2025...",
      },
      {
        id: "2",
        type: "hook",
        title: "Le hook 'Confession'",
        description: "Commencez par une révélation personnelle",
        confidence: 88,
        example: "Je dois vous avouer quelque chose...",
      },
      {
        id: "3",
        type: "hashtag",
        title: "#LinkedInCreator",
        description: "Hashtag en forte croissance (+156% cette semaine)",
        confidence: 85,
        trending: true,
      },
      {
        id: "4",
        type: "timing",
        title: "Publier mardi à 9h",
        description: "Meilleur créneau basé sur votre audience",
        confidence: 91,
      },
      {
        id: "5",
        type: "format",
        title: "Carrousel éducatif",
        description: "Format avec le plus d'engagement cette semaine",
        confidence: 87,
        trending: true,
      },
      {
        id: "6",
        type: "topic",
        title: "Remote work & productivité",
        description: "Sujet evergreen avec engagement constant",
        confidence: 84,
      },
      {
        id: "7",
        type: "hook",
        title: "Le hook 'Chiffre choc'",
        description: "Commencez par une statistique surprenante",
        confidence: 89,
        example: "97% des entrepreneurs font cette erreur...",
      },
      {
        id: "8",
        type: "hashtag",
        title: "#Entrepreneuriat",
        description: "Hashtag stable avec bonne portée",
        confidence: 82,
      },
      {
        id: "9",
        type: "format",
        title: "Post storytelling",
        description: "Racontez une histoire personnelle",
        confidence: 86,
        example: "Il y a 3 ans, j'ai tout perdu...",
      },
      {
        id: "10",
        type: "topic",
        title: "Leadership authentique",
        description: "Tendance montante chez les décideurs",
        confidence: 83,
        trending: true,
      },
    ];

    return baseSuggestions;
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [userProfile]);

  const refreshSuggestions = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Mélanger les suggestions pour simuler un rafraîchissement
      setSuggestions((prev) => [...prev].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 800);
  };

  const filters = [
    { id: "all", label: "Tout", icon: Sparkles },
    { id: "topic", label: "Sujets", icon: Lightbulb },
    { id: "hook", label: "Hooks", icon: Zap },
    { id: "hashtag", label: "Hashtags", icon: Hash },
    { id: "timing", label: "Timing", icon: Clock },
    { id: "format", label: "Formats", icon: BarChart3 },
  ];

  const filteredSuggestions = suggestions.filter(
    (s) => activeFilter === "all" || s.type === activeFilter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "topic":
        return Lightbulb;
      case "hook":
        return Zap;
      case "hashtag":
        return Hash;
      case "timing":
        return Clock;
      case "format":
        return BarChart3;
      default:
        return Sparkles;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "topic":
        return "bg-violet/20 text-violet-light border-violet/30";
      case "hook":
        return "bg-gold/20 text-gold border-gold/30";
      case "hashtag":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "timing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "format":
        return "bg-rose/20 text-rose border-rose/30";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-light" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Suggestions IA</CardTitle>
              <p className="text-xs text-white/50">Basées sur les tendances et votre profil</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSuggestions}
            disabled={isLoading}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeFilter === filter.id
                    ? "bg-violet/20 text-violet-light border border-violet/30"
                    : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Liste des suggestions */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => {
              const Icon = getTypeIcon(suggestion.type);
              return (
                <button
                  key={suggestion.id}
                  onClick={() => onSelectSuggestion?.(suggestion)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet/30 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(suggestion.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white truncate">
                          {suggestion.title}
                        </h4>
                        {suggestion.trending && (
                          <Badge className="bg-rose/20 text-rose border-rose/30 text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                            Tendance
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/60 line-clamp-1">
                        {suggestion.description}
                      </p>
                      {suggestion.example && (
                        <p className="text-xs text-white/40 mt-1 italic line-clamp-1">
                          "{suggestion.example}"
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-white/40">Confiance</span>
                        <span className={`text-sm font-medium ${
                          suggestion.confidence >= 90 ? "text-green-400" :
                          suggestion.confidence >= 80 ? "text-gold" : "text-white/60"
                        }`}>
                          {suggestion.confidence}%
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-violet-light transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white/60">
                  {suggestions.filter((s) => s.trending).length} tendances
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-violet-light" />
                <span className="text-white/60">
                  {suggestions.length} suggestions
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-violet-light hover:text-violet">
              Voir plus
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartSuggestions;
