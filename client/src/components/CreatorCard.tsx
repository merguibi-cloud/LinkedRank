import { TrendingUp, Users, Heart, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { CreatorAvatar } from "@/components/CreatorAvatar";

interface CreatorCardProps {
  rank: number;
  username: string;
  name: string;
  headline: string;
  profileImage: string;
  linkedinUsername?: string;
  followers: number;
  engagementRate: number;
  growthRate: number;
  country: string;
  sector: string;
  authorityScore: number;
}

export default function CreatorCard({
  rank,
  username,
  name,
  headline,
  profileImage,
  linkedinUsername,
  followers,
  engagementRate,
  growthRate,
  country,
  sector,
  authorityScore,
}: CreatorCardProps) {
  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "default";
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      Tech: "bg-violet/20 text-violet-light",
      Business: "bg-gold/20 text-gold-light",
      Marketing: "bg-rose/20 text-rose",
      Finance: "bg-emerald-500/20 text-emerald-400",
      "Ressources Humaines": "bg-orange-500/20 text-orange-400",
      Entrepreneuriat: "bg-amber-500/20 text-amber-400",
      Leadership: "bg-blue-500/20 text-blue-400",
      "Personal Branding": "bg-pink-500/20 text-pink-400",
    };
    return colors[sector] || "bg-muted text-muted-foreground";
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      France: "🇫🇷",
      USA: "🇺🇸",
      UK: "🇬🇧",
      Germany: "🇩🇪",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      India: "🇮🇳",
      UAE: "🇦🇪",
      "Saudi Arabia": "🇸🇦",
      Netherlands: "🇳🇱",
      Belgium: "🇧🇪",
      Switzerland: "🇨🇭",
    };
    return flags[country] || "🌍";
  };

  return (
    <Link href={`/creator/${username}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet/50 hover:shadow-[0_20px_40px_-20px_rgba(139,92,246,0.3)]">
        {/* Rank Badge */}
        <div className={`rank-badge absolute -right-1 -top-1 ${getRankBadgeClass(rank)}`}>
          {rank}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <CreatorAvatar
              name={name}
              profilePicture={profileImage}
              linkedinUsername={linkedinUsername || username}
              size="md"
            />
            <span className="absolute -bottom-1 -right-1 text-lg">{getCountryFlag(country)}</span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-white group-hover:text-violet-light transition-colors">
              {name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {headline}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSectorColor(sector)}`}>
                {sector}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-lg font-bold text-white">{formatFollowers(followers)}</p>
            <p className="text-xs text-muted-foreground">Abonnés</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-lg font-bold text-white">{engagementRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <p className={`mt-1 text-lg font-bold ${growthRate >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Croissance</p>
          </div>
        </div>

        {/* Authority Score */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Authority Score</span>
            <span className="font-semibold text-violet-light">{authorityScore}/100</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-rose transition-all duration-500"
              style={{ width: `${authorityScore}%` }}
            />
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-violet/10 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Voir le profil <ExternalLink className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
