import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing,
  X,
  Check,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  MessageSquare,
  Users,
  Zap,
  Gift,
  Star,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "achievement" | "streak" | "challenge" | "engagement" | "milestone" | "tip";
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "achievement",
      title: "🏆 Nouveau badge débloqué !",
      message: "Vous avez obtenu le badge '100K Club' - Félicitations pour vos 100 000 vues !",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-yellow-400 bg-yellow-500/10",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: { label: "Voir mes badges", href: "/gamification" }
    },
    {
      id: "2",
      type: "streak",
      title: "🔥 Streak de 12 jours !",
      message: "Continuez comme ça ! Plus que 2 jours pour débloquer le badge 'Feu Éternel'",
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-400 bg-orange-500/10",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: "3",
      type: "challenge",
      title: "✅ Défi complété !",
      message: "Vous avez terminé le défi 'Créateur actif' - +300 XP gagnés !",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-400 bg-green-500/10",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    },
    {
      id: "4",
      type: "engagement",
      title: "📈 Post viral !",
      message: "Votre post '5 astuces pour LinkedIn' a dépassé 25 000 vues !",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-400 bg-blue-500/10",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      action: { label: "Voir les stats", href: "/live-analytics" }
    },
    {
      id: "5",
      type: "milestone",
      title: "🎉 Nouveau niveau !",
      message: "Félicitations ! Vous êtes maintenant niveau 4 'Expert'",
      icon: <Star className="w-5 h-5" />,
      color: "text-purple-400 bg-purple-500/10",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: "6",
      type: "tip",
      title: "💡 Conseil du coach",
      message: "Publiez aujourd'hui entre 8h et 9h pour maximiser votre portée !",
      icon: <Zap className="w-5 h-5" />,
      color: "text-cyan-400 bg-cyan-500/10",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      read: true,
      action: { label: "Voir le coaching", href: "/coaching" }
    }
  ]);

  const [settings, setSettings] = useState({
    achievements: true,
    streaks: true,
    challenges: true,
    engagement: true,
    tips: true
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Notifications effacées");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border/50 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary/20 text-primary">{unreadCount} nouvelles</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Tout lire
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-200px)]">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${notification.read ? "bg-secondary/20 border-border/30" : "bg-primary/5 border-primary/30"}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.color}`}>
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium text-sm ${notification.read ? "text-foreground" : "text-foreground"}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                                <a href={notification.action.href}>{notification.action.label}</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Settings */}
              <div className="border-t border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Préférences</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key === "achievements" ? "Badges" : 
                         key === "streaks" ? "Streaks" :
                         key === "challenges" ? "Défis" :
                         key === "engagement" ? "Engagement" : "Conseils"}
                      </span>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
