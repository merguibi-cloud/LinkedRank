import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import {
  Wrench,
  FolderOpen,
  Sparkles,
  Layers,
  FileText,
  Mic,
  Zap,
  Calendar,
  ArrowRight,
} from "lucide-react";

const TOOLS = [
  {
    href: "/generate",
    label: "Générateur IA",
    description: "Créez des posts LinkedIn avec l'intelligence artificielle",
    icon: Sparkles,
    color: "from-amber-600 to-amber-700",
    badge: "IA",
  },
  {
    href: "/mes-outils?tab=mediatheque",
    label: "Médiathèque",
    description: "Téléversez vos visuels et générez des publications automatiquement",
    icon: FolderOpen,
    color: "from-violet-600 to-purple-700",
    badge: "Nouveau",
  },
  {
    href: "/carousels",
    label: "Carrousels",
    description: "Créez des carrousels LinkedIn professionnels",
    icon: Layers,
    color: "from-blue-600 to-cyan-700",
  },
  {
    href: "/templates",
    label: "Templates",
    description: "Modèles de posts prêts à personnaliser",
    icon: FileText,
    color: "from-emerald-600 to-teal-700",
  },
  {
    href: "/voice",
    label: "Dictée vocale",
    description: "Dictez vos idées, l'IA les transforme en posts",
    icon: Mic,
    color: "from-rose-600 to-pink-700",
  },
  {
    href: "/auto-publish",
    label: "Auto-Publish",
    description: "Publication automatique sur LinkedIn",
    icon: Zap,
    color: "from-orange-600 to-red-700",
  },
  {
    href: "/schedule",
    label: "Calendrier",
    description: "Planifiez vos publications à l'avance",
    icon: Calendar,
    color: "from-indigo-600 to-blue-700",
  },
];

function getTabFromSearch(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") === "mediatheque" ? "mediatheque" : "outils";
}

export default function MesOutils() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState(getTabFromSearch);

  useEffect(() => {
    setActiveTab(getTabFromSearch());
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = tab === "mediatheque" ? "/mes-outils?tab=mediatheque" : "/mes-outils";
    window.history.replaceState(null, "", url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-7 h-7 text-amber-500" />
            Mes Outils
          </h1>
          <p className="text-muted-foreground mt-1">
            Tous vos outils de création LinkedIn en un seul endroit
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="outils" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Outils
            </TabsTrigger>
            <TabsTrigger value="mediatheque" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Médiathèque
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outils" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS.map(tool => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href}>
                    <Card className="bg-card/50 border-amber-900/20 h-full hover:border-amber-600/40 hover:shadow-lg transition-all cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {tool.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3 group-hover:text-amber-400 transition-colors">
                          {tool.label}
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <span className="text-xs text-amber-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ouvrir <ArrowRight className="w-3 h-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="mediatheque" className="mt-6">
            <MediaLibraryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
