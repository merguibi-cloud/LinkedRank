import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Lightbulb,
  Newspaper,
  Video,
  FileText,
  Search,
  ArrowRight,
  Clock,
  Eye,
  Star,
  TrendingUp,
  Sparkles,
  Target,
  Users,
  Zap,
  Calendar,
  CheckCircle2,
} from "lucide-react";

type ResourceCategory = "all" | "guides" | "tips" | "news" | "videos";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  readTime: string;
  views: number;
  featured: boolean;
  image?: string;
  date: string;
  link?: string;
}

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "Tout", icon: BookOpen },
    { id: "guides", label: "Guides", icon: FileText },
    { id: "tips", label: "Tips & Astuces", icon: Lightbulb },
    { id: "news", label: "Actualités", icon: Newspaper },
    { id: "videos", label: "Vidéos", icon: Video },
  ];

  const resources: Resource[] = [
    {
      id: "1",
      title: "Le guide ultime pour exploser sur LinkedIn en 2025",
      description:
        "Découvrez les stratégies des top créateurs pour atteindre 100K abonnés et générer des leads qualifiés.",
      category: "guides",
      readTime: "15 min",
      views: 12500,
      featured: true,
      date: "20 Dec 2024",
      link: "/resources/guide-linkedin-2025",
    },
    {
      id: "2",
      title: "Comment écrire un hook qui capte l'attention en 3 secondes",
      description:
        "Les techniques des meilleurs copywriters pour créer des accroches irrésistibles.",
      category: "tips",
      readTime: "5 min",
      views: 8900,
      featured: true,
      date: "19 Dec 2024",
    },
    {
      id: "3",
      title: "LinkedIn lance de nouvelles fonctionnalités pour les créateurs",
      description:
        "Tour d'horizon des dernières mises à jour de la plateforme et comment en tirer parti.",
      category: "news",
      readTime: "3 min",
      views: 5600,
      featured: false,
      date: "18 Dec 2024",
    },
    {
      id: "4",
      title: "Masterclass : Créer du contenu viral avec l'IA",
      description:
        "Apprenez à utiliser ChatGPT et les outils IA pour multiplier votre production de contenu.",
      category: "videos",
      readTime: "45 min",
      views: 15200,
      featured: true,
      date: "17 Dec 2024",
    },
    {
      id: "5",
      title: "Les 10 formats de posts qui génèrent le plus d'engagement",
      description:
        "Analyse de 10 000 posts LinkedIn pour identifier les formats les plus performants.",
      category: "guides",
      readTime: "10 min",
      views: 9800,
      featured: false,
      date: "16 Dec 2024",
    },
    {
      id: "6",
      title: "Publier le matin ou le soir ? La réponse définitive",
      description:
        "Étude basée sur les données de 500 créateurs pour trouver le meilleur moment de publication.",
      category: "tips",
      readTime: "4 min",
      views: 7200,
      featured: false,
      date: "15 Dec 2024",
    },
    {
      id: "7",
      title: "L'algorithme LinkedIn 2025 : ce qui change",
      description:
        "Décryptage des dernières évolutions de l'algorithme et comment adapter votre stratégie.",
      category: "news",
      readTime: "6 min",
      views: 11000,
      featured: true,
      date: "14 Dec 2024",
    },
    {
      id: "8",
      title: "Comment transformer vos commentaires en clients",
      description:
        "La méthode en 5 étapes pour convertir l'engagement en opportunités business.",
      category: "tips",
      readTime: "7 min",
      views: 6500,
      featured: false,
      date: "13 Dec 2024",
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter((r) => r.featured);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "guides":
        return FileText;
      case "tips":
        return Lightbulb;
      case "news":
        return Newspaper;
      case "videos":
        return Video;
      default:
        return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "guides":
        return "bg-violet/20 text-violet-light";
      case "tips":
        return "bg-gold/20 text-gold";
      case "news":
        return "bg-blue-500/20 text-blue-400";
      case "videos":
        return "bg-rose/20 text-rose";
      default:
        return "bg-white/10 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 border-b border-white/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet/10 border border-violet/20 text-violet-light text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              Centre de ressources
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Apprenez à{" "}
              <span className="gradient-text">dominer LinkedIn</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Guides, tutoriels, tips et actualités pour devenir un créateur de contenu d'exception.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une ressource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-card/50 border-white/10 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 border-b border-white/5">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-gold" />
              À la une
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredResources.map((resource) => {
              const Icon = getCategoryIcon(resource.category);
              const cardContent = (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        resource.category
                      )}`}
                    >
                      <Icon className="w-3 h-3 inline mr-1" />
                      {categories.find((c) => c.id === resource.category)?.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-violet-light transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(resource.views / 1000).toFixed(1)}K
                    </span>
                  </div>
                  {!resource.link && (
                    <div className="mt-3 text-xs text-amber-500/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Bientôt disponible
                    </div>
                  )}
                </>
              );
              
              return resource.link ? (
                <Link
                  key={resource.id}
                  href={resource.link}
                  className="group p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all cursor-pointer block"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={resource.id}
                  className="group p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all cursor-pointer block"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Resources */}
      <section className="py-12">
        <div className="container">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as ResourceCategory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? "bg-violet/20 text-violet-light border border-violet/30"
                    : "bg-card/50 text-muted-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const Icon = getCategoryIcon(resource.category);
              const cardContent = (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        resource.category
                      )}`}
                    >
                      <Icon className="w-3 h-3 inline mr-1" />
                      {categories.find((c) => c.id === resource.category)?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {resource.date}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-violet-light transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(resource.views / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-light group-hover:translate-x-1 transition-all" />
                  </div>
                  {!resource.link && (
                    <div className="mt-3 text-xs text-amber-500/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Bientôt disponible
                    </div>
                  )}
                </>
              );
              
              return resource.link ? (
                <Link
                  key={resource.id}
                  href={resource.link}
                  className="group p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all cursor-pointer block"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={resource.id}
                  className="group p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm hover:border-violet/30 transition-all cursor-pointer block"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Aucune ressource trouvée
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Recevez les meilleurs tips chaque semaine
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez 10 000+ créateurs qui reçoivent nos conseils exclusifs pour dominer LinkedIn.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                placeholder="votre@email.com"
                className="bg-card/50 border-white/10"
              />
              <Button className="btn-gradient whitespace-nowrap">
                S'inscrire
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Pas de spam. Désabonnement en un clic.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
