import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, 
  Facebook, 
  Target, 
  Users, 
  TrendingUp, 
  Sparkles,
  Copy,
  Download,
  Share2,
  CheckCircle2,
  Zap,
  MessageSquare,
  Heart,
  Eye,
  Calendar,
  DollarSign,
  BarChart3,
  Rocket
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VisualTemplates } from "@/components/VisualTemplates";
import { PostScheduler } from "@/components/PostScheduler";

// Agents Marketing spécialisés
const marketingAgents = [
  {
    id: "instagram-agent",
    name: "Insta",
    role: "Instagram Specialist",
    avatar: "📸",
    personality: "Visuel & Créatif",
    description: "Expert en création de contenu visuel pour Instagram. Je crée des posts, stories et reels qui captent l'attention.",
    skills: ["Reels", "Stories", "Carrousels", "Hashtags"],
    color: "from-pink-500 to-purple-500",
    stats: { posts: 1250, engagement: "8.5%", reach: "45K" },
  },
  {
    id: "facebook-agent",
    name: "Meta",
    role: "Facebook Strategist",
    avatar: "📘",
    personality: "Communautaire & Engageant",
    description: "Spécialiste des communautés Facebook. Je crée du contenu qui génère des discussions et fidélise votre audience.",
    skills: ["Posts", "Groupes", "Lives", "Ads"],
    color: "from-blue-500 to-blue-600",
    stats: { posts: 890, engagement: "6.2%", reach: "32K" },
  },
  {
    id: "content-agent",
    name: "Créa",
    role: "Content Creator",
    avatar: "✨",
    personality: "Innovant & Storyteller",
    description: "Je transforme vos idées en histoires captivantes adaptées à chaque plateforme sociale.",
    skills: ["Copywriting", "Storytelling", "Hooks", "CTA"],
    color: "from-violet to-rose",
    stats: { posts: 2100, engagement: "9.1%", reach: "78K" },
  },
];

// Audiences cibles
const targetAudiences = [
  {
    id: "creators",
    name: "Créateurs de contenu",
    icon: "🎨",
    description: "Influenceurs, YouTubers, podcasters qui veulent développer leur présence LinkedIn",
    size: "2.5M",
    interests: ["Personal branding", "Monétisation", "Croissance audience"],
    platforms: ["Instagram", "YouTube", "TikTok"],
    pain_points: ["Manque de temps", "Pas d'idées", "Algorithme LinkedIn complexe"],
    messaging: "Automatisez votre LinkedIn pendant que vous créez du contenu ailleurs",
  },
  {
    id: "entrepreneurs",
    name: "Entrepreneurs",
    icon: "🚀",
    description: "Fondateurs de startups et PME qui veulent générer des leads via LinkedIn",
    size: "1.8M",
    interests: ["Lead generation", "Networking", "Visibilité"],
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    pain_points: ["Pas le temps de poster", "ROI incertain", "Besoin de leads"],
    messaging: "Transformez LinkedIn en machine à leads avec nos agents IA",
  },
  {
    id: "sales",
    name: "Commerciaux",
    icon: "💼",
    description: "Sales, BDR, Account Executives qui prospectent sur LinkedIn",
    size: "3.2M",
    interests: ["Prospection", "Personal branding", "Social selling"],
    platforms: ["LinkedIn", "Email", "CRM"],
    pain_points: ["Prospection chronophage", "Profil peu visible", "Pas de contenu"],
    messaging: "Devenez un top performer LinkedIn sans y passer des heures",
  },
];

