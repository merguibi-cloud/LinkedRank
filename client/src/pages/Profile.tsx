import { useState } from "react";
import { Loader2, Lock, Mail, Save, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const supabaseMode = isSupabaseConfigured();

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [email, setEmail] = useState(user?.email ?? "");
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation();
  const updateEmailMutation = trpc.auth.updateEmail.useMutation();
  const changePasswordMutation = trpc.auth.changePassword.useMutation();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    setSavingName(true);
    try {
      if (supabaseMode) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          data: { name: name.trim() },
        });
        if (error) {
          toast.error(error.message || "Erreur lors de la mise à jour");
          return;
        }
      } else {
        await updateProfileMutation.mutateAsync({ name: name.trim() });
      }
      await utils.auth.me.invalidate();
      toast.success("Nom mis à jour !");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("L'email ne peut pas être vide");
      return;
    }

    setSavingEmail(true);
    try {
      if (supabaseMode) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (error) {
          toast.error(error.message || "Erreur lors de la mise à jour");
          return;
        }
        toast.success(
          "Email de confirmation envoyé ! Cliquez sur le lien pour valider le changement."
        );
      } else {
        await updateEmailMutation.mutateAsync({ email: email.trim() });
        await utils.auth.me.invalidate();
        toast.success("Email mis à jour !");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!supabaseMode && !currentPassword) {
      toast.error("Entrez votre mot de passe actuel");
      return;
    }

    setSavingPassword(true);
    try {
      if (supabaseMode) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          toast.error(error.message || "Erreur lors de la mise à jour");
          return;
        }
      } else {
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Mot de passe mis à jour !");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>
            <p className="text-muted-foreground">
              Gérez les informations de votre compte
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              Nom
            </CardTitle>
            <CardDescription>
              Le nom affiché dans l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSaveName}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Votre nom"
                className="flex-1"
              />
              <Button type="submit" disabled={savingName}>
                {savingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email
            </CardTitle>
            <CardDescription>
              {supabaseMode
                ? "Changer d'email nécessite de confirmer via un lien envoyé à la nouvelle adresse."
                : "L'adresse utilisée pour vous connecter."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSaveEmail}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="flex-1"
              />
              <Button type="submit" disabled={savingEmail}>
                {savingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Mot de passe
            </CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe (8 caractères minimum)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="space-y-3">
              {!supabaseMode && (
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmer</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
              </div>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Mettre à jour le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
