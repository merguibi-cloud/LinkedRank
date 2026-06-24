import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { Bot, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSentTo, setResetEmailSentTo] = useState<string | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Erreur lors de l'envoi de l'email");
        return;
      }

      setResetEmailSentTo(email);
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-muted-foreground">
            La récupération de mot de passe n'est pas disponible.
          </p>
          <Link href="/login" className="text-violet-light hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  if (resetEmailSentTo) {
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
              Vérifiez votre boîte mail
            </h1>
            <p className="text-muted-foreground">
              Nous avons envoyé un lien de réinitialisation à{" "}
              <span className="text-white">{resetEmailSentTo}</span>.
              Cliquez sur le lien pour choisir un nouveau mot de passe.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous ne le voyez pas ? Pensez à vérifier votre dossier spam.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={getLoginUrl()}
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
          <h1 className="text-2xl font-bold text-white">
            Mot de passe oublié ?
          </h1>
          <p className="text-muted-foreground mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
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
          <Button
            type="submit"
            className="w-full btn-gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              "Envoyer le lien"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={getLoginUrl()}
            className="text-violet-light hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
