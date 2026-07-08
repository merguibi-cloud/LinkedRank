import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Users, FileText, BarChart3, AlertTriangle, Sparkles,
  XCircle, TrendingUp, RefreshCw, CheckCircle2, Linkedin,
  HardDrive, Zap, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "overview" | "users" | "autopublish" | "spend";

function formatBytes(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `il y a ${d}j`;
  if (h > 0) return `il y a ${h}h`;
  return "récemment";
}

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.stats.useQuery();
  const { data: userList, isLoading: usersLoading } = trpc.admin.users.useQuery();
  const { data: failures } = trpc.admin.autopublishFailures.useQuery();
  const { data: spendData } = trpc.admin.spend.useQuery();

  const setRole = trpc.admin.setRole.useMutation({ onSuccess: () => refetchStats() });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Vous n'avez pas les droits administrateur.</p>
          <Link href="/"><Button variant="outline">Retour à l'accueil</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "users", label: `Utilisateurs${userList ? ` (${userList.length})` : ""}`, icon: Users },
    { id: "autopublish", label: `Auto-publish${stats ? ` · ${stats.autoPublish.failed} échecs` : ""}`, icon: AlertTriangle },
    { id: "spend", label: "Coûts IA", icon: Zap },
  ];

  const filteredUsers = (userList ?? []).filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Administration</h1>
            <p className="text-muted-foreground text-sm">LinkedRank — tableau de bord interne</p>
          </div>
          <Button variant="outline" className="border-white/10 gap-2" onClick={() => refetchStats()}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/10 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-violet-500/20 text-violet-300 font-medium"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {statsLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : stats ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Utilisateurs total",
                      value: stats.users.total,
                      sub: `${stats.users.active7d} actifs (7j)`,
                      icon: Users,
                      color: "violet",
                    },
                    {
                      label: "Générations IA",
                      value: stats.generations.total,
                      sub: `+${stats.generations.last7d} cette semaine`,
                      icon: Sparkles,
                      color: "rose",
                    },
                    {
                      label: "Publications réussies",
                      value: stats.autoPublish.published,
                      sub: `${stats.autoPublish.failed} échecs`,
                      icon: CheckCircle2,
                      color: "emerald",
                    },
                    {
                      label: "Stockage",
                      value: formatBytes(stats.storage.mb),
                      sub: `${stats.storage.files} fichiers`,
                      icon: HardDrive,
                      color: "blue",
                    },
                  ].map(card => (
                    <div key={card.label} className="p-5 rounded-2xl border border-white/10 bg-card/50">
                      <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
                        card.color === "violet" ? "bg-violet-500/20 text-violet-300" :
                        card.color === "rose" ? "bg-rose-500/20 text-rose-400" :
                        card.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
                      <div className="text-xs text-muted-foreground">{card.label}</div>
                      <div className="text-xs text-white/40 mt-1">{card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Secondary stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Inscrits (24h)", value: stats.users.last24h, icon: TrendingUp },
                    { label: "Inscrits (7j)", value: stats.users.last7d, icon: TrendingUp },
                    { label: "Générations (24h)", value: stats.generations.last24h, icon: Sparkles },
                    { label: "Carousels générés", value: stats.carousels, icon: FileText },
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
                      <s.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-xl font-semibold text-white">{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI spend summary */}
                <div className="p-5 rounded-2xl border border-white/10 bg-card/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Coûts IA
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white">${stats.spend.totalCost}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">${stats.spend.cost7d}</div>
                      <div className="text-xs text-muted-foreground">Cette semaine</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.spend.calls.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Appels loggés</div>
                    </div>
                  </div>
                  {stats.spend.calls === 0 && (
                    <p className="text-xs text-amber-400 mt-3">⚠ Les appels avant le déploiement du token tracking ne sont pas comptés.</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <Input
              placeholder="Rechercher par email ou nom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm bg-card/50 border-white/10"
            />
            {usersLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      {["Email", "Nom", "Plan", "Rôle", "Générations", "LinkedIn", "Inscrit", "Actif"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">{u.plan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={e => setRole.mutate({ userId: u.id, role: e.target.value as "user" | "admin" })}
                            className="bg-transparent text-xs text-muted-foreground border border-white/10 rounded px-2 py-0.5"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-white">{u.generations}</td>
                        <td className="px-4 py-3">
                          {u.linkedinConnected
                            ? <Linkedin className="w-4 h-4 text-blue-400" />
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(u.createdAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(u.lastSignedIn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── AUTO-PUBLISH FAILURES ── */}
        {activeTab === "autopublish" && (
          <div className="space-y-6">
            {failures ? (
              <>
                <div className="p-5 rounded-2xl border border-white/10 bg-card/50">
                  <h3 className="text-sm font-semibold text-white mb-4">Répartition par erreur</h3>
                  <div className="space-y-3">
                    {failures.byError.map(e => (
                      <div key={e.error} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{e.error ?? "(aucun message)"}</p>
                        </div>
                        <span className="text-sm font-medium text-red-400 shrink-0">{e.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 bg-white/5 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">20 échecs les plus récents</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        {["Email", "Erreur", "Retries", "Planifié"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {failures.recent.map((r, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-4 py-3 text-white">{r.email ?? "?"}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{r.error}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.retries}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(r.scheduledFor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <p className="text-muted-foreground">Chargement...</p>}
          </div>
        )}

        {/* ── SPEND ── */}
        {activeTab === "spend" && (
          <div className="space-y-6">
            {spendData ? (
              <>
                {spendData.byModel.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
                    ⚠ Aucun appel loggé pour l'instant. Le tracking démarre à partir du prochain déploiement.
                  </div>
                ) : null}

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl border border-white/10 bg-card/50">
                    <h3 className="text-sm font-semibold text-white mb-4">Par modèle</h3>
                    <div className="space-y-3">
                      {spendData.byModel.length > 0 ? spendData.byModel.map(r => (
                        <div key={r.model} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-white font-mono">{r.model}</div>
                            <div className="text-xs text-muted-foreground">{r.calls} appels · {r.tokens.toLocaleString()} tokens</div>
                          </div>
                          <span className="text-sm font-medium text-yellow-400">${r.cost}</span>
                        </div>
                      )) : <p className="text-muted-foreground text-sm">Aucune donnée</p>}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-card/50">
                    <h3 className="text-sm font-semibold text-white mb-4">Par fonctionnalité</h3>
                    <div className="space-y-3">
                      {spendData.byEndpoint.length > 0 ? spendData.byEndpoint.map(r => (
                        <div key={r.endpoint} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-white">{r.endpoint}</div>
                            <div className="text-xs text-muted-foreground">{r.calls} appels</div>
                          </div>
                          <span className="text-sm font-medium text-yellow-400">${r.cost}</span>
                        </div>
                      )) : <p className="text-muted-foreground text-sm">Aucune donnée</p>}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-card/50">
                    <h3 className="text-sm font-semibold text-white mb-4">Top utilisateurs</h3>
                    <div className="space-y-3">
                      {spendData.topUsers.length > 0 ? spendData.topUsers.map(r => (
                        <div key={r.email} className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-white truncate max-w-[160px]">{r.email}</div>
                            <div className="text-xs text-muted-foreground">{r.calls} appels</div>
                          </div>
                          <span className="text-sm font-medium text-yellow-400">${r.cost}</span>
                        </div>
                      )) : <p className="text-muted-foreground text-sm">Aucune donnée</p>}
                    </div>
                  </div>
                </div>
              </>
            ) : <p className="text-muted-foreground">Chargement...</p>}
          </div>
        )}

      </div>
    </div>
  );
}
