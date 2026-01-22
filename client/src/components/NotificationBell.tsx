import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Bot, TrendingUp, Send, BarChart3, Lightbulb, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean | null;
  priority: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  createdAt: Date;
}

const notificationIcons: Record<string, React.ReactNode> = {
  agent_task_completed: <Bot className="w-4 h-4 text-emerald-400" />,
  agent_task_failed: <AlertCircle className="w-4 h-4 text-red-400" />,
  agent_needs_approval: <Bot className="w-4 h-4 text-amber-400" />,
  trend_detected: <TrendingUp className="w-4 h-4 text-violet-light" />,
  post_published: <Send className="w-4 h-4 text-blue-400" />,
  post_performance: <BarChart3 className="w-4 h-4 text-emerald-400" />,
  suggestion: <Lightbulb className="w-4 h-4 text-amber-400" />,
  system: <Bell className="w-4 h-4 text-muted-foreground" />,
};

const priorityColors: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-amber-500",
  medium: "border-l-violet",
  low: "border-l-muted-foreground",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: unreadCount = 0, refetch: refetchCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const { data: notifications = [], refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    { limit: 20, unreadOnly: false },
    { enabled: isOpen }
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet text-[10px] font-bold flex items-center justify-center text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 bg-card border-white/10"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-white"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-white/5 cursor-pointer transition-colors border-l-2",
                    notification.isRead ? "opacity-60" : "bg-white/5",
                    priorityColors[notification.priority || "medium"] || priorityColors.medium
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {notificationIcons[notification.type] || notificationIcons.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          notification.isRead ? "text-muted-foreground" : "text-white font-medium"
                        )}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate({ id: notification.id });
                              }}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Marquer comme lu"
                            >
                              <Check className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate({ id: notification.id });
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.actionLabel && (
                          <span className="text-xs text-violet-light hover:underline">
                            {notification.actionLabel} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10 text-center">
            <a
              href="/notifications"
              className="text-sm text-violet-light hover:underline"
            >
              Voir toutes les notifications
            </a>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
