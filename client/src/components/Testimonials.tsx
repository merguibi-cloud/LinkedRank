import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Quote, 
  TrendingUp, 
  Users, 
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Verified
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  results: {
    metric: string;
    before: string;
    after: string;
    improvement: string;
  };
  linkedinUrl?: string;
  verified: boolean;
  date: string;
  category: "creator" | "entrepreneur" | "sales";
}

// Témoignages clients
const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marie Dupont",
    role: "Content Creator",
    company: "MarieContent",
    avatar: "MD",
    content: "LinkedAgents a complètement transformé ma stratégie LinkedIn. Je passais 3h par jour à créer du contenu, maintenant c'est 30 minutes. L'IA comprend vraiment mon style et génère des posts qui engagent ma communauté.",
    rating: 5,
    results: {
      metric: "Engagement",
      before: "2.1%",
      after: "8.7%",
      improvement: "+314%",
    },
    linkedinUrl: "https://linkedin.com/in/marie-dupont",
    verified: true,
    date: "Décembre 2024",
    category: "creator",
  },
  {
    id: "2",
    name: "Thomas Martin",
    role: "CEO & Founder",
    company: "TechStartup",
    avatar: "TM",
    content: "En tant qu'entrepreneur, je n'avais pas le temps de gérer LinkedIn. Avec LinkedAgents, j'ai généré 47 leads qualifiés en 3 semaines. Le ROI est incroyable, c'est devenu mon canal d'acquisition principal.",
    rating: 5,
    results: {
      metric: "Leads générés",
      before: "5/mois",
      after: "47/mois",
      improvement: "+840%",
    },
    linkedinUrl: "https://linkedin.com/in/thomas-martin",
    verified: true,
    date: "Novembre 2024",
    category: "entrepreneur",
  },
  {
    id: "3",
    name: "Sophie Bernard",
    role: "Sales Director",
    company: "SalesForce Partner",
    avatar: "SB",
    content: "Mon équipe commerciale utilise LinkedAgents pour la prospection. Les posts générés par l'IA attirent nos prospects idéaux. Notre taux de réponse aux InMails a explosé depuis qu'on partage du contenu de qualité.",
    rating: 5,
    results: {
      metric: "Taux de réponse",
      before: "12%",
      after: "34%",
      improvement: "+183%",
    },
    linkedinUrl: "https://linkedin.com/in/sophie-bernard",
    verified: true,
    date: "Décembre 2024",
    category: "sales",
  },
  {
    id: "4",
    name: "Lucas Petit",
    role: "Personal Branding Coach",
    company: "BrandYourself",
    avatar: "LP",
    content: "Je recommande LinkedAgents à tous mes clients. L'outil est intuitif, les agents IA sont bluffants de pertinence. C'est comme avoir une équipe de ghostwriters disponible 24/7.",
    rating: 5,
    results: {
      metric: "Followers",
      before: "2.3K",
      after: "15.8K",
      improvement: "+587%",
    },
    linkedinUrl: "https://linkedin.com/in/lucas-petit",
    verified: true,
    date: "Octobre 2024",
    category: "creator",
  },
  {
    id: "5",
    name: "Emma Leroy",
    role: "Founder",
    company: "EcoStartup",
    avatar: "EL",
    content: "LinkedAgents m'a permis de construire une audience engagée autour de ma mission écologique. Les posts sont authentiques et résonnent avec ma communauté. J'ai même été invitée à des podcasts grâce à ma visibilité.",
    rating: 5,
    results: {
      metric: "Impressions",
      before: "5K/mois",
      after: "120K/mois",
      improvement: "+2300%",
    },
    linkedinUrl: "https://linkedin.com/in/emma-leroy",
    verified: true,
    date: "Novembre 2024",
    category: "entrepreneur",
  },
  {
    id: "6",
    name: "Antoine Moreau",
    role: "Account Executive",
    company: "Enterprise SaaS",
    avatar: "AM",
    content: "Grâce à LinkedAgents, je suis passé de commercial invisible à thought leader dans mon secteur. Mes prospects me contactent directement après avoir vu mes posts. C'est un game changer pour la vente sociale.",
    rating: 5,
    results: {
      metric: "Pipeline généré",
      before: "50K€/mois",
      after: "180K€/mois",
      improvement: "+260%",
    },
    linkedinUrl: "https://linkedin.com/in/antoine-moreau",
    verified: true,
    date: "Décembre 2024",
    category: "sales",
  },
];