// Templates de posts pour les campagnes
const campaignTemplates = {
  instagram: [
    {
      type: "Reel",
      hook: "🤯 J'ai automatisé mon LinkedIn et voici ce qui s'est passé...",
      content: "Montrer les résultats avant/après avec LinkedAgents",
      cta: "Lien en bio pour essayer gratuitement",
      hashtags: "#LinkedInTips #AITools #ContentCreator #Automation",
    },
    {
      type: "Carrousel",
      hook: "5 raisons pour lesquelles les top créateurs utilisent l'IA sur LinkedIn",
      content: "Slides éducatives avec statistiques et témoignages",
      cta: "Sauvegarde ce post et teste LinkedAgents",
      hashtags: "#LinkedInGrowth #AIMarketing #SocialMedia",
    },
    {
      type: "Story",
      hook: "POV: Tu découvres que l'IA peut poster sur LinkedIn à ta place",
      content: "Démonstration rapide de l'interface",
      cta: "Swipe up pour essayer",
      hashtags: "#LinkedInHacks #Productivity",
    },
  ],
  facebook: [
    {
      type: "Post Groupe",
      hook: "🔥 Qui d'autre galère à être régulier sur LinkedIn ?",
      content: "Partage d'expérience + solution avec LinkedAgents",
      cta: "Commentez 'IA' pour recevoir le lien",
      engagement: "Question ouverte pour générer des commentaires",
    },
    {
      type: "Vidéo",
      hook: "Comment j'ai multiplié par 3 mon engagement LinkedIn en 30 jours",
      content: "Tutoriel pas à pas avec résultats",
      cta: "Lien dans les commentaires",
      engagement: "Demander aux gens de partager leurs résultats",
    },
    {
      type: "Ad",
      hook: "Entrepreneurs : Arrêtez de perdre du temps sur LinkedIn",
      content: "Témoignage client + démo produit",
      cta: "Essai gratuit - 3 agents IA inclus",
      targeting: "Entrepreneurs, Freelances, Consultants",
    },
  ],
};

