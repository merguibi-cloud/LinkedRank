import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Bot,
  Star,
  ChevronRight,
  Crown,
} from "lucide-react";
import { Link } from "wouter";

const agents = [
  {
    id: "content-creator",
    name: "Léa",
    role: "Créatrice de Contenu",
    emoji: "✨",
    avatar: "👩‍💻",
    color: "violet",
    gradient: "from-violet to-purple-600",
    personality: "Créative et inspirante",
    description: "Léa génère des posts LinkedIn captivants adaptés à votre style et votre audience.",
    skills: ["Storytelling", "Hooks viraux", "Copywriting"],
    stats: { posts: "15K+", engagement: "4.8%", satisfaction: "98%" },
    quote: "Chaque post est une opportunité de connecter !",
    bestFor: "Créer du contenu engageant",
  },
  {
    id: "trend-hunter",
    name: "Max",
    role: "Chasseur de Tendances",
    emoji: "🔥",
    avatar: "🕵️",
    color: "rose",
    gradient: "from-rose to-red-600",
    personality: "Curieux et avant-gardiste",
    description: "Max surveille les tendances LinkedIn 24/7 et identifie les sujets qui vont buzzer.",
    skills: ["Veille tendances", "Analyse virale", "Prédiction"],
    stats: { trends: "8K+", accuracy: "94%", early: "48h avant" },
    quote: "Les tendances de demain, je les repère aujourd'hui !",
    bestFor: "Rester à la pointe",
  },
  {
    id: "engagement-booster",
    name: "Emma",
    role: "Booster d'Engagement",
    emoji: "💬",
    avatar: "🤝",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
    personality: "Sociable et empathique",
    description: "Emma optimise vos interactions et vous aide à construire une communauté engagée.",
    skills: ["Réponses intelligentes", "Community", "Networking"],
    stats: { interactions: "45K+", response: "99%", growth: "+156%" },
    quote: "Chaque commentaire est une chance de créer une connexion !",
    bestFor: "Développer votre réseau",
  },
  {
    id: "analytics-guru",
    name: "Alex",
    role: "Analyste Performance",
    emoji: "📊",
    avatar: "🧠",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    personality: "Méthodique et perspicace",
    description: "Alex analyse vos données en profondeur pour identifier ce qui fonctionne.",
    skills: ["Data analysis", "Reporting", "Optimisation"],
    stats: { data: "2.5M", insights: "12K+", accuracy: "97%" },
    quote: "Les données racontent une histoire !",
    bestFor: "Améliorer vos performances",
  },
  {
    id: "scheduler",
    name: "Sam",
    role: "Planificateur Intelligent",
    emoji: "📅",
    avatar: "⏰",
    color: "gold",
    gradient: "from-amber-500 to-orange-600",
    personality: "Organisé et fiable",
    description: "Sam planifie vos publications aux moments optimaux pour maximiser la portée.",
    skills: ["Timing optimal", "Planification", "Automatisation"],
    stats: { scheduled: "28K+", timing: "92%", consistency: "100%" },
    quote: "Le bon contenu au bon moment !",
    bestFor: "Publier régulièrement",
  },
];

export default function MeetTheAgents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      violet: { bg: "bg-violet/20", border: "border-violet/30", text: "text-violet-light" },
      rose: { bg: "bg-rose/20", border: "border-rose/30", text: "text-rose" },
      green: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" },
      blue: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
      gold: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" },
    };
    return colors[color] || { bg: "bg-white/10", border: "border-white/20", text: "text-white" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="bg-violet/20 text-violet-light border-violet/30 mb-4">
            <Bot className="w-3 h-3 mr-1" />
            Votre Équipe IA
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            Rencontrez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet to-rose">Agents IA</span>
          </h1>
          <p className="text-lg text-white/60">
            5 agents spécialisés travaillent 24/7 pour développer votre présence LinkedIn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const colors = getColorClasses(agent.color);
            return (
              <Card
                key={agent.id}
                className="bg-card/50 border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                        <span className="text-xl">{agent.emoji}</span>
                      </div>
                      <p className={`text-sm ${colors.text}`}>{agent.role}</p>
                      <p className="text-xs text-white/50 mt-1">{agent.personality}</p>
                    </div>
                  </div>

                  <p className="text-sm text-white/70 mb-4">{agent.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className={`text-xs ${colors.border} ${colors.text}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-white/5 mb-4">
                    {Object.entries(agent.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-sm font-semibold text-white">{value}</p>
                        <p className="text-xs text-white/40 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border mb-4`}>
                    <p className="text-sm italic text-white/80">"{agent.quote}"</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Star className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-white/60">Idéal pour:</span>
                    <span className="text-white">{agent.bestFor}</span>
                  </div>

                  <Link href="/agents">
                    <Button className={`w-full mt-4 bg-gradient-to-r ${agent.gradient} hover:opacity-90`}>
                      Activer {agent.name}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-violet/20 to-rose/20 border border-violet/30">
          <div className="text-center max-w-2xl mx-auto">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Pourquoi travailler avec nos agents ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet/30 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-violet-light" />
                </div>
                <h3 className="font-semibold text-white mb-2">Disponibles 24/7</h3>
                <p className="text-sm text-white/60">Vos agents travaillent pendant que vous dormez</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-rose/30 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-rose" />
                </div>
                <h3 className="font-semibold text-white mb-2">Résultats prouvés</h3>
                <p className="text-sm text-white/60">+340% d'engagement en moyenne</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Personnalisés</h3>
                <p className="text-sm text-white/60">Ils apprennent de votre style unique</p>
              </div>
            </div>
            <Link href="/agents/setup">
              <Button size="lg" className="mt-8 bg-gradient-to-r from-violet to-rose hover:opacity-90">
                <Sparkles className="w-5 h-5 mr-2" />
                Configurer mon équipe IA
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
