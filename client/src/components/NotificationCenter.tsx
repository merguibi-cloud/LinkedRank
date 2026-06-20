import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  TrendingUp,
  CheckCircle2,
  Info,
  AlertCircle,
  Send,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type NotificationMetadata = {
  agentEmoji?: string;
  agentName?: string;
  trend?: string;
  growth?: string;
  count?: number;
  theme?: string;
};

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean | null;
  actionUrl?: string | null;
  createdAt: Date;
  metadata?: unknown;
};

type UiType = "success" | "info" | "warning" | "agent";

function mapNotificationType(type: string): UiType {
  switch (type) {
    case "post_published":
    case "agent_task_completed":
      return "success";
    case "agent_task_failed":
      return "warning";
    case "trend_detected":
    case "agent_needs_approval":
    case "suggestion":
      return "agent";
    case "post_performance":
      return "info";
    default:
      return "info";
  }
}

function getTypeStyles(type: UiType): string {
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
}

function parseMetadata(metadata: unknown): NotificationMetadata | null {
  if (!metadata) return null;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as NotificationMetadata;
    } catch {
      return null;
    }
  }
  if (typeof metadata === "object") {
    return metadata as NotificationMetadata;
  }
  return null;
}

function getNotificationIcon(notification: NotificationItem): React.ReactNode {
  const meta = parseMetadata(notification.metadata);
  const emoji = meta?.agentEmoji;
  if (emoji) {
    return <span className="text-lg">{emoji}</span>;
  }

  switch (notification.type) {
    case "post_published":
      return <CheckCircle2 className="w-5 h-5" />;
    case "agent_task_failed":
      return <AlertCircle className="w-5 h-5" />;
    case "trend_detected":
      return <TrendingUp className="w-5 h-5" />;
    case "post_performance":
      return <BarChart3 className="w-5 h-5" />;
    case "suggestion":
      return <Lightbulb className="w-5 h-5" />;
    case "agent_task_completed":
      return <Send className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount = 0, refetch: refetchCount } =
    trpc.notifications.unreadCount.useQuery(undefined, {
      refetchInterval: 30000,
    });

  const { data: notifications = [], refetch: refetchNotifications } =
    trpc.notifications.list.useQuery(
      { limit: 20, unreadOnly: false },
      { enabled: isOpen, refetchInterval: isOpen ? 30000 : false }
    );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    if (notification.actionUrl) {
      setIsOpen(false);
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/70" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-light" />
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose/20 text-rose text-xs font-medium">
                      {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-violet-light hover:text-violet transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">Aucune notification</p>
                    <p className="text-white/40 text-sm mt-1">
                      Générez ou publiez un post pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification) => {
                      const uiType = mapNotificationType(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                            !notification.isRead ? "bg-white/[0.02]" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getTypeStyles(uiType)}`}
                            >
                              {getNotificationIcon(notification)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className={`font-medium ${notification.isRead ? "text-white/70" : "text-white"}`}
                                >
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate({ id: notification.id });
                                  }}
                                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                  aria-label="Supprimer"
                                >
                                  <X className="w-3 h-3 text-white/40" />
                                </button>
                              </div>
                              <p
                                className={`text-sm mt-0.5 ${notification.isRead ? "text-white/50" : "text-white/70"}`}
                              >
                                {notification.message}
                              </p>
                              <span className="text-xs text-white/40 mt-1 block">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>

                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-violet flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                  <Link href="/notifications">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2 text-sm text-violet-light hover:text-violet transition-colors"
                    >
                      Voir toutes les notifications
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
