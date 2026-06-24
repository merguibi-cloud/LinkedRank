import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SignupProgress } from "@/components/auth/SignupProgress";
import { ensureVoiceOnboardingUrl, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { waitForAuthenticatedUser } from "@/lib/authSession";
import { trpc } from "@/lib/trpc";
import {
  createClient,
  isSupabaseConfigured,
  PENDING_CONFIRMATION_EMAIL_KEY,
} from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Mic,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type SignupStep = 1 | 2;

export default function Signup() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<SignupStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);

  const redirect = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return ensureVoiceOnboardingUrl(params.get("redirect"));
  }, []);

  useEffect(() => {
    if (!loading && user) {
      setLocation(redirect);
    }
  }, [user, loading, redirect, setLocation]);

  const goToVoiceOnboarding = async () => {
    const authenticated = await waitForAuthenticatedUser(utils);
    if (!authenticated) {
      toast.error(
        "Session non établie. Réessayez de vous connecter ou vérifiez votre email."
      );
      return;
    }
    window.location.href = redirect;
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() || undefined },
            emailRedirectTo: `${window.location.origin}${redirect}`,
          },
        });

        if (error) {
          toast.error(error.message || "Inscription échouée");
          return;
        }

        if (!data.session) {
          localStorage.setItem(PENDING_CONFIRMATION_EMAIL_KEY, email);
          setPendingEmailVerification(true);
          toast.success("Compte créé ! Vérifiez votre email pour continuer.");
          return;
        }

        toast.success("Compte créé ! Lancement de votre agent vocal...");
        await goToVoiceOnboarding();
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

        toast.success("Compte créé ! Lancement de votre agent vocal...");
        await goToVoiceOnboarding();
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

  if (pendingEmailVerification) {
    return (
      <AuthLayout mode="signup" signupStep={2}>
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Vérifiez votre email
            </h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Un lien de confirmation a été envoyé à{" "}
              <span className="text-white font-medium">{email}</span>.
              Cliquez dessus pour accéder directement à votre agent vocal.
            </p>
          </div>
          <div className="rounded-xl border border-violet/20 bg-violet/5 p-4 flex items-start gap-3 text-left">
            <Mic className="h-5 w-5 text-violet-light shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Après confirmation, vous serez redirigé vers l'onboarding vocal pour
              configurer LinkedIn en parlant.
            </p>
          </div>
          <Link href={getLoginUrl(redirect)}>
            <Button variant="outline" className="w-full border-white/10">
              J'ai confirmé mon email — me connecter
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="signup" signupStep={step}>
      <SignupProgress currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Commencez gratuitement
              </h1>
              <p className="text-muted-foreground mt-2">
                Créez votre compte en 30 secondes — aucune carte requise
              </p>
            </div>

            <form onSubmit={handleStep1} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom ou pseudo"
                    autoComplete="name"
                    className="bg-white/5 border-white/10 pl-10 h-12 focus:border-violet/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    required
                    autoComplete="email"
                    className="bg-white/5 border-white/10 pl-10 h-12 focus:border-violet/50"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full btn-gradient h-12 text-base">
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Sécurisez votre compte
              </h1>
              <p className="text-muted-foreground mt-2">
                Dernière étape avant de rencontrer votre agent vocal
              </p>
            </div>

            <div className="rounded-xl border border-violet/20 bg-violet/5 p-4 mb-6 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-rose">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Prochaine étape : agent vocal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configurez LinkedIn en parlant — pas de formulaires compliqués
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 caractères minimum"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 pl-10 pr-10 h-12 focus:border-violet/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <Button type="submit" className="w-full btn-gradient h-12 text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Préparation de votre agent...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Créer mon compte et parler à mon agent
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href={getLoginUrl(redirect)} className="text-violet-light hover:underline font-medium">
            Se connecter
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-3">
          En créant un compte, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </AuthLayout>
  );
}
