import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  getLinkedInConnectUrl,
  getSignupUrl,
  sanitizeInternalRedirect,
} from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowRight, Eye, EyeOff, Linkedin, Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout mode="login">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Accédez à votre espace et reprenez votre stratégie LinkedIn
          </p>
        </div>

        {connectLinkedIn && (
          <div className="flex items-center gap-3 rounded-xl border border-[#0077B5]/30 bg-[#0077B5]/10 p-4 mb-6 text-sm">
            <Linkedin className="h-5 w-5 text-[#0077B5] shrink-0" />
            <p className="text-muted-foreground">
              Connectez-vous d'abord, puis vous serez redirigé vers LinkedIn.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                autoComplete="email"
                className="bg-white/5 border-white/10 pl-10 h-12 focus:border-violet/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-light hover:underline"
              >
                Mot de passe oubliÃ© ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
              required
              className="bg-background/50"
            />
          </div>

          <Button type="submit" className="w-full btn-gradient h-12 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                Accéder à mon espace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href={getSignupUrl(redirect)} className="text-violet-light hover:underline font-medium">
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
