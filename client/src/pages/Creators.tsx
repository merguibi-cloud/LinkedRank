import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import {
  Users,
  TrendingUp,
  Award,
  ExternalLink,
  Search,
  Filter,
  Linkedin,
  Star,
  Eye,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

// Données des créateurs LinkedIn populaires
const creatorsData = [
  {
    id: 1,
    name: "Nina Ramen",
    username: "ninaramen",
    avatar: "👩‍💼",
    color: "from-pink-500 to-rose-500",
    title: "Copywriter & Formatrice LinkedIn",
    followers: "180K+",
    engagement: "8.2%",
    specialty: "Copywriting",
    country: "🇫🇷 France",
    verified: true,
    description: "Experte en copywriting et personal branding sur LinkedIn. Auteure de posts viraux et formatrice reconnue.",
  },
  {
    id: 2,
    name: "Thibault Louis",
    username: "thibaultlouis",
    avatar: "👨‍💻",
    color: "from-blue-500 to-cyan-500",
    title: "Entrepreneur & Créateur de contenu",
    followers: "250K+",
    engagement: "7.8%",
    specialty: "Entrepreneuriat",
    country: "🇫🇷 France",
    verified: true,
    description: "Partage son parcours entrepreneurial et ses conseils pour réussir sur LinkedIn.",
  },
  {
    id: 3,
    name: "Caroline Mignaux",
    username: "carolinemignaux",
    avatar: "👩‍🎤",
    color: "from-violet-500 to-purple-500",
    title: "Experte Marketing & Personal Branding",
    followers: "120K+",
    engagement: "9.1%",
    specialty: "Marketing",
    country: "🇫🇷 France",
    verified: true,
    description: "Spécialiste du marketing digital et du personal branding. Créatrice de contenus inspirants.",
  },
  {
    id: 4,
    name: "Justin Welsh",
    username: "justinwelsh",
    avatar: "👨‍💼",
    color: "from-emerald-500 to-teal-500",
    title: "Solopreneur & LinkedIn Expert",
    followers: "500K+",
    engagement: "6.5%",
    specialty: "Solopreneuriat",
    country: "🇺🇸 USA",
    verified: true,
    description: "L'un des créateurs LinkedIn les plus suivis. Expert en solopreneuriat et création de contenu.",
  },
  {
    id: 5,
    name: "Ruben Hassid",
    username: "rubenhassid",
    avatar: "🧑‍💻",
    color: "from-amber-500 to-orange-500",
    title: "AI & Tech Content Creator",
    followers: "300K+",
    engagement: "7.2%",
    specialty: "Intelligence Artificielle",
    country: "🇮🇱 Israël",
    verified: true,
    description: "Créateur de contenu spécialisé en IA et technologies. Vulgarise les concepts complexes.",
  },
  {
    id: 6,
    name: "Léa Nguyen",
    username: "leanguyen",
    avatar: "👩‍🔬",
    color: "from-indigo-500 to-blue-500",
    title: "Data Scientist & Créatrice",
    followers: "85K+",
    engagement: "10.3%",
    specialty: "Data Science",
    country: "🇫🇷 France",
    verified: false,
    description: "Partage ses connaissances en data science et machine learning de manière accessible.",
  },
  {
    id: 7,
    name: "Guillaume Moubeche",
    username: "guillaumemoubeche",
    avatar: "🚀",
    color: "from-rose-500 to-pink-500",
    title: "CEO lemlist & Entrepreneur",
    followers: "150K+",
    engagement: "8.5%",
    specialty: "SaaS & Growth",
    country: "🇫🇷 France",
    verified: true,
    description: "Fondateur de lemlist, partage son expérience de création de startup et de growth.",
  },
  {
    id: 8,
    name: "Sahil Bloom",
    username: "sahilbloom",
    avatar: "📈",
    color: "from-cyan-500 to-blue-500",
    title: "Investor & Writer",
    followers: "400K+",
    engagement: "6.8%",
    specialty: "Finance & Productivité",
    country: "🇺🇸 USA",
    verified: true,
    description: "Investisseur et écrivain. Partage des frameworks de productivité et de réflexion.",
  },
];

const specialties = [
  "Tous",
  "Copywriting",
  "Entrepreneuriat",
  "Marketing",
  "Intelligence Artificielle",
  "Data Science",
  "SaaS & Growth",
  "Finance & Productivité",
];

export default function Creators() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");

  const filteredCreators = creatorsData.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "Tous" || creator.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet/20 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-rose/20 blur-[100px]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-violet-light">
              <Users className="h-4 w-4" />
              Inspirez-vous des meilleurs
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Top{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                Créateurs LinkedIn
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Découvrez les créateurs qui dominent LinkedIn et inspirez-vous de leurs stratégies pour développer votre audience.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 border-b border-white/10">
        <div className="container">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un créateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-card/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-violet/50 focus:outline-none focus:ring-1 focus:ring-violet/50"
              />
            </div>

            {/* Specialty Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedSpecialty === specialty
                      ? "bg-violet text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCreators.length} créateur{filteredCreators.length > 1 ? "s" : ""} trouvé{filteredCreators.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="group relative rounded-2xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-violet/30 hover:bg-card/80 hover:scale-[1.02]"
              >
                {/* Verified Badge */}
                {creator.verified && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                    <Star className="h-3 w-3 fill-current" />
                    Vérifié
                  </div>
                )}

                {/* Avatar & Info */}
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${creator.color} text-3xl shadow-lg`}>
                    {creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{creator.name}</h3>
                    <p className="text-sm text-violet-light truncate">@{creator.username}</p>
                    <p className="text-xs text-muted-foreground">{creator.country}</p>
                  </div>
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-white/80 mb-2 line-clamp-2">
                  {creator.title}
                </p>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {creator.description}
                </p>

                {/* Specialty Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-full bg-violet/20 px-3 py-1 text-xs font-medium text-violet-light">
                    {creator.specialty}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-white">{creator.followers}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">{creator.engagement}</span>
                  </div>
                </div>

                {/* View Profile Button */}
                <a
                  href={`https://linkedin.com/in/${creator.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                >
                  <Linkedin className="h-4 w-4" />
                  Voir le profil
                  <ExternalLink className="h-3 w-3" />
                </a>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet/5 to-rose/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </div>
            ))}
          </div>

          {filteredCreators.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun créateur trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Vous voulez rejoindre ce classement ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Utilisez nos agents IA pour créer du contenu viral et développer votre audience LinkedIn.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/agents">
                <Button className="btn-gradient h-12 px-8">
                  Activer mes Agents IA
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/generate">
                <Button variant="outline" className="h-12 px-8 border-white/20 hover:bg-white/5">
                  Générer du contenu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
