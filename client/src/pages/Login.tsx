import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLinkedInConnectUrl,
  getSignupUrl,
  sanitizeInternalRedirect,
} from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { Bot, Linkedin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const redirect = sanitizeInternalRedirect(params.get("redirect"));
  const connectLinkedIn = params.get("connectLinkedIn") === "1";
  const confirmed = params.get("confirmed") === "1";
  const confirmError = params.get("confirm_error");

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (confirmed) {
      toast.success("Email confirmé ! Vous pouvez maintenant vous connecter.");
    } else if (confirmError) {
      toast.error(
        "Le lien de confirmation est invalide ou a expiré. Veuillez réessayer de vous inscrire."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (connectLinkedIn) {
        window.location.href = getLinkedInConnectUrl(redirect);
      } else {
        setLocation(redirect);
      }
    }
  }, [user, loading, redirect, connectLinkedIn, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Connexion échouée");
          return;
        }

        toast.success("Connexion réussie !");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Connexion échouée");
          return;
        }

        toast.success("Connexion réussie !");
      }

      if (connectLinkedIn) {
        window.location.href = getLinkedInConnectUrl(redirect);
      } else {
        window.location.href = redirect;
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LinkedAgents</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Accédez à votre espace pour publier sur LinkedIn
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-background/50"
            />
          </div>
          <Button
            type="submit"
            className="w-full btn-gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href={getSignupUrl(redirect)}
            className="text-violet-light hover:underline"
          >
            Créer un compte
          </Link>
        </p>

        {connectLinkedIn && (
          <div className="flex items-center gap-2 rounded-lg border border-[#0077B5]/30 bg-[#0077B5]/10 p-3 text-sm text-muted-foreground">
            <Linkedin className="h-4 w-4 text-[#0077B5] shrink-0" />
            Connectez-vous d'abord, puis vous serez redirigé vers LinkedIn.
          </div>
        )}
      </div>
    </div>
  );
}
