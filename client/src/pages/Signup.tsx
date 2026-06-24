import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl, sanitizeInternalRedirect } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  createClient,
  isSupabaseConfigured,
  PENDING_CONFIRMATION_EMAIL_KEY,
} from "@/lib/supabase";
import { Bot, Loader2, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Signup() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationEmailSentTo, setConfirmationEmailSentTo] = useState<
    string | null
  >(null);

  const params = new URLSearchParams(window.location.search);
  const redirect = sanitizeInternalRedirect(
    params.get("redirect"),
    "/onboarding?new=1"
  );

  useEffect(() => {
    if (!loading && user) {
      setLocation(redirect);
    }
  }, [user, loading, redirect, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() || undefined },
          },
        });

        if (error) {
          toast.error(error.message || "Inscription échouée");
          return;
        }

        if (!data.session) {
          localStorage.setItem(PENDING_CONFIRMATION_EMAIL_KEY, email);
          setConfirmationEmailSentTo(email);
          return;
        }

        toast.success("Compte créé ! Parlez maintenant à votre agent vocal.");
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Inscription échouée");
          return;
        }

        toast.success("Compte créé ! Parlez maintenant à votre agent vocal.");
      }

      window.location.href = redirect;
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

  if (confirmationEmailSentTo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LinkedAgents</span>
          </Link>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <MailCheck className="mx-auto h-10 w-10 text-violet-light" />
            <h1 className="text-2xl font-bold text-white">
              Confirmez votre email
            </h1>
            <p className="text-muted-foreground">
              Nous avons envoyé un email de confirmation à{" "}
              <span className="text-white">{confirmationEmailSentTo}</span>.
              Cliquez sur le lien dans cet email pour activer votre compte.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous ne le voyez pas ? Pensez à vérifier votre dossier spam.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={getLoginUrl(redirect)}
              className="text-violet-light hover:underline"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
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
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-muted-foreground mt-2">
            Après l'inscription, vous parlerez directement à votre agent vocal
            pour configurer LinkedIn
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom"
              className="bg-background/50"
            />
          </div>
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
              placeholder="8 caractères minimum"
              minLength={8}
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
                Création...
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href={getLoginUrl(redirect)}
            className="text-violet-light hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
