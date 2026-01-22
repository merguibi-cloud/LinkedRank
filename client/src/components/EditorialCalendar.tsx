import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  TrendingUp,
  FileText,
  Image,
  Video,
  Sparkles,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  title: string;
  type: "text" | "carousel" | "video" | "image";
  date: Date;
  time: string;
  status: "draft" | "scheduled" | "published";
  engagement?: number;
  optimalScore?: number;
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Données de démonstration
const generateDemoData = (year: number, month: number): ScheduledPost[] => {
  const posts: ScheduledPost[] = [
    {
      id: "1",
      title: "5 conseils pour booster votre LinkedIn",
      type: "carousel",
      date: new Date(year, month, 3),
      time: "09:00",
      status: "scheduled",
      optimalScore: 92
    },
    {
      id: "2",
      title: "Mon parcours d'entrepreneur",
      type: "text",
      date: new Date(year, month, 5),
      time: "12:00",
      status: "scheduled",
      optimalScore: 87
    },
    {
      id: "3",
      title: "Tutoriel vidéo : Créer un carrousel",
      type: "video",
      date: new Date(year, month, 8),
      time: "18:00",
      status: "draft",
      optimalScore: 78
    },
    {
      id: "4",
      title: "Infographie : Statistiques LinkedIn 2024",
      type: "image",
      date: new Date(year, month, 12),
      time: "10:00",
      status: "scheduled",
      optimalScore: 95
    },
    {
      id: "5",
      title: "Les erreurs à éviter sur LinkedIn",
      type: "carousel",
      date: new Date(year, month, 15),
      time: "09:00",
      status: "scheduled",
      optimalScore: 89
    },
    {
      id: "6",
      title: "Comment j'ai atteint 10K followers",
      type: "text",
      date: new Date(year, month, 18),
      time: "08:30",
      status: "draft",
      optimalScore: 91
    },
    {
      id: "7",
      title: "Analyse de tendances du mois",
      type: "carousel",
      date: new Date(year, month, 22),
      time: "14:00",
      status: "scheduled",
      optimalScore: 85
    },
    {
      id: "8",
      title: "Behind the scenes",
      type: "video",
      date: new Date(year, month, 25),
      time: "17:00",
      status: "draft",
      optimalScore: 72
    }
  ];
  return posts;
};

// Créneaux optimaux
const OPTIMAL_SLOTS = [
  { day: 1, hour: 9, score: 95 }, // Lundi 9h
  { day: 2, hour: 12, score: 92 }, // Mardi 12h
  { day: 3, hour: 9, score: 90 }, // Mercredi 9h
  { day: 4, hour: 18, score: 88 }, // Jeudi 18h
  { day: 5, hour: 10, score: 85 }, // Vendredi 10h
];

export function EditorialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>(() => 
    generateDemoData(currentDate.getFullYear(), currentDate.getMonth())
  );
  const [draggedPost, setDraggedPost] = useState<ScheduledPost | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculer les jours du mois
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // Ajuster pour commencer lundi
  const daysInMonth = lastDayOfMonth.getDate();

  // Générer les jours à afficher
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setCurrentDate(newDate);
    setPosts(generateDemoData(newDate.getFullYear(), newDate.getMonth()));
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const postDate = new Date(post.date);
      return postDate.getDate() === day && 
             postDate.getMonth() === month && 
             postDate.getFullYear() === year;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="w-3 h-3" />;
      case "carousel": return <Sparkles className="w-3 h-3" />;
      case "video": return <Video className="w-3 h-3" />;
      case "image": return <Image className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "scheduled": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "published": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "";
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isOptimalDay = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return OPTIMAL_SLOTS.some(slot => slot.day === dayOfWeek);
  };

  const handleDragStart = (post: ScheduledPost) => {
    setDraggedPost(post);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: number) => {
    if (draggedPost) {
      const newDate = new Date(year, month, day);
      setPosts(prev => prev.map(p => 
        p.id === draggedPost.id 
          ? { ...p, date: newDate }
          : p
      ));
      toast.success(`Post déplacé au ${day} ${MONTHS[month]}`);
      setDraggedPost(null);
    }
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success("Post supprimé");
  };

  const duplicatePost = (post: ScheduledPost) => {
    const newPost = {
      ...post,
      id: `${post.id}_copy_${Date.now()}`,
      title: `${post.title} (copie)`,
      status: "draft" as const
    };
    setPosts(prev => [...prev, newPost]);
    toast.success("Post dupliqué");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Calendrier éditorial</h2>
          <p className="text-muted-foreground">
            Planifiez et organisez vos publications LinkedIn
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode("week")}>
            Semaine
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("month")}>
            Mois
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau post
          </Button>
        </div>
      </div>

      {/* Navigation du mois */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h3 className="text-xl font-bold">
              {MONTHS[month]} {year}
            </h3>
            
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Créneau optimal</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Planifié</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Brouillon</Badge>
        </div>
      </div>

      {/* Calendrier */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-border/30">
            {DAYS.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayPosts = day ? getPostsForDay(day) : [];
              const isOptimal = day ? isOptimalDay(day) : false;
              
              return (
                <motion.div
                  key={index}
                  className={`min-h-[120px] md:min-h-[140px] border-b border-r border-border/30 p-2 transition-colors ${
                    day ? "hover:bg-secondary/20 cursor-pointer" : "bg-secondary/5"
                  } ${isToday(day || 0) ? "bg-primary/10" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={() => day && handleDrop(day)}
                  onClick={() => day && setSelectedDate(new Date(year, month, day))}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          isToday(day) ? "text-primary" : ""
                        }`}>
                          {day}
                        </span>
                        {isOptimal && (
                          <div className="w-2 h-2 rounded-full bg-green-500" title="Créneau optimal" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map((post) => (
                          <motion.div
                            key={post.id}
                            draggable
                            onDragStart={() => handleDragStart(post)}
                            className={`p-1.5 rounded text-xs cursor-move ${getStatusColor(post.status)} border`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-1">
                              {getTypeIcon(post.type)}
                              <span className="truncate flex-1">{post.title}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="w-4 h-4 p-0">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Voir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicatePost(post)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Dupliquer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-500"
                                    onClick={() => deletePost(post.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[10px] opacity-70">
                              <Clock className="w-2.5 h-2.5" />
                              {post.time}
                              {post.optimalScore && (
                                <>
                                  <TrendingUp className="w-2.5 h-2.5 ml-1" />
                                  {post.optimalScore}%
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayPosts.length - 2} autres
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Créneaux optimaux suggérés */}
      <Card className="glass-card border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Créneaux optimaux cette semaine
          </CardTitle>
          <CardDescription>
            Basé sur l'analyse de votre audience et des tendances LinkedIn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {OPTIMAL_SLOTS.map((slot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center"
              >
                <p className="font-medium text-green-500">
                  {DAYS[slot.day - 1]}
                </p>
                <p className="text-2xl font-bold">{slot.hour}h</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {slot.score}% optimal
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du mois */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Posts planifiés</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">
              {posts.filter(p => p.status === "scheduled").length}
            </p>
            <p className="text-sm text-muted-foreground">Programmés</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">
              {posts.filter(p => p.status === "draft").length}
            </p>
            <p className="text-sm text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {Math.round(posts.reduce((acc, p) => acc + (p.optimalScore || 0), 0) / posts.length)}%
            </p>
            <p className="text-sm text-muted-foreground">Score moyen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditorialCalendar;
