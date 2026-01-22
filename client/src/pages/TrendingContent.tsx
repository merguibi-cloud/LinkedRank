import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Crown,
  Flame,
  Clock,
  Filter,
  Globe,
  Lock,
  Sparkles,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";

interface TrendingPost {
  id: string;
  rank: number;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  authorUsername: string;
  content: string;
  postUrl: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagementRate: number;
  publishedAt: string;
  category: string;
  isViral: boolean;
}

export default function TrendingContent() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("week");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Données de démonstration des posts tendance
  const trendingPosts: TrendingPost[] = [
    {
      id: "1",
      rank: 1,
      authorName: "Bill Gates",
      authorHeadline: "Co-chair, Bill & Melinda Gates Foundation",
      authorAvatar: "https://media.licdn.com/dms/image/v2/D5603AQHv6LsdiUg1kw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1695167344576?e=1740614400&v=beta&t=abc123",
      authorUsername: "williamhgates",
      content: "L'IA va transformer l'éducation de manière fondamentale. Voici 5 façons dont nous pouvons nous y préparer...",
      postUrl: "https://www.linkedin.com/posts/williamhgates_ai-education-future-activity-123456789",
      likes: 125000,
      comments: 8500,
      shares: 15000,
      impressions: 5200000,
      engagementRate: 2.85,
      publishedAt: "2024-12-20",
      category: "Tech & IA",
      isViral: true,
    },
    {
      id: "2",
      rank: 2,
      authorName: "Simon Sinek",
      authorHeadline: "Optimist | Author of Start With Why",
      authorAvatar: "https://media.licdn.com/dms/image/v2/C4E03AQGq7eutGpuWjg/profile-displayphoto-shrink_400_400/0/1516281600000?e=1740614400&v=beta&t=def456",
      authorUsername: "simonsinek",
      content: "Le leadership n'est pas une question de position. C'est une question de décision. Chaque jour, vous choisissez d'être un leader ou non.",
      postUrl: "https://www.linkedin.com/posts/simonsinek_leadership-mindset-growth-activity-987654321",
      likes: 98000,
      comments: 6200,
      shares: 12000,
      impressions: 4100000,
      engagementRate: 2.83,
      publishedAt: "2024-12-19",
      category: "Leadership",
      isViral: true,
    },
    {
      id: "3",
      rank: 3,
      authorName: "Gary Vaynerchuk",
      authorHeadline: "CEO of VaynerMedia | Investor | Public Speaker",
      authorAvatar: "https://media.licdn.com/dms/image/v2/D5603AQHwmgHLhbc9jQ/profile-displayphoto-shrink_400_400/0/1695167344576?e=1740614400&v=beta&t=ghi789",
      authorUsername: "garyvaynerchuk",
      content: "Arrêtez de vous plaindre. Commencez à créer. Le contenu est roi, mais la constance est reine. 👑",
      postUrl: "https://www.linkedin.com/posts/garyvaynerchuk_content-consistency-hustle-activity-456789123",
      likes: 87000,
      comments: 5800,
      shares: 9500,
      impressions: 3800000,
      engagementRate: 2.69,
      publishedAt: "2024-12-21",
      category: "Entrepreneuriat",
      isViral: true,
    },
    {
      id: "4",
      rank: 4,
      authorName: "Satya Nadella",
      authorHeadline: "Chairman and CEO at Microsoft",
      authorAvatar: "https://media.licdn.com/dms/image/v2/C5603AQHHUuOSlRVA1w/profile-displayphoto-shrink_400_400/0/1579726624000?e=1740614400&v=beta&t=jkl012",
      authorUsername: "satyanadella",
      content: "La culture mange la stratégie au petit-déjeuner. Chez Microsoft, nous avons appris que le growth mindset est la clé de tout.",
      postUrl: "https://www.linkedin.com/posts/satyanadella_culture-growthmindset-microsoft-activity-789123456",
      likes: 76000,
      comments: 4200,
      shares: 8200,
      impressions: 3200000,
      engagementRate: 2.76,
      publishedAt: "2024-12-18",
      category: "Tech & IA",
      isViral: true,
    },
    {
      id: "5",
      rank: 5,
      authorName: "Arianna Huffington",
      authorHeadline: "Founder & CEO at Thrive Global",
      authorAvatar: "https://media.licdn.com/dms/image/v2/C4D03AQGHGxocjK5lNg/profile-displayphoto-shrink_400_400/0/1516281600000?e=1740614400&v=beta&t=mno345",
      authorUsername: "araboreal",
      content: "Le burnout n'est pas un badge d'honneur. La vraie productivité vient du repos et de la récupération.",
      postUrl: "https://www.linkedin.com/posts/araboreal_wellbeing-productivity-burnout-activity-321654987",
      likes: 65000,
      comments: 3800,
      shares: 7100,
      impressions: 2800000,
      engagementRate: 2.71,
      publishedAt: "2024-12-22",
      category: "Bien-être",
      isViral: true,
    },
    {
      id: "6",
      rank: 6,
      authorName: "Adam Grant",
      authorHeadline: "Organizational Psychologist at Wharton",
      authorAvatar: "https://media.licdn.com/dms/image/v2/C4E03AQGq7eutGpuWjg/profile-displayphoto-shrink_400_400/0/1516281600000?e=1740614400&v=beta&t=pqr678",
      authorUsername: "adammgrant",
      content: "Les meilleurs managers ne sont pas ceux qui ont toutes les réponses. Ce sont ceux qui posent les meilleures questions.",
      postUrl: "https://www.linkedin.com/posts/adammgrant_management-leadership-questions-activity-654987321",
      likes: 58000,
      comments: 3500,
      shares: 6800,
      impressions: 2500000,
      engagementRate: 2.73,
      publishedAt: "2024-12-17",
      category: "Leadership",
      isViral: false,
    },
  ];

  const categories = ["all", "Tech & IA", "Leadership", "Entrepreneuriat", "Marketing", "Bien-être", "Finance"];

  const filteredPosts = trendingPosts.filter(post => 
    categoryFilter === "all" || post.category === categoryFilter
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Si l'utilisateur n'est pas connecté ou n'a pas d'abonnement, afficher la version limitée
  const isSubscribed = user?.subscriptionPlan && user.subscriptionPlan !== "starter";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet/10 via-transparent to-transparent" />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Flame className="w-3 h-3 mr-1" />
              Contenus Tendance
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Les <span className="gradient-text">meilleurs posts</span> LinkedIn de la semaine
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez les contenus qui ont le plus performé cette semaine. Inspirez-vous des meilleurs pour créer vos propres posts viraux.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-y border-white/10">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1 bg-card/50 rounded-lg p-1">
                {[
                  { value: "day", label: "24h" },
                  { value: "week", label: "7 jours" },
                  { value: "month", label: "30 jours" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeFilter(option.value as typeof timeFilter)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      timeFilter === option.value
                        ? "bg-violet text-white"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    categoryFilter === category
                      ? "bg-violet/20 text-violet-light border border-violet/30"
                      : "bg-card/50 text-muted-foreground border border-white/10 hover:border-white/20"
                  }`}
                >
                  {category === "all" ? "Tous" : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      <section className="py-12">
        <div className="container">
          <div className="space-y-6">
            {filteredPosts.slice(0, isSubscribed ? undefined : 3).map((post, index) => (
              <div
                key={post.id}
                className={`relative p-6 rounded-2xl border transition-all ${
                  post.rank <= 3
                    ? "border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-transparent"
                    : "border-white/10 bg-card/50"
                } hover:border-violet/30`}
              >
                {/* Rank Badge */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  post.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black" :
                  post.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" :
                  post.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black" :
                  "bg-card border border-white/20 text-white"
                }`}>
                  {post.rank <= 3 ? <Crown className="w-5 h-5" /> : post.rank}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Author Info */}
                  <div className="flex items-start gap-4 md:w-1/4">
                    <div className="relative">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=6366f1&color=fff`;
                        }}
                      />
                      {post.isViral && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Flame className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{post.authorName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.authorHeadline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:w-2/4">
                    <p className="text-white/90 line-clamp-3 mb-3">{post.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="md:w-1/4 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                        <span className="text-sm font-semibold text-white">{formatNumber(post.likes)}</span>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <MessageCircle className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <span className="text-sm font-semibold text-white">{formatNumber(post.comments)}</span>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <Share2 className="w-4 h-4 mx-auto mb-1 text-green-400" />
                        <span className="text-sm font-semibold text-white">{formatNumber(post.shares)}</span>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-white/5">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-sm font-semibold text-white">{formatNumber(post.impressions)}</span>
                      </div>
                    </div>
                    
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#0A66C2]/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Voir sur LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Paywall for non-subscribers */}
            {!isSubscribed && (
              <div className="relative">
                {/* Blurred preview */}
                <div className="opacity-30 blur-sm pointer-events-none">
                  {filteredPosts.slice(3, 5).map((post) => (
                    <div
                      key={post.id}
                      className="p-6 rounded-2xl border border-white/10 bg-card/50 mb-6"
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-600" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-600 rounded w-1/3 mb-2" />
                          <div className="h-3 bg-gray-600 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upgrade CTA */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 rounded-2xl border border-violet/30 bg-card/95 backdrop-blur-xl max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Accédez à tous les contenus tendance
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Débloquez l'accès illimité aux meilleurs posts LinkedIn et inspirez-vous des top créateurs.
                    </p>
                    <Link href="/pricing">
                      <Button className="btn-gradient gap-2">
                        <Sparkles className="w-4 h-4" />
                        Passer à Pro
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à créer du contenu <span className="gradient-text">viral</span> ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Utilisez notre générateur IA pour créer des posts inspirés des meilleurs créateurs LinkedIn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/generate">
                <Button className="btn-gradient gap-2">
                  <Sparkles className="w-4 h-4" />
                  Générer du contenu
                </Button>
              </Link>
              <Link href="/auto-publish">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Publication automatique
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
