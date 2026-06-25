import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLinkedInConnectUrl, getSignupUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GettingStartedJourney } from "@/components/GettingStartedJourney";
import { LinkedInConnectBanner } from "@/components/LinkedInConnectBanner";
import { useGettingStartedJourney } from "@/hooks/useGettingStartedJourney";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";
import type { UpcomingPublication } from "@/components/autopublish/UpcomingPublicationsView";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Copy,
  Send,
  Loader2,
  Check,
  PenTool,
  Linkedin,
  Clock,
  Zap,
  ImageIcon,
  CheckCircle2,
  Bot,
  FileText,
} from "lucide-react";

type GeneratedPost = {
  id: number;
  title: string | null;
  content: string;
  theme: string | null;
  status: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
  publishedAt: Date | string | null;
  scheduledAt: Date | string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  generated: { label: "Brouillon", className: "bg-white/10 text-muted-foreground" },
  saved: { label: "Enregistré", className: "bg-blue-500/15 text-blue-300" },
  scheduled: { label: "Planifié", className: "bg-amber-500/15 text-amber-300" },
  published: { label: "Publié", className: "bg-emerald-500/15 text-emerald-300" },
};

function PostStatusBadge({ status }: { status: string | null }) {
  const config = STATUS_LABELS[status ?? ""] ?? STATUS_LABELS.generated;
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showJourney } = useGettingStartedJourney();
  const { status: linkedInStatus, loading: linkedInLoading } = useLinkedInStatus();
  const [publishingPostId, setPublishingPostId] = useState<number | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingPublication[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [autoEnabled, setAutoEnabled] = useState(false);

  const { data: postsData, isLoading: postsLoading } = trpc.generator.myPosts.useQuery(
    { limit: 12, offset: 0 },
    { enabled: !!user }
  );

  useEffect(() => {
    if (!user) {
      setUpcomingLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auto-publish/upcoming?days=14", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUpcoming(data.publications ?? []);
          setAutoEnabled(!!data.meta?.isEnabled);
        }
      } catch {
        if (!cancelled) setUpcoming([]);
      } finally {
        if (!cancelled) setUpcomingLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const posts = (postsData?.posts ?? []) as GeneratedPost[];
  const totalPosts = postsData?.total ?? posts.length;

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "published").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const upcomingCount = upcoming.filter(
      (p) => new Date(p.scheduledFor).getTime() > Date.now()
    ).length;

    return {
      total: totalPosts,
      published,
      scheduled: scheduled + upcomingCount,
      autoEnabled,
    };
  }, [posts, totalPosts, upcoming, autoEnabled]);

  const upcomingSorted = useMemo(
    () =>
      [...upcoming]
        .filter((p) => new Date(p.scheduledFor).getTime() > Date.now())
        .sort(
          (a, b) =>
            new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        )
        .slice(0, 6),
    [upcoming]
  );

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

  const handlePublish = async (post: GeneratedPost) => {
    setPublishingPostId(post.id);
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: post.content,
          imageUrl: post.imageUrl ?? undefined,
          generatedPostId: post.id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Post publié sur LinkedIn");
      } else if (data.error === "LinkedIn not connected") {
        window.location.href = getLinkedInConnectUrl("/dashboard");
      } else if (data.error === "LinkedIn token expired, please reconnect") {
        window.location.href = getLinkedInConnectUrl("/dashboard");
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

  const firstName = user.name?.split(" ")[0] || "Créateur";
  const linkedInConnected = linkedInStatus.connected;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 md:py-8 space-y-8">
        {/* En-tête */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tableau de bord</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Bonjour, {firstName}
            </h1>
            <p className="text-muted-foreground">
              Vos posts, publications programmées et actions en un coup d'œil.
            </p>
            {linkedInConnected && !linkedInLoading && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm">
                {linkedInStatus.profilePicture ? (
                  <img
                    src={linkedInStatus.profilePicture}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Linkedin className="h-4 w-4 text-[#0077B5]" />
                )}
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">
                  {linkedInStatus.profileName ?? "LinkedIn connecté"}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link href="/auto-publish">
              <Button variant="outline" className="w-full sm:w-auto border-violet/30">
                <Zap className="w-4 h-4 mr-2" />
                Auto-publication
              </Button>
            </Link>
            <Link href="/generate">
              <Button className="btn-gradient w-full sm:w-auto">
                <PenTool className="w-4 h-4 mr-2" />
                Créer un post
              </Button>
            </Link>
          </div>
        </div>

        <GettingStartedJourney />

        {!linkedInConnected && !linkedInLoading && <LinkedInConnectBanner />}

        {/* Stats réelles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              label: "Posts créés",
              value: stats.total,
              icon: Sparkles,
              hint: "Total générés",
            },
            {
              label: "Publiés",
              value: stats.published,
              icon: Send,
              hint: "Sur LinkedIn",
            },
            {
              label: "Programmés",
              value: stats.scheduled,
              icon: Calendar,
              hint: "À venir",
            },
            {
              label: "Automatisation",
              value: stats.autoEnabled ? "Active" : "Off",
              icon: Zap,
              hint: stats.autoEnabled ? "Publications auto" : "Non activée",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 md:p-5 rounded-xl border border-white/10 bg-card/50"
            >
              <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center mb-3">
                <stat.icon className="w-4 h-4 text-violet-light" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <p className="text-xs text-muted-foreground/80 mt-1">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Publications programmées */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-light" />
                Publications programmées
              </h2>
              <Link href="/auto-publish">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {upcomingLoading ? (
              <div className="flex items-center justify-center py-12 rounded-xl border border-white/10 bg-card/30">
                <Loader2 className="w-6 h-6 animate-spin text-violet-light" />
              </div>
            ) : upcomingSorted.length > 0 ? (
              <div className="space-y-3">
                {upcomingSorted.map((pub) => {
                  const TypeIcon =
                    pub.type === "recurring" ? Bot : pub.type === "one_shot" ? Calendar : FileText;
                  return (
                    <div
                      key={pub.id}
                      className="rounded-xl border border-white/10 bg-card/50 overflow-hidden hover:border-violet/25 transition-colors"
                    >
                      <div className="flex gap-0">
                        {pub.imageUrl ? (
                          <div className="w-20 sm:w-24 shrink-0">
                            <img
                              src={pub.imageUrl}
                              alt=""
                              className="h-full min-h-[88px] w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center bg-white/5 min-h-[88px]">
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 p-3 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className="w-3.5 h-3.5 text-violet-light shrink-0" />
                            <span className="text-xs text-violet-light font-medium truncate">
                              {pub.relativeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {formatDateTime(pub.scheduledFor)}
                          </p>
                          {pub.content ? (
                            <p className="text-sm text-white/85 line-clamp-2">{pub.content}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Contenu généré à la publication
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-white/10 text-center bg-card/20">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-white mb-1">Aucune publication programmée</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Planifiez un post ou activez l'auto-publication.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link href="/generate">
                    <Button size="sm" variant="outline" className="border-white/10">
                      Créer un post
                    </Button>
                  </Link>
                  <Link href="/auto-publish">
                    <Button size="sm" className="btn-gradient">
                      Automatiser
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Derniers posts */}
          <section className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-violet-light" />
                Derniers posts
              </h2>
              <Link href="/generate">
                <Button variant="ghost" size="sm" className="text-violet-light">
                  Nouveau post
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {postsLoading ? (
              <div className="flex items-center justify-center py-16 rounded-xl border border-white/10 bg-card/30">
                <Loader2 className="w-6 h-6 animate-spin text-violet-light" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-white/10 bg-card/50 overflow-hidden hover:border-violet/25 transition-all group"
                  >
                    {post.imageUrl ? (
                      <div className="aspect-[16/9] overflow-hidden bg-black/20">
                        <img
                          src={post.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-violet/10 to-rose/5 border-b border-white/5">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet/15 text-violet-light truncate">
                            {post.theme || "Général"}
                          </span>
                          <PostStatusBadge status={post.status} />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                      </div>
                      {post.title && (
                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-sm text-white/80 line-clamp-3 mb-3">{post.content}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-white h-8 px-2"
                          onClick={() => handleCopy(post.content, post.id)}
                        >
                          {copiedPostId === post.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {post.status !== "published" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-[#0077B5] h-8 px-2"
                            onClick={() => handlePublish(post)}
                            disabled={publishingPostId === post.id}
                          >
                            {publishingPostId === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun post pour le moment</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Générez votre premier contenu avec l'IA — texte et visuel inclus.
                </p>
                <Link href="/generate?guided=1">
                  <Button className="btn-gradient">
                    <PenTool className="w-4 h-4 mr-2" />
                    Créer mon premier post
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Actions rapides — seulement si parcours terminé */}
        {!showJourney && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            <Link href="/generate">
              <Button variant="outline" size="sm" className="border-white/10">
                <PenTool className="w-4 h-4 mr-2" />
                Nouveau post
              </Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline" size="sm" className="border-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                Calendrier
              </Button>
            </Link>
            <Link href="/auto-publish">
              <Button variant="outline" size="sm" className="border-white/10">
                <Zap className="w-4 h-4 mr-2" />
                Automatisation
              </Button>
            </Link>
            {!linkedInConnected && (
              <a href={getLinkedInConnectUrl("/dashboard")}>
                <Button variant="outline" size="sm" className="border-[#0077B5]/30 text-[#0077B5]">
                  <Linkedin className="w-4 h-4 mr-2" />
                  Connecter LinkedIn
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
