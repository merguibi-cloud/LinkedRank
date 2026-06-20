import { CreatorAvatar } from "@/components/CreatorAvatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export type RankingCreator = {
  id: number;
  name: string;
  headline?: string | null;
  profilePicture?: string | null;
  linkedinUsername?: string | null;
  linkedinUrl?: string | null;
  followers?: number | null;
  engagementRate?: string | number | null;
  followersGrowth30d?: number | null;
  country?: string | null;
  sector?: string | null;
  industry?: string | null;
  isVerified?: boolean | null;
  isTopVoice?: boolean | null;
};

function formatFollowers(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}

function getCountryFlag(country: string) {
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
}

function getGrowth(creator: RankingCreator) {
  if (!creator.followersGrowth30d || !creator.followers) return 0;
  return (creator.followersGrowth30d / creator.followers) * 100;
}

function getEngagement(creator: RankingCreator) {
  return Number(creator.engagementRate) || 0;
}

function usernameOf(creator: RankingCreator) {
  return (
    creator.linkedinUsername ||
    creator.name.toLowerCase().replace(/\s+/g, "")
  );
}

function PodiumCard({
  creator,
  rank,
  size,
}: {
  creator: RankingCreator;
  rank: 1 | 2 | 3;
  size: "lg" | "md" | "sm";
}) {
  const styles = {
    1: "border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-card/60 order-2 sm:order-2",
    2: "border-slate-300/40 bg-gradient-to-b from-slate-400/15 to-card/60 order-1 sm:order-1 sm:mt-8",
    3: "border-orange-600/40 bg-gradient-to-b from-orange-600/15 to-card/60 order-3 sm:order-3 sm:mt-10",
  }[rank];

  const avatarSize = size === "lg" ? "2xl" : size === "md" ? "xl" : "lg";
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <Link href={`/creator/${usernameOf(creator)}`}>
      <div
        className={`group relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${styles}`}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">{medals[rank]}</span>
        <div className="relative mt-2">
          <CreatorAvatar
            name={creator.name}
            profilePicture={creator.profilePicture}
            linkedinUsername={creator.linkedinUsername}
            size={avatarSize}
          />
          <span className="absolute -bottom-1 -right-1 text-xl">
            {getCountryFlag(creator.country || "")}
          </span>
        </div>
        <h3 className="mt-4 line-clamp-1 text-lg font-bold text-white group-hover:text-violet-light">
          {creator.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
          {creator.headline || creator.sector || creator.industry}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="bg-white/10">
            <Users className="mr-1 h-3 w-3" />
            {formatFollowers(creator.followers || 0)}
          </Badge>
          {creator.isTopVoice && (
            <Badge className="bg-violet/30 text-violet-light">Top Voice</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

function RankingRow({ creator, rank }: { creator: RankingCreator; rank: number }) {
  const growth = getGrowth(creator);
  const engagement = getEngagement(creator);

  return (
    <Link href={`/creator/${usernameOf(creator)}`}>
      <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-card/40 p-4 transition-all hover:border-violet/40 hover:bg-card/70">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            rank <= 3
              ? "bg-gradient-to-br from-violet to-rose text-white"
              : "bg-white/10 text-muted-foreground"
          }`}
        >
          {rank}
        </div>

        <CreatorAvatar
          name={creator.name}
          profilePicture={creator.profilePicture}
          linkedinUsername={creator.linkedinUsername}
          size="md"
          ring={false}
          className="border-2 border-white/10"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-white group-hover:text-violet-light">
              {creator.name}
            </h3>
            <span>{getCountryFlag(creator.country || "")}</span>
            {creator.isVerified && (
              <Badge variant="outline" className="h-5 border-emerald-500/40 text-emerald-400 text-[10px]">
                Vérifié
              </Badge>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {creator.headline || "Créateur LinkedIn"}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {(creator.sector || creator.industry) && (
              <Badge variant="secondary" className="text-[10px] bg-violet/20 text-violet-light">
                {creator.sector || creator.industry}
              </Badge>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="flex items-center justify-end gap-1 font-bold text-white">
            <Users className="h-4 w-4 text-muted-foreground" />
            {formatFollowers(creator.followers || 0)}
          </p>
          <p className="text-xs text-muted-foreground">abonnés</p>
        </div>

        <div className="hidden shrink-0 text-right md:block w-20">
          <p className="flex items-center justify-end gap-1 font-semibold text-white">
            <Heart className="h-3.5 w-3.5 text-rose" />
            {engagement.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">engagement</p>
        </div>

        <div className="hidden shrink-0 text-right lg:block w-20">
          <p
            className={`flex items-center justify-end gap-1 font-semibold ${
              growth >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">croissance</p>
        </div>

        {creator.linkedinUrl && (
          <a
            href={creator.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden xl:flex shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-[#0077B5]"
            title="Profil LinkedIn"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </Link>
  );
}

export function CreatorRankings({ creators }: { creators: RankingCreator[] }) {
  if (creators.length === 0) return null;

  const top3 = creators.slice(0, 3);
  const rest = creators.slice(3);

  return (
    <div className="space-y-10">
      {top3.length >= 3 && (
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Podium</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <PodiumCard creator={top3[1]} rank={2} size="md" />
            <PodiumCard creator={top3[0]} rank={1} size="lg" />
            <PodiumCard creator={top3[2]} rank={3} size="sm" />
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Classement complet
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({creators.length} créateurs)
          </span>
        </h2>
        <div className="space-y-2">
          {creators.map((creator, index) => (
            <RankingRow key={creator.id} creator={creator} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
