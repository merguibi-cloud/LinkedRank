import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  ThumbsUp, 
  Heart, 
  Reply, 
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Loader2,
  Copy,
  Edit,
  Trash2,
  Filter,
  Search,
  Bot,
  Star,
  MessageCircle,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Types
interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  authorAvatar?: string;
  authorHeadline?: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative" | "question";
  priority: "high" | "medium" | "low";
  suggestedResponse?: string;
  createdAt: string;
  isResponded: boolean;
}

interface EngagementStats {
  totalComments: number;
  pendingResponses: number;
  respondedToday: number;
  avgResponseTime: string;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    question: number;
  };
}

// Mock data for demonstration
const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    postId: "post-1",
    postTitle: "5 stratégies pour doubler votre engagement LinkedIn",
    authorName: "Marie Dupont",
    authorAvatar: "",
    authorHeadline: "Marketing Manager @ TechCorp",
    content: "Super article ! J'ai appliqué la stratégie #3 et j'ai vu une augmentation de 40% de mes impressions. Merci pour ces conseils précieux !",
    sentiment: "positive",
    priority: "high",
    suggestedResponse: "Merci beaucoup Marie ! 🙏 C'est génial d'entendre que la stratégie #3 fonctionne si bien pour vous. 40% d'augmentation, c'est impressionnant ! Continuez comme ça et n'hésitez pas à partager vos autres résultats.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isResponded: false,
  },
  {
    id: "2",
    postId: "post-1",
    postTitle: "5 stratégies pour doubler votre engagement LinkedIn",
    authorName: "Pierre Martin",
    authorHeadline: "Entrepreneur | Consultant Digital",
    content: "Intéressant, mais comment adapter ces conseils pour un secteur B2B très technique comme l'industrie ?",
    sentiment: "question",
    priority: "high",
    suggestedResponse: "Excellente question Pierre ! 🎯 Pour le B2B technique, je recommande d'adapter la stratégie en mettant l'accent sur les études de cas et les données concrètes. Votre audience apprécie les preuves tangibles. Je prépare justement un article sur ce sujet, restez connecté !",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isResponded: false,
  },
  {
    id: "3",
    postId: "post-2",
    postTitle: "L'IA va-t-elle remplacer les créateurs de contenu ?",
    authorName: "Sophie Laurent",
    authorHeadline: "Content Strategist | Freelance",
    content: "Je ne suis pas d'accord avec votre point de vue. L'IA ne peut pas remplacer la créativité humaine et l'authenticité.",
    sentiment: "negative",
    priority: "medium",
    suggestedResponse: "Merci Sophie pour votre perspective ! 💭 Vous soulevez un point crucial. Je suis d'accord que l'authenticité reste irremplaçable. Mon point était plutôt que l'IA peut être un outil d'amplification, pas de remplacement. Qu'en pensez-vous ?",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isResponded: false,
  },
  {
    id: "4",
    postId: "post-2",
    postTitle: "L'IA va-t-elle remplacer les créateurs de contenu ?",
    authorName: "Thomas Petit",
    authorHeadline: "CEO @ StartupAI",
    content: "Très bonne analyse ! J'utilise déjà l'IA pour optimiser mes contenus et les résultats sont bluffants.",
    sentiment: "positive",
    priority: "low",
    suggestedResponse: "Merci Thomas ! 🚀 C'est exactement l'approche que je recommande : utiliser l'IA comme un multiplicateur de force. Quels outils utilisez-vous principalement ?",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isResponded: true,
  },
];

const MOCK_STATS: EngagementStats = {
  totalComments: 47,
  pendingResponses: 12,
  respondedToday: 8,
  avgResponseTime: "45 min",
  sentimentBreakdown: {
    positive: 28,
    neutral: 10,
    negative: 4,
    question: 5,
  },
};

// Response templates
const RESPONSE_TEMPLATES = [
  { id: "thanks", label: "Remerciement", template: "Merci beaucoup pour votre commentaire ! 🙏" },
  { id: "question", label: "Répondre à une question", template: "Excellente question ! Voici ma réponse : " },
  { id: "debate", label: "Débat constructif", template: "Merci pour votre perspective ! Je comprends votre point de vue. Cependant, " },
  { id: "cta", label: "Call-to-action", template: "Si ce sujet vous intéresse, n'hésitez pas à me suivre pour plus de contenus sur ce thème !" },
];

