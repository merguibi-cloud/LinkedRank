import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatorRankings } from "@/components/CreatorRankings";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Filter, TrendingUp, Users, Award, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";

export default function RankingsFrance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("followers");

  const { data: creatorsData, isLoading } = trpc.influencers.list.useQuery({
    country: "France",
    industry: selectedSector === "all" ? undefined : selectedSector,
    sortBy: sortBy as "followers" | "engagement" | "growth",
    limit: 50,
  });

  const creators = creatorsData?.influencers || [];

  // Filter by search query
  const filteredCreators = creators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (creator.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (creator.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const sectors = [
    "Tech",
    "Business",
    "Marketing",
    "Finance",
    "Entrepreneuriat",
    "Leadership",
    "Personal Branding",
    "Ressources Humaines",
    "Sales",
    "Innovation",
  ];

  const topFollowers = filteredCreators.reduce((max, c) => Math.max(max, c.followers ?? 0), 0);
  const avgGrowth =
    filteredCreators.length > 0
      ? (
          filteredCreators.reduce((sum, c) => sum + (c.followersGrowth30d ?? 0), 0) /
          filteredCreators.length
        ).toFixed(1)
      : "—";

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toString();
  };

  const stats = [
    { icon: Users, value: filteredCreators.length.toString(), label: "Créateurs listés" },
    { icon: TrendingUp, value: avgGrowth === "—" ? "—" : `${avgGrowth}%`, label: "Croissance moy. (30j)" },
    { icon: Award, value: topFollowers > 0 ? formatFollowers(topFollowers) : "—", label: "Plus grand profil" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-violet/20 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-rose/20 blur-[100px]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-violet-light">
              <span className="text-xl">🇫🇷</span>
              Classement France
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Top Créateurs{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                LinkedIn France
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Découvrez les leaders d'opinion les plus influents en France. Inspirez-vous de leurs contenus et stratégies.
            </p>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-card/50 p-4 text-center backdrop-blur-sm"
              >
                <stat.icon className="mx-auto h-5 w-5 text-violet-light" />
                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-y border-white/10 bg-background/80 py-4 backdrop-blur-xl">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un créateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-white/10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px] bg-card/50 border-white/10">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-card/50 border-white/10">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">Abonnés</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="growth">Croissance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-card/50 p-4 animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-14 w-14 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="h-3 w-64 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            <CreatorRankings creators={filteredCreators} />
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">Aucun créateur trouvé pour ces critères.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSector("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Vous souhaitez apparaître dans ce classement ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Créez votre profil créateur et commencez à générer du contenu qui performe.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button className="btn-gradient">
                  Créer mon profil créateur
                </Button>
              </Link>
              <Link href="/rankings/world">
                <Button variant="outline" className="border-white/20 hover:bg-white/5">
                  Voir le classement mondial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
