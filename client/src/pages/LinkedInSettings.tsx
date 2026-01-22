import DashboardLayout from "@/components/DashboardLayout";
import { LinkedInIntegration } from "@/components/LinkedInIntegration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Linkedin, 
  Bell, 
  Clock, 
  Shield, 
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

export default function LinkedInSettings() {
  const [autoPublish, setAutoPublish] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [supervisedMode, setSupervisedMode] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres LinkedIn</h1>
          <p className="mt-2 text-muted-foreground">
            Configurez votre connexion LinkedIn et les paramètres de publication
          </p>
        </div>

        {/* LinkedIn Integration Component */}
        <LinkedInIntegration />

        {/* Publication Settings */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Paramètres de publication
            </CardTitle>
            <CardDescription>
              Configurez comment vos agents publient sur LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supervised Mode */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Mode supervisé</h4>
                  <p className="text-sm text-muted-foreground">
                    Approuvez chaque publication avant qu'elle soit postée
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {supervisedMode && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Recommandé
                  </span>
                )}
                <Switch
                  checked={supervisedMode}
                  onCheckedChange={setSupervisedMode}
                />
              </div>
            </div>

            {/* Auto Publish */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet/20">
                  <Zap className="h-5 w-5 text-violet-light" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Auto-publication</h4>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux agents de publier automatiquement
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!supervisedMode && autoPublish && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Attention
                  </span>
                )}
                <Switch
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                  disabled={supervisedMode}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose/20">
                  <Bell className="h-5 w-5 text-rose" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des alertes pour les actions importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Warning for autonomous mode */}
            {!supervisedMode && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-400">Mode autonome activé</h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      En désactivant le mode supervisé, vos agents pourront publier sans votre approbation. 
                      Nous recommandons de garder le mode supervisé activé pour contrôler votre image de marque.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling Settings */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Horaires de publication
            </CardTitle>
            <CardDescription>
              Définissez les meilleurs moments pour publier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 font-medium text-white">Jours préférés</h4>
                <div className="flex flex-wrap gap-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((day) => (
                    <button
                      key={day}
                      className="rounded-lg bg-violet/20 px-3 py-1.5 text-sm text-violet-light hover:bg-violet/30 transition-colors"
                    >
                      {day}
                    </button>
                  ))}
                  {["Sam", "Dim"].map((day) => (
                    <button
                      key={day}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/20 transition-colors"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="mb-2 font-medium text-white">Créneaux horaires</h4>
                <div className="flex flex-wrap gap-2">
                  {["8h-9h", "12h-13h", "17h-18h"].map((slot) => (
                    <button
                      key={slot}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Basé sur l'analyse de votre audience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="btn-gradient">
            Enregistrer les paramètres
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
