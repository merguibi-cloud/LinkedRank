import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Globe,
  Trash2,
  Download,
  LogOut,
  Sparkles,
  Target,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { USER_PROFILES } from "@/components/ProfileSelector";
import { ProfileQuiz, useProfileQuiz, getQuizRecommendations } from "@/components/ProfileQuiz";

export default function Settings() {
  const { profile, clearProfile } = useUserProfile();
  const { showQuiz, quizAnswers, startQuiz, completeQuiz, skipQuiz } = useProfileQuiz();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  const resetOnboarding = () => {
    localStorage.removeItem("linkedagents_onboarding_completed");
    localStorage.removeItem("linkedagents_user_profile");
    toast.success("Guide de démarrage réinitialisé ! Rechargez la page pour le relancer.", {
      action: {
        label: "Recharger",
        onClick: () => window.location.reload()
      }
    });
  };

  const changeProfile = () => {
    clearProfile();
    localStorage.removeItem("linkedagents_onboarding_completed");
    toast.success("Profil réinitialisé ! Rechargez la page pour choisir un nouveau profil.", {
      action: {
        label: "Recharger",
        onClick: () => window.location.reload()
      }
    });
  };

  const exportData = () => {
    toast.success("Export des données en cours...");
    // Simuler un export
    setTimeout(() => {
      toast.success("Données exportées avec succès !");
    }, 2000);
  };

  return (
    <DashboardLayout>
      {/* Quiz de profil avancé */}
      {showQuiz && (
        <ProfileQuiz 
          onComplete={(answers) => {
            completeQuiz(answers);
            toast.success("Profil personnalisé avec succès !");
          }}
          onSkip={skipQuiz}
        />
      )}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Personnalisez votre expérience LinkedAgents</p>
          </div>
        </div>

        {/* Profil utilisateur */}
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Votre Profil
            </CardTitle>
            <CardDescription>
              Votre profil détermine les conseils et fonctionnalités recommandées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{profile.focus}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={changeProfile}>
                  Changer
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                <p className="text-muted-foreground mb-3">Aucun profil sélectionné</p>
                <Button onClick={resetOnboarding}>
                  <Target className="w-4 h-4 mr-2" />
                  Choisir mon profil
                </Button>
              </div>
            )}

            {profile && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Vos objectifs
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {profile.objectives.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Fonctionnalités recommandées
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.recommendedFeatures.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guide de démarrage */}
        <Card className="glass-card border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Guide de démarrage
            </CardTitle>
            <CardDescription>
              Revoyez le tutoriel interactif pour découvrir toutes les fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Relancer le guide</h4>
                  <p className="text-sm text-muted-foreground">
                    Redécouvrez LinkedAgents en 7 étapes
                  </p>
                </div>
              </div>
              <Button 
                onClick={resetOnboarding}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Relancer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz de personnalisation avancée */}
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Personnalisation avancée
            </CardTitle>
            <CardDescription>
              Répondez à 4 questions pour affiner vos recommandations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Quiz de profil</h4>
                  <p className="text-sm text-muted-foreground">
                    {quizAnswers ? "Vos préférences sont enregistrées" : "Objectifs, fréquence, secteur, niveau"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={startQuiz}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                {quizAnswers ? "Refaire" : "Commencer"}
              </Button>
            </div>
            {quizAnswers && (
              <div className="mt-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                <h4 className="text-sm font-medium mb-2">Vos recommandations personnalisées :</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {getQuizRecommendations(quizAnswers).slice(0, 4).map((rec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notifications push</h4>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes pour vos badges et objectifs
                </p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Rappels de publication</h4>
                <p className="text-sm text-muted-foreground">
                  Soyez notifié quand c'est le moment de publier
                </p>
              </div>
              <Switch 
                checked={autoPublish} 
                onCheckedChange={setAutoPublish}
              />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-medium">Mode sombre</h4>
                  <p className="text-sm text-muted-foreground">
                    Activer le thème sombre
                  </p>
                </div>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Données */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Données & Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Exporter mes données</h4>
                  <p className="text-sm text-muted-foreground">
                    Téléchargez toutes vos données
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={exportData}>
                Exporter
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-destructive" />
                <div>
                  <h4 className="font-medium text-destructive">Supprimer mon compte</h4>
                  <p className="text-sm text-muted-foreground">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aide */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Aide & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <button className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-left">
                <span className="font-medium">Centre d'aide</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-left">
                <span className="font-medium">Contacter le support</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-left">
                <span className="font-medium">Tutoriels vidéo</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors text-left">
                <span className="font-medium">Nouveautés</span>
                <Badge variant="outline" className="text-[10px]">v2.0</Badge>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
