import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLinkedInConnectUrl, getSignupUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LinkedInConnectBanner } from "@/components/LinkedInConnectBanner";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  Save,
  Send,
  User,
  Building2,
  Target,
  Lightbulb,
  Globe,
  Briefcase,
  ArrowLeft,
  Linkedin,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Calendar,
  Clock,
  FolderOpen,
  Zap,
  Layers,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDateInput, getDefaultScheduleTime, buildScheduledAtIso } from "@/lib/scheduleUtils";
import { isGuidedMode } from "@/lib/gettingStartedJourney";
import { MediaLibraryPicker, MediaUploadZone } from "@/components/MediaLibraryPicker";
import { AI_IMAGE_FORMATS, AI_IMAGE_STYLES, type AiImageFormatId, type AiImageStyleId } from "@/lib/aiImageStyles";
import { CAROUSEL_STYLES, CAROUSEL_SLIDE_COUNTS, type CarouselStyleId } from "@/lib/carouselOptions";

const GettingStartedJourney = lazy(() =>
  import("@/components/GettingStartedJourney").then((m) => ({
    default: m.GettingStartedJourney,
  }))
);

type Post = {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  suggestedMedia?: string;
  callToAction?: string;
};

type ContentType = "post" | "carousel";

type WorkflowStep =
  | "configure"
  | "image"
  | "choose-automation"
  | "configure-automation"
  | "publish";

const STEPS: { id: WorkflowStep; label: string; icon: typeof Lightbulb }[] = [
  { id: "configure", label: "Configurer", icon: Lightbulb },
  { id: "image", label: "Créer le visuel", icon: ImageIcon },
  { id: "choose-automation", label: "Choisir l'automatisation", icon: Zap },
  { id: "configure-automation", label: "Configurer l'automatisation", icon: Calendar },
  { id: "publish", label: "Publier", icon: Send },
];

