import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Save, 
  Send,
  User,
  Building2,
  Target,
  Lightbulb,
  Globe,
  Briefcase,
  ArrowLeft,
  Linkedin
} from "lucide-react";
import { Link } from "wouter";

export default function Generator() {
  const { user } = useAuth();
  const login = () => { window.location.href = getLoginUrl(); };
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Form state
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "inspirational" | "educational" | "provocative">("inspirational");
  const [language, setLanguage] = useState<"FR" | "EN" | "AR" | "ES" | "DE">("FR");
  const [postType, setPostType] = useState<"story" | "tips" | "question" | "announcement" | "motivation" | "insight">("motivation");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [batchCount, setBatchCount] = useState(3);

  // Generated posts
  const [generatedPosts, setGeneratedPosts] = useState<Array<{
    id: number;
    title: string;
    content: string;
    hashtags: string[];
    suggestedMedia?: string;
    callToAction?: string;
  }>>([]);

  // Get options
  const { data: options } = trpc.generator.options.useQuery();
  
  // Get user profile
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });

  // Generate mutation
  const generateMutation = trpc.generator.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedPosts(prev => [data, ...prev]);
      toast.success("Post généré avec succès !");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Generate batch mutation
  const generateBatchMutation = trpc.generator.generateBatch.useMutation({
    onSuccess: (data) => {
      setGeneratedPosts(prev => [...data, ...prev]);
      toast.success(`${data.length} posts générés avec succès !`);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!theme) {
      toast.error("Veuillez sélectionner une thématique");
      return;
    }
    generateMutation.mutate({
      theme,
      tone,
      language,
      postType,
      additionalInstructions: additionalInstructions || undefined,
    });
  };

  const handleGenerateBatch = () => {
    if (!theme) {
      toast.error("Veuillez sélectionner une thématique");
      return;
    }
    generateBatchMutation.mutate({
      theme,
      tone,
      language,
      count: batchCount,
      additionalInstructions: additionalInstructions || undefined,
    });
  };

  const copyToClipboard = async (content: string, id: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLoading = generateMutation.isPending || generateBatchMutation.isPending;

  // State for publishing
  const [publishingPostId, setPublishingPostId] = useState<number | null>(null);

  // Publish to LinkedIn
  const handlePublishToLinkedIn = async (post: typeof generatedPosts[0]) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour publier");
      return;
    }

    setPublishingPostId(post.id);
    try {
      const response = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          hashtags: post.hashtags,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Post publié sur LinkedIn avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Erreur lors de la publication sur LinkedIn");
    } finally {
      setPublishingPostId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-amber-900/20 bg-gradient-to-r from-amber-950/20 to-transparent">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </header>

        <div className="container py-20">
          <Card className="max-w-md mx-auto bg-card/50 border-amber-900/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Générateur de Contenu IA</CardTitle>
              <CardDescription>
                Connectez-vous pour générer des posts LinkedIn personnalisés avec l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={login} 
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
              >
                Se connecter pour commencer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-amber-900/20 bg-gradient-to-r from-amber-950/20 to-transparent">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour aux posts
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Connecté en tant que</span>
            <Badge variant="outline" className="border-amber-700/50 text-amber-400">
              {user.name || user.email}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Generator Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Générateur de Contenu IA
              </h1>
              <p className="text-muted-foreground mt-2">
                Créez des posts LinkedIn personnalisés basés sur votre profil et vos objectifs
              </p>
            </div>

            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/50">
                <TabsTrigger value="generate">Générer</TabsTrigger>
                <TabsTrigger value="profile">Mon Profil</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4 mt-4">
                <Card className="bg-card/50 border-amber-900/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Paramètres de génération
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Theme */}
                    <div className="space-y-2">
                      <Label>Thématique *</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Choisir une thématique" />
                        </SelectTrigger>
                        <SelectContent>
                          {options?.themes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label>Langue</Label>
                      <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FR">🇫🇷 Français</SelectItem>
                          <SelectItem value="EN">🇬🇧 English</SelectItem>
                          <SelectItem value="AR">🇸🇦 العربية</SelectItem>
                          <SelectItem value="ES">🇪🇸 Español</SelectItem>
                          <SelectItem value="DE">🇩🇪 Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                      <Label>Ton</Label>
                      <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">💼 Professionnel</SelectItem>
                          <SelectItem value="casual">😊 Décontracté</SelectItem>
                          <SelectItem value="inspirational">✨ Inspirant</SelectItem>
                          <SelectItem value="educational">📚 Éducatif</SelectItem>
                          <SelectItem value="provocative">🔥 Provocateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Post Type */}
                    <div className="space-y-2">
                      <Label>Type de post</Label>
                      <Select value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">📖 Storytelling</SelectItem>
                          <SelectItem value="tips">💡 Conseils</SelectItem>
                          <SelectItem value="question">❓ Question</SelectItem>
                          <SelectItem value="announcement">📢 Annonce</SelectItem>
                          <SelectItem value="motivation">🚀 Motivation</SelectItem>
                          <SelectItem value="insight">🎯 Insight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Instructions */}
                    <div className="space-y-2">
                      <Label>Instructions supplémentaires (optionnel)</Label>
                      <Textarea
                        placeholder="Ex: Parler de mon nouveau projet, mentionner mon école KEOS..."
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        className="bg-background/50 min-h-[100px]"
                      />
                    </div>

                    {/* Generate Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !theme}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Générer 1 post
                      </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Select 
                        value={batchCount.toString()} 
                        onValueChange={(v) => setBatchCount(parseInt(v))}
                      >
                        <SelectTrigger className="w-20 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleGenerateBatch}
                        disabled={isLoading || !theme}
                        variant="outline"
                        className="flex-1 border-amber-700/50 hover:bg-amber-950/30"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Générer {batchCount} posts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                <ProfileForm profile={profile} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Generated Posts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Posts générés</h2>
              {generatedPosts.length > 0 && (
                <Badge variant="outline" className="border-amber-700/50">
                  {generatedPosts.length} post{generatedPosts.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {generatedPosts.length === 0 ? (
              <Card className="bg-card/30 border-dashed border-amber-900/30">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-500/50" />
                  <p className="text-muted-foreground">
                    Vos posts générés apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {generatedPosts.map((post) => (
                  <Card key={post.id} className="bg-card/50 border-amber-900/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{post.title}</CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(post.content, post.id)}
                          className="hover:bg-amber-950/30"
                        >
                          {copiedId === post.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-amber-950/30">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {post.suggestedMedia && (
                        <div className="text-xs text-muted-foreground bg-background/30 p-2 rounded">
                          <strong>Média suggéré:</strong> {post.suggestedMedia}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 border-amber-700/50">
                            <Save className="w-3 h-3 mr-1" />
                            Sauvegarder
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-purple-700/50 text-purple-400 hover:bg-purple-950/30"
                            onClick={() => {
                              // Stocker le contenu et rediriger vers Auto-Publish pour générer l'image
                              sessionStorage.setItem('generateImageContent', post.content);
                              window.location.href = '/auto-publish?tab=preview&generateImage=true';
                            }}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Générer image
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-[#0077B5] hover:bg-[#006699]"
                          onClick={() => handlePublishToLinkedIn(post)}
                          disabled={publishingPostId === post.id}
                        >
                          {publishingPostId === post.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Linkedin className="w-3 h-3 mr-1" />
                          )}
                          {publishingPostId === post.id ? "Publication..." : "Publier sur LinkedIn"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Form Component
function ProfileForm({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    companyName: profile?.companyName || "",
    industry: profile?.industry || "",
    sector: profile?.sector || "",
    targetAudience: profile?.targetAudience || "",
    personalBio: profile?.personalBio || "",
    achievements: profile?.achievements || "",
    businessGoals: profile?.businessGoals || "",
    uniqueSellingPoints: profile?.uniqueSellingPoints || "",
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour !");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Card className="bg-card/50 border-amber-900/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-amber-500" />
          Mon Profil
        </CardTitle>
        <CardDescription>
          Ces informations seront utilisées pour personnaliser vos posts générés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Entreprise
              </Label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Ex: KEOS Business School"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Secteur
              </Label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Ex: Éducation, Tech, Restauration..."
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Target className="w-3 h-3" /> Audience cible
            </Label>
            <Input
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="Ex: Entrepreneurs, étudiants, professionnels du marketing..."
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio personnelle</Label>
            <Textarea
              value={formData.personalBio}
              onChange={(e) => setFormData(prev => ({ ...prev, personalBio: e.target.value }))}
              placeholder="Décrivez-vous en quelques phrases..."
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Réalisations clés</Label>
            <Textarea
              value={formData.achievements}
              onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              placeholder="Ex: 500K+ abonnés LinkedIn, fondateur de 3 entreprises..."
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Objectifs business
            </Label>
            <Textarea
              value={formData.businessGoals}
              onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
              placeholder="Ex: Atteindre 1M d'abonnés, développer en Arabie Saoudite..."
              className="bg-background/50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Sauvegarder le profil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
