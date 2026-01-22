import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Linkedin, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shield, 
  Zap,
  Settings,
  ExternalLink,
  Clock,
  Users,
  FileText,
  Send
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface LinkedInStatus {
  connected: boolean;
  profileName?: string;
  profileImage?: string;
  lastSync?: string;
  permissions: {
    read: boolean;
    write: boolean;
    analytics: boolean;
  };
}

export function LinkedInIntegration() {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Simuler le statut de connexion LinkedIn
  const [linkedInStatus] = useState<LinkedInStatus>({
    connected: !!user,
    profileName: user?.name || "Youssef Koutari",
    profileImage: "",
    lastSync: new Date().toLocaleString("fr-FR"),
    permissions: {
      read: true,
      write: true,
      analytics: true,
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    // Rediriger vers l'authentification LinkedIn
    window.location.href = getLoginUrl();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simuler une synchronisation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const features = [
    {
      icon: FileText,
      title: "Publication directe",
      description: "Publiez vos posts directement sur LinkedIn depuis la plateforme",
      available: linkedInStatus.permissions.write,
    },
    {
      icon: Users,
      title: "Analyse d'audience",
      description: "Accédez aux insights de votre audience LinkedIn",
      available: linkedInStatus.permissions.analytics,
    },
    {
      icon: Clock,
      title: "Planification",
      description: "Programmez vos publications à l'avance",
      available: linkedInStatus.permissions.write,
    },
    {
      icon: Send,
      title: "Auto-publication",
      description: "Laissez vos agents publier automatiquement (mode supervisé)",
      available: linkedInStatus.permissions.write,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
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
                  {linkedInStatus.connected
                    ? "Votre compte LinkedIn est connecté"
                    : "Connectez votre compte pour activer toutes les fonctionnalités"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {linkedInStatus.connected ? (
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
          {linkedInStatus.connected ? (
            <div className="space-y-4">
              {/* Profile Info */}
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-2xl">
                  {linkedInStatus.profileImage ? (
                    <img
                      src={linkedInStatus.profileImage}
                      alt={linkedInStatus.profileName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{linkedInStatus.profileName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Dernière synchronisation : {linkedInStatus.lastSync}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="border-white/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sync..." : "Synchroniser"}
                </Button>
              </div>

              {/* Permissions */}
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
                  <span className="text-sm text-white">Analytics</span>
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

              {/* Security Note */}
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-emerald-400">Connexion sécurisée</h5>
                  <p className="text-sm text-muted-foreground">
                    Nous utilisons OAuth 2.0, le protocole officiel de LinkedIn. 
                    Vos identifiants ne sont jamais stockés sur nos serveurs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
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

      {/* API Documentation Link */}
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

// Composant pour afficher le statut de connexion dans la sidebar ou navbar
export function LinkedInStatusBadge() {
  const { user } = useAuth();
  const isConnected = !!user;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {isConnected ? "LinkedIn connecté" : "Non connecté"}
      </span>
    </div>
  );
}
