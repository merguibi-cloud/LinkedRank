import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "agent";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ElementType;
  agentEmoji?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "agent",
    title: "Léa a terminé",
    message: "3 nouveaux posts générés sur l'IA et l'entrepreneuriat",
    time: "Il y a 5 min",
    read: false,
    agentEmoji: "👩‍💻",
  },
  {
    id: "2",
    type: "success",
    title: "Post publié !",
    message: "Votre post sur LinkedIn a été publié avec succès",
    time: "Il y a 15 min",
    read: false,
    icon: CheckCircle2,
  },
  {
    id: "3",
    type: "agent",
    title: "Max a détecté une tendance",
    message: "Le sujet 'IA générative' explose sur LinkedIn (+340%)",
    time: "Il y a 30 min",
    read: false,
    agentEmoji: "🕵️",
  },
  {
    id: "4",
    type: "info",
    title: "Nouveau record !",
    message: "Votre post a atteint 10K vues - votre meilleur score !",
    time: "Il y a 1h",
    read: true,
    icon: TrendingUp,
  },
  {
    id: "5",
    type: "agent",
    title: "Emma suggère",
    message: "5 commentaires méritent une réponse pour booster l'engagement",
    time: "Il y a 2h",
    read: true,
    agentEmoji: "🤝",
  },
  {
    id: "6",
    type: "agent",
    title: "Sam a planifié",
    message: "Votre prochain post sera publié demain à 8h30",
    time: "Il y a 3h",
    read: true,
    agentEmoji: "⏰",
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [hasNewNotification, setHasNewNotification] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setHasNewNotification(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/20 text-emerald-400";
      case "warning":
        return "bg-gold/20 text-gold";
      case "agent":
        return "bg-violet/20 text-violet-light";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  const getIcon = (notification: Notification) => {
    if (notification.agentEmoji) {
      return <span className="text-lg">{notification.agentEmoji}</span>;
    }
    const Icon = notification.icon || Info;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-white/70" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">{unreadCount}</span>
          </motion.div>
        )}
        {hasNewNotification && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-rose rounded-full"
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-light" />
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose/20 text-rose text-xs font-medium">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-violet-light hover:text-violet transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                          !notification.read ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getTypeStyles(notification.type)}`}>
                            {getIcon(notification)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-medium ${notification.read ? "text-white/70" : "text-white"}`}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <X className="w-3 h-3 text-white/40" />
                              </button>
                            </div>
                            <p className={`text-sm mt-0.5 ${notification.read ? "text-white/50" : "text-white/70"}`}>
                              {notification.message}
                            </p>
                            <span className="text-xs text-white/40 mt-1 block">
                              {notification.time}
                            </span>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-violet flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                <button className="w-full py-2 text-sm text-violet-light hover:text-violet transition-colors">
                  Voir toutes les notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
