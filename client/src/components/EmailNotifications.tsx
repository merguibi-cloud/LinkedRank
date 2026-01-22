import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  Flame, 
  Trophy, 
  Gift, 
  TrendingUp,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Sparkles,
  Send,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  frequency: "instant" | "daily" | "weekly";
  category: "engagement" | "gamification" | "content" | "system";
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "streak_reminder",
    title: "Rappel de streak",
    description: "Recevez un rappel si votre streak risque d'être perdu",
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    enabled: true,
    frequency: "instant",
    category: "gamification"
  },
  {
    id: "badge_unlocked",
    title: "Badge débloqué",
    description: "Notification quand vous débloquez un nouveau badge",
    icon: <Trophy className="w-5 h-5 text-amber-500" />,
    enabled: true,
    frequency: "instant",
    category: "gamification"
  },
  {
    id: "level_up",
    title: "Montée de niveau",
    description: "Célébrez chaque nouveau niveau atteint",
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    enabled: true,
    frequency: "instant",
    category: "gamification"
  },
  {
    id: "challenge_reminder",
    title: "Rappel de défi",
    description: "Rappel avant la fin d'un défi communautaire",
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    enabled: true,
    frequency: "daily",
    category: "gamification"
  },
  {
    id: "post_performance",
    title: "Performance de post",
    description: "Résumé des performances de vos publications",
    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    enabled: true,
    frequency: "daily",
    category: "engagement"
  },
  {
    id: "weekly_report",
    title: "Rapport hebdomadaire",
    description: "Récapitulatif de votre semaine sur LinkedIn",
    icon: <Calendar className="w-5 h-5 text-primary" />,
    enabled: true,
    frequency: "weekly",
    category: "engagement"
  },
  {
    id: "new_referral",
    title: "Nouveau filleul",
    description: "Notification quand quelqu'un utilise votre code de parrainage",
    icon: <Gift className="w-5 h-5 text-pink-500" />,
    enabled: true,
    frequency: "instant",
    category: "system"
  },
  {
    id: "content_suggestions",
    title: "Suggestions de contenu",
    description: "Idées de posts basées sur les tendances",
    icon: <Mail className="w-5 h-5 text-cyan-500" />,
    enabled: false,
    frequency: "weekly",
    category: "content"
  }
];

// Historique des notifications envoyées
const NOTIFICATION_HISTORY = [
  {
    id: "1",
    title: "🔥 Votre streak de 5 jours est en danger !",
    message: "Publiez un post aujourd'hui pour maintenir votre streak",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "streak_reminder",
    read: true
  },
  {
    id: "2",
    title: "🏆 Nouveau badge débloqué : Créateur Prolifique",
    message: "Félicitations ! Vous avez publié 50 posts",
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "badge_unlocked",
    read: true
  },
  {
    id: "3",
    title: "📈 Votre post a atteint 1,000 vues !",
    message: "Votre dernier post performe très bien",
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    type: "post_performance",
    read: false
  },
  {
    id: "4",
    title: "🎁 Marie Dupont a utilisé votre code !",
    message: "Vous avez gagné 500 crédits bonus",
    sentAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    type: "new_referral",
    read: true
  }
];

export function EmailNotifications() {
  const [settings, setSettings] = useState(NOTIFICATION_SETTINGS);
  const [history] = useState(NOTIFICATION_HISTORY);
  const [testEmailSent, setTestEmailSent] = useState(false);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success("Préférence mise à jour !");
  };

  const sendTestEmail = () => {
    setTestEmailSent(true);
    toast.success("📧 Email de test envoyé !");
    setTimeout(() => setTestEmailSent(false), 3000);
  };

  const enableAll = () => {
    setSettings(prev => prev.map(s => ({ ...s, enabled: true })));
    toast.success("Toutes les notifications activées !");
  };

  const disableAll = () => {
    setSettings(prev => prev.map(s => ({ ...s, enabled: false })));
    toast.success("Toutes les notifications désactivées");
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "instant": return "Instantané";
      case "daily": return "Quotidien";
      case "weekly": return "Hebdomadaire";
      default: return frequency;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "instant": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "daily": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "weekly": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      default: return "";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "engagement": return "Engagement";
      case "gamification": return "Gamification";
      case "content": return "Contenu";
      case "system": return "Système";
      default: return category;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Il y a ${days}j`;
    if (hours > 0) return `Il y a ${hours}h`;
    return "À l'instant";
  };

  // Grouper par catégorie
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <div className="space-y-6">
      {/* Header avec actions rapides */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications Email
          </h2>
          <p className="text-muted-foreground">
            Configurez vos préférences de notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={enableAll}>
            <Check className="w-4 h-4 mr-2" />
            Tout activer
          </Button>
          <Button variant="outline" size="sm" onClick={disableAll}>
            Tout désactiver
          </Button>
          <Button onClick={sendTestEmail} disabled={testEmailSent}>
            <Send className="w-4 h-4 mr-2" />
            {testEmailSent ? "Envoyé !" : "Tester"}
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settings.filter(s => s.enabled).length}</p>
                <p className="text-xs text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-muted-foreground">Taux d'ouverture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+15%</p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card key={category} className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                {getCategoryLabel(category)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map((setting, index) => (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      {setting.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{setting.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                      <Badge className={`mt-1 text-xs ${getFrequencyColor(setting.frequency)}`}>
                        {getFrequencyLabel(setting.frequency)}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historique des notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Notifications récentes
          </CardTitle>
          <CardDescription>
            Les dernières notifications envoyées à votre email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  notification.read 
                    ? "bg-secondary/10 border-border/30" 
                    : "bg-primary/5 border-primary/30"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.read ? "bg-muted" : "bg-primary"
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notification.sentAt)}
                  </p>
                </div>
                {!notification.read && (
                  <Badge variant="outline" className="text-xs">
                    Non lu
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerte streak */}
      <Card className="glass-card border-orange-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Rappel de streak activé</h3>
              <p className="text-sm text-muted-foreground">
                Vous recevrez un email à 18h si vous n'avez pas encore publié aujourd'hui
              </p>
            </div>
            <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
              <Flame className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailNotifications;
