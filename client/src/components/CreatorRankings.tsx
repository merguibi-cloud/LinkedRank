import { CreatorAvatar } from "@/components/CreatorAvatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, TrendingUp, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export type RankingCreator = {
  id: number;
  name: string;
  headline?: string | null;
  profilePicture?: string | null;
  bannerImage?: string | null;
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

const CARD_GRADIENTS = [
  "from-violet-600/90 via-purple-600/80 to-rose-500/90",
  "from-blue-600/90 via-indigo-600/80 to-cyan-500/90",
  "from-emerald-600/90 via-teal-600/80 to-green-500/90",
  "from-orange-600/90 via-amber-600/80 to-yellow-500/90",
  "from-pink-600/90 via-fuchsia-600/80 to-purple-500/90",
  "from-slate-600/90 via-zinc-600/80 to-slate-500/90",
];

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
  return creator.linkedinUsername || creator.name.toLowerCase().replace(/\s+/g, "");
}

function getBannerStyle(creator: RankingCreator, index: number) {
  const banner = creator.bannerImage?.trim();
  if (banner && banner.startsWith("http") && !banner.includes("licdn.com/dms")) {
    return { backgroundImage: `url(${banner})` };
  }
  return {};
}

function getBannerGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
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
        className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${styles}`}
      >
        <div
          className={`h-20 w-full bg-cover bg-center bg-gradient-to-br ${getBannerGradient(rank - 1)}`}
          style={getBannerStyle(creator, rank - 1)}
        />
        <div className="flex flex-col items-center px-5 pb-5 -mt-12">
          <span className="mb-2 text-2xl">{medals[rank]}</span>
          <div className="relative">
            <CreatorAvatar
              name={creator.name}
              profilePicture={creator.profilePicture}
              linkedinUsername={creator.linkedinUsername}
              linkedinUrl={creator.linkedinUrl}
              size={avatarSize}
            />
            <span className="absolute -bottom-1 -right-1 text-xl">
              {getCountryFlag(creator.country || "")}
            </span>
          </div>
          <h3 className="mt-4 line-clamp-1 text-lg font-bold text-white group-hover:text-violet-light">
            {creator.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-center text-xs text-muted-foreground">
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
      </div>
    </Link>
  );
}

function CreatorCard({
  creator,
  rank,
  index,
}: {
  creator: RankingCreator;
  rank: number;
  index: number;
}) {
  const growth = getGrowth(creator);
  const engagement = getEngagement(creator);
  const hasBanner = Boolean(
    creator.bannerImage?.startsWith("http") &&
      !creator.bannerImage.includes("licdn.com/dms")
  );

  return (
    <Link href={`/creator/${usernameOf(creator)}`}>
      <div className="group overflow-hidden rounded-2xl border border-white/10 bg-card/50 transition-all hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-lg">
        <div
          className={`relative h-28 bg-cover bg-center ${!hasBanner ? `bg-gradient-to-br ${getBannerGradient(index)}` : ""}`}
          style={getBannerStyle(creator, index)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <div
            className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              rank <= 3
                ? "bg-gradient-to-br from-violet to-rose text-white"
                : "bg-black/40 text-white backdrop-blur-sm"
            }`}
          >
            #{rank}
          </div>
          {creator.linkedinUrl && (
            <a
              href={creator.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-3 top-3 rounded-lg bg-black/40 p-1.5 text-white/80 backdrop-blur-sm hover:bg-black/60 hover:text-white"
              title="Profil LinkedIn"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="relative px-4 pb-4">
          <div className="-mt-10 mb-3 flex justify-center">
            <CreatorAvatar
              name={creator.name}
              profilePicture={creator.profilePicture}
              linkedinUsername={creator.linkedinUsername}
              linkedinUrl={creator.linkedinUrl}
              size="lg"
            />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="line-clamp-1 font-semibold text-white group-hover:text-violet-light">
                {creator.name}
              </h3>
              <span className="text-sm">{getCountryFlag(creator.country || "")}</span>
            </div>
            <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
              {creator.headline || "Créateur LinkedIn"}
            </p>
            {(creator.sector || creator.industry) && (
              <Badge
                variant="secondary"
                className="mt-2 bg-violet/20 text-[10px] text-violet-light"
              >
                {creator.sector || creator.industry}
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
            <div>
              <p className="text-sm font-bold text-white">
                {formatFollowers(creator.followers || 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">abonnés</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{engagement.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">engagement</p>
            </div>
            <div>
              <p
                className={`text-sm font-bold ${
                  growth >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">croissance</p>
            </div>
          </div>
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
          linkedinUrl={creator.linkedinUrl}
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
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="flex items-center justify-end gap-1 font-bold text-white">
            <Users className="h-4 w-4 text-muted-foreground" />
            {formatFollowers(creator.followers || 0)}
          </p>
        </div>

        <div className="hidden shrink-0 text-right md:block w-16">
          <p className="flex items-center justify-end gap-1 font-semibold text-white">
            <Heart className="h-3.5 w-3.5 text-rose" />
            {engagement.toFixed(1)}%
          </p>
        </div>

        <div className="hidden shrink-0 text-right lg:block w-16">
          <p
            className={`flex items-center justify-end gap-1 font-semibold ${
              growth >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}%
          </p>
        </div>
      </div>
    </Link>
  );
}

export function CreatorRankings({ creators }: { creators: RankingCreator[] }) {
  if (creators.length === 0) return null;

  const top3 = creators.slice(0, 3);
  const gridCreators = creators.slice(3, 24);
  const listCreators = creators.slice(24);

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

      {gridCreators.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Créateurs à suivre
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridCreators.map((creator, i) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                rank={i + 4}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {listCreators.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Suite du classement
          </h2>
          <div className="space-y-2">
            {listCreators.map((creator, index) => (
              <RankingRow key={creator.id} creator={creator} rank={index + 25} />
            ))}
          </div>
        </div>
      )}

      {creators.length < 3 && (
        <div className="space-y-2">
          {creators.map((creator, index) => (
            <RankingRow key={creator.id} creator={creator} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
