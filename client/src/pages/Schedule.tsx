import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
} from "lucide-react";

interface ScheduledPost {
  id: number;
  content: string;
  scheduledDate: Date;
  status: "pending" | "published" | "failed";
}

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTime, setNewPostTime] = useState("09:00");
  const [isScheduling, setIsScheduling] = useState(false);

  // Mock scheduled posts (in real app, fetch from API)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 1,
      content: "🚀 La clé du succès sur LinkedIn ? La régularité. Publiez chaque jour, même si c'est juste 3 lignes. L'algorithme vous récompensera. #LinkedIn #PersonalBranding",
      scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h from now
      status: "pending",
    },
    {
      id: 2,
      content: "J'ai analysé 500 posts LinkedIn viraux. Le point commun ? Ils commencent tous par une accroche qui crée de la curiosité. Voici les 5 formules qui marchent le mieux...",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: "pending",
    },
  ]);

  const handleSchedulePost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Le contenu du post est requis");
      return;
    }

    setIsScheduling(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const [hours, minutes] = newPostTime.split(":").map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const newPost: ScheduledPost = {
      id: Date.now(),
      content: newPostContent,
      scheduledDate,
      status: "pending",
    };

    setScheduledPosts([...scheduledPosts, newPost]);
    setNewPostContent("");
    setShowNewPostModal(false);
    setIsScheduling(false);
    toast.success("Post planifié avec succès !");
  };

  const handleDeletePost = (id: number) => {
    setScheduledPosts(scheduledPosts.filter(p => p.id !== id));
    toast.success("Post supprimé");
  };

  const handlePublishNow = async (post: ScheduledPost) => {
    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: post.content }),
      });

      const data = await response.json();

      if (data.success) {
        setScheduledPosts(scheduledPosts.map(p => 
          p.id === post.id ? { ...p, status: "published" as const } : p
        ));
        toast.success("Post publié sur LinkedIn !");
      } else if (data.error === "LinkedIn not connected") {
        const authResponse = await fetch("/api/linkedin/auth");
        const authData = await authResponse.json();
        if (authData.authUrl) {
          toast.info("Redirection vers LinkedIn pour autorisation...");
          window.location.href = authData.authUrl;
        }
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
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
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Planificateur de posts
            </h1>
            <p className="text-muted-foreground">
              Programmez vos publications LinkedIn à l'avance
            </p>
          </div>
          <Button 
            className="btn-gradient"
            onClick={() => setShowNewPostModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau post
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-semibold text-white">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(day => (
                  <div key={day} className="text-center text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
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

          {/* Scheduled posts for selected date */}
          <div>
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Posts du {selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </h3>

              <div className="space-y-4">
                {getPostsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Aucun post planifié pour cette date
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setShowNewPostModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un post
                    </Button>
                  </div>
                ) : (
                  getPostsForDate(selectedDate).map(post => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-white/10 bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatTime(new Date(post.scheduledDate))}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          post.status === "published" 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : post.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gold/20 text-gold"
                        }`}>
                          {post.status === "published" ? "Publié" : post.status === "failed" ? "Échec" : "En attente"}
                        </span>
                      </div>
                      <p className="text-sm text-white/90 line-clamp-3 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground hover:text-[#0077B5]"
                          onClick={() => handlePublishNow(post)}
                          disabled={post.status === "published"}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Publier
                        </Button>
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
            </div>

            {/* Upcoming posts */}
            <div className="mt-6 p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Prochaines publications
              </h3>
              <div className="space-y-3">
                {scheduledPosts
                  .filter(p => p.status === "pending")
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .slice(0, 3)
                  .map(post => (
                    <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{post.content.slice(0, 50)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.scheduledDate).toLocaleDateString("fr-FR")} à {formatTime(new Date(post.scheduledDate))}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-white/10 p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Planifier un nouveau post
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Contenu du post
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet/50 resize-none"
                  placeholder="Écrivez votre post LinkedIn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-violet/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-violet/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewPostModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 btn-gradient"
                  onClick={handleSchedulePost}
                  disabled={isScheduling}
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Planification...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier
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
