import { useState } from "react";
import { MediaUploadZone } from "@/components/MediaLibraryPicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FolderOpen,
  Sparkles,
  Trash2,
  Loader2,
  ImageIcon,
  Film,
  FileText,
  Wand2,
  Send,
  Pencil,
  RefreshCw,
} from "lucide-react";

type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  tags: string[];
  fileUrl: string;
  fileName: string;
  mediaType: "image" | "video" | "document";
  aiDescription: string | null;
  aiSuggestedTheme: string | null;
  usageCount: number | null;
  createdAt: Date;
};

const TYPE_LABELS = { image: "Image", video: "Vidéo", document: "Document" };
const TYPE_ICONS = { image: ImageIcon, video: Film, document: FileText };

export function MediaLibraryPanel() {
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document">("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [suggestedPosts, setSuggestedPosts] = useState<Array<{
    id: number;
    title: string;
    content: string;
    hashtags: string[];
    imageUrl: string;
    mediaId: number;
    mediaTitle: string | null;
  }>>([]);

  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.mediaLibrary.list.useQuery({
    limit: 100,
    mediaType: filter === "all" ? undefined : filter,
  });

  const deleteMutation = trpc.mediaLibrary.delete.useMutation({
    onSuccess: () => {
      utils.mediaLibrary.list.invalidate();
      setSelectedMedia(null);
      toast.success("Média supprimé");
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.mediaLibrary.update.useMutation({
    onSuccess: updated => {
      utils.mediaLibrary.list.invalidate();
      setSelectedMedia(updated as MediaItem);
      toast.success("Média mis à jour");
    },
    onError: e => toast.error(e.message),
  });

  const reanalyzeMutation = trpc.mediaLibrary.reanalyze.useMutation({
    onSuccess: updated => {
      utils.mediaLibrary.list.invalidate();
      setSelectedMedia(updated as MediaItem);
      toast.success("Analyse IA mise à jour");
    },
    onError: e => toast.error(e.message),
  });

  const generatePostMutation = trpc.mediaLibrary.generatePost.useMutation({
    onSuccess: post => {
      toast.success("Publication générée !", {
        description: "Redirection vers le générateur...",
      });
      sessionStorage.setItem("linkedrank-draft-post", JSON.stringify(post));
      window.location.href = "/generate";
    },
    onError: e => toast.error(e.message),
  });

  const suggestMutation = trpc.mediaLibrary.suggestPosts.useMutation({
    onSuccess: posts => {
      setSuggestedPosts(posts);
      toast.success(`${posts.length} publication(s) proposée(s) par l'IA`);
    },
    onError: e => toast.error(e.message),
  });

  const items = (data?.items ?? []) as MediaItem[];

  const openEdit = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditTitle(item.title ?? "");
    setEditDescription(item.description ?? "");
  };

  const handleSaveEdit = () => {
    if (!selectedMedia) return;
    updateMutation.mutate({
      id: selectedMedia.id,
      title: editTitle,
      description: editDescription,
    });
  };

  const useSuggestedPost = (post: typeof suggestedPosts[0]) => {
    sessionStorage.setItem("linkedrank-draft-post", JSON.stringify(post));
    window.location.href = "/generate";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-500" />
            Médiathèque
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Téléversez vos visuels et laissez l&apos;IA créer des publications LinkedIn
          </p>
        </div>
        <Button
          onClick={() => suggestMutation.mutate({ count: 3 })}
          disabled={suggestMutation.isPending || items.length === 0}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
        >
          {suggestMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Proposer des publications IA
        </Button>
      </div>

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Ma bibliothèque ({data?.total ?? 0})</TabsTrigger>
          <TabsTrigger value="upload">Téléverser</TabsTrigger>
          {suggestedPosts.length > 0 && (
            <TabsTrigger value="suggestions">
              Suggestions IA ({suggestedPosts.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader>
              <CardTitle>Téléverser des médias</CardTitle>
              <CardDescription>
                Ajoutez images, vidéos ou documents. L&apos;IA analysera automatiquement vos visuels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploadZone onUploaded={() => refetch()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["all", "image", "video", "document"] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Tous" : TYPE_LABELS[f]}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="bg-card/50 border-amber-900/30">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Votre médiathèque est vide</p>
                <MediaUploadZone compact onUploaded={() => refetch()} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map(item => {
                const Icon = TYPE_ICONS[item.mediaType];
                return (
                  <Card
                    key={item.id}
                    className="bg-card/50 border-amber-900/20 overflow-hidden group cursor-pointer hover:border-amber-700/40 transition-colors"
                    onClick={() => openEdit(item)}
                  >
                    <div className="aspect-square relative">
                      {item.mediaType === "image" ? (
                        <img
                          src={item.fileUrl}
                          alt={item.title ?? item.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center">
                          <Icon className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation();
                            generatePostMutation.mutate({ mediaId: item.id });
                          }}
                          disabled={generatePostMutation.isPending}
                        >
                          <Sparkles className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm("Supprimer ce média ?")) {
                              deleteMutation.mutate({ id: item.id });
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{item.title ?? item.fileName}</p>
                      {item.aiDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {item.aiDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {TYPE_LABELS[item.mediaType]}
                        </Badge>
                        {(item.usageCount ?? 0) > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {item.usageCount}× utilisé
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {suggestedPosts.length > 0 && (
          <TabsContent value="suggestions" className="mt-4 space-y-4">
            {suggestedPosts.map(post => (
              <Card key={post.id} className="bg-card/50 border-amber-900/30">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full sm:w-40 h-40 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          {post.mediaTitle && (
                            <p className="text-xs text-muted-foreground">
                              Basé sur : {post.mediaTitle}
                            </p>
                          )}
                        </div>
                        <Button size="sm" onClick={() => useSuggestedPost(post)}>
                          <Send className="w-3 h-3 mr-1" /> Utiliser
                        </Button>
                      </div>
                      <p className="text-sm mt-2 whitespace-pre-wrap line-clamp-4">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!selectedMedia} onOpenChange={open => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du média</DialogTitle>
            <DialogDescription>Modifiez les informations ou générez une publication</DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.mediaType === "image" && (
                <img
                  src={selectedMedia.fileUrl}
                  alt={selectedMedia.title ?? ""}
                  className="w-full rounded-lg max-h-48 object-contain bg-muted/20"
                />
              )}
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={2}
                />
              </div>
              {selectedMedia.aiDescription && (
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/30">
                  <p className="text-xs font-medium text-purple-300 mb-1">Analyse IA</p>
                  <p className="text-sm text-muted-foreground">{selectedMedia.aiDescription}</p>
                  {selectedMedia.aiSuggestedTheme && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Thème suggéré : {selectedMedia.aiSuggestedTheme}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  <Pencil className="w-3 h-3 mr-1" /> Enregistrer
                </Button>
                {selectedMedia.mediaType === "image" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reanalyzeMutation.mutate({ id: selectedMedia.id })}
                    disabled={reanalyzeMutation.isPending}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Ré-analyser
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500"
                  onClick={() => generatePostMutation.mutate({ mediaId: selectedMedia.id })}
                  disabled={generatePostMutation.isPending}
                >
                  {generatePostMutation.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Générer une publication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
