import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, Redirect } from "wouter";
import {
  Users, FileText, BarChart3, AlertTriangle, Sparkles,
  XCircle, TrendingUp, RefreshCw, CheckCircle2, Linkedin,
  HardDrive, Zap, ChevronLeft, ChevronRight, Search,
  Download, UserPlus, Mail, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-card/50 space-y-3">
      <Skeleton className="w-9 h-9 rounded-xl" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function SecondaryStatSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
      <Skeleton className="w-4 h-4 rounded shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-t border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination component ──────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  limit,
  onPage,
  isFetching,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  isFetching?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // generate window: always show first, last, current ± 1
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/10">
      <span className="text-xs text-muted-foreground">
        {from}–{to} sur {total}
        {isFetching && <span className="ml-2 text-violet-400">…</span>}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {sorted.map((p, idx) => {
          const gap = idx > 0 && p - sorted[idx - 1] > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {gap && <span className="text-muted-foreground/40 text-xs px-1">…</span>}
              <button
                onClick={() => onPage(p)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs transition-colors ${
                  p === page
                    ? "bg-violet-500/30 text-violet-300 font-semibold"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const PAGE_SIZE = { users: 25, autopublish: 20, spend: 15 } as const;

// ── Page component ────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // per-tab page state
  const [usersPage, setUsersPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [linkedinFilter, setLinkedinFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [usersSort, setUsersSort] = useState<"created_desc" | "created_asc" | "active_desc" | "name_asc" | "generations_desc">("created_desc");
  const [apPage, setApPage] = useState(1);
  const [spendPage, setSpendPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [invitePhoneNumber, setInvitePhoneNumber] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  // debounce search: properly cancel the previous timer on each keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setUsersPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 350);
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError, isFetching: statsFetching, refetch: refetchStats } =
    trpc.admin.stats.useQuery(undefined, {
      enabled: isAdmin,
      staleTime: 5 * 60_000,        // re-use for 5 min; refresh button still works
      refetchOnWindowFocus: false,   // don't refetch on every alt-tab
    });

  const { data: usersData, isLoading: usersLoading, isFetching: usersFetching, refetch: refetchUsers } =
    trpc.admin.users.useQuery(
      {
        page: usersPage,
        limit: PAGE_SIZE.users,
        search: debouncedSearch || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        plan: planFilter === "all" ? undefined : planFilter,
        linkedin: linkedinFilter === "all" ? undefined : linkedinFilter,
        sort: usersSort,
      },
      {
        enabled: isAdmin && activeTab === "users",
        placeholderData: previousData => previousData,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: failures, isLoading: failuresLoading, isFetching: failuresFetching, refetch: refetchFailures } =
    trpc.admin.autopublishFailures.useQuery(
      { page: apPage, limit: PAGE_SIZE.autopublish },
      {
        enabled: isAdmin && activeTab === "autopublish",
        placeholderData: previousData => previousData,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    );

  const { data: spendData, isLoading: spendLoading, error: spendError, isFetching: spendFetching, refetch: refetchSpend } =
    trpc.admin.spend.useQuery(
      { page: spendPage, limit: PAGE_SIZE.spend },
      {
        enabled: isAdmin && activeTab === "spend",
        placeholderData: previousData => previousData,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    );

  const setRole = trpc.admin.setRole.useMutation({
    onSuccess: () => { refetchStats(); refetchUsers(); },
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      if (usersData?.rows.length === 1 && usersPage > 1) {
        setUsersPage(page => page - 1);
      } else {
        refetchUsers();
      }
      refetchStats();
    },
  });

  const handleDeleteUser = (target: { id: number; email: string }) => {
    if (target.id === user?.id) return;
    const confirmed = window.confirm(
      `Supprimer définitivement le compte ${target.email} ?\n\n` +
      "Son accès et toutes ses données LinkedRank seront supprimés. Cette action est irréversible.",
    );
    if (confirmed) deleteUser.mutate({ userId: target.id });
  };

  const exportUsers = trpc.admin.exportUsers.useMutation({
    onSuccess: rows => {
      const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const headers = ["ID", "Email", "Prénom", "Nom", "Téléphone", "Rôle", "Plan", "Générations IA", "LinkedIn connecté", "Inscription", "Dernière activité"];
      const csvRows = rows.map(row => [
        row.id, row.email, row.firstName, row.lastName, row.phoneNumber, row.role, row.plan, row.generations,
        row.linkedinConnected ? "Oui" : "Non", row.createdAt, row.lastSignedIn,
      ]);
      const csv = `\uFEFF${[headers, ...csvRows].map(row => row.map(escapeCsv).join(",")).join("\n")}`;
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `linkedrank-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });

  const handleExportUsers = () => exportUsers.mutate({
    search: debouncedSearch || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    plan: planFilter === "all" ? undefined : planFilter,
    linkedin: linkedinFilter === "all" ? undefined : linkedinFilter,
    sort: usersSort,
  });

  const inviteUser = trpc.admin.inviteUser.useMutation({
    onSuccess: result => {
      setInviteSuccess(`Invitation envoyée à ${result.email}`);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInvitePhoneNumber("");
    },
  });

  const handleInviteUser = (event: React.FormEvent) => {
    event.preventDefault();
    setInviteSuccess(null);
    inviteUser.mutate({
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
      phoneNumber: invitePhoneNumber,
    });
  };

  const refreshActiveTab = () => {
    if (activeTab === "users") { refetchUsers(); return; }
    if (activeTab === "autopublish") { refetchFailures(); refetchStats(); return; }
    if (activeTab === "spend") { refetchSpend(); refetchStats(); return; }
    refetchStats();
  };

  // ── Auth guards ─────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#05050D] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#614AFC] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Redirect to="/admin/login" />;

  if (user.role !== "admin") {
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

  // ── Tabs config ─────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "overview",    label: "Vue d'ensemble", icon: BarChart3 },
    { id: "users",       label: `Utilisateurs${stats ? ` (${stats.users.total})` : ""}`, icon: Users },
    { id: "autopublish", label: `Auto-publish${stats ? ` · ${stats.autoPublish.failed} échecs` : ""}`, icon: AlertTriangle },
    { id: "spend",       label: "Coûts IA", icon: Zap },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Administration</h1>
            <p className="text-muted-foreground text-sm">LinkedRank — tableau de bord interne</p>
          </div>
          <Button variant="outline" className="border-white/10 gap-2" onClick={refreshActiveTab}>
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
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <SecondaryStatSkeleton key={i} />)}
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-card/50 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-3 w-14" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : statsError ? (
              <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h2 className="text-white font-semibold mb-1">Impossible de charger les statistiques</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {statsError.message || "La base de données ne répond pas."}
                </p>
                <Button variant="outline" disabled={statsFetching} onClick={() => refetchStats()}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${statsFetching ? "animate-spin" : ""}`} />
                  Réessayer
                </Button>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Utilisateurs total", value: stats.users.total,          sub: `${stats.users.active7d} actifs (7j)`,         icon: Users,        color: "violet" },
                    { label: "Générations IA",      value: stats.generations.total,   sub: `+${stats.generations.last7d} cette semaine`,   icon: Sparkles,     color: "rose" },
                    { label: "Publications réussies",value: stats.autoPublish.published, sub: `${stats.autoPublish.failed} échecs`,         icon: CheckCircle2, color: "emerald" },
                    { label: "Stockage",            value: formatBytes(stats.storage.mb), sub: `${stats.storage.files} fichiers`,           icon: HardDrive,    color: "blue" },
                  ].map(card => (
                    <div key={card.label} className="p-5 rounded-2xl border border-white/10 bg-card/50">
                      <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
                        card.color === "violet"  ? "bg-violet-500/20 text-violet-300" :
                        card.color === "rose"    ? "bg-rose-500/20 text-rose-400" :
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Inscrits (24h)",      value: stats.users.last24h,          icon: TrendingUp },
                    { label: "Inscrits (7j)",        value: stats.users.last7d,           icon: TrendingUp },
                    { label: "Générations (24h)",    value: stats.generations.last24h,    icon: Sparkles },
                    { label: "Carousels générés",    value: stats.carousels,              icon: FileText },
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
            <div className="flex justify-end">
              <Button
                className="gap-2"
                onClick={() => {
                  setInviteOpen(open => !open);
                  setInviteSuccess(null);
                  inviteUser.reset();
                }}
              >
                <UserPlus className="w-4 h-4" />
                Inviter un utilisateur
              </Button>
            </div>

            {inviteOpen && (
              <form onSubmit={handleInviteUser} className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Nouvelle invitation</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Un email sécurisé permettra à l'utilisateur de définir son mot de passe.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="utilisateur@entreprise.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="pl-9 bg-card/50 border-white/10"
                    />
                  </div>
                  <Input required placeholder="Prénom" value={inviteFirstName} onChange={e => setInviteFirstName(e.target.value)} className="bg-card/50 border-white/10" />
                  <Input required placeholder="Nom" value={inviteLastName} onChange={e => setInviteLastName(e.target.value)} className="bg-card/50 border-white/10" />
                  <Input required type="tel" placeholder="+212 6 00 00 00 00" value={invitePhoneNumber} onChange={e => setInvitePhoneNumber(e.target.value)} className="bg-card/50 border-white/10" />
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={inviteUser.isPending || !inviteEmail.trim()}>
                    {inviteUser.isPending ? "Envoi…" : "Envoyer l'invitation"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                    Annuler
                  </Button>
                </div>
                {inviteSuccess && <p className="text-sm text-emerald-400">{inviteSuccess}</p>}
                {inviteUser.error && <p className="text-sm text-red-400">{inviteUser.error.message}</p>}
              </form>
            )}

            {/* Search */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Email ou nom…" value={search} onChange={e => handleSearch(e.target.value)} className="pl-9 bg-card/50 border-white/10" />
              </div>
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as typeof roleFilter); setUsersPage(1); }} className="h-9 rounded-md border border-white/10 bg-card px-3 text-sm text-white">
                <option value="all">Tous les rôles</option><option value="user">Utilisateurs</option><option value="admin">Admins</option>
              </select>
              <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setUsersPage(1); }} className="h-9 rounded-md border border-white/10 bg-card px-3 text-sm text-white">
                <option value="all">Tous les plans</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="business">Business</option>
              </select>
              <select value={linkedinFilter} onChange={e => { setLinkedinFilter(e.target.value as typeof linkedinFilter); setUsersPage(1); }} className="h-9 rounded-md border border-white/10 bg-card px-3 text-sm text-white">
                <option value="all">Tous LinkedIn</option><option value="connected">Connectés</option><option value="disconnected">Non connectés</option>
              </select>
              <select value={usersSort} onChange={e => { setUsersSort(e.target.value as typeof usersSort); setUsersPage(1); }} className="h-9 rounded-md border border-white/10 bg-card px-3 text-sm text-white">
                <option value="created_desc">Plus récents</option><option value="created_asc">Plus anciens</option><option value="active_desc">Activité récente</option><option value="name_asc">Nom A–Z</option><option value="generations_desc">Plus de générations</option>
              </select>
              <Button variant="outline" className="h-9 border-white/10 gap-2" onClick={handleExportUsers} disabled={exportUsers.isPending}>
                <Download className="w-4 h-4" />
                {exportUsers.isPending ? "Export…" : "Exporter CSV"}
              </Button>
            </div>
            {exportUsers.error && <p className="text-xs text-red-400">Échec de l'export : {exportUsers.error.message}</p>}
            {deleteUser.error && <p className="text-xs text-red-400">Échec de la suppression : {deleteUser.error.message}</p>}

            {usersLoading ? (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>{["Email","Prénom","Nom","Téléphone","Plan","Rôle","Générations","LinkedIn","Inscrit","Actif","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>{Array.from({ length: PAGE_SIZE.users }).map((_, i) => <TableRowSkeleton key={i} cols={11} />)}</tbody>
                </table>
              </div>
            ) : usersData ? (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>{["Email","Prénom","Nom","Téléphone","Plan","Rôle","Générations","LinkedIn","Inscrit","Actif","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className={usersFetching ? "opacity-60 transition-opacity" : ""}>
                    {usersData.rows.map(u => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.firstName ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.lastName ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.phoneNumber ?? "—"}</td>
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
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={u.id === user.id ? "Vous ne pouvez pas supprimer votre propre compte" : `Supprimer ${u.email}`}
                            aria-label={`Supprimer le compte ${u.email}`}
                            disabled={u.id === user.id || (deleteUser.isPending && deleteUser.variables?.userId === u.id)}
                            onClick={() => handleDeleteUser(u)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 pb-3">
                  <Pagination page={usersData.page} total={usersData.total} limit={usersData.limit} onPage={setUsersPage} isFetching={usersFetching} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ── AUTO-PUBLISH FAILURES ── */}
        {activeTab === "autopublish" && (
          <div className="space-y-6">
            {failuresLoading ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-card/50 space-y-3">
                  <Skeleton className="h-4 w-40" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-8 shrink-0" />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 bg-white/5"><Skeleton className="h-4 w-44" /></div>
                  <table className="w-full text-sm"><tbody>
                    {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
                  </tbody></table>
                </div>
              </div>
            ) : failures ? (
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
                  <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Échecs récents</h3>
                    <span className="text-xs text-muted-foreground">{failures.total} au total</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.02]">
                      <tr>{["Email","Erreur","Retries","Planifié"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className={failuresFetching ? "opacity-60" : ""}>
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
                  <div className="px-4 pb-3">
                    <Pagination page={failures.page} total={failures.total} limit={failures.limit} onPage={setApPage} isFetching={failuresFetching} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── SPEND ── */}
        {activeTab === "spend" && (
          <div className="space-y-6">
            {spendLoading ? (
              <div className="grid lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/10 bg-card/50 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div key={j} className="flex justify-between items-center">
                        <div className="space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : spendError ? (
              <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h2 className="text-white font-semibold mb-1">Impossible de charger les coûts IA</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {spendError.message || "La base de données ne répond pas."}
                </p>
                <Button variant="outline" disabled={spendFetching} onClick={() => refetchSpend()}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${spendFetching ? "animate-spin" : ""}`} />
                  Réessayer
                </Button>
              </div>
            ) : spendData ? (
              <>
                {spendData.byModel.length === 0 && (
                  <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
                    ⚠ Aucun appel loggé pour l'instant. Le tracking démarre à partir du prochain déploiement.
                  </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* By model */}
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

                  {/* By endpoint */}
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

                  {/* Top users — paginated */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-card/50 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-4">Top utilisateurs</h3>
                    <div className={`space-y-3 flex-1 ${spendFetching ? "opacity-60" : ""}`}>
                      {spendData.topUsers.length > 0 ? spendData.topUsers.map(r => (
                        <div key={r.email} className="flex justify-between items-center">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white truncate">{r.email}</div>
                            <div className="text-xs text-muted-foreground">{r.calls} appels · {r.tokens.toLocaleString()} tokens</div>
                          </div>
                          <span className="text-sm font-medium text-yellow-400 ml-3 shrink-0">${r.cost}</span>
                        </div>
                      )) : <p className="text-muted-foreground text-sm">Aucune donnée</p>}
                    </div>
                    <Pagination page={spendData.page} total={spendData.total} limit={spendData.limit} onPage={setSpendPage} isFetching={spendFetching} />
                  </div>
                </div>
                {spendData.byEndpoint.length === 1 && spendData.byEndpoint[0]?.endpoint === "unknown" && (
                  <p className="text-xs text-amber-400/90">
                    Les données historiques ne contiennent ni utilisateur ni fonctionnalité : le même total apparaît donc dans les trois regroupements. Les nouveaux appels seront attribués correctement.
                  </p>
                )}
              </>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
