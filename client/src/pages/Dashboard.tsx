import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { QuickActions } from "@/components/QuickActions";
import { AgentStatusWidget } from "@/components/AgentStatusWidget";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { ContextualHelp } from "@/components/ContextualHelp";
import { AIRecommendations } from "@/components/AIRecommendations";
import { GamificationWidget } from "@/components/GamificationWidget";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { PersonalizedTips, WelcomeWidget } from "@/components/PersonalizedTips";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Zap,
  BookOpen,
  BarChart3,
  Clock,
  Target,
  Flame,
  ArrowRight,
  Copy,
  Download,
  Send,
  Star,
  Filter,
  Loader2,
  Check,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [publishingPostId, setPublishingPostId] = useState<number | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  // Fetch user's generated posts
  const { data: postsData } = trpc.posts.list.useQuery({
    limit: 10,
  });

  // Fetch top content for inspiration
  const { data: topContent } = trpc.posts.list.useQuery({
    limit: 6,
    language: "FR",
  });

  // Handle copy to clipboard
  const handleCopy = async (content: string, postId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPostId(postId);
      toast.success("Contenu copié dans le presse-papiers !");
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  // Handle publish to LinkedIn
  const handlePublish = async (content: string, postId: number) => {
    setPublishingPostId(postId);
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Post publié sur LinkedIn avec succès !");
      } else if (data.error === "LinkedIn not connected") {
        // Redirect to LinkedIn auth with format=json
        const authResponse = await fetch("/api/linkedin/auth?format=json");
        const authData = await authResponse.json();
        if (authData.authUrl) {
          toast.info("Redirection vers LinkedIn pour autorisation...");
          window.location.href = authData.authUrl;
        } else {
          toast.error("Erreur de configuration LinkedIn");
        }
      } else if (data.error === "LinkedIn token expired, please reconnect") {
        const authResponse = await fetch("/api/linkedin/auth?format=json");
        const authData = await authResponse.json();
        if (authData.authUrl) {
          toast.info("Token expiré, reconnexion à LinkedIn...");
          window.location.href = authData.authUrl;
        }
      } else if (data.error?.includes("DUPLICATE_POST") || data.error?.includes("duplicate")) {
        toast.error("Ce post a déjà été publié sur LinkedIn");
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Erreur publication:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setPublishingPostId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Accédez à votre Dashboard
            </h1>
            <p className="text-muted-foreground mb-8">
              Connectez-vous pour accéder à tous vos outils de création de contenu, vos statistiques et vos posts générés.
            </p>
            <a href={getLoginUrl()}>
              <Button className="btn-gradient">Se connecter</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Posts générés",
      value: postsData?.posts?.length || 47,
      icon: Sparkles,
      change: "+18 ce mois",
      color: "violet",
    },
    {
      label: "Vues totales",
      value: "125K",
      icon: Eye,
      change: "+32% vs mois dernier",
      color: "rose",
    },
    {
      label: "Engagement moyen",
      value: "5.8%",
      icon: Heart,
      change: "+1.2% vs mois dernier",
      color: "gold",
    },
    {
      label: "Streak actuel",
      value: "12 🔥",
      icon: Calendar,
      change: "Record personnel battu !",
      color: "emerald",
    },
  ];

  const quickActions = [
    {
      title: "Générer un post",
      description: "Créez du contenu avec l'IA",
      icon: Sparkles,
      href: "/generator",
      color: "from-violet to-rose",
    },
    {
      title: "Top contenus",
      description: "Inspirez-vous des meilleurs",
      icon: Flame,
      href: "/top-content",
      color: "from-orange-500 to-rose",
    },
    {
      title: "Planifier",
      description: "Programmez vos publications",
      icon: Calendar,
      href: "/schedule",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Analytics",
      description: "Suivez vos performances",
      icon: BarChart3,
      href: "/analytics",
      color: "from-blue-500 to-violet",
    },
  ];

  const categories = [
    { value: "all", label: "Tous" },
    { value: "entrepreneuriat", label: "Entrepreneuriat" },
    { value: "leadership", label: "Leadership" },
    { value: "marketing", label: "Marketing" },
    { value: "tech", label: "Tech / IA" },
    { value: "personal-branding", label: "Personal Branding" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard />
      <Navbar />

      <div className="container py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bonjour, {user.name?.split(" ")[0] || "Créateur"} 👋
          </h1>
          <p className="text-muted-foreground">
            Prêt à créer du contenu qui performe ? Voici votre tableau de bord.
          </p>
        </div>

        {/* Widget de bienvenue personnalisé */}
        <div className="mb-6">
          <WelcomeWidget />
        </div>

        {/* Conseils personnalisés */}
        <div className="mb-6">
          <PersonalizedTips feature="dashboard" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === "violet"
                      ? "bg-violet/20 text-violet-light"
                      : stat.color === "rose"
                      ? "bg-rose/20 text-rose"
                      : stat.color === "gold"
                      ? "bg-gold/20 text-gold"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Vos posts récents</h2>
              <Link href="/my-posts">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {postsData?.posts?.slice(0, 4).map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet/20 text-violet-light">
                      {post.theme || "Général"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-3 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-white"
                      onClick={() => handleCopy(post.content, post.id)}
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copier
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-[#0077B5]"
                      onClick={() => handlePublish(post.content, post.id)}
                      disabled={publishingPostId === post.id}
                    >
                      {publishingPostId === post.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Publication...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Publier
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {(!postsData?.posts || postsData.posts.length === 0) && (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Aucun post généré</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez à créer du contenu avec notre générateur IA.
                  </p>
                  <Link href="/generator">
                    <Button className="btn-gradient">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Générer mon premier post
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Inspiration Panel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Inspiration</h2>
              <Link href="/top-content">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Explorer
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat.value
                      ? "bg-violet/20 text-violet-light border border-violet/30"
                      : "bg-card/50 text-muted-foreground border border-white/10 hover:border-white/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {topContent?.posts?.slice(0, 3).map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all cursor-pointer"
                  onClick={() => handleCopy(post.content, post.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-gold" />
                    <span className="text-xs text-gold">Top contenu</span>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-3 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {Math.floor(Math.random() * 5000) + 1000}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {Math.floor(Math.random() * 200) + 50}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gamification Widget */}
            <div className="mt-6">
              <GamificationWidget />
            </div>

            {/* Agent Status Widget */}
            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <AgentStatusWidget />
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="mt-8 p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
          <AIRecommendations />
        </div>
      </div>

      {/* Contextual Help */}
      <ContextualHelp pageId="dashboard" />
    </div>
  );
}
