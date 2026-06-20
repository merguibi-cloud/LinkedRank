import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  formatDateInput,
  formatTimeInput,
  getDefaultScheduleTime,
} from "@/lib/scheduleUtils";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ScheduledPost {
  id: number;
  content: string;
  scheduledDate: Date;
  status: "pending" | "published" | "failed";
  imageUrl?: string | null;
}

type PostModalMode = "create" | "edit";

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalMode, setModalMode] = useState<PostModalMode>("create");
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postDate, setPostDate] = useState(getDefaultScheduleTime().date);
  const [postTime, setPostTime] = useState(getDefaultScheduleTime().time);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const loadScheduledPosts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/schedule", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setScheduledPosts(
          (data.posts || []).map((p: { id: number; content: string; scheduledDate: string; status: string; imageUrl?: string }) => ({
            id: p.id,
            content: p.content,
            scheduledDate: new Date(p.scheduledDate),
            status: p.status,
            imageUrl: p.imageUrl,
          }))
        );
      }
    } catch {
      toast.error("Impossible de charger les posts planifiés");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadScheduledPosts();
  }, [loadScheduledPosts]);

  const openCreateModal = () => {
    const defaults = getDefaultScheduleTime();
    setModalMode("create");
    setEditingPost(null);
    setPostContent("");
    setPostDate(formatDateInput(selectedDate) >= defaults.date ? formatDateInput(selectedDate) : defaults.date);
    setPostTime(defaults.time);
    setShowPostModal(true);
  };

  const openEditModal = (post: ScheduledPost) => {
    if (post.status !== "pending") {
      toast.error("Seuls les posts en attente peuvent être modifiés");
      return;
    }
    setModalMode("edit");
    setEditingPost(post);
    setPostContent(post.content);
    setPostDate(formatDateInput(new Date(post.scheduledDate)));
    setPostTime(formatTimeInput(new Date(post.scheduledDate)));
    setShowPostModal(true);
  };

  const closeModal = () => {
    setShowPostModal(false);
    setEditingPost(null);
  };

  const handleSavePost = async () => {
    if (!postContent.trim()) {
      toast.error("Le contenu du post est requis");
      return;
    }

    setIsSaving(true);
    try {
      const url =
        modalMode === "edit" && editingPost
          ? `/api/schedule/${editingPost.id}`
          : "/api/schedule";
      const method = modalMode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: postContent,
          date: postDate,
          time: postTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(modalMode === "edit" ? "Programmation mise à jour !" : "Post planifié avec succès !");
        closeModal();
        await loadScheduledPosts();
      } else {
        toast.error(data.error || "Erreur lors de la planification");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setScheduledPosts(scheduledPosts.filter((p) => p.id !== id));
        toast.success("Post supprimé");
      } else {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handlePublishNow = async (post: ScheduledPost) => {
    try {
      const response = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: post.content,
          imageUrl: post.imageUrl ?? undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetch(`/api/schedule/${post.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        await loadScheduledPosts();
        toast.success("Post publié sur LinkedIn !");
      } else if (data.error?.includes("LinkedIn not connected")) {
        toast.info("Connectez LinkedIn pour publier");
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter((post) => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Planifiez vos publications
            </h1>
            <p className="text-muted-foreground mb-8">
              Connectez-vous pour accéder au planificateur de posts LinkedIn.
            </p>
            <a href={getLoginUrl()}>
              <Button className="btn-gradient">Se connecter</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(selectedDate);
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Planificateur de posts
            </h1>
            <p className="text-muted-foreground">
              Choisissez le jour, la date et l&apos;heure exacte de diffusion sur LinkedIn
            </p>
          </div>
          <Button className="btn-gradient" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau post
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() =>
                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
                  }
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-semibold text-white">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <button
                  onClick={() =>
                    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
                  }
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                  <div key={day} className="text-center text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const postsOnDay = getPostsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = day.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-xl p-2 transition-all relative ${
                        isSelected
                          ? "bg-violet/30 border border-violet"
                          : isToday
                            ? "bg-gold/20 border border-gold/30"
                            : "hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      <span className={`text-sm ${isToday ? "text-gold font-bold" : "text-white"}`}>
                        {day.getDate()}
                      </span>
                      {postsOnDay.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          {postsOnDay.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Posts du{" "}
                {selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-light" />
                </div>
              ) : (
                <div className="space-y-4">
                  {getPostsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Aucun post planifié pour cette date
                      </p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un post
                      </Button>
                    </div>
                  ) : (
                    getPostsForDate(selectedDate).map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-xl border border-white/10 bg-background/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatTime(new Date(post.scheduledDate))}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              post.status === "published"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : post.status === "failed"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gold/20 text-gold"
                            }`}
                          >
                            {post.status === "published"
                              ? "Publié"
                              : post.status === "failed"
                                ? "Échec"
                                : "En attente"}
                          </span>
                        </div>
                        <p className="text-sm text-white/90 line-clamp-3 mb-3">{post.content}</p>
                        <div className="flex items-center gap-2">
                          {post.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-violet-light"
                                onClick={() => openEditModal(post)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Modifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-[#0077B5]"
                                onClick={() => handlePublishNow(post)}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Publier
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-red-400"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Prochaines publications</h3>
              <div className="space-y-3">
                {scheduledPosts
                  .filter((p) => p.status === "pending")
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
                  )
                  .slice(0, 5)
                  .map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => openEditModal(post)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{post.content.slice(0, 50)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.scheduledDate).toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          à {formatTime(new Date(post.scheduledDate))}
                        </p>
                      </div>
                    </button>
                  ))}
                {scheduledPosts.filter((p) => p.status === "pending").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune publication planifiée
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              {modalMode === "edit" ? "Modifier la programmation" : "Planifier un nouveau post"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Contenu du post
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet/50 resize-none"
                  placeholder="Écrivez votre post LinkedIn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Date</label>
                  <input
                    type="date"
                    value={postDate}
                    min={formatDateInput(new Date())}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-violet/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Heure</label>
                  <input
                    type="time"
                    value={postTime}
                    onChange={(e) => setPostTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-violet/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Le post sera publié automatiquement sur LinkedIn à la date et l&apos;heure choisies.
              </p>

              <div className="flex items-center gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Annuler
                </Button>
                <Button className="flex-1 btn-gradient" onClick={handleSavePost} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      {modalMode === "edit" ? "Mettre à jour" : "Planifier"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
