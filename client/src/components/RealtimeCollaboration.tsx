import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Edit3, 
  Eye, 
  MessageSquare,
  Send,
  Copy,
  Link,
  Check,
  Clock,
  Sparkles,
  UserPlus,
  Crown,
  Pencil
} from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  role: "owner" | "editor" | "viewer";
  isOnline: boolean;
  cursorPosition?: { line: number; char: number };
  lastActive?: string;
}

interface Comment {
  id: string;
  author: Collaborator;
  text: string;
  timestamp: string;
  resolved?: boolean;
}

const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: "1",
    name: "Youssef K.",
    color: "#8B5CF6",
    role: "owner",
    isOnline: true,
    cursorPosition: { line: 3, char: 45 }
  },
  {
    id: "2",
    name: "Marie D.",
    avatar: "https://i.pravatar.cc/150?img=1",
    color: "#EC4899",
    role: "editor",
    isOnline: true,
    cursorPosition: { line: 7, char: 12 }
  },
  {
    id: "3",
    name: "Thomas M.",
    avatar: "https://i.pravatar.cc/150?img=3",
    color: "#10B981",
    role: "editor",
    isOnline: false,
    lastActive: "Il y a 5 min"
  },
  {
    id: "4",
    name: "Sophie B.",
    avatar: "https://i.pravatar.cc/150?img=5",
    color: "#F59E0B",
    role: "viewer",
    isOnline: true
  }
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: MOCK_COLLABORATORS[1],
    text: "Super accroche ! Peut-être ajouter un emoji au début ?",
    timestamp: "Il y a 2 min"
  },
  {
    id: "2",
    author: MOCK_COLLABORATORS[2],
    text: "Le CTA est un peu faible, on pourrait le renforcer",
    timestamp: "Il y a 10 min",
    resolved: true
  }
];

const SAMPLE_POST = `🚀 3 leçons que j'aurais aimé apprendre plus tôt dans ma carrière

Après 10 ans dans le digital, voici ce que je retiens :

1️⃣ Le réseau > Les compétences
Vous pouvez être le meilleur dans votre domaine, sans réseau vous n'irez nulle part.

2️⃣ Échouer vite = Apprendre vite
Chaque échec est une leçon déguisée. Embrassez-les.

3️⃣ La constance bat le talent
Publier régulièrement > Publier parfaitement

Quelle leçon vous a le plus marqué ?

#Carrière #LinkedIn #Entrepreneuriat`;

export function RealtimeCollaboration() {
  const [content, setContent] = useState(SAMPLE_POST);
  const [collaborators] = useState(MOCK_COLLABORATORS);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simuler les curseurs des autres utilisateurs
  const [remoteCursors, setRemoteCursors] = useState<{[key: string]: { x: number; y: number }}>({});

  useEffect(() => {
    // Simuler le mouvement des curseurs
    const interval = setInterval(() => {
      setRemoteCursors({
        "2": { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 },
        "4": { x: Math.random() * 400 + 50, y: Math.random() * 200 + 100 }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://linkedagents.com/collab/abc123");
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: MOCK_COLLABORATORS[0],
      text: newComment,
      timestamp: "À l'instant"
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Commentaire ajouté");
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail("");
    setShowInvite(false);
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Crown className="w-3 h-3 text-amber-500" />;
    if (role === "editor") return <Pencil className="w-3 h-3 text-blue-500" />;
    return <Eye className="w-3 h-3 text-muted-foreground" />;
  };

  const getRoleBadge = (role: string) => {
    if (role === "owner") return <Badge className="bg-amber-500/20 text-amber-500 text-xs">Propriétaire</Badge>;
    if (role === "editor") return <Badge className="bg-blue-500/20 text-blue-500 text-xs">Éditeur</Badge>;
    return <Badge variant="outline" className="text-xs">Lecteur</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Collaboration en temps réel
          </h2>
          <p className="text-sm text-muted-foreground">
            Éditez ensemble comme sur Google Docs
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Avatars des collaborateurs */}
          <div className="flex -space-x-2">
            {collaborators.filter(c => c.isOnline).map((collab) => (
              <div key={collab.id} className="relative">
                <Avatar className="w-8 h-8 border-2 border-background" style={{ borderColor: collab.color }}>
                  <AvatarImage src={collab.avatar} />
                  <AvatarFallback style={{ backgroundColor: collab.color }} className="text-white text-xs">
                    {collab.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Link className="w-4 h-4 mr-2" />}
            {copied ? "Copié !" : "Partager"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone d'édition principale */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Brouillon collaboratif
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Sauvegardé automatiquement
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {/* Curseurs des autres utilisateurs */}
              <AnimatePresence>
                {Object.entries(remoteCursors).map(([userId, pos]) => {
                  const user = collaborators.find(c => c.id === userId);
                  if (!user || !user.isOnline) return null;
                  
                  return (
                    <motion.div
                      key={userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, x: pos.x, y: pos.y }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", damping: 30 }}
                      className="absolute pointer-events-none z-10"
                      style={{ left: 0, top: 0 }}
                    >
                      <div className="flex items-start gap-1">
                        <div 
                          className="w-0.5 h-5 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded text-white whitespace-nowrap"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
                placeholder="Commencez à écrire votre post..."
              />

              {/* Indicateur de caractères */}
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{content.length} caractères</span>
                <span className={content.length > 3000 ? "text-red-500" : ""}>
                  {content.length > 3000 ? "Trop long pour LinkedIn" : "Longueur optimale"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaires ({comments.filter(c => !c.resolved).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Nouveau commentaire */}
              <div className="flex gap-2 mb-4">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <Button size="icon" onClick={handleAddComment}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Liste des commentaires */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${comment.resolved ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback style={{ backgroundColor: comment.author.color }} className="text-white text-xs">
                          {comment.author.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          {comment.resolved && (
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Résolu
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Collaborateurs */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Collaborateurs ({collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={collab.avatar} />
                          <AvatarFallback style={{ backgroundColor: collab.color }} className="text-white">
                            {collab.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${collab.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{collab.name}</span>
                          {getRoleIcon(collab.role)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {collab.isOnline ? (
                            <span className="text-green-500">En ligne</span>
                          ) : (
                            collab.lastActive
                          )}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(collab.role)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historique des versions */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: "À l'instant", author: "Youssef K.", action: "Modification du CTA" },
                  { time: "Il y a 5 min", author: "Marie D.", action: "Ajout d'emojis" },
                  { time: "Il y a 15 min", author: "Thomas M.", action: "Correction orthographe" },
                  { time: "Il y a 1h", author: "Youssef K.", action: "Création du brouillon" }
                ].map((version, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-medium">{version.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {version.author} • {version.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Voir tout l'historique
              </Button>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Améliorer avec l'IA
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Dupliquer le brouillon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Inviter un collaborateur
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collegue@email.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Rôle</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <Pencil className="w-4 h-4 mr-2 text-blue-500" />
                    Éditeur
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Lecteur
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleInvite}>
                  Envoyer l'invitation
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default RealtimeCollaboration;
