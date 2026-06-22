import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getSignupUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { LinkedInConnectBanner } from "@/components/LinkedInConnectBanner";
import { QuickActions } from "@/components/QuickActions";
import { PersonalizedTips } from "@/components/PersonalizedTips";
import { toast } from "sonner";
import {
  Sparkles,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  ArrowRight,
  Copy,
  Send,
  Star,
  Loader2,
  Check,
  PenTool,
  Linkedin,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [publishingPostId, setPublishingPostId] = useState<number | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const { data: postsData } = trpc.generator.myPosts.useQuery(
    { limit: 10, offset: 0 },
    { enabled: !!user }
  );

  const { data: topContent } = trpc.posts.list.useQuery({
    limit: 4,
    language: "FR",
  });

  const handleCopy = async (content: string, postId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPostId(postId);
      toast.success("Contenu copié");
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const handlePublish = async (content: string, postId: number) => {
    setPublishingPostId(postId);
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Post publié sur LinkedIn");
      } else if (data.error === "LinkedIn not connected") {
        const authResponse = await fetch("/api/linkedin/auth?format=json", {
          credentials: "include",
        });
        const authData = await authResponse.json();
        if (authData.authUrl) {
          toast.info("Redirection vers LinkedIn...");
          window.location.href = authData.authUrl;
        } else {
          toast.error("Erreur de configuration LinkedIn");
        }
      } else if (data.error === "LinkedIn token expired, please reconnect") {
        const authResponse = await fetch("/api/linkedin/auth?format=json", {
          credentials: "include",
        });
        const authData = await authResponse.json();
        if (authData.authUrl) {
          window.location.href = authData.authUrl;
        }
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch {
      toast.error("Erreur de connexion");
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
            <h1 className="text-2xl font-bold text-white mb-4">Votre espace de travail</h1>
            <p className="text-muted-foreground mb-8">
              Connectez-vous pour créer, publier et suivre vos contenus LinkedIn.
            </p>
            <a href={getSignupUrl("/dashboard")}>
              <Button className="btn-gradient">Créer un compte</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const postCount = postsData?.posts?.length ?? 0;
  const firstName = user.name?.split(" ")[0] || "Créateur";

  const stats = [
    {
      label: "Posts générés",
      value: postCount.toString(),
      icon: Sparkles,
      hint: postCount > 0 ? "Depuis votre inscription" : "Commencez par créer un post",
    },
    {
      label: "Vues LinkedIn",
      value: "—",
      icon: Eye,
      hint: "Connectez LinkedIn pour suivre",
    },
    {
      label: "Engagement",
      value: "—",
      icon: Heart,
      hint: "Disponible après connexion",
    },
    {
      label: "Planifiés",
      value: "—",
      icon: Calendar,
      hint: "Via le calendrier",
    },
  ];

  const nextSteps = [
    {
      step: "1",
      title: "Créer un post",
      description: "Générez votre contenu avec l'IA en 4 étapes simples.",
      href: "/generate",
      icon: PenTool,
      cta: "Ouvrir le générateur",
    },
    {
      step: "2",
      title: "Connecter LinkedIn",
      description: "Liez votre compte pour publier directement depuis l'app.",
      href: "/linkedin-settings",
      icon: Linkedin,
      cta: "Configurer LinkedIn",
    },
    {
      step: "3",
      title: "Planifier vos publications",
      description: "Programmez vos posts aux meilleurs créneaux.",
      href: "/schedule",
      icon: Calendar,
      cta: "Voir le calendrier",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6 md:py-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tableau de bord</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Bonjour, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez, publiez et suivez votre contenu LinkedIn en un seul endroit.
            </p>
          </div>
          <Link href="/generate">
            <Button className="btn-gradient w-full sm:w-auto">
              <PenTool className="w-4 h-4 mr-2" />
              Créer un post
            </Button>
          </Link>
        </div>

        <LinkedInConnectBanner />

        <PersonalizedTips feature="dashboard" compact />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 md:p-5 rounded-xl border border-white/10 bg-card/50"
            >
              <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center mb-3">
                <stat.icon className="w-4 h-4 text-violet-light" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">{stat.hint}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Par où commencer</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {nextSteps.map((item) => (
              <Link key={item.step} href={item.href}>
                <div className="group h-full p-5 rounded-xl border border-white/10 bg-card/40 hover:border-violet/30 hover:bg-card/60 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/20 text-sm font-semibold text-violet-light">
                      {item.step}
                    </span>
                    <item.icon className="w-5 h-5 text-violet-light" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <span className="inline-flex items-center text-sm text-violet-light group-hover:gap-2 transition-all">
                    {item.cta}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <QuickActions />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Posts récents</h2>
              <Link href="/generate">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Nouveau post
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {postsData?.posts?.slice(0, 4).map((post: { id: number; theme?: string; createdAt: string; content: string }) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-white/10 bg-card/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet/15 text-violet-light">
                      {post.theme || "Général"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-3 mb-3">{post.content}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white h-8"
                      onClick={() => handleCopy(post.content, post.id)}
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-emerald-400" />
                          Copié
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
                      className="text-muted-foreground hover:text-[#0077B5] h-8"
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
                <div className="p-10 rounded-xl border border-dashed border-white/10 text-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">Aucun post pour le moment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Le générateur vous guide étape par étape : texte, visuel, publication.
                  </p>
                  <Link href="/generate">
                    <Button className="btn-gradient">
                      <PenTool className="w-4 h-4 mr-2" />
                      Créer mon premier post
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Inspiration</h2>
              <Link href="/top-posts">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Voir plus
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {topContent?.posts?.slice(0, 3).map((post: { id: number; content: string; likes?: number; comments?: number }) => (
                <button
                  key={post.id}
                  type="button"
                  className="w-full text-left p-4 rounded-xl border border-white/10 bg-card/50 hover:border-violet/30 transition-all"
                  onClick={() => handleCopy(post.content, post.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-gold" />
                    <span className="text-xs text-gold font-medium">Top contenu</span>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-3">{post.content}</p>
                  {(post.likes || post.comments) ? (
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {post.likes ? (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </span>
                      ) : null}
                      {post.comments ? (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.comments}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
