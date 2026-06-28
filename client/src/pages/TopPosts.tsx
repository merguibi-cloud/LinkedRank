import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { trpc } from "@/lib/trpc";
import {
  Trophy,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Award,
} from "lucide-react";

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function extractLinkedInUsername(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

type ViralPostItem = {
  id: number;
  authorName: string;
  authorHeadline?: string | null;
  authorProfileUrl?: string | null;
  authorProfilePicture?: string | null;
  authorFollowers?: number | null;
  content: string;
  postUrl: string;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  impressions?: number | null;
  theme?: string | null;
  language?: string | null;
  rank?: number | null;
  publishedAt?: Date | string | null;
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-400" />;
    case 2:
      return <Award className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return (
        <span className="flex h-6 w-6 items-center justify-center text-lg font-bold text-muted-foreground">
          #{rank}
        </span>
      );
  }
}

function getRankBadgeColor(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500 to-amber-500 text-black";
    case 2:
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-black";
    case 3:
      return "bg-gradient-to-r from-amber-600 to-orange-600 text-white";
    default:
      return "bg-white/10 text-white";
  }
}

function ViralPostCard({
  post,
  rank,
  featured = false,
}: {
  post: ViralPostItem;
  rank: number;
  featured?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(post.content.length > 900);
  const linkedinUsername = extractLinkedInUsername(post.authorProfileUrl);
  const showToggle = post.content.length > 900;

  return (
    <Card
      className={`overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm transition-all hover:border-white/20 ${
        rank === 1 ? "ring-2 ring-yellow-500/30" : ""
      } ${featured ? "sm:col-span-2" : ""}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div
            className={`flex w-full shrink-0 flex-row items-center justify-center gap-2 py-3 sm:w-16 sm:flex-col sm:py-6 ${getRankBadgeColor(rank)}`}
          >
            {getRankIcon(rank)}
            {rank <= 3 && (
              <span className="text-xs font-bold sm:mt-1">
                {rank === 1 ? "1er" : rank === 2 ? "2ème" : "3ème"}
              </span>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <CreatorAvatar
                  name={post.authorName}
                  profilePicture={post.authorProfilePicture}
                  linkedinUsername={linkedinUsername}
                  linkedinUrl={post.authorProfileUrl}
                  size={featured ? "lg" : "md"}
                />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">{post.authorName}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {post.authorHeadline || "Créateur LinkedIn"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {post.authorFollowers != null && post.authorFollowers > 0 && (
                      <Badge variant="outline" className="border-white/20 text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        {formatNumber(post.authorFollowers)} abonnés
                      </Badge>
                    )}
                    {post.theme && (
                      <Badge variant="outline" className="border-white/20 text-xs">
                        {post.theme}
                      </Badge>
                    )}
                    {post.language && (
                      <Badge variant="outline" className="border-white/20 text-xs">
                        {post.language === "FR" ? "🇫🇷 FR" : "🇬🇧 EN"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full shrink-0 border-white/20 text-white hover:bg-white/10 sm:w-auto"
                onClick={() => window.open(post.postUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir sur LinkedIn
              </Button>
            </div>

            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p
                className={`whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-base ${
                  collapsed ? "line-clamp-[12]" : ""
                }`}
              >
                {post.content}
              </p>
              {showToggle && (
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0 text-violet-light"
                  onClick={() => setCollapsed((v) => !v)}
                >
                  {collapsed ? "Lire la suite" : "Réduire"}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 sm:gap-6">
              <div className="flex items-center gap-1.5 text-pink-400">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(post.likes ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(post.comments ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(post.shares ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatNumber(post.impressions ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TopPosts() {
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState<"all" | "FR" | "EN">("all");

  const { data, isLoading } = trpc.viralPosts.list.useQuery({
    weekNumber: selectedWeek,
    year: selectedYear,
    language: filter,
    limit: 20,
  });

  const posts = data?.posts ?? [];
  const topThree = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pt-8 pb-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-orange-500/20 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-rose/20 blur-[100px]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
              <Flame className="h-4 w-4" />
              Inspiration virale
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Posts{" "}
              <span className="bg-gradient-to-r from-orange-400 to-rose bg-clip-text text-transparent">
                viraux
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Les publications LinkedIn qui performent le mieux — accessibles sans compte, pour vous inspirer.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-card/50 px-4 py-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-white/80">
                Semaine {selectedWeek}, {selectedYear}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setSelectedWeek(Math.min(52, selectedWeek + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Flame, label: "Publications", value: posts.length, color: "text-orange-400" },
            {
              icon: Heart,
              label: "Likes totaux",
              value: formatNumber(posts.reduce((a, p) => a + (p.likes ?? 0), 0)),
              color: "text-pink-400",
            },
            {
              icon: Eye,
              label: "Impressions",
              value: formatNumber(posts.reduce((a, p) => a + (p.impressions ?? 0), 0)),
              color: "text-blue-400",
            },
            {
              icon: Users,
              label: "Auteurs",
              value: posts.length,
              color: "text-purple-400",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-card/50">
              <CardContent className="flex items-center gap-3 p-4">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as "all" | "FR" | "EN")}
          className="mb-6"
        >
          <TabsList className="border border-white/10 bg-white/5">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              Toutes
            </TabsTrigger>
            <TabsTrigger value="FR" className="data-[state=active]:bg-white/10">
              🇫🇷 Français
            </TabsTrigger>
            <TabsTrigger value="EN" className="data-[state=active]:bg-white/10">
              🇬🇧 English
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-white/10 bg-card/40"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card/40 py-16 text-center">
            <Flame className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucun post viral pour cette semaine. Essayez une autre période.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedWeek(getWeekNumber(new Date()));
                setSelectedYear(new Date().getFullYear());
                setFilter("all");
              }}
            >
              Revenir à la semaine actuelle
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {topThree.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">Top 3 de la semaine</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {topThree.map((post, index) => (
                    <ViralPostCard
                      key={post.id}
                      post={post}
                      rank={post.rank ?? index + 1}
                      featured={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Autres inspirations</h2>
                {rest.map((post, index) => (
                  <ViralPostCard
                    key={post.id}
                    post={post}
                    rank={post.rank ?? index + 4}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mt-12 border-white/10 bg-gradient-to-br from-violet/20 to-rose/20">
          <CardContent className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-violet-light" />
            <h3 className="mb-2 text-2xl font-bold text-white">
              Créez votre propre contenu viral
            </h3>
            <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
              Inspirez-vous de ces posts et générez du contenu engageant avec notre IA.
            </p>
            <Link href="/generate">
              <Button className="btn-gradient">
                <Sparkles className="mr-2 h-4 w-4" />
                Générer un post inspiré
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
