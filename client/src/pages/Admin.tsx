import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Globe,
  Sparkles,
} from "lucide-react";

type AdminTab = "overview" | "creators" | "posts" | "content" | "settings";

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const { data: creatorsData } = trpc.influencers.list.useQuery({ limit: 100 });
  const { data: postsData } = trpc.posts.list.useQuery({ limit: 100 });

  // Check if user is admin (you would implement proper role checking)
  const isAdmin = user?.email?.includes("youssef") || user?.email?.includes("admin");

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
            <p className="text-muted-foreground mb-8">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <Link href="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "creators", label: "Créateurs", icon: Users },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "content", label: "Top Contenus", icon: Sparkles },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const stats = [
    {
      label: "Créateurs",
      value: creatorsData?.influencers?.length || 0,
      change: "+5 cette semaine",
      icon: Users,
      color: "violet",
    },
    {
      label: "Posts en base",
      value: postsData?.posts?.length || 0,
      change: "+23 cette semaine",
      icon: FileText,
      color: "rose",
    },
    {
      label: "Utilisateurs actifs",
      value: "1,234",
      change: "+12% ce mois",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "Pays couverts",
      value: "15",
      change: "+3 ce mois",
      icon: Globe,
      color: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
            <p className="text-muted-foreground">
              Gérez les créateurs, les contenus et les paramètres de la plateforme.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-violet/20 text-violet-light"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stat.color === "violet"
                          ? "bg-violet/20 text-violet-light"
                          : stat.color === "rose"
                          ? "bg-rose/20 text-rose"
                          : stat.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl border border-white/10 bg-card/50">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Créateurs récents
                </h3>
                <div className="space-y-3">
                  {creatorsData?.influencers?.slice(0, 5).map((creator: any) => (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-white font-semibold">
                          {creator.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{creator.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {creator.country}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(creator.followers / 1000).toFixed(0)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-card/50">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Actions rapides
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col border-white/10"
                  >
                    <Upload className="w-5 h-5 mb-2" />
                    <span className="text-sm">Importer créateurs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col border-white/10"
                  >
                    <RefreshCw className="w-5 h-5 mb-2" />
                    <span className="text-sm">Sync LinkedIn</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col border-white/10"
                  >
                    <Plus className="w-5 h-5 mb-2" />
                    <span className="text-sm">Ajouter post</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col border-white/10"
                  >
                    <BarChart3 className="w-5 h-5 mb-2" />
                    <span className="text-sm">Voir analytics</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Creators Tab */}
        {activeTab === "creators" && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un créateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-white/10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-card/50 border-white/10">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                </SelectContent>
              </Select>
              <Button className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter créateur
              </Button>
            </div>

            {/* Creators Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Créateur
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Pays
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Secteur
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Abonnés
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Score
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {creatorsData?.influencers
                    ?.filter(
                      (c: any) =>
                        !searchQuery ||
                        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((creator: any) => (
                      <tr key={creator.id} className="border-t border-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-white font-semibold">
                              {creator.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {creator.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{creator.linkedinUrl?.split("/").pop() || "unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {creator.country}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet/20 text-violet-light">
                            {creator.industry}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-white">
                          {(creator.followers / 1000).toFixed(0)}K
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet to-rose"
                                style={{
                                  width: `${creator.authorityScore || 50}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {creator.authorityScore || 50}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un post..."
                  className="pl-10 bg-card/50 border-white/10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-card/50 border-white/10">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="FR">Français</SelectItem>
                  <SelectItem value="EN">Anglais</SelectItem>
                </SelectContent>
              </Select>
              <Button className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter post
              </Button>
            </div>

            <div className="grid gap-4">
              {postsData?.posts?.slice(0, 10).map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-white/10 bg-card/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet/20 text-violet-light">
                        {post.theme || "Général"}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {post.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-8">
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Paramètres généraux
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nom de la plateforme
                  </label>
                  <Input
                    defaultValue="LinkedRank"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <Textarea
                    defaultValue="La plateforme #1 pour les créateurs LinkedIn"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-card/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Intégrations
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-white">LinkedIn API</div>
                      <div className="text-xs text-muted-foreground">
                        Publication automatique
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                    Configuration requise
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-violet-light" />
                    </div>
                    <div>
                      <div className="font-medium text-white">IA Génération</div>
                      <div className="text-xs text-muted-foreground">
                        Génération de contenu
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
