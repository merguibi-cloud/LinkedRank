import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getSignupUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Sparkles } from "lucide-react";
import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { refreshAuthSession } from "@/lib/authSession";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [syncingAuth, setSyncingAuth] = useState(false);

  const isNewSignup = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("new") === "1" || params.get("voice") === "1";
  }, []);

  const autoStart = isNewSignup;

  const { data: status } = trpc.onboarding.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!isNewSignup || user || loading) return;

    let cancelled = false;
    setSyncingAuth(true);

    const supabase = isSupabaseConfigured() ? createClient() : null;
    const authListener = supabase?.auth.onAuthStateChange(() => {
      void refreshAuthSession(utils);
    });

    void refreshAuthSession(utils);

    const timer = window.setTimeout(() => {
      if (!cancelled) setSyncingAuth(false);
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      authListener?.data.subscription.unsubscribe();
    };
  }, [isNewSignup, user, loading, utils]);

  useEffect(() => {
    if (user) setSyncingAuth(false);
  }, [user]);

  useEffect(() => {
    if (status?.completed && !isNewSignup) {
      setLocation("/dashboard");
    }
  }, [status, isNewSignup, setLocation]);

  if (loading || (isNewSignup && !user && syncingAuth)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose">
          <Mic className="h-7 w-7 text-white animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Préparation de votre agent vocal...</p>
          <p className="text-sm text-muted-foreground mt-1">Connexion en cours</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-violet-light" />
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
            {isNewSignup
              ? "Créez un compte pour démarrer immédiatement votre onboarding vocal."
              : "Connectez-vous pour démarrer une conversation vocale avec votre agent LinkedRank."}
          </p>
          {isNewSignup ? (
            <a href={getSignupUrl()}>
              <Button className="btn-gradient w-full">
                Créer mon compte gratuitement
              </Button>
            </a>
          ) : (
            <a href={getLoginUrl("/onboarding?new=1")}>
              <Button className="btn-gradient w-full">
                Se connecter pour continuer
              </Button>
            </a>
          )}
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