export default function EngagementManager() {
  const [activeTab, setActiveTab] = useState<"inbox" | "templates" | "analytics">("inbox");
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [stats] = useState<EngagementStats>(MOCK_STATS);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter comments
  const filteredComments = comments.filter(comment => {
    if (filterSentiment !== "all" && comment.sentiment !== filterSentiment) return false;
    if (searchQuery && !comment.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !comment.authorName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return !comment.isResponded;
  });

  const handleSelectComment = (comment: Comment) => {
    setSelectedComment(comment);
    setResponseText(comment.suggestedResponse || "");
  };

  const handleGenerateResponse = async () => {
    if (!selectedComment) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      `Merci ${selectedComment.authorName.split(" ")[0]} pour votre retour ! 🙏 Votre commentaire soulève des points très pertinents. `,
      `Super remarque ${selectedComment.authorName.split(" ")[0]} ! J'apprécie vraiment que vous preniez le temps de partager votre perspective. `,
      `Excellente contribution ${selectedComment.authorName.split(" ")[0]} ! C'est exactement le type de discussion que j'espérais générer. `,
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setResponseText(randomResponse);
    setIsGenerating(false);
    toast.success("Réponse générée !");
  };

  const handleSendResponse = async () => {
    if (!selectedComment || !responseText.trim()) return;
    
    setIsSending(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark as responded
    setComments(prev => prev.map(c => 
      c.id === selectedComment.id ? { ...c, isResponded: true } : c
    ));
    
    setIsSending(false);
    setSelectedComment(null);
    setResponseText("");
    toast.success("Réponse envoyée !", {
      description: "Votre réponse a été publiée sur LinkedIn",
    });
  };

  const handleUseTemplate = (template: string) => {
    setResponseText(prev => prev + template);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseText);
    toast.success("Copié dans le presse-papiers");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-500 bg-green-500/10";
      case "negative": return "text-red-500 bg-red-500/10";
      case "question": return "text-blue-500 bg-blue-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <Heart className="h-4 w-4" />;
      case "negative": return <AlertCircle className="h-4 w-4" />;
      case "question": return <MessageCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      default: return "text-green-500 bg-green-500/10";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return `il y a ${diffDays}j`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              Engagement Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos commentaires et boostez votre engagement avec l'IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
            <Button size="sm">
              <Bot className="h-4 w-4 mr-1" />
              Mode Auto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                  <p className="text-xs text-muted-foreground">Total commentaires</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingResponses}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.respondedToday}</p>
                  <p className="text-xs text-muted-foreground">Répondu aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                  <p className="text-xs text-muted-foreground">Temps moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Sentiment</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs">{stats.sentimentBreakdown.positive}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-xs">{stats.sentimentBreakdown.neutral}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs">{stats.sentimentBreakdown.negative}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs">{stats.sentimentBreakdown.question}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="inbox" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Boîte de réception
              {filteredComments.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {filteredComments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Comments List */}
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="all">Tous</option>
                    <option value="positive">Positif</option>
                    <option value="negative">Négatif</option>
                    <option value="question">Questions</option>
                    <option value="neutral">Neutre</option>
                  </select>
                </div>

                {/* Comments */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredComments.length === 0 ? (
                    <Card className="border-border/50 bg-card/50">
                      <CardContent className="p-8 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-medium">Tout est à jour !</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aucun commentaire en attente de réponse
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredComments.map((comment) => (
                      <Card 
                        key={comment.id}
                        className={`border-border/50 bg-card/50 cursor-pointer transition-all hover:border-primary/50 ${
                          selectedComment?.id === comment.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleSelectComment(comment)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.authorAvatar} />
                              <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{comment.authorName}</span>
                                <Badge className={getSentimentColor(comment.sentiment)} variant="secondary">
                                  {getSentimentIcon(comment.sentiment)}
                                </Badge>
                                <Badge className={getPriorityColor(comment.priority)} variant="secondary">
                                  {comment.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-2">
                                {comment.authorHeadline}
                              </p>
                              <p className="text-sm line-clamp-2">{comment.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  Sur : {comment.postTitle.substring(0, 30)}...
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimeAgo(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Response Panel */}
              <div className="space-y-4">
                {selectedComment ? (
                  <>
                    {/* Selected Comment */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedComment.authorAvatar} />
                            <AvatarFallback>{selectedComment.authorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{selectedComment.authorName}</CardTitle>
                            <CardDescription>{selectedComment.authorHeadline}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedComment.content}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Sur le post : "{selectedComment.postTitle}"
                        </p>
                      </CardContent>
                    </Card>

                    {/* Response Editor */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Reply className="h-5 w-5 text-primary" />
                          Votre réponse
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Écrivez votre réponse..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={5}
                          className="bg-background"
                        />

                        {/* Quick templates */}
                        <div className="flex flex-wrap gap-2">
                          {RESPONSE_TEMPLATES.map((template) => (
                            <Button
                              key={template.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleUseTemplate(template.template)}
                            >
                              {template.label}
                            </Button>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleGenerateResponse}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Générer avec l'IA
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyResponse}
                            disabled={!responseText}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleSendResponse}
                            disabled={isSending || !responseText.trim()}
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Envoyer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border-border/50 bg-card/50 h-full min-h-[400px] flex items-center justify-center">
                    <CardContent className="text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-medium">Sélectionnez un commentaire</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cliquez sur un commentaire pour y répondre
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Templates de réponse</CardTitle>
                <CardDescription>
                  Créez et gérez vos templates de réponse pour gagner du temps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {RESPONSE_TEMPLATES.map((template) => (
                  <div key={template.id} className="p-4 rounded-lg bg-muted/50 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{template.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{template.template}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ajouter un template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Performance d'engagement</CardTitle>
                  <CardDescription>Évolution sur les 7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Répartition des sentiments</CardTitle>
                  <CardDescription>Analyse des commentaires reçus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="flex-1">Positif</span>
                      <span className="font-medium">{stats.sentimentBreakdown.positive}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500" />
                      <span className="flex-1">Neutre</span>
                      <span className="font-medium">{stats.sentimentBreakdown.neutral}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="flex-1">Négatif</span>
                      <span className="font-medium">{stats.sentimentBreakdown.negative}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="flex-1">Questions</span>
                      <span className="font-medium">{stats.sentimentBreakdown.question}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 md:col-span-2">
                <CardHeader>
                  <CardTitle>Conseils IA</CardTitle>
                  <CardDescription>Recommandations pour améliorer votre engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-primary" />
                        <span className="font-medium">Répondez plus vite</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Les réponses dans l'heure génèrent 3x plus d'engagement
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Personnalisez vos réponses</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mentionnez le prénom de la personne pour créer une connexion
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
