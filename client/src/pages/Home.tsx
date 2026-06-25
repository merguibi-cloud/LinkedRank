import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getSignupUrl } from "@/const";
import { Link } from "wouter";
import {
  Zap,
  BarChart3,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Play,
  CheckCircle2,
  Bot,
  Brain,
  MessageSquare,
  Layers,
  Rocket,
  Shield,
  Clock,
  Users,
  Lock,
  PenTool,
  Search,
  CalendarDays,
  LineChart,
  Crown,
  Check,
  BadgeCheck,
} from "lucide-react";
import { SocialProofStats } from "@/components/SocialProof";
import { VideoPresentation } from "@/components/VideoPresentation";

type AgentAvailability = "available" | "coming_soon";

function AgentStatusBadge({ availability }: { availability: AgentAvailability }) {
  if (availability === "available") {
    return (
      <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        Disponible
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
      <Clock className="w-3 h-3" />
      Arrive bientôt
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  const agents: Array<{
    icon: typeof Sparkles;
    name: string;
    role: string;
    color: string;
    personality: string;
    description: string;
    quote: string;
    availability: AgentAvailability;
    href?: string;
    ctaLabel?: string;
  }> = [
    {
      icon: PenTool,
      name: "Léa",
      role: "Content Creator",
      color: "from-pink-500 to-rose-500",
      personality: "Créative et inspirante",
      description: "Transforme vos idées en posts structurés, adaptés à votre audience LinkedIn.",
      quote: "Chaque publication est une opportunité de marquer les esprits.",
      availability: "available",
      href: "/generate",
      ctaLabel: "Créer avec Léa",
    },
    {
      icon: Search,
      name: "Max",
      role: "Trend Hunter",
      color: "from-blue-500 to-cyan-500",
      personality: "Curieux et analytique",
      description: "Surveille les tendances pour repérer les sujets à fort potentiel.",
      quote: "Les tendances d'aujourd'hui sont les succès de demain.",
      availability: "coming_soon",
    },
    {
      icon: MessageSquare,
      name: "Emma",
      role: "Engagement Manager",
      color: "from-emerald-500 to-teal-500",
      personality: "Empathique et réactive",
      description: "Aide à structurer vos réponses et à entretenir votre communauté.",
      quote: "L'engagement, c'est l'art de créer des conversations.",
      availability: "coming_soon",
    },
    {
      icon: LineChart,
      name: "Alex",
      role: "Growth Strategist",
      color: "from-violet-500 to-purple-500",
      personality: "Stratégique et orienté data",
      description: "Analyse vos performances pour affiner votre stratégie de contenu.",
      quote: "Les chiffres racontent une histoire — je la traduis en actions.",
      availability: "coming_soon",
    },
    {
      icon: CalendarDays,
      name: "Sam",
      role: "Planificateur",
      color: "from-amber-500 to-orange-500",
      personality: "Organisé et précis",
      description: "Programme vos publications aux créneaux les plus performants.",
      quote: "Le timing fait la différence — je m'en occupe.",
      availability: "available",
      href: "/auto-publish",
      ctaLabel: "Configurer l'auto-publication",
    },
  ];

  const availableAgentsCount = agents.filter((a) => a.availability === "available").length;
  const comingSoonAgentsCount = agents.filter((a) => a.availability === "coming_soon").length;

  const features = [
    {
      icon: Bot,
      title: "Agents IA Autonomes",
      description: "Vos agents travaillent 24/7 pour créer, analyser et optimiser votre présence LinkedIn.",
    },
    {
      icon: Layers,
      title: "Carrousels Professionnels",
      description: "Générez des carrousels visuellement impactants en quelques clics, prêts à publier.",
    },
    {
      icon: Target,
      title: "Score de Viralité",
      description: "Prédisez le potentiel viral de vos posts avant publication grâce à notre IA.",
    },
    {
      icon: Clock,
      title: "Meilleurs Horaires",
      description: "Publiez au moment optimal grâce à l'analyse de votre audience spécifique.",
    },
    {
      icon: Zap,
      title: "Auto-Publication",
      description: "Connectez LinkedIn et publiez automatiquement le contenu approuvé par vos agents.",
    },
    {
      icon: Shield,
      title: "Contrôle Total",
      description: "Gardez le contrôle avec le mode supervisé : approuvez ou rejetez chaque action.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12 sm:pb-20 pt-8 sm:pt-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet/20 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-rose/20 blur-[100px]" />
          <div className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-violet-light">
              <Bot className="h-4 w-4" />
              Plateforme d'Agents IA pour LinkedIn
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-violet-light via-rose to-gold bg-clip-text text-transparent">
                LinkedAgents
              </span>
            </h1>
            
            <p className="mt-4 text-xl font-medium text-white/90 sm:text-3xl">
              Vos agents IA pour LinkedIn
            </p>

            {/* Subtitle */}
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
              Créez du contenu LinkedIn avec l'IA, planifiez vos publications et suivez vos résultats — en quelques clics.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center">
              {user ? (
                <>
                  <Link href="/agents">
                    <Button className="btn-gradient h-12 w-full px-8 text-base sm:h-14 sm:w-auto sm:px-10 sm:text-lg">
                      <Brain className="mr-2 h-5 w-5" />
                      Mes Agents IA
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="h-12 w-full border-white/20 px-8 text-base hover:bg-white/5 sm:h-14 sm:w-auto sm:px-10 sm:text-lg">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getSignupUrl()}>
                    <Button className="btn-gradient h-12 w-full px-8 text-base sm:h-14 sm:w-auto sm:px-10 sm:text-lg">
                      <Rocket className="mr-2 h-5 w-5" />
                      Créer mon compte
                    </Button>
                  </a>
                  <Link href="/rankings/france">
                    <Button variant="outline" className="h-12 w-full border-white/20 px-8 text-base hover:bg-white/5 sm:h-14 sm:w-auto sm:px-10 sm:text-lg">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Explorer les classements
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {availableAgentsCount} agent{availableAgentsCount > 1 ? "s" : ""} disponible{availableAgentsCount > 1 ? "s" : ""} · {comingSoonAgentsCount} arrive bientôt
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Mode supervisé par défaut
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Connexion LinkedIn sécurisée
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <SocialProofStats />

      {/* Video Presentation Section */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-4 py-2 text-sm text-rose">
                <Play className="h-4 w-4" />
                Aperçu interactif
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Découvrez LinkedAgents en{" "}
                <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                  quelques étapes
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Parcourez un aperçu guidé pour comprendre comment nos agents IA vous aident à créer et publier sur LinkedIn.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Rencontrez votre équipe d'agents IA personnalisés</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Découvrez comment générer du contenu avec l'IA</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Apprenez à automatiser votre stratégie LinkedIn</span>
                </li>
              </ul>
            </div>

            {/* Video Component */}
            <div className="flex justify-center">
              <VideoPresentation />
            </div>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section className="py-12 sm:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <Bot className="h-4 w-4" />
              Votre équipe d'agents IA
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Rencontrez vos{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                Agents IA
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Commencez avec Léa pour créer du contenu et Sam pour automatiser vos publications LinkedIn.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const isComingSoon = agent.availability === "coming_soon";
              const AgentIcon = agent.icon;
              const card = (
              <div
                className={[
                  "group relative rounded-2xl border p-6 backdrop-blur-sm transition-all h-full",
                  isComingSoon
                    ? "border-white/5 bg-card/30 opacity-80 hover:opacity-95 hover:border-white/10"
                    : "border-violet/20 bg-card/50 hover:border-violet/40 hover:bg-card/80 shadow-lg shadow-violet/5 cursor-pointer",
                ].join(" ")}
              >
                <AgentStatusBadge availability={agent.availability} />

                {isComingSoon && (
                  <div className="absolute inset-0 rounded-2xl bg-background/10 pointer-events-none" />
                )}

                <div className={`relative mb-4 flex items-center gap-4 ${isComingSoon ? "grayscale-[35%]" : ""}`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} shadow-lg`}>
                    <AgentIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                    <p className="text-sm text-violet-light">{agent.role}</p>
                    <p className="text-xs text-muted-foreground">{agent.personality}</p>
                  </div>
                </div>

                <p className="relative text-sm text-muted-foreground mb-3">
                  {agent.description}
                </p>

                <p className="relative text-xs italic text-white/60 mb-4 border-l-2 border-violet/30 pl-3">
                  {agent.quote}
                </p>

                {isComingSoon && (
                  <div className="relative flex items-center gap-1.5 text-xs text-amber-300/80">
                    <Lock className="w-3 h-3" />
                    Bientôt disponible sur LinkedAgents
                  </div>
                )}

                {!isComingSoon && agent.href && (
                  <div className="relative mt-4">
                    <Button className="w-full btn-gradient h-10 text-sm">
                      {agent.ctaLabel ?? "Ouvrir"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Hover Effect */}
                {!isComingSoon && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet/5 to-rose/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                )}
              </div>
              );

              return agent.href && !isComingSoon ? (
                <Link key={agent.name} href={agent.href}>
                  {card}
                </Link>
              ) : (
                <div key={agent.name}>{card}</div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link href="/generate">
                  <Button className="btn-gradient h-12 px-8">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Créer avec Léa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auto-publish">
                  <Button variant="outline" className="h-12 px-8 border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Automatiser avec Sam
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getSignupUrl()}>
                <Button className="btn-gradient h-12 px-8">
                  <Rocket className="mr-2 h-5 w-5" />
                  Créer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/10 bg-card/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Tout ce dont vous avez besoin pour{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                performer
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Une suite complète d'outils propulsés par l'IA pour automatiser et optimiser votre stratégie LinkedIn
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-violet/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-rose/20">
                  <feature.icon className="h-6 w-6 text-violet-light" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="border-t border-white/10 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
              <Sparkles className="h-4 w-4" />
              Tarifs simples et transparents
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Un plan pour chaque{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                ambition LinkedIn
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Commencez avec <strong className="text-white">14 jours gratuits</strong> sur le plan Starter — sans carte bancaire.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                id: "starter",
                name: "Starter",
                price: "19€",
                tagline: "/mois",
                color: "from-blue-500 to-cyan-500",
                trial: "14 jours gratuits",
                icon: Zap,
                popular: false,
                features: ["30 posts IA / mois", "Calendrier éditorial", "Programmation LinkedIn", "Analytics basiques"],
              },
              {
                id: "pro",
                name: "Pro",
                price: "49€",
                tagline: "/mois",
                color: "from-violet-500 to-purple-600",
                icon: Crown,
                popular: true,
                features: ["200 posts IA / mois", "Génération de carrousels", "Analytics avancées", "Bibliothèque d'idées", "Personnalisation du ton"],
              },
              {
                id: "growth",
                name: "Growth",
                price: "99€",
                tagline: "/mois",
                color: "from-rose-500 to-orange-500",
                icon: Rocket,
                popular: false,
                features: ["Posts illimités", "IA entraînée sur le profil", "Automatisation complète", "Multi-comptes", "Rapports avancés"],
              },
            ].map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border p-7 backdrop-blur-sm transition-all ${
                    plan.popular
                      ? "border-violet/40 bg-gradient-to-b from-violet/10 to-card/80 shadow-2xl shadow-violet/20 scale-[1.02]"
                      : "border-white/10 bg-card/50 hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-violet to-rose px-4 py-1.5 text-sm font-semibold text-white">
                        Le plus populaire
                      </span>
                    </div>
                  )}

                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>

                  <div className="my-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.tagline}</span>
                  </div>

                  {"trial" in plan && plan.trial && (
                    <div className="mb-4 flex items-center gap-1.5 text-xs text-emerald-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {plan.trial} · Sans carte bancaire
                    </div>
                  )}

                  <ul className="mb-6 flex-1 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                        <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/pricing">
                    <div className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 bg-gradient-to-r ${plan.color}`}>
                      Voir ce plan
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/pricing">
              <Button variant="outline" className="border-white/20 hover:bg-white/5">
                Voir tous les détails et comparer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet/20 via-rose/10 to-gold/10 p-12 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-violet blur-[100px]" />
              <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-rose blur-[100px]" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                <Sparkles className="h-4 w-4" />
                Prêt à automatiser votre LinkedIn ?
              </div>
              
              <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Activez vos Agents IA{" "}
                <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                  maintenant
                </span>
              </h2>
              
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Créez un compte gratuit et configurez vos agents IA en quelques minutes.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {user ? (
                  <Link href="/agents">
                    <Button className="btn-gradient h-14 px-10 text-lg">
                      <Brain className="mr-2 h-5 w-5" />
                      Accéder à mes Agents
                    </Button>
                  </Link>
                ) : (
                  <a href={getSignupUrl()}>
                    <Button className="btn-gradient h-14 px-10 text-lg">
                      <Rocket className="mr-2 h-5 w-5" />
                      Commencer gratuitement
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-background/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-8 w-8 text-violet-light" />
                <span className="text-xl font-bold text-white">LinkedAgents</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Votre équipe d'agents IA pour LinkedIn. Générez, planifiez et publiez du contenu avec l'aide de l'IA.
              </p>
              <div className="flex gap-3">
                <a href="https://linkedin.com/company/linkedagents" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://twitter.com/linkedagents" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-3">
                <li><Link href="/generate" className="text-sm text-muted-foreground hover:text-white transition-colors">Générateur IA</Link></li>
                <li><Link href="/auto-publish" className="text-sm text-muted-foreground hover:text-white transition-colors">Auto-Publication</Link></li>
                <li><Link href="/agents" className="text-sm text-muted-foreground hover:text-white transition-colors">Agents IA</Link></li>
                <li><Link href="/analytics/advanced" className="text-sm text-muted-foreground hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Ressources</h4>
              <ul className="space-y-3">
                <li><Link href="/resources" className="text-sm text-muted-foreground hover:text-white transition-colors">Centre d'aide</Link></li>
                <li><Link href="/resources/guide-linkedin-2025" className="text-sm text-muted-foreground hover:text-white transition-colors">Guide LinkedIn 2025</Link></li>
                <li><Link href="/templates" className="text-sm text-muted-foreground hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/top-posts" className="text-sm text-muted-foreground hover:text-white transition-colors">Posts Viraux</Link></li>
                <li><Link href="/creators" className="text-sm text-muted-foreground hover:text-white transition-colors">Top Créateurs</Link></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-3">
                <li><Link href="/legal/mentions-legales" className="text-sm text-muted-foreground hover:text-white transition-colors">Mentions Légales</Link></li>
                <li><Link href="/legal/confidentialite" className="text-sm text-muted-foreground hover:text-white transition-colors">Politique de Confidentialité</Link></li>
                <li><Link href="/legal/cgv" className="text-sm text-muted-foreground hover:text-white transition-colors">CGV</Link></li>
                <li><Link href="/legal/cgu" className="text-sm text-muted-foreground hover:text-white transition-colors">CGU</Link></li>
                <li><a href="mailto:contact@linkedagents.fr" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LinkedAgents. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/legal/confidentialite" className="text-xs text-muted-foreground hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/legal/cgu" className="text-xs text-muted-foreground hover:text-white transition-colors">Conditions</Link>
              <span className="text-xs text-muted-foreground">Conçu en France</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
