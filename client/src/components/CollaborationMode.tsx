import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Share2, 
  Link, 
  Copy, 
  MessageSquare, 
  Clock,
  Check,
  X,
  Send,
  Users,
  Eye,
  Edit,
  History,
  Mail,
  Linkedin,
  Twitter,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline";
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

interface Version {
  id: string;
  author: string;
  timestamp: Date;
  changes: string;
}

interface SharedDraft {
  id: string;
  title: string;
  content: string;
  status: "draft" | "review" | "approved" | "rejected";
  shareLink: string;
  collaborators: Collaborator[];
  comments: Comment[];
  versions: Version[];
  createdAt: Date;
  updatedAt: Date;
}

// Données de démonstration
const DEMO_DRAFTS: SharedDraft[] = [
  {
    id: "1",
    title: "Post sur l'IA générative",
    content: `🤖 L'IA générative va transformer votre façon de travailler.

Voici 5 cas d'usage concrets que j'utilise au quotidien :

1️⃣ Rédaction de contenus
→ Gain de temps : 3h/semaine

2️⃣ Analyse de données
→ Insights en quelques secondes

3️⃣ Création de visuels
→ Plus besoin de designer

4️⃣ Automatisation des emails
→ Réponses personnalisées

5️⃣ Brainstorming
→ Idées illimitées

Le plus important : l'IA ne remplace pas, elle amplifie.

Quel outil IA utilisez-vous le plus ?`,
    status: "review",
    shareLink: "https://linkedagents.com/share/abc123",
    collaborators: [
      { id: "1", name: "Youssef K.", avatar: "", role: "owner", status: "online" },
      { id: "2", name: "Marie D.", avatar: "", role: "editor", status: "online" },
      { id: "3", name: "Thomas M.", avatar: "", role: "viewer", status: "offline" }
    ],
    comments: [
      {
        id: "c1",
        author: "Marie D.",
        avatar: "",
        content: "Super post ! Je suggère d'ajouter un exemple concret pour le point 2.",
        timestamp: new Date(Date.now() - 3600000),
        resolved: false
      },
      {
        id: "c2",
        author: "Thomas M.",
        avatar: "",
        content: "Le hook est accrocheur, j'adore !",
        timestamp: new Date(Date.now() - 7200000),
        resolved: true
      }
    ],
    versions: [
      { id: "v1", author: "Youssef K.", timestamp: new Date(Date.now() - 86400000), changes: "Version initiale" },
      { id: "v2", author: "Marie D.", timestamp: new Date(Date.now() - 43200000), changes: "Ajout des emojis" },
      { id: "v3", author: "Youssef K.", timestamp: new Date(Date.now() - 3600000), changes: "Reformulation du CTA" }
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: "2",
    title: "Retour d'expérience startup",
    content: `🚀 3 ans de startup : ce que j'aurais aimé savoir au départ.

Thread 🧵

1/ Le produit parfait n'existe pas
→ Lancez vite, itérez souvent

2/ Les premiers clients sont les plus précieux
→ Écoutez-les religieusement

3/ Le cash est roi
→ Gardez toujours 6 mois de runway

4/ L'équipe fait tout
→ Recrutez lentement, virez vite

5/ Le networking n'est pas optionnel
→ Votre réseau = votre valeur

La vérité ? C'est plus dur que prévu, mais tellement gratifiant.

Quelle leçon ajouteriez-vous ?`,
    status: "approved",
    shareLink: "https://linkedagents.com/share/def456",
    collaborators: [
      { id: "1", name: "Youssef K.", avatar: "", role: "owner", status: "online" },
      { id: "4", name: "Sophie B.", avatar: "", role: "editor", status: "offline" }
    ],
    comments: [
      {
        id: "c3",
        author: "Sophie B.",
        avatar: "",
        content: "Parfait, prêt à publier !",
        timestamp: new Date(Date.now() - 1800000),
        resolved: true
      }
    ],
    versions: [
      { id: "v1", author: "Youssef K.", timestamp: new Date(Date.now() - 172800000), changes: "Brouillon initial" },
      { id: "v2", author: "Sophie B.", timestamp: new Date(Date.now() - 86400000), changes: "Corrections orthographiques" }
    ],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 1800000)
  }
];

