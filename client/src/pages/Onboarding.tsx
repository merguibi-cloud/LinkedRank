import { useAuth } from "@/_core/hooks/useAuth";
import { getSignupUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { ProfileOnboarding } from "@/components/ProfileOnboarding";
import { refreshAuthSession } from "@/lib/authSession";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [syncingAuth, setSyncingAuth] = useState(false);

  const { data: status } = trpc.onboarding.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (user || loading) return;

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
  }, [user, loading, utils]);

  useEffect(() => {
    if (user) setSyncingAuth(false);
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (user && status?.completed) {
      setLocation("/dashboard");
    }
  }, [user, loading, status, setLocation]);

  if (loading || (!user && syncingAuth)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-violet-light" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
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
            Configurez votre profil
          </h1>
          <p className="text-muted-foreground mb-8">
            Créez un compte pour personnaliser votre contenu LinkedIn en quelques clics.
          </p>
          <a href={getSignupUrl()}>
            <Button className="btn-gradient w-full">
              Créer mon compte gratuitement
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

  return <ProfileOnboarding />;
}
