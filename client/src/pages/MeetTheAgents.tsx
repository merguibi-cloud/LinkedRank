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
  Lock,
  CheckCircle2,
  Clock,
  PenLine,
} from "lucide-react";
import { Link } from "wouter";
import {
  AGENTS_ROSTER,
  COLOR_CLASSES,
  type AgentRosterEntry,
} from "@/lib/agentsRoster";

const availableAgents = AGENTS_ROSTER.filter(a => a.availability === "available");
const comingSoonAgents = AGENTS_ROSTER.filter(a => a.availability === "coming_soon");

function AvailabilityBadge({ agent }: { agent: AgentRosterEntry }) {
  if (agent.availability === "available") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        Disponible
      </Badge>
    );
  }

  return (
    <Badge className="bg-white/10 text-white/70 border-white/20 gap-1">
      <Clock className="w-3 h-3" />
      Arrive bientôt
    </Badge>
  );
}

function AgentCard({
  agent,
  featured = false,
  expanded,
  onToggle,
}: {
  agent: AgentRosterEntry;
  featured?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const colors = COLOR_CLASSES[agent.color] ?? COLOR_CLASSES.violet;
  const isAvailable = agent.availability === "available";
  const isComingSoon = !isAvailable;

  return (
    <Card
      className={[
        "relative overflow-hidden border transition-all duration-300",
        featured
          ? `bg-gradient-to-br from-violet-950/80 via-card/80 to-fuchsia-950/40 border-violet-500/40 shadow-xl shadow-violet-500/10`
          : isComingSoon
            ? "bg-card/30 border-white/5 opacity-80 hover:opacity-95"
            : `${colors.bg} ${colors.border} hover:border-white/20`,
        onToggle ? "cursor-pointer" : "",
      ].join(" ")}
      onClick={onToggle}
    >
      {isComingSoon && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] pointer-events-none z-[1]" />
      )}

      <CardContent className={`relative z-[2] ${featured ? "p-8" : "p-5"}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-4">
            <div
              className={[
                "rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                agent.gradient,
                featured ? "w-20 h-20 text-4xl" : "w-14 h-14 text-2xl",
                isComingSoon ? "grayscale-[30%]" : "",
              ].join(" ")}
            >
              {agent.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className={`font-bold text-white ${featured ? "text-2xl" : "text-lg"}`}>
                  {agent.name}
                </h3>
                <span>{agent.emoji}</span>
              </div>
              <p className={`text-sm font-medium ${colors.text}`}>{agent.role}</p>
              <p className="text-xs text-white/50 mt-0.5">{agent.personality}</p>
            </div>
          </div>
          <AvailabilityBadge agent={agent} />
        </div>

        <p className={`text-sm text-white/70 mb-4 ${featured ? "text-base leading-relaxed" : ""}`}>
          {agent.description}
        </p>

        {(featured || expanded) && (
          <>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.skills.map(skill => (
                <Badge
                  key={skill}
                  variant="outline"
                  className={`text-xs ${colors.border} ${colors.text} bg-black/20`}
                >
                  {skill}
                </Badge>
              ))}
            </div>

            <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} mb-4`}>
              <p className="text-sm italic text-white/80">&ldquo;{agent.quote}&rdquo;</p>
            </div>

            <div className="flex items-center gap-2 text-sm mb-4">
              <Star className={`w-4 h-4 ${colors.text}`} />
              <span className="text-white/60">Idéal pour :</span>
              <span className="text-white font-medium">{agent.bestFor}</span>
            </div>
          </>
        )}

        {isAvailable && agent.ctaHref ? (
          <Link href={agent.ctaHref}>
            <Button
              className={`w-full bg-gradient-to-r ${agent.gradient} hover:opacity-90 shadow-lg ${colors.glow}`}
              size={featured ? "lg" : "default"}
            >
              <PenLine className="w-4 h-4 mr-2" />
              {agent.ctaLabel ?? `Activer ${agent.name}`}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            variant="outline"
            className="w-full border-white/10 text-white/40 bg-white/5 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            Arrive bientôt
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MeetTheAgents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 via-card/50 to-rose-950/30 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative text-center max-w-3xl mx-auto">
            <Badge className="bg-violet-500/20 text-violet-200 border-violet-500/30 mb-4">
              <Bot className="w-3 h-3 mr-1" />
              LinkedAgents — Équipe IA
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Votre équipe IA pour{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300">
                dominer LinkedIn
              </span>
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Commencez avec <strong className="text-white">Léa</strong> pour créer du contenu et{" "}
              <strong className="text-white">Sam</strong> pour automatiser vos publications.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-200">
                  {availableAgents.length} agent{availableAgents.length > 1 ? "s" : ""} disponible{availableAgents.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Clock className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/60">{comingSoonAgents.length} arrive bientôt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agents disponibles */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Agents disponibles</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} featured />
            ))}
          </div>
        </div>

        {/* Coming soon grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-white/40" />
              <h2 className="text-xl font-semibold text-white">Bientôt disponibles</h2>
            </div>
            <p className="text-sm text-white/40 hidden sm:block">
              Inscrivez-vous pour être notifié du lancement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comingSoonAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                expanded={selectedAgent === agent.id}
                onToggle={() =>
                  setSelectedAgent(selectedAgent === agent.id ? null : agent.id)
                }
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-500/10 via-transparent to-rose-500/10 border border-white/10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Pourquoi une équipe d&apos;agents ?</h2>
            <p className="text-white/50 mb-8">
              Chaque agent aura une mission précise. Léa pose déjà les bases de votre présence LinkedIn.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Disponibles 24/7",
                  desc: "Vos agents travaillent pendant que vous dormez",
                  color: "text-violet-400",
                  bg: "bg-violet-500/20",
                },
                {
                  icon: TrendingUp,
                  title: "Spécialisés",
                  desc: "Un rôle précis pour chaque étape de votre stratégie",
                  color: "text-rose-400",
                  bg: "bg-rose-500/20",
                },
                {
                  icon: Users,
                  title: "Personnalisés",
                  desc: "Ils apprennent de votre style et votre secteur",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/20",
                },
              ].map(item => (
                <div key={item.title} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/generate">
              <Button size="lg" className="mt-8 bg-gradient-to-r from-violet-500 to-rose-500 hover:opacity-90">
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer avec Léa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