export default function Generator() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const guided = isGuidedMode();
  const login = () => { window.location.href = getSignupUrl("/generate?guided=1"); };
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [contentType, setContentType] = useState<ContentType | null>(null);
  const isCarousel = contentType === "carousel";

  const [carouselTopic, setCarouselTopic] = useState("");
  const [carouselSlideCount, setCarouselSlideCount] = useState(7);
  const [carouselStyle, setCarouselStyle] = useState<CarouselStyleId>("modern");
  const [carouselAuthorTitle, setCarouselAuthorTitle] = useState("");
  const [carouselImageUrls, setCarouselImageUrls] = useState<string[]>([]);
  const [carouselSlideIndex, setCarouselSlideIndex] = useState(0);

  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "inspirational" | "educational" | "provocative">("inspirational");
  const [language, setLanguage] = useState<"FR" | "EN" | "AR" | "ES" | "DE">("FR");
  const [postType, setPostType] = useState<"story" | "tips" | "question" | "announcement" | "motivation" | "insight">("motivation");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [batchCount, setBatchCount] = useState(3);

  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("configure");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState(getDefaultScheduleTime().date);
  const [scheduleTime, setScheduleTime] = useState(getDefaultScheduleTime().time);
  const [scheduling, setScheduling] = useState(false);
  const [imageSource, setImageSource] = useState<"ai" | "library">("library");
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [mediaSuggestionsApplied, setMediaSuggestionsApplied] = useState(false);
  const [aiImageStyle, setAiImageStyle] = useState<AiImageStyleId>("professional");
  const [aiImageFormat, setAiImageFormat] = useState<AiImageFormatId>("1536x1024");

  // Charger un brouillon depuis la médiathèque
  useEffect(() => {
    const draft = sessionStorage.getItem("linkedrank-draft-post");
    if (!draft) return;
    try {
      const post = JSON.parse(draft) as Post & { imageUrl?: string; mediaId?: number };
      sessionStorage.removeItem("linkedrank-draft-post");
      // Drafts pushed from Carousels.tsx's "Utiliser" carry a "carrousel" tag
      // so this gate-skipping load lands on the right content type.
      const isDraftCarousel = post.hashtags?.includes("carrousel") ?? false;
      setContentType(isDraftCarousel ? "carousel" : "post");
      if (isDraftCarousel && post.imageUrl) {
        setCarouselImageUrls([post.imageUrl]);
        setCarouselSlideIndex(0);
      }
      setGeneratedPosts(prev => [post, ...prev]);
      setActivePost(post);
      setEditedContent(post.content);
      setEditedHashtags(post.hashtags ?? []);
      if (post.imageUrl) {
        setImageUrl(post.imageUrl);
        setImageSource("library");
        if (post.mediaId) setSelectedMediaId(post.mediaId);
        setWorkflowStep("choose-automation");
      } else {
        setWorkflowStep("configure");
      }
      toast.success("Publication chargée depuis la médiathèque");
    } catch {
      sessionStorage.removeItem("linkedrank-draft-post");
    }
  }, []);

  // Charger un template depuis la bibliothèque
  useEffect(() => {
    const template = sessionStorage.getItem("selectedTemplate");
    if (!template) return;
    sessionStorage.removeItem("selectedTemplate");
    setAdditionalInstructions(
      `Adapte ce template à mon profil et génère un post LinkedIn complet:\n\n${template}`
    );
    toast.success("Template chargé — configurez puis générez votre post");
  }, []);

  const { data: options } = trpc.generator.options.useQuery();
  const { data: profile } = trpc.profile.get.useQuery(undefined, { enabled: !!user });

  const { data: mediaSuggestions, isLoading: isLoadingSuggestions } =
    trpc.mediaLibrary.suggestForPost.useQuery(
      {
        content: editedContent,
        title: activePost?.title ?? "Post LinkedIn",
        limit: 6,
      },
      {
        enabled:
          !!user &&
          workflowStep === "image" &&
          editedContent.length >= 10 &&
          !!activePost,
      }
    );

  useEffect(() => {
    if (!mediaSuggestions || mediaSuggestionsApplied || workflowStep !== "image") return;

    setMediaSuggestionsApplied(true);

    if (mediaSuggestions.hasRelevantMatch && mediaSuggestions.suggestions[0]) {
      const top = mediaSuggestions.suggestions[0];
      setSelectedMediaId(top.id);
      setImageUrl(top.fileUrl);
      setImageSource("library");
    } else if (mediaSuggestions.suggestions.length === 0) {
      setImageSource("ai");
    }
  }, [mediaSuggestions, mediaSuggestionsApplied, workflowStep]);

  const startWorkflow = (post: Post) => {
    setContentType("post");
    setActivePost(post);
    setEditedContent(post.content);
    setEditedHashtags(post.hashtags ?? []);
    setImageUrl(null);
    setImageKey(null);
    setImagePrompt(null);
    setSelectedMediaId(null);
    setImageSource("library");
    setMediaSuggestionsApplied(false);
    setWorkflowStep("configure");
  };

  const generateMutation = trpc.generator.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedPosts(prev => [data, ...prev]);
      startWorkflow(data);
      void utils.generator.myPosts.invalidate();
      if (isGuidedMode()) {
        toast.success("Premier post créé !", {
          description: "Passez à l'automatisation pour publier régulièrement.",
          action: {
            label: "Étape suivante",
            onClick: () => setLocation("/auto-publish?guided=1"),
          },
        });
      } else {
        toast.success("Post généré ! Relisez-le avant de continuer.");
      }
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const generateBatchMutation = trpc.generator.generateBatch.useMutation({
    onSuccess: (data) => {
      setGeneratedPosts(prev => [...data, ...prev]);
      if (data[0]) startWorkflow(data[0]);
      void utils.generator.myPosts.invalidate();
      if (isGuidedMode() && data[0]) {
        toast.success("Premier post créé !", {
          action: {
            label: "Activer l'automatisation",
            onClick: () => setLocation("/auto-publish?guided=1"),
          },
        });
      } else {
        toast.success(`${data.length} posts générés !`);
      }
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  // Un carrousel est généré en un seul appel (texte + visuels des slides déjà
  // prêts) — on le traite ensuite comme un post normal pour l'édition,
  // l'automatisation et la publication, avec la 1ère slide comme image.
  const generateCarouselMutation = trpc.carousels.generate.useMutation({
    onSuccess: (data) => {
      const caption = data.slides
        .map(
          (slide: { title?: string; content?: string }, index: number) =>
            `${index + 1}. ${slide.title || "Slide"}\n${slide.content || ""}`
        )
        .join("\n\n")
        .slice(0, 2800);

      setCarouselImageUrls(data.imageUrls);
      setCarouselSlideIndex(0);
      setActivePost({
        id: data.id,
        title: carouselTopic || "Carrousel LinkedIn",
        content: caption,
        hashtags: ["carrousel", "linkedin"],
      });
      setEditedContent(caption);
      setEditedHashtags(["carrousel", "linkedin"]);
      setImageUrl(data.imageUrls[0] ?? null);
      setImageKey(null);
      setImagePrompt(null);
      setSelectedMediaId(null);
      toast.success(`Carrousel généré ! ${data.slides.length} slides créées.`);
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const savePostMutation = trpc.generator.savePost.useMutation({
    onSuccess: () => toast.success("Post sauvegardé"),
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  const syncPostAssets = (postId: number, status?: "saved" | "scheduled" | "published") => {
    savePostMutation.mutate({
      id: postId,
      content: editedContent,
      ...(status ? { status } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(imageKey ? { imageKey } : {}),
      ...(imagePrompt ? { imagePrompt } : {}),
      ...(selectedMediaId ? { mediaLibraryId: selectedMediaId } : {}),
    });
  };

  const generateImageMutation = trpc.generator.generatePostImage.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.imageUrl);
      setImageKey(data.imageKey);
      setImagePrompt(data.prompt);
      setSelectedMediaId(data.mediaLibraryId);
      setImageSource("ai");
      if (activePost) {
        syncPostAssets(activePost.id);
      }
      toast.success("Image générée et enregistrée dans votre médiathèque");
    },
    onError: (error) => toast.error(`Erreur image: ${error.message}`),
  });

  const handleGenerate = () => {
    if (!theme) { toast.error("Veuillez sélectionner une thématique"); return; }
    generateMutation.mutate({ theme, tone, language, postType, additionalInstructions: additionalInstructions || undefined });
  };

  const handleGenerateBatch = () => {
    if (!theme) { toast.error("Veuillez sélectionner une thématique"); return; }
    generateBatchMutation.mutate({ theme, tone, language, count: batchCount, additionalInstructions: additionalInstructions || undefined });
  };

  const handleGenerateCarousel = () => {
    if (!carouselTopic.trim()) { toast.error("Veuillez entrer un sujet"); return; }
    generateCarouselMutation.mutate({
      topic: carouselTopic.trim(),
      slideCount: carouselSlideCount,
      style: carouselStyle,
      authorTitle: carouselAuthorTitle || undefined,
    });
  };

  const copyToClipboard = async (content: string, id: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    if (!activePost) return;
    savePostMutation.mutate({ id: activePost.id, content: editedContent, status: "saved" });
  };

  const handleGenerateImage = () => {
    if (!activePost) return;
    generateImageMutation.mutate({
      content: editedContent,
      title: activePost.title,
      suggestedMedia: activePost.suggestedMedia,
      visualStyle: aiImageStyle,
      imageSize: aiImageFormat,
      generatedPostId: activePost.id,
    });
  };

  const handlePublish = async () => {
    if (!user) { toast.error("Connectez-vous pour publier"); return; }
    setPublishing(true);
    try {
      const response = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: editedContent,
          hashtags: editedHashtags,
          imageUrl: imageUrl ?? undefined,
          generatedPostId: isCarousel ? undefined : activePost?.id,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Post publié sur LinkedIn !");
        if (activePost && !isCarousel) {
          syncPostAssets(activePost.id, "published");
        }
        setWorkflowStep("configure");
        setActivePost(null);
        setCarouselImageUrls([]);
        setCarouselSlideIndex(0);
      } else if (data.error?.includes("LinkedIn not connected")) {
        toast.info("Connectez LinkedIn pour publier");
        window.location.href = getLinkedInConnectUrl("/generate");
      } else {
        toast.error(data.error || "Erreur lors de la publication");
      }
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!user) { toast.error("Connectez-vous pour planifier"); return; }
    setScheduling(true);
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: editedContent,
          imageUrl: imageUrl ?? undefined,
          imageKey: imageKey ?? undefined,
          mediaLibraryId: selectedMediaId ?? undefined,
          date: scheduleDate,
          time: scheduleTime,
          scheduledAt: buildScheduledAtIso(scheduleDate, scheduleTime),
          generatedPostId: activePost?.id,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Post planifié ! Il sera publié automatiquement.");
        if (activePost && !isCarousel) {
          syncPostAssets(activePost.id, "scheduled");
        }
        setWorkflowStep("configure");
        setActivePost(null);
        setCarouselImageUrls([]);
        setCarouselSlideIndex(0);
      } else {
        toast.error(data.error || "Erreur lors de la planification");
      }
    } catch {
      toast.error("Erreur lors de la planification");
    } finally {
      setScheduling(false);
    }
  };

  const isLoading = generateMutation.isPending || generateBatchMutation.isPending;
  const stepIndex = STEPS.findIndex(s => s.id === workflowStep);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-violet/20 bg-gradient-to-r from-violet/10 to-transparent">
          <div className="container py-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
          </div>
        </header>
        <div className="container py-20">
          <Card className="max-w-md mx-auto bg-card/50 border-violet/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Créer un post LinkedIn</CardTitle>
              <CardDescription>Connectez-vous pour générer du contenu avec l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={login} className="w-full bg-gradient-to-r from-violet to-rose hover:opacity-90">
                Se connecter pour commencer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-violet/20 bg-gradient-to-r from-violet/10 to-transparent safe-area-top">
        <div className="container flex items-center justify-between gap-2 py-3 sm:py-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Badge variant="outline" className="max-w-[45vw] truncate border-violet/40 text-violet-light text-xs sm:max-w-none sm:text-sm">
            {user.name || user.email}
          </Badge>
        </div>
      </header>

      <div className="container space-y-4 py-4 sm:space-y-6 sm:py-6">
        <Suspense fallback={null}>
          <GettingStartedJourney variant="compact" />
        </Suspense>

        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent sm:text-3xl">
            {guided ? "Étape 3 — Votre premier post" : "Créer un post LinkedIn"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {guided
              ? "Choisissez un thème, générez — l'IA s'occupe du reste."
              : "Générez votre texte, ajoutez une image IA, choisissez votre automatisation, puis publiez — tout en 5 étapes"}
          </p>
        </div>

        <LinkedInConnectBanner />

        {!contentType ? (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <button
              type="button"
              onClick={() => setContentType("post")}
              className="text-left rounded-2xl border border-violet/30 bg-card/50 p-6 transition-all hover:border-violet hover:bg-violet/5"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-rose flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Post</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Texte généré par l&apos;IA accompagné d&apos;une image — le format LinkedIn classique
              </p>
            </button>
            <button
              type="button"
              onClick={() => setContentType("carousel")}
              className="text-left rounded-2xl border border-violet/30 bg-card/50 p-6 transition-all hover:border-violet hover:bg-violet/5"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-rose flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Carrousel</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Plusieurs slides visuelles générées automatiquement pour raconter une idée en plusieurs temps
              </p>
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setContentType(null);
                setActivePost(null);
                setWorkflowStep("configure");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Changer de type de contenu
            </button>

            {/* Stepper — défilement horizontal sur mobile */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = step.id === workflowStep;
                const isDone = i < stepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (i === 0 || activePost) setWorkflowStep(step.id);
                    }}
                    disabled={i > 0 && !activePost}
                    className={`flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-violet text-white"
                        : isDone
                          ? "bg-violet/20 text-violet-light border border-violet/40"
                          : "bg-card/50 text-muted-foreground border border-border disabled:opacity-40"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">{step.label}</span>
                    <span className="hidden sm:inline">{i + 1}. {step.label}</span>
                    {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 opacity-50 hidden sm:block" />}
                  </button>
                );
              })}
            </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Config (always visible on configure step, collapsed otherwise) */}
          <div className={`space-y-4 ${workflowStep !== "configure" ? "lg:opacity-60" : ""}`}>
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/50">
                <TabsTrigger value="generate">Paramètres</TabsTrigger>
                <TabsTrigger value="profile">Mon Profil</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-4">
                {isCarousel ? (
                <Card className="bg-card/50 border-violet/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-violet-light" />
                      Étape 1 — Configurer
                    </CardTitle>
                    <CardDescription>Choisissez le sujet et le style de votre carrousel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sujet *</Label>
                      <Textarea
                        placeholder="Ex: 5 stratégies pour augmenter son engagement LinkedIn"
                        value={carouselTopic}
                        onChange={e => setCarouselTopic(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Style visuel</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {CAROUSEL_STYLES.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setCarouselStyle(s.id)}
                            className={`rounded-lg border text-left transition-all overflow-hidden ${
                              carouselStyle === s.id
                                ? "border-violet ring-2 ring-violet/40"
                                : "border-border hover:border-violet/50"
                            }`}
                          >
                            <div className={`h-10 ${s.preview}`} />
                            <div className="p-2 bg-background/50">
                              <p className="text-xs font-medium">{s.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre de slides</Label>
                      <div className="flex gap-2">
                        {CAROUSEL_SLIDE_COUNTS.map(count => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setCarouselSlideCount(count)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              carouselSlideCount === count
                                ? "bg-violet text-white"
                                : "bg-background/50 border border-border hover:border-violet/50"
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Titre/Fonction (optionnel)</Label>
                      <Input
                        placeholder="Ex: CEO @ MonEntreprise"
                        value={carouselAuthorTitle}
                        onChange={e => setCarouselAuthorTitle(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button
                      onClick={handleGenerateCarousel}
                      disabled={generateCarouselMutation.isPending || !carouselTopic.trim()}
                      className="w-full btn-gradient"
                    >
                      {generateCarouselMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Générer le carrousel
                    </Button>
                  </CardContent>
                </Card>
                ) : (
                <Card className="bg-card/50 border-violet/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-violet-light" />
                      Étape 1 — Configurer
                    </CardTitle>
                    <CardDescription>Choisissez le sujet et le style de votre post</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Thématique *</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Choisir une thématique" /></SelectTrigger>
                        <SelectContent>
                          {options?.themes.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Langue</Label>
                        <Select value={language} onValueChange={v => setLanguage(v as typeof language)}>
                          <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FR">Français</SelectItem>
                            <SelectItem value="EN">Anglais</SelectItem>
                            <SelectItem value="AR">Arabe</SelectItem>
                            <SelectItem value="ES">Espagnol</SelectItem>
                            <SelectItem value="DE">Allemand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ton</Label>
                        <Select value={tone} onValueChange={v => setTone(v as typeof tone)}>
                          <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professionnel</SelectItem>
                            <SelectItem value="casual">Décontracté</SelectItem>
                            <SelectItem value="inspirational">Inspirant</SelectItem>
                            <SelectItem value="educational">Éducatif</SelectItem>
                            <SelectItem value="provocative">Provocateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Type de post</Label>
                      <Select value={postType} onValueChange={v => setPostType(v as typeof postType)}>
                        <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="story">Storytelling</SelectItem>
                          <SelectItem value="tips">Conseils</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="announcement">Annonce</SelectItem>
                          <SelectItem value="motivation">Motivation</SelectItem>
                          <SelectItem value="insight">Insight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions (optionnel)</Label>
                      <Textarea
                        placeholder="Ex: Mentionner mon projet, parler de l'IA..."
                        value={additionalInstructions}
                        onChange={e => setAdditionalInstructions(e.target.value)}
                        className="bg-background/50 min-h-[80px]"
                      />
                    </div>
                    <Button onClick={handleGenerate} disabled={isLoading || !theme} className="w-full btn-gradient">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Générer 1 post
                    </Button>
                    <div className="flex gap-2">
                      <Select value={batchCount.toString()} onValueChange={v => setBatchCount(parseInt(v))}>
                        <SelectTrigger className="w-16 bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleGenerateBatch} disabled={isLoading || !theme} variant="outline" className="flex-1 border-violet/40">
                        Générer {batchCount} variantes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                <ProfileForm profile={profile} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Workflow steps */}
          <div className="space-y-4">
            {workflowStep === "configure" && !activePost && isCarousel && (
              <Card className="bg-card/30 border-dashed border-violet/30">
                <CardContent className="py-16 text-center">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-violet-light/50" />
                  <p className="text-muted-foreground mb-2">Configurez votre carrousel et générez-le</p>
                  <p className="text-xs text-muted-foreground">Le parcours vous guidera ensuite : relecture → visuels → automatisation → publication</p>
                </CardContent>
              </Card>
            )}

            {workflowStep === "configure" && !activePost && !isCarousel && (
              <>
                {generatedPosts.length === 0 ? (
                  <Card className="bg-card/30 border-dashed border-violet/30">
                    <CardContent className="py-16 text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-violet-light/50" />
                      <p className="text-muted-foreground mb-2">Commencez par configurer et générer un post</p>
                      <p className="text-xs text-muted-foreground">Le parcours vous guidera ensuite : relecture → image → automatisation → publication</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Posts récents — cliquez pour continuer</h2>
                    {generatedPosts.map(post => (
                      <Card key={post.id} className="bg-card/50 border-violet/30 cursor-pointer hover:border-violet/40 transition-colors" onClick={() => startWorkflow(post)}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                          <Button size="sm" variant="ghost" className="mt-2 text-violet-light" onClick={e => { e.stopPropagation(); startWorkflow(post); }}>
                            Continuer <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {workflowStep === "configure" && activePost && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isCarousel ? <Layers className="w-5 h-5 text-violet-light" /> : <Lightbulb className="w-5 h-5 text-violet-light" />}
                    Étape 1 — {isCarousel ? "Votre carrousel" : "Configurer le post"}
                  </CardTitle>
                  <CardDescription>
                    {isCarousel
                      ? "Relisez et modifiez la légende avant de passer aux visuels"
                      : "Relisez et modifiez le texte généré avant de passer à l'image"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input value={activePost.title} readOnly className="bg-background/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu du post</Label>
                    <Textarea
                      value={editedContent}
                      onChange={e => setEditedContent(e.target.value)}
                      className="bg-background/50 min-h-[220px] font-mono text-sm"
                    />
                  </div>
                  {activePost.suggestedMedia && (
                    <p className="text-xs text-muted-foreground bg-background/30 p-2 rounded flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-violet-light" />
                      Idée visuelle : {activePost.suggestedMedia}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedContent, activePost.id)}>
                      {copiedId === activePost.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    {!isCarousel && (
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={savePostMutation.isPending}>
                        <Save className="w-3 h-3 mr-1" /> Sauvegarder
                      </Button>
                    )}
                    <Button className="flex-1 btn-gradient" onClick={() => setWorkflowStep("image")}>
                      Suivant : Créer le visuel <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflowStep === "image" && activePost && !isCarousel && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    Étape 2 — Créer l'image
                  </CardTitle>
                  <CardDescription>
                    Choisissez un visuel de votre médiathèque ou générez une image IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 p-1 rounded-lg bg-background/50 border border-border">
                    <Button
                      type="button"
                      variant={imageSource === "library" ? "secondary" : "ghost"}
                      className="flex-1"
                      onClick={() => setImageSource("library")}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" /> Médiathèque
                    </Button>
                    <Button
                      type="button"
                      variant={imageSource === "ai" ? "secondary" : "ghost"}
                      className="flex-1"
                      onClick={() => setImageSource("ai")}
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Image IA
                    </Button>
                  </div>

                  {imageSource === "library" ? (
                    <div className="space-y-3">
                      {isLoadingSuggestions ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Analyse de votre médiathèque...
                        </div>
                      ) : (
                        <MediaLibraryPicker
                          selectedId={selectedMediaId}
                          suggestions={mediaSuggestions?.suggestions}
                          hasRelevantMatch={mediaSuggestions?.hasRelevantMatch}
                          onSwitchToAi={() => setImageSource("ai")}
                          onSelect={item => {
                            setSelectedMediaId(item.id);
                            setImageUrl(item.fileUrl);
                            setImageKey(item.fileKey ?? null);
                            setImageSource("library");
                            if (activePost) {
                              savePostMutation.mutate({
                                id: activePost.id,
                                content: editedContent,
                                imageUrl: item.fileUrl,
                                imageKey: item.fileKey,
                                mediaLibraryId: item.id,
                              });
                            }
                          }}
                        />
                      )}
                      {imageUrl && imageSource === "library" && (
                        <img
                          src={imageUrl}
                          alt="Média sélectionné"
                          className="w-full rounded-lg border border-violet/30 max-h-64 object-contain"
                        />
                      )}
                      <MediaUploadZone compact onUploaded={() => setMediaSuggestionsApplied(false)} />
                      <Link href="/mes-outils?tab=mediatheque" className="text-xs text-violet-light hover:underline flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" /> Gérer ma médiathèque
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm mb-2 block">Style visuel</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {AI_IMAGE_STYLES.map(style => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => setAiImageStyle(style.id)}
                                className={`relative overflow-hidden rounded-lg border text-left transition-all ${
                                  aiImageStyle === style.id
                                    ? "border-purple-500 ring-2 ring-purple-500/40"
                                    : "border-border hover:border-purple-700/50"
                                }`}
                              >
                                <div className={`h-14 ${style.preview} flex items-center justify-center`}>
                                  <span className="text-xl">{style.icon}</span>
                                </div>
                                <div className="p-2 bg-background/50">
                                  <p className="text-xs font-medium">{style.name}</p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">{style.description}</p>
                                </div>
                                {aiImageStyle === style.id && (
                                  <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-purple-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Format</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {AI_IMAGE_FORMATS.map(format => (
                              <button
                                key={format.id}
                                type="button"
                                onClick={() => setAiImageFormat(format.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                  aiImageFormat === format.id
                                    ? "border-purple-500 ring-2 ring-purple-500/40 bg-purple-950/20"
                                    : "border-border hover:border-purple-700/50"
                                }`}
                              >
                                <div className={`w-10 shrink-0 rounded border border-white/20 bg-muted/30 ${format.aspect}`} />
                                <div className="text-left min-w-0">
                                  <p className="text-sm font-medium">{format.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{format.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {imageUrl ? (
                        <div className="space-y-3">
                          <img src={imageUrl} alt="Image générée pour le post" className="w-full rounded-lg border border-violet/30" />
                          {imagePrompt && (
                            <p className="text-xs text-muted-foreground italic">Prompt : {imagePrompt}</p>
                          )}
                          <Button variant="outline" size="sm" onClick={handleGenerateImage} disabled={generateImageMutation.isPending}>
                            {generateImageMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                            Regénérer
                          </Button>
                        </div>
                      ) : (
                        <div className="py-6 text-center border border-dashed border-purple-700/30 rounded-lg bg-purple-950/10">
                          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-purple-400/50" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Style « {AI_IMAGE_STYLES.find(s => s.id === aiImageStyle)?.name} » · format {AI_IMAGE_FORMATS.find(f => f.id === aiImageFormat)?.name.toLowerCase()}
                          </p>
                          <Button onClick={handleGenerateImage} disabled={generateImageMutation.isPending} className="bg-purple-700 hover:bg-purple-600">
                            {generateImageMutation.isPending ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération en cours (30-60s)...</>
                            ) : (
                              <><Sparkles className="w-4 h-4 mr-2" /> Générer l&apos;image IA</>
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setWorkflowStep("configure")}>← Retour</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setWorkflowStep("choose-automation")}>
                      <SkipForward className="w-3 h-3 mr-1" /> {imageUrl ? "Suivant" : "Passer sans image"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflowStep === "image" && activePost && isCarousel && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    Étape 2 — Vos visuels
                  </CardTitle>
                  <CardDescription>
                    Vos slides ont déjà été générées avec le texte — parcourez-les ci-dessous
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {carouselImageUrls.length > 0 && (
                    <>
                      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted border border-violet/30">
                        <img
                          src={carouselImageUrls[carouselSlideIndex]}
                          alt={`Slide ${carouselSlideIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {carouselImageUrls.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setCarouselSlideIndex(i => Math.max(0, i - 1))}
                              disabled={carouselSlideIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCarouselSlideIndex(i => Math.min(carouselImageUrls.length - 1, i + 1))}
                              disabled={carouselSlideIndex === carouselImageUrls.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Slide {carouselSlideIndex + 1} / {carouselImageUrls.length}
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {carouselImageUrls.map((url, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setCarouselSlideIndex(index)}
                            className={`shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${
                              carouselSlideIndex === index
                                ? "border-violet ring-2 ring-violet/40"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={url} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setWorkflowStep("configure")}>← Retour</Button>
                    <Button className="flex-1 btn-gradient" onClick={() => setWorkflowStep("choose-automation")}>
                      Suivant <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflowStep === "choose-automation" && activePost && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-violet-light" />
                    Étape 3 — Choisir l&apos;automatisation
                  </CardTitle>
                  <CardDescription>Publiez immédiatement ou planifiez la diffusion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PostPreviewCard
                    title={activePost.title}
                    content={editedContent}
                    hashtags={editedHashtags}
                    imageUrl={imageUrl}
                  />

                  <div className="flex gap-2 p-1 rounded-lg bg-background/50 border border-border">
                    <Button
                      type="button"
                      variant={publishMode === "now" ? "secondary" : "ghost"}
                      className="flex-1"
                      onClick={() => setPublishMode("now")}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publier maintenant
                    </Button>
                    <Button
                      type="button"
                      variant={publishMode === "schedule" ? "secondary" : "ghost"}
                      className="flex-1"
                      onClick={() => setPublishMode("schedule")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setWorkflowStep("image")}>← Retour</Button>
                    <Button className="flex-1 btn-gradient" onClick={() => setWorkflowStep("configure-automation")}>
                      Continuer <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflowStep === "configure-automation" && activePost && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-light" />
                    Étape 4 — Configurer l&apos;automatisation
                  </CardTitle>
                  <CardDescription>
                    {publishMode === "schedule"
                      ? "Choisissez la date et l'heure de diffusion"
                      : "Rien à configurer pour une publication immédiate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {publishMode === "schedule" ? (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-violet/30 bg-violet/5">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Date de diffusion
                        </Label>
                        <Input
                          type="date"
                          value={scheduleDate}
                          min={formatDateInput(new Date())}
                          onChange={e => setScheduleDate(e.target.value)}
                          className="bg-background/50 [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Heure
                        </Label>
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                          className="bg-background/50 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed border-violet/30 rounded-lg bg-violet/5">
                      <Send className="w-8 h-8 mx-auto mb-2 text-violet-light/60" />
                      <p className="text-sm text-muted-foreground">
                        Aucune configuration nécessaire — votre post sera publié immédiatement à l&apos;étape suivante.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setWorkflowStep("choose-automation")}>← Retour</Button>
                    <Button className="flex-1 btn-gradient" onClick={() => setWorkflowStep("publish")}>
                      Continuer <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {workflowStep === "publish" && activePost && (
              <Card className="bg-card/50 border-violet/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-[#0077B5]" />
                    Étape 5 — Publier
                  </CardTitle>
                  <CardDescription>
                    {publishMode === "now"
                      ? "Votre post sera publié immédiatement sur LinkedIn"
                      : `Planifié pour le ${scheduleDate} à ${scheduleTime}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PostPreviewCard
                    title={activePost.title}
                    content={editedContent}
                    hashtags={editedHashtags}
                    imageUrl={imageUrl}
                  />

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setWorkflowStep("configure-automation")}>← Retour</Button>
                    {publishMode === "now" ? (
                      <Button
                        className="flex-1 bg-[#0077B5] hover:bg-[#006699]"
                        onClick={handlePublish}
                        disabled={publishing}
                      >
                        {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Linkedin className="w-4 h-4 mr-2" />}
                        Publier sur LinkedIn
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 btn-gradient"
                        onClick={handleSchedule}
                        disabled={scheduling}
                      >
                        {scheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                        Planifier la publication
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function PostPreviewCard({
  title,
  content,
  hashtags,
  imageUrl,
}: {
  title: string;
  content: string;
  hashtags: string[];
  imageUrl: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
      {imageUrl && <img src={imageUrl} alt="Aperçu" className="w-full rounded-md" />}
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileForm({ profile }: { profile: Record<string, string | null | undefined> | null | undefined }) {
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    sector: "",
    targetAudience: "",
    personalBio: "",
    achievements: "",
    businessGoals: "",
    uniqueSellingPoints: "",
  });

  // Recharger le formulaire quand le profil est récupéré depuis la base
  useEffect(() => {
    if (profile === undefined) return;
    setFormData({
      companyName: profile?.companyName || "",
      industry: profile?.industry || profile?.sector || "",
      sector: profile?.sector || "",
      targetAudience: profile?.targetAudience || "",
      personalBio: profile?.personalBio || "",
      achievements: profile?.achievements || "",
      businessGoals: profile?.businessGoals || "",
      uniqueSellingPoints: profile?.uniqueSellingPoints || "",
    });
  }, [profile?.id, profile?.updatedAt]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.get.invalidate();
      toast.success("Profil sauvegardé ! Vos infos seront réutilisées pour vos prochains posts.");
    },
    onError: (error) => toast.error(`Erreur: ${error.message}`),
  });

  return (
    <Card className="bg-card/50 border-violet/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-violet-light" /> Mon Profil
        </CardTitle>
        <CardDescription>Ces infos personnalisent vos posts générés</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); updateMutation.mutate({ ...formData, sector: formData.industry }); }} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Entreprise</Label>
              <Input value={formData.companyName} onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Secteur</Label>
              <Input value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Target className="w-3 h-3" /> Audience cible</Label>
            <Input value={formData.targetAudience} onChange={e => setFormData(p => ({ ...p, targetAudience: e.target.value }))} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Bio personnelle</Label>
            <Textarea value={formData.personalBio} onChange={e => setFormData(p => ({ ...p, personalBio: e.target.value }))} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Globe className="w-3 h-3" /> Objectifs business</Label>
            <Textarea value={formData.businessGoals} onChange={e => setFormData(p => ({ ...p, businessGoals: e.target.value }))} className="bg-background/50" />
          </div>
          <Button type="submit" disabled={updateMutation.isPending} className="w-full bg-gradient-to-r from-violet to-rose">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Sauvegarder le profil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
