import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  TrendingUp, 
  Heart,
  Globe,
  Filter,
  ArrowLeft,
  ExternalLink,
  Award,
  BarChart3,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

export default function Influencers() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [sortBy, setSortBy] = useState<"followers" | "engagement" | "growth">("followers");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Get filters
  const { data: filters } = trpc.influencers.filters.useQuery();

  // Get influencers
  const { data, isLoading } = trpc.influencers.list.useQuery({
    search: search || undefined,
    country: country || undefined,
    industry: industry || undefined,
    sortBy,
    limit,
    offset,
  });

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black">🥇 #1</Badge>;
    if (index === 1) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-black">🥈 #2</Badge>;
    if (index === 2) return <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">🥉 #3</Badge>;
    return <Badge variant="outline" className="border-amber-700/50">#{index + 1}</Badge>;
  };

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

      {/* Hero Section */}
      <section className="py-12 border-b border-amber-900/20">
        <div className="container text-center">
          <Badge className="mb-4 bg-amber-950/50 text-amber-400 border-amber-700/50">
            <Award className="w-3 h-3 mr-1" />
            Classement LinkedIn
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Top <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Influenceurs</span> LinkedIn
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les créateurs de contenu les plus influents sur LinkedIn. 
            Inspirez-vous des meilleurs pour développer votre audience.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-amber-900/20 bg-gradient-to-r from-amber-950/10 to-transparent">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{data?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Influenceurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{filters?.countries.length || 0}</div>
              <div className="text-sm text-muted-foreground">Pays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{filters?.industries.length || 0}</div>
              <div className="text-sm text-muted-foreground">Secteurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">Temps réel</div>
              <div className="text-sm text-muted-foreground">Mise à jour</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-amber-900/20">
        <div className="container">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un influenceur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card/50 border-amber-900/30"
              />
            </div>

            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px] bg-card/50 border-amber-900/30">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {filters?.countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-[180px] bg-card/50 border-amber-900/30">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tous les secteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {filters?.industries.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px] bg-card/50 border-amber-900/30">
                <BarChart3 className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Par abonnés
                  </span>
                </SelectItem>
                <SelectItem value="engagement">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Par engagement
                  </span>
                </SelectItem>
                <SelectItem value="growth">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Par croissance
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Influencers List */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : data?.influencers.length === 0 ? (
            <Card className="bg-card/30 border-dashed border-amber-900/30">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-amber-500/50" />
                <p className="text-muted-foreground">
                  Aucun influenceur trouvé. Les données seront bientôt disponibles.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {data?.influencers.map((influencer, index) => (
                  <Card 
                    key={influencer.id} 
                    className="bg-card/50 border-amber-900/30 hover:border-amber-700/50 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="hidden sm:block">
                          {getRankBadge(offset + index)}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-14 h-14 border-2 border-amber-700/30">
                          <AvatarImage src={influencer.profilePicture || undefined} />
                          <AvatarFallback className="bg-amber-950 text-amber-400">
                            {influencer.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{influencer.name}</h3>
                            {influencer.isVerified && (
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">Vérifié</Badge>
                            )}
                            <span className="sm:hidden">{getRankBadge(offset + index)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {influencer.headline}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {influencer.country && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {influencer.country}
                              </span>
                            )}
                            {influencer.industry && (
                              <span>{influencer.industry}</span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-500">
                              {formatNumber(influencer.followers)}
                            </div>
                            <div className="text-xs text-muted-foreground">Abonnés</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-500">
                              {influencer.avgLikes ? formatNumber(influencer.avgLikes) : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">Likes moy.</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${(influencer.followersGrowth30d || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {influencer.followersGrowth30d ? `${influencer.followersGrowth30d > 0 ? '+' : ''}${influencer.followersGrowth30d.toFixed(1)}%` : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">Croissance</div>
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden text-right">
                          <div className="text-lg font-bold text-amber-500">
                            {formatNumber(influencer.followers)}
                          </div>
                          <div className="text-xs text-muted-foreground">abonnés</div>
                        </div>

                        {/* Action */}
                        {influencer.linkedinUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="hidden sm:flex border-amber-700/50 hover:bg-amber-950/30"
                            asChild
                          >
                            <a href={influencer.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data && data.total > limit && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="border-amber-700/50"
                  >
                    Précédent
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    {offset + 1} - {Math.min(offset + limit, data.total)} sur {data.total}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= data.total}
                    className="border-amber-700/50"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 border-t border-amber-900/20 bg-gradient-to-r from-amber-950/20 to-transparent">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">
            Vous voulez rejoindre ce classement ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Utilisez notre générateur de contenu IA pour créer des posts viraux 
            et développer votre audience LinkedIn.
          </p>
          <Link href="/generator">
            <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600">
              Commencer à créer du contenu
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
