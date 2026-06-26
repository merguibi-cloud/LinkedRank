import { useToolsStats } from "@/hooks/useToolsStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { IllustrationSlot } from "@/components/IllustrationSlot";
import {
  BarChart3,
  Calendar,
  FileText,
  Loader2,
  PenTool,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";

export function AnalyticsOverview() {
  const { loading, stats } = useToolsStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-violet-light" />
        Chargement de vos données...
      </div>
    );
  }

  const cards = [
    {
      label: "Posts générés",
      value: stats.totalGenerated,
      icon: Sparkles,
      color: "from-violet to-rose",
    },
    {
      label: "Publiés",
      value: stats.published,
      icon: Send,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Planifiés",
      value: stats.pendingSchedule,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Auto IA (7j)",
      value: stats.upcomingAuto,
      icon: Zap,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="border-white/10 bg-white/[0.03]">
              <CardContent className="pt-5">
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}
                >
                  <card.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-violet-light" />
              Thèmes les plus utilisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topThemes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Générez votre premier post pour voir les statistiques par thème.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topThemes.map((item) => (
                  <div key={item.theme} className="flex items-center gap-3">
                    <span className="text-sm text-white flex-1 truncate">
                      {item.theme}
                    </span>
                    <div className="h-2 flex-1 max-w-[120px] rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet to-rose rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / stats.totalGenerated) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-violet-light" />
              Meilleurs créneaux (vos planifications)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bestHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Planifiez des posts dans le calendrier pour identifier vos créneaux
                préférés.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.bestHours.map((slot) => (
                  <Badge
                    key={slot.hour}
                    variant="outline"
                    className="border-violet/30 text-violet-light"
                  >
                    {String(slot.hour).padStart(2, "0")}h00 — {slot.count} post
                    {slot.count > 1 ? "s" : ""}
                  </Badge>
                ))}
              </div>
            )}
            {!stats.autoEnabled && (
              <p className="text-xs text-muted-foreground mt-4">
                Activez l&apos;auto-publication pour compléter vos créneaux
                automatiquement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-violet-light" />
            Activité récente
          </CardTitle>
          <Link href="/generate">
            <Button size="sm" className="btn-gradient gap-2">
              <PenTool className="h-3.5 w-3.5" />
              Nouveau post
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentPosts.length === 0 ? (
            <div className="text-center py-8">
              {/* Drop an image at public/images/empty-analytics.png to fill this */}
              <IllustrationSlot
                src="/images/empty-analytics.png"
                icon={BarChart3}
                alt=""
                className="h-14 w-14 mx-auto mb-3"
                iconClassName="h-10 w-10 mx-auto mb-3"
              />
              <p className="text-muted-foreground text-sm mb-4">
                Aucun contenu pour le moment
              </p>
              <Link href="/generate">
                <Button variant="outline" className="border-white/10">
                  Créer avec le générateur IA
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {post.theme && (
                        <Badge variant="secondary" className="text-[10px]">
                          {post.theme}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[10px] border-white/10 capitalize"
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