export default function MarketingCampaign() {
  
  const [selectedAudience, setSelectedAudience] = useState(targetAudiences[0]);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copié dans le presse-papier !");
  };

  const handleGenerateContent = async (platform: string, audience: typeof targetAudiences[0]) => {
    setIsGenerating(true);
    
    // Simuler la génération de contenu
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const content = platform === "instagram" 
      ? `🚀 ${audience.icon} Attention ${audience.name} !\n\nVous passez des heures sur LinkedIn sans résultats ?\n\n${audience.pain_points[0]} ? ${audience.pain_points[1]} ?\n\nJ'ai découvert LinkedAgents et ça a tout changé :\n✅ 3 agents IA qui travaillent 24/7\n✅ Posts générés automatiquement\n✅ Engagement x3 en 30 jours\n\n${audience.messaging}\n\n👉 Lien en bio pour essayer gratuitement\n\n#LinkedIn #AI #${audience.name.replace(/\s/g, "")} #Automation`
      : `🔥 ${audience.icon} À tous les ${audience.name} qui galèrent sur LinkedIn...\n\nJe sais ce que c'est :\n❌ ${audience.pain_points[0]}\n❌ ${audience.pain_points[1]}\n❌ ${audience.pain_points[2]}\n\nMais j'ai trouvé LA solution : LinkedAgents\n\n3 agents IA qui :\n✨ Créent du contenu viral\n✨ Détectent les tendances\n✨ Gèrent votre engagement\n\n${audience.messaging}\n\nCommentez "IA" pour recevoir le lien d'essai gratuit 👇`;
    
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Campagne Marketing</h1>
            <p className="mt-2 text-muted-foreground">
              Agents IA pour vos campagnes Instagram et Facebook
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/20">
              <Calendar className="mr-2 h-4 w-4" />
              Planifier
            </Button>
            <Button className="btn-gradient">
              <Rocket className="mr-2 h-4 w-4" />
              Lancer la campagne
            </Button>
          </div>
        </div>

        {/* Marketing Agents */}
        <div className="grid gap-4 md:grid-cols-3">
          {marketingAgents.map((agent) => (
            <Card key={agent.id} className="border-white/10 bg-white/5 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${agent.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} text-2xl`}>
                    {agent.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                    <CardDescription>{agent.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">{agent.description}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {agent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-white/10 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/5 p-2">
                    <p className="text-lg font-bold text-white">{agent.stats.posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <p className="text-lg font-bold text-emerald-400">{agent.stats.engagement}</p>
                    <p className="text-xs text-muted-foreground">Engage.</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <p className="text-lg font-bold text-violet-light">{agent.stats.reach}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Target Audiences */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5" />
              Audiences Cibles
            </CardTitle>
            <CardDescription>
              Sélectionnez votre audience pour générer du contenu personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {targetAudiences.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => setSelectedAudience(audience)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedAudience.id === audience.id
                      ? "border-violet bg-violet/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{audience.icon}</span>
                    <h4 className="font-semibold text-white">{audience.name}</h4>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{audience.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{audience.size} personnes</span>
                  </div>
                  {selectedAudience.id === audience.id && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-violet-light">Pain points :</p>
                      <ul className="space-y-1">
                        {audience.pain_points.map((point, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-1 w-1 rounded-full bg-rose" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Templates */}
        <Tabs defaultValue="instagram" className="space-y-4">
          <TabsList className="bg-white/5">
            <TabsTrigger value="instagram" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500">
              <Instagram className="mr-2 h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-500">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {campaignTemplates.instagram.map((template, index) => (
                <Card key={index} className="border-white/10 bg-white/5">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-gradient-to-r from-pink-500 to-purple-500">
                      {template.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Hook</p>
                      <p className="font-medium text-white">{template.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contenu</p>
                      <p className="text-sm text-muted-foreground">{template.content}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTA</p>
                      <p className="text-sm text-emerald-400">{template.cta}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.hashtags.split(" ").map((tag) => (
                        <span key={tag} className="text-xs text-violet-light">{tag}</span>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20"
                      onClick={() => handleCopyContent(`${template.hook}\n\n${template.content}\n\n${template.cta}\n\n${template.hashtags}`)}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Copier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate Custom Content */}
            <Card className="border-violet/30 bg-violet/10">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Générer du contenu personnalisé</h4>
                    <p className="text-sm text-muted-foreground">
                      Pour l'audience : {selectedAudience.name}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateContent("instagram", selectedAudience)}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Générer pour Instagram
                      </>
                    )}
                  </Button>
                </div>

                {generatedContent && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-background/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Contenu généré</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContent(generatedContent)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white">{generatedContent}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {campaignTemplates.facebook.map((template, index) => (
                <Card key={index} className="border-white/10 bg-white/5">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-blue-500">
                      {template.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Hook</p>
                      <p className="font-medium text-white">{template.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contenu</p>
                      <p className="text-sm text-muted-foreground">{template.content}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTA</p>
                      <p className="text-sm text-emerald-400">{template.cta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm text-violet-light">{template.engagement || template.targeting}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20"
                      onClick={() => handleCopyContent(`${template.hook}\n\n${template.content}\n\n${template.cta}`)}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Copier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate Custom Content for Facebook */}
            <Card className="border-blue-500/30 bg-blue-500/10">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Générer du contenu personnalisé</h4>
                    <p className="text-sm text-muted-foreground">
                      Pour l'audience : {selectedAudience.name}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateContent("facebook", selectedAudience)}
                    disabled={isGenerating}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Générer pour Facebook
                      </>
                    )}
                  </Button>
                </div>

                {generatedContent && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-background/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Contenu généré</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyContent(generatedContent)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white">{generatedContent}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Campaign Stats Preview */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5" />
              Prévisions de la campagne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <Eye className="mx-auto mb-2 h-6 w-6 text-violet-light" />
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-sm text-muted-foreground">Impressions estimées</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <Heart className="mx-auto mb-2 h-6 w-6 text-rose" />
                <p className="text-2xl font-bold text-white">3.5K</p>
                <p className="text-sm text-muted-foreground">Engagements prévus</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-muted-foreground">Nouveaux leads</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <DollarSign className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <p className="text-2xl font-bold text-white">2.5x</p>
                <p className="text-sm text-muted-foreground">ROI estimé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Templates Section */}
        <VisualTemplates />

        {/* Post Scheduler Section */}
        <PostScheduler />
      </div>
    </DashboardLayout>
  );
}
