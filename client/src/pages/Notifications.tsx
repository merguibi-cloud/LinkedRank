import DashboardLayout from "@/components/DashboardLayout";
import { EmailNotifications } from "@/components/EmailNotifications";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, Trash2, TrendingUp, CheckCircle2, Send, BarChart3, Lightbulb, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function NotificationIcon({ type, emoji }: { type: string; emoji?: string }) {
  if (emoji) return <span className="text-xl">{emoji}</span>;

  const iconClass = "w-5 h-5";
  switch (type) {
    case "post_published":
      return <CheckCircle2 className={cn(iconClass, "text-emerald-400")} />;
    case "trend_detected":
      return <TrendingUp className={cn(iconClass, "text-violet-light")} />;
    case "post_performance":
      return <BarChart3 className={cn(iconClass, "text-blue-400")} />;
    case "suggestion":
      return <Lightbulb className={cn(iconClass, "text-amber-400")} />;
    case "agent_task_completed":
      return <Send className={cn(iconClass, "text-emerald-400")} />;
    default:
      return <Info className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function InAppNotifications() {
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery({
    limit: 50,
    unreadOnly: false,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({ onSuccess: () => refetch() });
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.notifications.delete.useMutation({ onSuccess: () => refetch() });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-violet-light" />
          <div>
            <h2 className="text-xl font-semibold text-white">Notifications in-app</h2>
            <p className="text-sm text-muted-foreground">
              Activité réelle : génération, publication, agents et tendances
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/70">Aucune notification pour le moment</p>
          <p className="text-sm text-muted-foreground mt-1">
            Générez du contenu ou publiez sur LinkedIn pour recevoir des alertes ici.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
          {notifications.map((notification) => {
            const metadata = notification.metadata as { agentEmoji?: string } | null | undefined;
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-4 p-4 hover:bg-white/[0.02] transition-colors",
                  !notification.isRead && "bg-white/[0.03]"
                )}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <NotificationIcon type={notification.type} emoji={metadata?.agentEmoji} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn("font-medium", notification.isRead ? "text-white/70" : "text-white")}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                          className="p-1.5 rounded-lg hover:bg-white/10"
                          title="Marquer comme lu"
                        >
                          <CheckCheck className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate({ id: notification.id })}
                        className="p-1.5 rounded-lg hover:bg-white/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="inline-block text-xs text-violet-light hover:underline mt-2"
                    >
                      {notification.actionLabel || "Voir"} →
                    </a>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-violet flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function Notifications() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <InAppNotifications />
        <EmailNotifications />
      </div>
    </DashboardLayout>
  );
}