export function CollaborationMode() {
  const [drafts, setDrafts] = useState<SharedDraft[]>(DEMO_DRAFTS);
  const [selectedDraft, setSelectedDraft] = useState<SharedDraft | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Lien de partage copié !");
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedDraft) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: "Youssef K.",
      avatar: "",
      content: newComment,
      timestamp: new Date(),
      resolved: false
    };

    setDrafts(prev => prev.map(d => 
      d.id === selectedDraft.id 
        ? { ...d, comments: [...d.comments, comment] }
        : d
    ));
    setSelectedDraft(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    setNewComment("");
    toast.success("Commentaire ajouté !");
  };

  const resolveComment = (commentId: string) => {
    if (!selectedDraft) return;
    
    setDrafts(prev => prev.map(d => 
      d.id === selectedDraft.id 
        ? { 
            ...d, 
            comments: d.comments.map(c => 
              c.id === commentId ? { ...c, resolved: !c.resolved } : c
            )
          }
        : d
    ));
    setSelectedDraft(prev => prev ? {
      ...prev,
      comments: prev.comments.map(c => 
        c.id === commentId ? { ...c, resolved: !c.resolved } : c
      )
    } : null);
  };

  const inviteCollaborator = () => {
    if (!inviteEmail.trim()) return;
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500/20 text-gray-500";
      case "review": return "bg-amber-500/20 text-amber-500";
      case "approved": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      default: return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "review": return "En révision";
      case "approved": return "Approuvé";
      case "rejected": return "Rejeté";
      default: return status;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "À l'instant";
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mode Collaboration</h2>
          <p className="text-muted-foreground">
            Partagez vos brouillons et recevez des feedbacks avant publication
          </p>
        </div>
        
        <Button className="gap-2" onClick={() => setShowShareModal(true)}>
          <Share2 className="w-4 h-4" />
          Nouveau partage
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{drafts.length}</p>
            <p className="text-xs text-muted-foreground">Brouillons partagés</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {drafts.filter(d => d.status === "review").length}
            </p>
            <p className="text-xs text-muted-foreground">En révision</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {drafts.filter(d => d.status === "approved").length}
            </p>
            <p className="text-xs text-muted-foreground">Approuvés</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {drafts.reduce((acc, d) => acc + d.comments.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Commentaires</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Liste des brouillons */}
        <div className="space-y-4">
          <h3 className="font-semibold">Mes brouillons partagés</h3>
          
          {drafts.map((draft) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                className={`glass-card cursor-pointer transition-all hover:border-primary/50 ${
                  selectedDraft?.id === draft.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedDraft(draft)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{draft.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Mis à jour {formatTimeAgo(draft.updatedAt)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(draft.status)}>
                      {getStatusLabel(draft.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {draft.content.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {draft.collaborators.slice(0, 3).map((collab) => (
                        <Avatar key={collab.id} className="w-6 h-6 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {collab.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {draft.collaborators.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                          +{draft.collaborators.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {draft.comments.filter(c => !c.resolved).length}
                      </span>
                      <span className="flex items-center gap-1">
                        <History className="w-3 h-3" />
                        v{draft.versions.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Détail du brouillon sélectionné */}
        <div className="space-y-4">
          {selectedDraft ? (
            <>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedDraft.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyShareLink(selectedDraft.shareLink)}>
                          <Link className="w-4 h-4 mr-2" />
                          Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {selectedDraft.content}
                    </pre>
                  </div>

                  {/* Lien de partage */}
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg mb-4">
                    <Link className="w-4 h-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{selectedDraft.shareLink}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyShareLink(selectedDraft.shareLink)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Collaborateurs */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Collaborateurs ({selectedDraft.collaborators.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedDraft.collaborators.map((collab) => (
                        <div key={collab.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>
                                  {collab.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                                collab.status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{collab.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{collab.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Inviter */}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Email du collaborateur"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={inviteCollaborator}>
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commentaires */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Commentaires ({selectedDraft.comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {selectedDraft.comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg ${
                          comment.resolved ? "bg-green-500/10 border border-green-500/30" : "bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {comment.author.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => resolveComment(comment.id)}
                          >
                            {comment.resolved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Ajouter un commentaire */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button onClick={addComment} className="self-end">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Historique des versions */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historique ({selectedDraft.versions.length} versions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedDraft.versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            v{selectedDraft.versions.length - index}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{version.changes}</p>
                            <p className="text-xs text-muted-foreground">
                              {version.author} • {formatTimeAgo(version.timestamp)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="glass-card h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Sélectionnez un brouillon pour voir les détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborationMode;
