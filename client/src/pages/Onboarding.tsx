import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useMemo } from "react";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: status } = trpc.onboarding.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const autoStart = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("new") === "1" || params.get("voice") === "1";
  }, []);

  useEffect(() => {
    if (status?.completed) {
      setLocation("/dashboard");
    }
  }, [status, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Connexion à votre agent...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Parlez à votre agent vocal
          </h1>
          <p className="text-muted-foreground mb-8">
            Créez un compte pour démarrer une conversation vocale avec votre agent LinkedRank.
          </p>
          <a href={getLoginUrl("/onboarding?new=1")}>
            <Button className="btn-gradient w-full">
              Se connecter pour continuer
            </Button>
          </a>
          <Link href="/">
            <Button variant="ghost" className="mt-4 text-muted-foreground">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <VoiceOnboarding autoStart={autoStart} />;
}
