import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Linkedin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  Settings,
  ExternalLink,
  Clock,
  Users,
  FileText,
  Send,
} from "lucide-react";
import { getLinkedInConnectUrl } from "@/const";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";

export { LinkedInStatusBadge } from "@/components/LinkedInStatusBadge";

export function LinkedInIntegration() {
  const { status, loading, syncing, sync } = useLinkedInStatus();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    window.location.href = getLinkedInConnectUrl("/dashboard");
  };

  const handleSync = async () => {
    await sync();
  };

  const lastSyncLabel = status.lastSync
    ? new Date(status.lastSync).toLocaleString("fr-FR")
    : "—";

  const features = [
    {
      icon: FileText,
      title: "Publication directe",
      description: "Publiez vos posts directement sur LinkedIn depuis la plateforme",
      available: status.connected,
    },
    {
      icon: Users,
      title: "Analyse d'audience",
      description: "Accédez aux insights de votre audience LinkedIn",
      available: false,
    },
    {
      icon: Clock,
      title: "Planification",
      description: "Programmez vos publications à l'avance",
      available: status.connected,
    },
    {
      icon: Send,
      title: "Auto-publication",
      description: "Laissez vos agents publier automatiquement (mode supervisé)",
      available: status.connected,
    },
  ];

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-gradient-to-br from-[#0077B5]/10 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0077B5]">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Connexion LinkedIn</CardTitle>
                <CardDescription>
                  {status.connected
                    ? "Votre compte LinkedIn est connecté"
                    : "Connectez votre compte pour activer toutes les fonctionnalités"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Connecté
                </span>
              ) : (
                <span className="flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Non connecté
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {status.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-2xl">
                  {status.profilePicture ? (
                    <img
                      src={status.profilePicture}
                      alt={status.profileName ?? "Profil LinkedIn"}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {status.profileName ?? "Utilisateur LinkedIn"}
                  </h4>
                  {status.email && (
                    <p className="text-sm text-muted-foreground">{status.email}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Dernière synchronisation : {lastSyncLabel}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="border-white/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sync..." : "Synchroniser"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-white">Lecture du profil</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-white">Publication</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-white">Token enregistré</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                <Linkedin className="mx-auto mb-4 h-12 w-12 text-[#0077B5]" />
                <h4 className="mb-2 text-lg font-semibold text-white">
                  Connectez votre compte LinkedIn
                </h4>
                <p className="mb-4 text-muted-foreground">
                  Autorisez LinkedAgents à accéder à votre profil pour débloquer toutes les fonctionnalités.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-[#0077B5] hover:bg-[#006699]"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <Linkedin className="mr-2 h-4 w-4" />
                      Se connecter avec LinkedIn
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-emerald-400">Connexion sécurisée</h5>
                  <p className="text-sm text-muted-foreground">
                    Nous utilisons OAuth 2.0, le protocole officiel de LinkedIn.
                    Votre mot de passe n'est jamais stocké — seul un token sécurisé est enregistré.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature, index) => (
          <Card
            key={index}
            className={`border-white/10 ${
              feature.available ? "bg-white/5" : "bg-white/[0.02] opacity-60"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    feature.available
                      ? "bg-gradient-to-br from-violet/20 to-rose/20"
                      : "bg-white/10"
                  }`}
                >
                  <feature.icon
                    className={`h-5 w-5 ${
                      feature.available ? "text-violet-light" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{feature.title}</h4>
                    {feature.available ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-muted-foreground">
                        Bientôt
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-white">Configuration avancée</h4>
                <p className="text-sm text-muted-foreground">
                  Personnalisez les paramètres de publication et d'automatisation
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-white/20">
              <ExternalLink className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

