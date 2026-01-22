import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
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
  Calendar,
  Rocket,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { SocialProofStats, TestimonialsSection, LiveActivityFeed, UrgencyBanner } from "@/components/SocialProof";
import { Testimonials } from "@/components/Testimonials";
import { VideoPresentation } from "@/components/VideoPresentation";

export default function Home() {
  const { user } = useAuth();

  // Agents IA personnifiés avec noms, avatars et personnalités
  const agents = [
    {
      icon: Sparkles,
      name: "Léa",
      role: "Content Creator",
      emoji: "✍️",
      avatar: "👩‍🎨",
      color: "from-pink-500 to-rose-500",
      personality: "Créative & Inspirante",
      description: "Salut ! Je suis Léa, votre créatrice de contenu. Je transforme vos idées en posts captivants qui résonnent avec votre audience.",
      quote: "\"Chaque post est une opportunité de marquer les esprits\"",
      stats: { posts: "2.4K", engagement: "+127%" },
      status: "Actif",
    },
    {
      icon: TrendingUp,
      name: "Max",
      role: "Trend Hunter",
      emoji: "🔍",
      avatar: "🕵️‍♂️",
      color: "from-blue-500 to-cyan-500",
      personality: "Curieux & Analytique",
      description: "Hey ! Max ici. Je surveille les tendances 24/7 pour vous alerter des opportunités virales avant tout le monde.",
      quote: "\"Les tendances d'aujourd'hui sont les succès de demain\"",
      stats: { trends: "847", alerts: "156" },
      status: "Actif",
    },
    {
      icon: MessageSquare,
      name: "Emma",
      role: "Engagement Manager",
      emoji: "💬",
      avatar: "👩‍💼",
      color: "from-emerald-500 to-teal-500",
      personality: "Empathique & Réactive",
      description: "Bonjour ! Emma à votre service. Je gère vos interactions et crée des connexions authentiques avec votre communauté.",
      quote: "\"L'engagement, c'est l'art de créer des conversations\"",
      stats: { replies: "5.2K", connections: "+89%" },
      status: "Actif",
    },
    {
      icon: BarChart3,
      name: "Alex",
      role: "Growth Strategist",
      emoji: "📈",
      avatar: "🧑‍💻",
      color: "from-violet-500 to-purple-500",
      personality: "Stratégique & Data-driven",
      description: "Salut ! Je suis Alex, votre stratège de croissance. J'analyse vos données pour maximiser votre impact LinkedIn.",
      quote: "\"Les chiffres racontent une histoire, je la décode pour vous\"",
      stats: { growth: "+234%", insights: "1.2K" },
      status: "Bientôt",
    },
    {
      icon: Users,
      name: "Noah",
      role: "Network Builder",
      emoji: "🤝",
      avatar: "🧑‍🤝‍🧑",
      color: "from-amber-500 to-orange-500",
      personality: "Social & Connecteur",
      description: "Hello ! Noah ici. Je construis votre réseau stratégique en identifiant les connexions qui comptent vraiment.",
      quote: "\"Votre réseau est votre valeur nette\"",
      stats: { connections: "3.8K", intros: "456" },
      status: "Bientôt",
    },
    {
      icon: Calendar,
      name: "Sam",
      role: "Schedule Master",
      emoji: "📅",
      avatar: "🤖",
      color: "from-indigo-500 to-blue-500",
      personality: "Organisé & Précis",
      description: "Yo ! Sam le planificateur. Je publie vos posts au moment parfait pour maximiser leur visibilité.",
      quote: "\"Le timing est tout, je m'en occupe\"",
      stats: { scheduled: "892", optimal: "98%" },
      status: "Actif",
    },
  ];

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

  const stats = [
    { value: "3", label: "Agents IA actifs" },
    { value: "24/7", label: "Travail continu" },
    { value: "10x", label: "Gain de temps" },
    { value: "98%", label: "Satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Banner */}
      <UrgencyBanner />
      
      <Navbar />
      
      {/* Live Activity Feed */}
      <LiveActivityFeed />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20">
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
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-violet-light via-rose to-gold bg-clip-text text-transparent">
                LinkedAgents
              </span>
            </h1>
            
            <p className="mt-4 text-2xl font-medium text-white/90 sm:text-3xl">
              Vos Agents IA pour dominer LinkedIn
            </p>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Une équipe d'agents IA qui travaille pour vous 24/7 : création de contenu, 
              détection de tendances, gestion de l'engagement et optimisation de votre croissance.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <>
                  <Link href="/agents">
                    <Button className="btn-gradient h-14 px-10 text-lg">
                      <Brain className="mr-2 h-5 w-5" />
                      Mes Agents IA
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="h-14 px-10 text-lg border-white/20 hover:bg-white/5">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button className="btn-gradient h-14 px-10 text-lg">
                      <Rocket className="mr-2 h-5 w-5" />
                      Activer mes Agents
                    </Button>
                  </a>
                  <Link href="/rankings/france">
                    <Button variant="outline" className="h-14 px-10 text-lg border-white/20 hover:bg-white/5">
                      <Play className="mr-2 h-5 w-5" />
                      Voir la démo
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                3 agents IA inclus
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
                Vidéo de présentation
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Découvrez LinkedAgents en{" "}
                <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                  60 secondes
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Pas le temps de lire ? Regardez notre courte vidéo pour comprendre comment nos agents IA peuvent transformer votre présence LinkedIn.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Rencontrez votre équipe d'agents IA personnalisés</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Découvrez comment générer du contenu viral</span>
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
      <section className="py-20">
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
              Chaque agent est spécialisé dans une tâche précise pour optimiser votre présence LinkedIn
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="group relative rounded-2xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-violet/30 hover:bg-card/80 hover:scale-[1.02]"
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  agent.status === "Actif" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {agent.status === "Actif" && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                  {agent.status}
                </div>

                {/* Agent Avatar & Info */}
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.color} text-3xl shadow-lg`}>
                    {agent.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                    <p className="text-sm text-violet-light">{agent.role}</p>
                    <p className="text-xs text-muted-foreground">{agent.personality}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3">
                  {agent.description}
                </p>

                {/* Quote */}
                <p className="text-xs italic text-white/60 mb-4">
                  {agent.quote}
                </p>

                {/* Stats */}
                <div className="flex gap-4 pt-3 border-t border-white/10">
                  {Object.entries(agent.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm font-bold text-white">{value}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet/5 to-rose/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            {user ? (
              <Link href="/agents">
                <Button className="btn-gradient h-12 px-8">
                  <Brain className="mr-2 h-5 w-5" />
                  Gérer mes Agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-gradient h-12 px-8">
                  <Rocket className="mr-2 h-5 w-5" />
                  Activer mes Agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Nouveaux témoignages clients */}
      <Testimonials />

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
                Rejoignez les créateurs qui ont délégué leur stratégie LinkedIn à une équipe d'agents IA.
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
                  <a href={getLoginUrl()}>
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
                Votre équipe d'agents IA pour dominer LinkedIn. Générez, planifiez et publiez du contenu viral automatiquement.
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
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">Tarifs</Link></li>
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
              <span className="text-xs text-muted-foreground">Fait avec ❤️ en France</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
