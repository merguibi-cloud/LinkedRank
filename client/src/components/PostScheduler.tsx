import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// Types
interface ScheduledPost {
  id: string;
  content: string;
  platforms: ("instagram" | "facebook" | "linkedin")[];
  scheduledDate: Date;
  scheduledTime: string;
  status: "scheduled" | "published" | "failed" | "draft";
  type: "post" | "story" | "reel" | "carousel";
  audience?: string;
}

// Posts planifiés de démonstration
const demoScheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    content: "🚀 5 astuces pour booster votre engagement LinkedIn...",
    platforms: ["linkedin", "instagram"],
    scheduledDate: new Date(Date.now() + 86400000), // Demain
    scheduledTime: "09:00",
    status: "scheduled",
    type: "carousel",
    audience: "Créateurs de contenu",
  },
  {
    id: "2",
    content: "POV: Tu découvres que l'IA peut poster à ta place...",
    platforms: ["instagram"],
    scheduledDate: new Date(Date.now() + 172800000), // Dans 2 jours
    scheduledTime: "12:00",
    status: "scheduled",
    type: "reel",
    audience: "Entrepreneurs",
  },
  {
    id: "3",
    content: "Comment j'ai généré 50 leads en 1 semaine avec LinkedIn...",
    platforms: ["facebook", "linkedin"],
    scheduledDate: new Date(Date.now() + 259200000), // Dans 3 jours
    scheduledTime: "18:00",
    status: "draft",
    type: "post",
    audience: "Commerciaux",
  },
  {
    id: "4",
    content: "Les 3 erreurs qui tuent votre visibilité LinkedIn...",
    platforms: ["linkedin"],
    scheduledDate: new Date(Date.now() - 86400000), // Hier
    scheduledTime: "10:00",
    status: "published",
    type: "post",
    audience: "Créateurs de contenu",
  },
];

// Composant de carte de post planifié
function ScheduledPostCard({ post, onEdit, onDelete }: { 
  post: ScheduledPost; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case "scheduled":
        return (
          <Badge className="bg-violet/20 text-violet">
            <Clock className="mr-1 h-3 w-3" />
            Planifié
          </Badge>
        );
      case "published":
        return (
          <Badge className="bg-green-500/20 text-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Publié
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            Échec
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500">
            <Edit className="mr-1 h-3 w-3" />
            Brouillon
          </Badge>
        );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="border-white/10 bg-white/5 transition-all hover:border-violet/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Badge variant="outline" className="border-white/20 text-xs">
                {post.type}
              </Badge>
              {post.audience && (
                <span className="text-xs text-muted-foreground">
                  • {post.audience}
                </span>
              )}
            </div>

            {/* Content preview */}
            <p className="line-clamp-2 text-sm text-white">
              {post.content}
            </p>

            {/* Platforms & Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {post.platforms.map((platform) => (
                    <div
                      key={platform}
                      className="rounded-full bg-white/10 p-1.5"
                    >
                      {getPlatformIcon(platform)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.platforms.length} plateforme{post.platforms.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(post.scheduledDate)}
                <Clock className="ml-2 h-3 w-3" />
                {post.scheduledTime}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-white"
              onClick={onEdit}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-white"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant de calendrier visuel
function CalendarView({ posts }: { posts: ScheduledPost[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getPostsForDay = (day: number) => {
    return posts.filter((post) => {
      const postDate = new Date(post.scheduledDate);
      return (
        postDate.getDate() === day &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day names */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = getPostsForDay(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`relative aspect-square cursor-pointer rounded-lg p-1 transition-colors hover:bg-white/10 ${
                  isToday ? "bg-violet/20 ring-1 ring-violet" : ""
                }`}
              >
                <span className={`text-xs ${isToday ? "font-bold text-violet" : "text-muted-foreground"}`}>
                  {day}
                </span>
                {dayPosts.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {dayPosts.slice(0, 3).map((post, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          post.status === "published"
                            ? "bg-green-500"
                            : post.status === "scheduled"
                            ? "bg-violet"
                            : "bg-yellow-500"
                        }`}
                      />
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayPosts.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-violet" />
            Planifié
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Publié
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            Brouillon
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant principal
export function PostScheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>(demoScheduledPosts);
  const [view, setView] = useState<"list" | "calendar">("list");

  const handleEdit = (postId: string) => {
    toast.info("Ouverture de l'éditeur...");
  };

  const handleDelete = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
    toast.success("Post supprimé");
  };

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Planification</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos publications sur toutes les plateformes
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg bg-white/5 p-1">
            <Button
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
            >
              Liste
            </Button>
            <Button
              size="sm"
              variant={view === "calendar" ? "secondary" : "ghost"}
              onClick={() => setView("calendar")}
            >
              Calendrier
            </Button>
          </div>
          <Button className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-violet/30 bg-violet/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-violet/20 p-3">
              <Clock className="h-5 w-5 text-violet" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{scheduledPosts.length}</p>
              <p className="text-xs text-muted-foreground">Posts planifiés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{publishedPosts.length}</p>
              <p className="text-xs text-muted-foreground">Posts publiés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-yellow-500/20 p-3">
              <Edit className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{draftPosts.length}</p>
              <p className="text-xs text-muted-foreground">Brouillons</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {view === "list" ? (
        <div className="space-y-4">
          {/* Scheduled */}
          {scheduledPosts.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Planifiés ({scheduledPosts.length})
              </h4>
              <div className="space-y-2">
                {scheduledPosts.map((post) => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post.id)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Drafts */}
          {draftPosts.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Brouillons ({draftPosts.length})
              </h4>
              <div className="space-y-2">
                {draftPosts.map((post) => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post.id)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Published */}
          {publishedPosts.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Publiés récemment ({publishedPosts.length})
              </h4>
              <div className="space-y-2">
                {publishedPosts.map((post) => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post.id)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <CalendarView posts={posts} />
      )}

      {/* Quick Actions */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-4">
          <h4 className="mb-3 font-medium text-white">Actions rapides</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-white/20">
              <Instagram className="mr-2 h-4 w-4 text-pink-500" />
              Planifier sur Instagram
            </Button>
            <Button variant="outline" size="sm" className="border-white/20">
              <Facebook className="mr-2 h-4 w-4 text-blue-500" />
              Planifier sur Facebook
            </Button>
            <Button variant="outline" size="sm" className="border-white/20">
              <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
              Planifier sur LinkedIn
            </Button>
            <Button variant="outline" size="sm" className="border-white/20">
              <Send className="mr-2 h-4 w-4" />
              Publier maintenant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