// Composant de carte de témoignage
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const getCategoryColor = () => {
    switch (testimonial.category) {
      case "creator":
        return "from-pink-500 to-purple-500";
      case "entrepreneur":
        return "from-blue-500 to-cyan-500";
      case "sales":
        return "from-green-500 to-emerald-500";
    }
  };

  const getCategoryLabel = () => {
    switch (testimonial.category) {
      case "creator":
        return "Créateur de contenu";
      case "entrepreneur":
        return "Entrepreneur";
      case "sales":
        return "Commercial";
    }
  };

  return (
    <Card className="group relative overflow-hidden border-white/10 bg-white/5 transition-all hover:border-violet/30 hover:bg-white/10">
      {/* Gradient accent */}
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${getCategoryColor()}`} />
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getCategoryColor()} text-lg font-bold text-white`}>
              {testimonial.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                {testimonial.verified && (
                  <Verified className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} @ {testimonial.company}
              </p>
            </div>
          </div>
          <Badge className={`bg-gradient-to-r ${getCategoryColor()} text-xs`}>
            {getCategoryLabel()}
          </Badge>
        </div>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">{testimonial.date}</span>
        </div>

        {/* Quote */}
        <div className="relative mb-4">
          <Quote className="absolute -left-1 -top-1 h-6 w-6 text-violet/30" />
          <p className="pl-6 text-sm leading-relaxed text-gray-300">
            "{testimonial.content}"
          </p>
        </div>

        {/* Results */}
        <div className="rounded-lg bg-gradient-to-r from-violet/20 to-fuchsia/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet">
            <TrendingUp className="h-4 w-4" />
            Résultats obtenus
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{testimonial.results.metric}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">{testimonial.results.before}</span>
                <span className="text-lg font-bold text-white">{testimonial.results.after}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">{testimonial.results.improvement}</p>
              <p className="text-xs text-muted-foreground">d'amélioration</p>
            </div>
          </div>
        </div>

        {/* LinkedIn link */}
        {testimonial.linkedinUrl && (
          <a
            href={testimonial.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-blue-500"
          >
            <Linkedin className="h-4 w-4" />
            Voir le profil LinkedIn
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// Composant principal des témoignages
export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-scroll
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-violet to-fuchsia">
            <Star className="mr-1 h-3 w-3" />
            Témoignages clients
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ils ont transformé leur LinkedIn
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Découvrez comment nos utilisateurs ont multiplié leur impact sur LinkedIn
            grâce à LinkedAgents
          </p>
        </div>

        {/* Stats globales */}
        <div className="mb-12 grid gap-4 sm:grid-cols-4">
          <Card className="border-white/10 bg-white/5 text-center">
            <CardContent className="p-4">
              <Users className="mx-auto mb-2 h-6 w-6 text-violet" />
              <p className="text-2xl font-bold text-white">2,500+</p>
              <p className="text-xs text-muted-foreground">Utilisateurs actifs</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-center">
            <CardContent className="p-4">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-green-500" />
              <p className="text-2xl font-bold text-white">+340%</p>
              <p className="text-xs text-muted-foreground">Engagement moyen</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-center">
            <CardContent className="p-4">
              <Eye className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-2xl font-bold text-white">50M+</p>
              <p className="text-xs text-muted-foreground">Impressions générées</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-center">
            <CardContent className="p-4">
              <MessageSquare className="mx-auto mb-2 h-6 w-6 text-fuchsia" />
              <p className="text-2xl font-bold text-white">15K+</p>
              <p className="text-xs text-muted-foreground">Posts créés</p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          {/* Navigation */}
          <div className="absolute -left-4 top-1/2 z-10 -translate-y-1/2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute -right-4 top-1/2 z-10 -translate-y-1/2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {visibleTestimonials.map((testimonial, idx) => (
              <div
                key={`${testimonial.id}-${idx}`}
                className={`transition-all duration-500 ${
                  idx === 1 ? "md:scale-105" : "opacity-80"
                }`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-8 bg-violet"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Rejoignez les milliers d'utilisateurs qui ont transformé leur LinkedIn
          </p>
          <Button className="btn-gradient" size="lg">
            Commencer gratuitement
          </Button>
        </div>
      </div>
    </section>
  );
}

// Export du composant compact pour l'intégration dans d'autres pages
export function TestimonialsCompact() {
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featuredTestimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}
