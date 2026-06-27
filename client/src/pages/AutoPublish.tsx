import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLinkedInConnectUrl, getLoginUrl, getSignupUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { formatDateInput, getDefaultScheduleTime, combineDateAndTime, buildScheduledAtIso } from "@/lib/scheduleUtils";
import { AI_IMAGE_FORMATS, AI_IMAGE_STYLES } from "@/lib/aiImageStyles";
import { LinkedInConnectBanner } from "@/components/LinkedInConnectBanner";
import { GettingStartedJourney } from "@/components/GettingStartedJourney";
import { isGuidedMode } from "@/lib/gettingStartedJourney";
import { ToolsQuickNav } from "@/components/tools/ToolsQuickNav";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import { toast } from "sonner";
import {
  Zap,
  Calendar,
  Clock,
  Target,
  Sparkles,
  Settings,
  Play,
  Pause,
  Save,
  Loader2,
  Users,
  TrendingUp,
  MessageSquare,
  Hash,
  Globe,
  Flame,
  Check,
  Plus,
  X,
  ChevronRight,
  User,
  Briefcase,
  Heart,
  Lightbulb,
  BookOpen,
  Award,
  Search,
  Image,
  Palette,
  Download,
  RefreshCw,
  Layers,
  FileDown,
  Linkedin,
  Send,
  Pencil,
  FolderOpen,
  List,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { MediaLibraryPicker, MediaUploadZone } from "@/components/MediaLibraryPicker";
import { UpcomingPublicationsView } from "@/components/autopublish/UpcomingPublicationsView";
import {
  AutoPublishFlowAnimation,
  type AutoPublishFlowPhase,
} from "@/components/autopublish/AutoPublishFlowAnimation";
import {
  AutoPublishSuccessAnimation,
  AutoPublishScheduledAnimation,
} from "@/components/autopublish/AutoPublishSuccessAnimation";

// Days of the week
const DAYS = [
  { id: 0, name: "Dim", fullName: "Dimanche" },
  { id: 1, name: "Lun", fullName: "Lundi" },
  { id: 2, name: "Mar", fullName: "Mardi" },
  { id: 3, name: "Mer", fullName: "Mercredi" },
  { id: 4, name: "Jeu", fullName: "Jeudi" },
  { id: 5, name: "Ven", fullName: "Vendredi" },
  { id: 6, name: "Sam", fullName: "Samedi" },
];

// Time slots — every half hour, full 24h range
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

// Sectors
const SECTORS = [
  "Tech & Startups",
  "Marketing & Communication",
  "Finance & Investissement",
  "RH & Recrutement",
  "Entrepreneuriat",
  "Leadership & Management",
  "Sales & Business Development",
  "Personal Branding",
  "IA & Innovation",
  "E-commerce",
  "Consulting",
  "Immobilier",
];

// Objectives
const OBJECTIVES = [
  { id: "visibility", name: "Visibilité", icon: TrendingUp, description: "Augmenter ma notoriété sur LinkedIn" },
  { id: "leads", name: "Génération de leads", icon: Target, description: "Attirer des prospects qualifiés" },
  { id: "recruitment", name: "Recrutement", icon: Users, description: "Attirer des talents" },
  { id: "thought_leadership", name: "Thought Leadership", icon: Lightbulb, description: "Devenir une référence dans mon domaine" },
  { id: "networking", name: "Networking", icon: Heart, description: "Développer mon réseau professionnel" },
  { id: "sales", name: "Ventes", icon: Briefcase, description: "Convertir mon audience en clients" },
];

// Content Types
const CONTENT_TYPES = [
  { id: "storytelling", name: "Storytelling", icon: "📖", description: "Histoires personnelles et anecdotes" },
  { id: "tips", name: "Conseils pratiques", icon: "💡", description: "Astuces et méthodes actionnables" },
  { id: "case_study", name: "Études de cas", icon: "📊", description: "Analyses détaillées de succès/échecs" },
  { id: "opinion", name: "Opinions", icon: "🎯", description: "Prises de position et débats" },
  { id: "educational", name: "Éducatif", icon: "🎓", description: "Tutoriels et explications" },
  { id: "behind_scenes", name: "Coulisses", icon: "🎬", description: "Vie quotidienne et transparence" },
  { id: "industry_news", name: "Actualités", icon: "📰", description: "Commentaires sur l'actualité du secteur" },
  { id: "carousel", name: "Carrousels", icon: "🎠", description: "Contenus visuels et slides" },
];

// Tones
const TONES = [
  { id: "professional", name: "Professionnel", icon: "👔", description: "Sérieux et expert" },
  { id: "casual", name: "Décontracté", icon: "😊", description: "Accessible et amical" },
  { id: "inspirational", name: "Inspirant", icon: "✨", description: "Motivant et positif" },
  { id: "educational", name: "Éducatif", icon: "📚", description: "Informatif et pédagogue" },
  { id: "provocative", name: "Provocateur", icon: "🔥", description: "Audacieux et engageant" },
];

// Languages
const LANGUAGES = [
  { id: "FR", name: "Français", flag: "🇫🇷" },
  { id: "EN", name: "English", flag: "🇬🇧" },
  { id: "AR", name: "العربية", flag: "🇸🇦" },
  { id: "ES", name: "Español", flag: "🇪🇸" },
  { id: "DE", name: "Deutsch", flag: "🇩🇪" },
];

// Virality levels
const VIRALITY_LEVELS = [
  { id: "low", name: "Conservateur", description: "Contenu classique et sûr", color: "bg-blue-500" },
  { id: "medium", name: "Équilibré", description: "Mix entre valeur et engagement", color: "bg-emerald-500" },
  { id: "high", name: "Viral", description: "Optimisé pour l'engagement max", color: "bg-orange-500" },
];

// Image styles for quote images
const IMAGE_STYLES = [
  { id: "minimal", name: "Minimaliste", description: "Design épuré et moderne", preview: "bg-gradient-to-br from-slate-900 to-slate-800" },
  { id: "gradient", name: "Gradient", description: "Dégradés colorés et vibrants", preview: "bg-gradient-to-br from-violet-600 to-pink-500" },
  { id: "geometric", name: "Géométrique", description: "Formes abstraites et modernes", preview: "bg-gradient-to-br from-blue-600 to-cyan-500" },
  { id: "nature", name: "Nature", description: "Arrière-plans naturels apaisants", preview: "bg-gradient-to-br from-emerald-600 to-teal-500" },
  { id: "dark", name: "Sombre", description: "Style professionnel et élégant", preview: "bg-gradient-to-br from-gray-900 to-black" },
  { id: "light", name: "Lumineux", description: "Fond clair et aéré", preview: "bg-gradient-to-br from-white to-gray-100" },
];

// Color palettes for quote images
const COLOR_PALETTES = [
  { id: "violet", name: "Violet", primary: "#8B5CF6", secondary: "#EC4899", bg: "from-violet-600 to-pink-500" },
  { id: "ocean", name: "Océan", primary: "#0EA5E9", secondary: "#06B6D4", bg: "from-blue-600 to-cyan-500" },
  { id: "forest", name: "Forêt", primary: "#10B981", secondary: "#14B8A6", bg: "from-emerald-600 to-teal-500" },
  { id: "sunset", name: "Coucher de soleil", primary: "#F59E0B", secondary: "#EF4444", bg: "from-orange-500 to-red-500" },
  { id: "midnight", name: "Minuit", primary: "#6366F1", secondary: "#8B5CF6", bg: "from-indigo-600 to-violet-600" },
  { id: "rose", name: "Rose", primary: "#EC4899", secondary: "#F43F5E", bg: "from-pink-500 to-rose-500" },
  { id: "slate", name: "Ardoise", primary: "#64748B", secondary: "#475569", bg: "from-slate-600 to-slate-800" },
  { id: "gold", name: "Or", primary: "#EAB308", secondary: "#CA8A04", bg: "from-yellow-500 to-amber-600" },
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDayOfWeekFromDate(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

interface ScheduleSlot {
  dayOfWeek: number;
  publishTime: string;
  isActive: boolean;
  publishDate?: string | null;
}

interface Influencer {
  id: number;
  name: string;
  headline: string;
  profilePicture: string;
  linkedinUsername?: string | null;
  linkedinUrl?: string | null;
  followers: number;
  country: string;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is number => typeof v === "number");
}

function mapServerSettings(raw: Record<string, unknown>): Settings {
  return {
    isEnabled: Boolean(raw.isEnabled),
    sector: String(raw.sector ?? ""),
    targetAudience: String(raw.targetAudience ?? ""),
    tone: String(raw.tone ?? "professional"),
    language: String(raw.language ?? "FR"),
    viralityLevel: String(raw.viralityLevel ?? "medium"),
    contentLength: String(raw.contentLength ?? "medium"),
    includeEmojis: raw.includeEmojis !== false,
    includeHashtags: raw.includeHashtags !== false,
    includeCallToAction: raw.includeCallToAction !== false,
    personalContext: String(raw.personalContext ?? ""),
    objectives: asStringArray(raw.objectives),
    contentTypes: asStringArray(raw.contentTypes),
    inspiringCreators: asNumberArray(raw.inspiringCreators),
    imageType: raw.imageType === "quote" ? "quote" : "ai",
    aiImageStyle: String(raw.aiImageStyle ?? "professional"),
    aiImageFormat: String(raw.aiImageFormat ?? "1536x1024"),
    imageStyle: String(raw.imageStyle ?? "gradient"),
    colorPalette: String(raw.colorPalette ?? "violet"),
    includeImage: raw.includeImage !== false,
    customQuote: String(raw.customQuote ?? ""),
  };
}

interface Settings {
  isEnabled: boolean;
  sector: string;
  targetAudience: string;
  tone: string;
  language: string;
  viralityLevel: string;
  contentLength: string;
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeCallToAction: boolean;
  personalContext: string;
  objectives: string[];
  contentTypes: string[];
  inspiringCreators: number[];
  // Image settings
  imageType: "ai" | "quote";
  aiImageStyle: string;
  aiImageFormat: string;
  imageStyle: string;
  colorPalette: string;
  includeImage: boolean;
  customQuote: string;
}

type AutoPublishTab =
  | "upcoming"
  | "objectives"
  | "creators"
  | "content"
  | "visual"
  | "schedule"
  | "preview";

type FlowOverlay =
  | { type: "flow"; phase: AutoPublishFlowPhase; phaseIndex: number }
  | { type: "success"; title?: string; message?: string }
  | { type: "scheduled"; dateLabel: string; timeLabel: string }
  | null;

export default function AutoPublish() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const guided = isGuidedMode();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AutoPublishTab>("upcoming");
  const [flowOverlay, setFlowOverlay] = useState<FlowOverlay>(null);
  const [upcomingKey, setUpcomingKey] = useState(0);
  
  // Influencers from database
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(true);

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    isEnabled: false,
    sector: "",
    targetAudience: "",
    tone: "professional",
    language: "FR",
    viralityLevel: "medium",
    contentLength: "medium",
    includeEmojis: true,
    includeHashtags: true,
    includeCallToAction: true,
    personalContext: "",
    objectives: [],
    contentTypes: [],
    inspiringCreators: [],
    // Image settings
    imageType: "ai",
    aiImageStyle: "professional",
    aiImageFormat: "1536x1024",
    imageStyle: "gradient",
    colorPalette: "violet",
    includeImage: true,
    customQuote: "",
  });

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [planningMode, setPlanningMode] = useState<"recurring" | "once">("once");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(getDefaultScheduleTime().date);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  // Preview state
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewContents, setPreviewContents] = useState<string[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [previewCount, setPreviewCount] = useState(3); // Number of previews to generate
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiImagePrompt, setAiImagePrompt] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState(getDefaultScheduleTime().date);
  const [scheduleTime, setScheduleTime] = useState(getDefaultScheduleTime().time);
  const [isScheduling, setIsScheduling] = useState(false);
  const [extractedQuote, setExtractedQuote] = useState<string>("");
  const [generatedCarousel, setGeneratedCarousel] = useState<any>(null);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [previewImageSource, setPreviewImageSource] = useState<"library" | "ai" | "quote">("library");
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null);
  const [mediaSuggestionsApplied, setMediaSuggestionsApplied] = useState(false);
  const settingsLoadedRef = useRef(false);

  const generateAiImageMutation = trpc.generator.generatePostImage.useMutation({
    onSuccess: (data) => {
      setAiImageUrl(data.imageUrl);
      setAiImagePrompt(data.prompt);
      toast.success("Image IA générée avec succès !");
    },
    onError: (error) => toast.error(`Erreur image: ${error.message}`),
  });

  const { data: mediaSuggestions, isLoading: isLoadingSuggestions } =
    trpc.mediaLibrary.suggestForPost.useQuery(
      {
        content: editedContent,
        title: settings.sector || "Post LinkedIn",
        limit: 6,
      },
      {
        enabled: !!user && !!previewContent && editedContent.length >= 10,
      }
    );

  useEffect(() => {
    if (!mediaSuggestions || mediaSuggestionsApplied || !previewContent) return;

    setMediaSuggestionsApplied(true);

    if (mediaSuggestions.hasRelevantMatch && mediaSuggestions.suggestions[0]) {
      const top = mediaSuggestions.suggestions[0];
      setSelectedMediaId(top.id);
      setLibraryImageUrl(top.fileUrl);
      setPreviewImageSource("library");
    } else if (mediaSuggestions.suggestions.length === 0) {
      setPreviewImageSource("ai");
    }
  }, [mediaSuggestions, mediaSuggestionsApplied, previewContent]);

  // Load influencers when authenticated
  useEffect(() => {
    if (!user?.id) return;

    const loadInfluencers = async () => {
      setIsLoadingInfluencers(true);
      try {
        // Load all top influencers without sector filtering
        const response = await fetch('/api/auto-publish/suggested-influencers', {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setInfluencers(data.influencers || []);
        } else {
          console.error("Failed to load influencers:", response.status);
          setInfluencers([]);
        }
      } catch (error) {
        console.error("Failed to load influencers:", error);
        setInfluencers([]);
      } finally {
        setIsLoadingInfluencers(false);
      }
    };
    void loadInfluencers();
  }, [user?.id]);

  // Load existing settings (once per session to avoid overwriting user edits)
  useEffect(() => {
    if (!user?.id || settingsLoadedRef.current) return;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/auto-publish/settings", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...mapServerSettings(data.settings as Record<string, unknown>),
            }));
          }
          if (data.schedule) {
            setSchedule(
              data.schedule.map((s: ScheduleSlot) => ({
                ...s,
                isActive: s.isActive !== false,
              }))
            );
          }
          settingsLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    void loadSettings();
  }, [user?.id]);

  const persistSettings = async (
    settingsToSave = settings,
    scheduleToSave = schedule,
    silent = false
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auto-publish/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: settingsToSave, schedule: scheduleToSave }),
      });

      if (response.ok) {
        if (!silent) toast.success("Paramètres sauvegardés !");
        return true;
      }
      toast.error("Erreur lors de la sauvegarde");
      return false;
    } catch {
      toast.error("Erreur de connexion");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    const ok = await persistSettings();
    if (ok) setUpcomingKey((k) => k + 1);
  };

  const handleSaveAndActivate = async () => {
    if (schedule.length === 0) {
      toast.error("Ajoutez au moins un créneau dans l'onglet Planning");
      setActiveTab("schedule");
      return;
    }
    if (settings.objectives.length === 0) {
      toast.info("Sélectionnez au moins un objectif pour personnaliser le contenu");
      setActiveTab("objectives");
      return;
    }

    const newSettings = { ...settings, isEnabled: true };
    setSettings(newSettings);
    const ok = await persistSettings(newSettings, schedule);
    if (ok) {
      setUpcomingKey((k) => k + 1);
      if (guided) {
        toast.success("Parcours terminé ! Votre automatisation est active.", {
          description: "L'IA publiera selon votre calendrier.",
        });
        setLocation("/dashboard");
      } else {
        toast.success("Configuration sauvegardée — auto-publication activée !");
      }
    } else {
      setSettings((prev) => ({ ...prev, isEnabled: settings.isEnabled }));
    }
  };

  const handleToggleEnabled = async (enabled?: boolean) => {
    const newEnabled = enabled ?? !settings.isEnabled;
    const newSettings = { ...settings, isEnabled: newEnabled };
    setSettings(newSettings);

    if (newEnabled && schedule.length === 0) {
      toast.info("Configurez votre planning pour activer l'auto-publication");
    }

    const saved = await persistSettings(newSettings, schedule, true);
    if (saved) {
      toast.success(
        newEnabled
          ? "Auto-publication activée — l'IA publiera selon votre config"
          : "Auto-publication désactivée"
      );
      setUpcomingKey((k) => k + 1);
    } else {
      setSettings((prev) => ({ ...prev, isEnabled: !newEnabled }));
    }
  };

  const handleAddScheduleSlot = async () => {
    if (planningMode === "recurring") {
      if (selectedDay === null) {
        toast.error("Sélectionnez un jour");
        return;
      }
    } else {
      if (!selectedDate) {
        toast.error("Sélectionnez une date");
        return;
      }
      const slotDate = combineDateAndTime(selectedDate, selectedTime);
      if (slotDate.getTime() <= Date.now()) {
        toast.error("La date doit être dans le futur");
        return;
      }
    }

    const dayOfWeek = planningMode === "once"
      ? getDayOfWeekFromDate(selectedDate)
      : selectedDay!;

    const publishDate = planningMode === "once" ? selectedDate : null;

    const exists = schedule.some(s =>
      s.dayOfWeek === dayOfWeek &&
      s.publishTime === selectedTime &&
      (s.publishDate ?? null) === publishDate
    );
    if (exists) {
      toast.error("Ce créneau existe déjà");
      return;
    }

    const newSchedule = [
      ...schedule,
      { dayOfWeek, publishTime: selectedTime, isActive: true, publishDate },
    ];
    setSchedule(newSchedule);
    const saved = await persistSettings(settings, newSchedule, true);
    if (saved) {
      toast.success("Créneau ajouté et sauvegardé");
      setUpcomingKey((k) => k + 1);
    } else {
      setSchedule(schedule);
      toast.error("Créneau non sauvegardé — réessayez");
    }
  };

  const handleRemoveScheduleSlot = async (
    dayOfWeek: number,
    publishTime: string,
    publishDate?: string | null
  ) => {
    const newSchedule = schedule.filter(
      s => !(
        s.dayOfWeek === dayOfWeek &&
        s.publishTime === publishTime &&
        (s.publishDate ?? null) === (publishDate ?? null)
      )
    );
    setSchedule(newSchedule);
    const saved = await persistSettings(settings, newSchedule, true);
    if (saved) {
      setUpcomingKey((k) => k + 1);
    } else {
      setSchedule(schedule);
      toast.error("Impossible de supprimer le créneau");
    }
  };

  const toggleObjective = (objectiveId: string) => {
    setSettings((prev) => {
      const objectives = asStringArray(prev.objectives);
      const newObjectives = objectives.includes(objectiveId)
        ? objectives.filter((o) => o !== objectiveId)
        : [...objectives, objectiveId];
      return { ...prev, objectives: newObjectives };
    });
  };

  const toggleContentType = (typeId: string) => {
    setSettings((prev) => {
      const contentTypes = asStringArray(prev.contentTypes);
      const newTypes = contentTypes.includes(typeId)
        ? contentTypes.filter((t) => t !== typeId)
        : [...contentTypes, typeId];
      return { ...prev, contentTypes: newTypes };
    });
  };

  const toggleCreator = (creatorId: number) => {
    setSettings((prev) => {
      const inspiringCreators = asNumberArray(prev.inspiringCreators);
      const newCreators = inspiringCreators.includes(creatorId)
        ? inspiringCreators.filter((c) => c !== creatorId)
        : [...inspiringCreators, creatorId];
      return { ...prev, inspiringCreators: newCreators };
    });
  };

  const toggleScheduleSlotActive = async (
    dayOfWeek: number,
    publishTime: string,
    publishDate?: string | null
  ) => {
    const newSchedule = schedule.map((s) =>
      s.dayOfWeek === dayOfWeek &&
      s.publishTime === publishTime &&
      (s.publishDate ?? null) === (publishDate ?? null)
        ? { ...s, isActive: !s.isActive }
        : s
    );
    setSchedule(newSchedule);
    const saved = await persistSettings(settings, newSchedule, true);
    if (saved) {
      setUpcomingKey((k) => k + 1);
    } else {
      setSchedule(schedule);
      toast.error("Impossible de mettre à jour le créneau");
    }
  };

  const handleGeneratePreview = async () => {
    if (settings.objectives.length === 0 && !settings.sector) {
      toast.error("Configurez au moins un objectif ou un secteur avant de générer");
      setActiveTab("objectives");
      return;
    }

    setIsGenerating(true);
    setPreviewContent(null);
    setPreviewContents([]);
    setSelectedPreviewIndex(0);
    setGeneratedImageUrl(null);
    setAiImageUrl(null);
    setAiImagePrompt(null);
    setLibraryImageUrl(null);
    setSelectedMediaId(null);
    setPreviewImageSource("library");
    setMediaSuggestionsApplied(false);
    setEditedContent("");
    setFlowOverlay({ type: "flow", phase: "generating", phaseIndex: 0 });
    const phaseTimer = window.setInterval(() => {
      setFlowOverlay((prev) =>
        prev?.type === "flow" && prev.phase === "generating"
          ? { ...prev, phaseIndex: Math.min(prev.phaseIndex + 1, 2) }
          : prev
      );
    }, 1200);
    try {
      const response = await fetch("/api/auto-publish/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...settings,
          selectedCreators: settings.inspiringCreators,
          count: previewCount, // Request multiple previews
        }),
      });

      const data = await response.json();
      
      if (response.ok && (data.previews || data.preview)) {
        const allPreviews = data.previews || [data.preview];
        setPreviewContents(allPreviews);
        setPreviewContent(allPreviews[0]);
        setEditedContent(allPreviews[0]);
        
        // Extract a quote from the first generated content
        const lines = allPreviews[0].split('\n').filter((l: string) => l.trim().length > 20 && l.trim().length < 150);
        if (lines.length > 0) {
          const quoteLine = lines.find((l: string) => l.includes('"') || l.includes('«')) || lines[0];
          setExtractedQuote(quoteLine.replace(/["*«»]/g, '').trim());
        }
        toast.success(`${allPreviews.length} aperçu(s) généré(s) avec succès !`);
      } else {
        console.error("Preview error:", data);
        toast.error(data.error || "Erreur lors de la génération de l'aperçu");
      }
    } catch (error) {
      console.error("Preview fetch error:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      window.clearInterval(phaseTimer);
      setFlowOverlay(null);
      setIsGenerating(false);
    }
  };

  const handleSelectPreview = (index: number) => {
    setSelectedPreviewIndex(index);
    setPreviewContent(previewContents[index]);
    setEditedContent(previewContents[index]);
    setGeneratedImageUrl(null);
    setAiImageUrl(null);
    setAiImagePrompt(null);
    setLibraryImageUrl(null);
    setSelectedMediaId(null);
    setPreviewImageSource("library");
    setMediaSuggestionsApplied(false);
    
    // Extract quote from selected preview
    const lines = previewContents[index].split('\n').filter((l: string) => l.trim().length > 20 && l.trim().length < 150);
    if (lines.length > 0) {
      const quoteLine = lines.find((l: string) => l.includes('"') || l.includes('«')) || lines[0];
      setExtractedQuote(quoteLine.replace(/["*«»]/g, '').trim());
    }
  };

  const handleGenerateAiImage = () => {
    if (!editedContent.trim()) {
      toast.error("Générez d'abord un aperçu de post");
      return;
    }
    const title = settings.sector || "Post LinkedIn";
    generateAiImageMutation.mutate({
      content: editedContent,
      title,
      visualStyle: settings.aiImageStyle,
      imageSize: settings.aiImageFormat as "1024x1024" | "1536x1024" | "1024x1536",
    });
  };

  const activeImageUrl =
    previewImageSource === "library"
      ? libraryImageUrl
      : previewImageSource === "ai"
        ? aiImageUrl
        : generatedImageUrl;

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    toast.info("Génération de l'image en cours...");
    try {
      const quote = settings.customQuote || extractedQuote || "Le succès est la somme de petits efforts répétés jour après jour.";
      const palette = COLOR_PALETTES.find(p => p.id === settings.colorPalette);
      const style = IMAGE_STYLES.find(s => s.id === settings.imageStyle);
      
      const response = await fetch("/api/auto-publish/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quote,
          authorName: user?.name || "Auteur",
          style: style?.name || "Gradient",
          colorPalette: palette?.name || "Violet",
          colors: [palette?.primary || "#8B5CF6", palette?.secondary || "#EC4899"],
        }),
      });

      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Image générée avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de la génération de l'image");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateCarousel = async () => {
    setIsGeneratingCarousel(true);
    setGeneratedCarousel(null);
    toast.info("Génération du carrousel en cours...");
    try {
      // Extraire le sujet du contenu généré ou utiliser les paramètres
      const topic = settings.sector || "Business et Entrepreneuriat";
      
      const response = await fetch("/api/carousels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic,
          slideCount: 5,
          style: settings.tone === "professional" ? "professional" : "modern",
          colorScheme: settings.colorPalette || "violet",
          language: settings.language || "FR",
        }),
      });

      const data = await response.json();
      if (response.ok && data.carousel) {
        setGeneratedCarousel(data.carousel);
        toast.success("Carrousel généré avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de la génération du carrousel");
      }
    } catch (error) {
      console.error("Carousel generation error:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handlePublishNow = async () => {
    const content = editedContent || previewContent;
    if (!content) {
      toast.error("Veuillez d'abord générer un aperçu avant de publier");
      return;
    }

    setIsPublishing(true);
    setFlowOverlay({ type: "flow", phase: "publishing", phaseIndex: 0 });
    const phaseTimer = window.setInterval(() => {
      setFlowOverlay((prev) =>
        prev?.type === "flow" && prev.phase === "publishing"
          ? { ...prev, phaseIndex: Math.min(prev.phaseIndex + 1, 2) }
          : prev
      );
    }, 900);

    try {
      const response = await fetch("/api/auto-publish/publish-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content,
          imageUrl: activeImageUrl || undefined,
        }),
      });

      const data = await response.json();
      window.clearInterval(phaseTimer);

      if (data.success) {
        setFlowOverlay({ type: "success" });
        setUpcomingKey((k) => k + 1);
      } else if (
        data.message?.includes("LinkedIn not connected") ||
        data.message?.includes("non connecté")
      ) {
        setFlowOverlay(null);
        toast.info("Connectez LinkedIn pour publier");
        window.location.href = getLinkedInConnectUrl("/auto-publish");
      } else {
        setFlowOverlay(null);
        toast.error(data.message || "Erreur lors de la publication");
      }
    } catch {
      window.clearInterval(phaseTimer);
      setFlowOverlay(null);
      toast.error("Erreur de connexion");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedulePost = async () => {
    const content = editedContent || previewContent;
    if (!content) {
      toast.error("Veuillez d'abord générer un aperçu avant de planifier");
      return;
    }

    setIsScheduling(true);
    setFlowOverlay({ type: "flow", phase: "scheduling", phaseIndex: 0 });
    const phaseTimer = window.setInterval(() => {
      setFlowOverlay((prev) =>
        prev?.type === "flow" && prev.phase === "scheduling"
          ? { ...prev, phaseIndex: Math.min(prev.phaseIndex + 1, 2) }
          : prev
      );
    }, 800);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content,
          imageUrl: activeImageUrl || undefined,
          date: scheduleDate,
          time: scheduleTime,
          scheduledAt: buildScheduledAtIso(scheduleDate, scheduleTime),
          source: "auto-publish",
        }),
      });
      const data = await response.json();
      window.clearInterval(phaseTimer);

      if (response.ok && data.success) {
        const scheduled = combineDateAndTime(scheduleDate, scheduleTime);
        setFlowOverlay({
          type: "scheduled",
          dateLabel: scheduled.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
          timeLabel: scheduleTime,
        });
        setUpcomingKey((k) => k + 1);
      } else {
        setFlowOverlay(null);
        toast.error(data.error || "Erreur lors de la planification");
      }
    } catch {
      window.clearInterval(phaseTimer);
      setFlowOverlay(null);
      toast.error("Erreur de connexion");
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishOrSchedule = () => {
    if (publishMode === "now") {
      handlePublishNow();
    } else {
      handleSchedulePost();
    }
  };

  const filteredInfluencers = influencers.filter(inf =>
    inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Publication Automatique
            </h1>
            <p className="text-muted-foreground mb-8">
              Connectez-vous pour configurer la publication automatique de vos posts LinkedIn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={getLoginUrl("/auto-publish")}>
                <Button variant="outline" className="border-white/20 w-full sm:w-auto">
                  Se connecter
                </Button>
              </a>
              <a href={getSignupUrl("/auto-publish")}>
                <Button className="btn-gradient w-full sm:w-auto">Créer un compte</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container py-8">
        <GettingStartedJourney variant="compact" className="mb-6" />
        <LinkedInConnectBanner />
        <ToolsQuickNav />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {guided ? "Étape 4 — Activez l'automatisation" : "Publication Automatique IA"}
                </h1>
                <p className="text-muted-foreground">
                  {guided
                    ? "Choisissez vos objectifs et un créneau — l'IA publie pour vous."
                    : "Configurez vos objectifs et laissez l'IA publier pour vous"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Enable/Disable Toggle */}
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
                settings.isEnabled
                  ? "bg-emerald-500/20 border-emerald-500/50"
                  : "bg-card border-white/10"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="auto-publish-toggle" className="text-sm font-medium text-white cursor-pointer">
                  Auto-publication
                </Label>
                <span className={`text-xs ${settings.isEnabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {settings.isEnabled ? "Publications automatiques actives" : "Publications automatiques en pause"}
                </span>
              </div>
              <Switch
                id="auto-publish-toggle"
                checked={settings.isEnabled}
                onCheckedChange={(checked) => void handleToggleEnabled(checked)}
                disabled={isSaving}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            <Button
              className="btn-gradient"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {settings.isEnabled && schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-400">
                    Publication automatique activée
                  </p>
                  <p className="text-sm text-emerald-400/70">
                    {schedule.length} créneau(x) • L'IA publie selon vos objectifs et votre planning
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setActiveTab("upcoming")}
              >
                <List className="w-4 h-4 mr-2" />
                Voir les publications à venir
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "upcoming", label: "À venir", icon: List },
            { id: "objectives", label: "1. Objectifs", icon: Target },
            { id: "creators", label: "2. Créateurs", icon: Users },
            { id: "content", label: "3. Contenu", icon: MessageSquare },
            { id: "visual", label: "4. Visuel", icon: Image },
            { id: "schedule", label: "5. Planning", icon: Calendar },
            { id: "preview", label: "6. Aperçu & Test", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AutoPublishTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-violet text-white"
                  : "bg-card border border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        
        {activeTab === "upcoming" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <UpcomingPublicationsView
              days={7}
              refreshToken={upcomingKey}
              isAutoEnabled={settings.isEnabled}
              hasSchedule={schedule.length > 0}
              hasObjectives={settings.objectives.length > 0 || Boolean(settings.sector)}
              onToggleAuto={(enabled) => void handleToggleEnabled(enabled)}
              onGoToSchedule={() => setActiveTab("schedule")}
              onGoToObjectives={() => setActiveTab("objectives")}
              onGoToPreview={() => setActiveTab("preview")}
            />
          </div>
        )}

        {/* Objectives Tab */}
        {activeTab === "objectives" && (
          <div className="space-y-8">
            {/* Auto-publish toggle */}
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${settings.isEnabled ? "bg-emerald-500/20" : "bg-white/5"}`}>
                  {settings.isEnabled ? (
                    <Play className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Pause className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">Publication automatique</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.isEnabled
                      ? "L'IA publie selon votre planning configuré"
                      : "Désactivée — aucune publication automatique ne partira"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={(checked) => void handleToggleEnabled(checked)}
                disabled={isSaving}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {/* Objectives Selection */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-light" />
                Quels sont vos objectifs ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Sélectionnez un ou plusieurs objectifs pour personnaliser le contenu généré
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {OBJECTIVES.map((objective) => (
                  <button
                    key={objective.id}
                    type="button"
                    onClick={() => toggleObjective(objective.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.objectives.includes(objective.id)
                        ? "bg-violet/20 border-violet/50"
                        : "bg-card/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.objectives.includes(objective.id)
                          ? "bg-violet/30"
                          : "bg-white/5"
                      }`}>
                        <objective.icon className={`w-5 h-5 ${
                          settings.objectives.includes(objective.id)
                            ? "text-violet-light"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          settings.objectives.includes(objective.id)
                            ? "text-white"
                            : "text-white/80"
                        }`}>
                          {objective.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {objective.description}
                        </p>
                      </div>
                      {settings.objectives.includes(objective.id) && (
                        <Check className="w-5 h-5 text-violet-light" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sector & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-violet-light" />
                  Secteur d'activité
                </h3>
                <select
                  value={settings.sector}
                  onChange={(e) => setSettings({ ...settings, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:border-violet/50 focus:outline-none"
                >
                  <option value="">Sélectionnez un secteur</option>
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-light" />
                  Audience cible
                </h3>
                <input
                  type="text"
                  value={settings.targetAudience}
                  onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })}
                  placeholder="Ex: Entrepreneurs, Marketeurs, DRH..."
                  className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:border-violet/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Personal Context */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-light" />
                Contexte personnel
              </h3>
              <p className="text-muted-foreground mb-4">
                Parlez-nous de vous, votre expertise, votre parcours... L'IA utilisera ces informations pour personnaliser le contenu.
              </p>
              <textarea
                value={settings.personalContext}
                onChange={(e) => setSettings({ ...settings, personalContext: e.target.value })}
                placeholder="Ex: Je suis CEO d'une startup SaaS B2B. J'ai 10 ans d'expérience en marketing digital. Ma mission est d'aider les entreprises à automatiser leur croissance..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:border-violet/50 focus:outline-none resize-none"
              />
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                className="btn-gradient"
                onClick={() => setActiveTab("creators")}
              >
                Suivant : Choisir les créateurs
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Creators Tab */}
        {activeTab === "creators" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-light" />
                Créateurs inspirants
              </h3>
              <p className="text-muted-foreground mb-6">
                Sélectionnez les créateurs dont vous voulez vous inspirer. L'IA analysera leur style et leurs contenus performants.
              </p>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un créateur..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:border-violet/50 focus:outline-none"
                />
              </div>

              {/* Selected Creators */}
              {settings.inspiringCreators.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {settings.inspiringCreators.length} créateur(s) sélectionné(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {settings.inspiringCreators.map((creatorId) => {
                      const creator = influencers.find(i => i.id === creatorId);
                      if (!creator) return null;
                      return (
                        <div
                          key={creatorId}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet/20 border border-violet/30"
                        >
                          <CreatorAvatar
                            name={creator.name}
                            profilePicture={creator.profilePicture}
                            linkedinUsername={creator.linkedinUsername}
                            linkedinUrl={creator.linkedinUrl}
                            size="sm"
                            ring={false}
                          />
                          <span className="text-sm text-white">{creator.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCreator(creatorId)}
                            className="text-violet-light hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Creators Grid */}
              {isLoadingInfluencers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-light" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredInfluencers.map((influencer) => (
                    <button
                      key={influencer.id}
                      type="button"
                      onClick={() => toggleCreator(influencer.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        settings.inspiringCreators.includes(influencer.id)
                          ? "bg-violet/20 border-violet/50"
                          : "bg-card/50 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <CreatorAvatar
                          name={influencer.name}
                          profilePicture={influencer.profilePicture}
                          linkedinUsername={influencer.linkedinUsername}
                          linkedinUrl={influencer.linkedinUrl}
                          size="md"
                          ring={false}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">
                              {influencer.name}
                            </p>
                            {settings.inspiringCreators.includes(influencer.id) && (
                              <Check className="w-4 h-4 text-violet-light flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {influencer.headline}
                          </p>
                          <p className="text-sm text-violet-light mt-1">
                            {formatFollowers(influencer.followers)} abonnés
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("objectives")}
              >
                Retour
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => setActiveTab("content")}
              >
                Suivant : Type de contenu
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Content Types */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-light" />
                Types de contenus
              </h3>
              <p className="text-muted-foreground mb-6">
                Quels types de contenus voulez-vous publier ?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleContentType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.contentTypes.includes(type.id)
                        ? "bg-violet/20 border-violet/50"
                        : "bg-card/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      {settings.contentTypes.includes(type.id) && (
                        <Check className="w-4 h-4 text-violet-light ml-auto" />
                      )}
                    </div>
                    <p className="font-medium text-white">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-light" />
                Ton de communication
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSettings({ ...settings, tone: tone.id })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      settings.tone === tone.id
                        ? "bg-violet/20 border-violet/50"
                        : "bg-card/50 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{tone.icon}</span>
                    <p className="font-medium text-white text-sm">{tone.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Virality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-light" />
                  Langue
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSettings({ ...settings, language: lang.id })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        settings.language === lang.id
                          ? "bg-violet/20 border-violet/50"
                          : "bg-card/50 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xl mb-1 block">{lang.flag}</span>
                      <p className="text-sm text-white">{lang.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-violet-light" />
                  Niveau de viralité
                </h3>
                <div className="space-y-3">
                  {VIRALITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSettings({ ...settings, viralityLevel: level.id })}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        settings.viralityLevel === level.id
                          ? "bg-violet/20 border-violet/50"
                          : "bg-card/50 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${level.color}`} />
                      <div>
                        <p className="font-medium text-white">{level.name}</p>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Options de contenu</h3>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "includeEmojis", label: "Emojis", icon: "😊" },
                  { key: "includeHashtags", label: "Hashtags", icon: "#" },
                  { key: "includeCallToAction", label: "Call-to-action", icon: "👉" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSettings({ 
                      ...settings, 
                      [option.key]: !settings[option.key as keyof Settings] 
                    })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      settings[option.key as keyof Settings]
                        ? "bg-violet/20 border-violet/50 text-white"
                        : "bg-card/50 border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {settings[option.key as keyof Settings] && (
                      <Check className="w-4 h-4 text-violet-light" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("creators")}
              >
                Retour
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => setActiveTab("visual")}
              >
                Suivant : Visuel
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Visual Tab - Image Settings */}
        {activeTab === "visual" && (
          <div className="space-y-8">
            {/* Include Image Toggle */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Image pour le post</h3>
                    <p className="text-muted-foreground">Ajouter une image à chaque publication automatique</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, includeImage: !settings.includeImage })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    settings.includeImage ? "bg-violet" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                    settings.includeImage ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>
            </div>

            {settings.includeImage && (
              <>
                {/* Image Type Selection */}
                <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-light" />
                    Type d'image
                  </h3>
                  <p className="text-muted-foreground mb-6">Choisissez comment générer vos visuels</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, imageType: "ai" })}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        settings.imageType === "ai"
                          ? "border-violet bg-violet/10 ring-2 ring-violet/50"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Image IA</p>
                          <p className="text-xs text-violet-light">Recommandé</p>
                        </div>
                        {settings.imageType === "ai" && (
                          <Check className="w-5 h-5 text-violet-light ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        DALL-E analyse votre post et crée une illustration professionnelle unique
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, imageType: "quote" })}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        settings.imageType === "quote"
                          ? "border-violet bg-violet/10 ring-2 ring-violet/50"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <p className="font-semibold text-white">Citation graphique</p>
                        {settings.imageType === "quote" && (
                          <Check className="w-5 h-5 text-violet-light ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Image avec citation inspirante sur fond coloré stylisé
                      </p>
                    </button>
                  </div>
                </div>

                {settings.imageType === "ai" ? (
                  <>
                    {/* AI Style Selection */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-light" />
                        Style visuel IA
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        L'IA adapte le style de l'illustration à votre secteur et contenu
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AI_IMAGE_STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSettings({ ...settings, aiImageStyle: style.id })}
                            className={`relative overflow-hidden rounded-xl border transition-all ${
                              settings.aiImageStyle === style.id
                                ? "border-violet ring-2 ring-violet/50"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`h-24 ${style.preview} flex items-center justify-center`}>
                              <span className="text-3xl">{style.icon}</span>
                            </div>
                            <div className="p-3 bg-card">
                              <p className="font-medium text-white text-sm">{style.name}</p>
                              <p className="text-xs text-muted-foreground">{style.description}</p>
                            </div>
                            {settings.aiImageStyle === style.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-2">Format de l&apos;image</h3>
                      <p className="text-muted-foreground mb-6">Choisissez le format adapté à LinkedIn</p>
                      <div className="grid grid-cols-2 gap-4">
                        {AI_IMAGE_FORMATS.map(format => (
                          <button
                            key={format.id}
                            type="button"
                            onClick={() => setSettings({ ...settings, aiImageFormat: format.id })}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              settings.aiImageFormat === format.id
                                ? "border-violet ring-2 ring-violet/50 bg-violet/5"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`w-14 shrink-0 rounded border border-white/20 bg-white/5 ${format.aspect}`} />
                            <div className="text-left">
                              <p className="font-medium text-white">{format.name}</p>
                              <p className="text-xs text-muted-foreground">{format.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-violet/20 bg-violet/5 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-violet-light mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-white mb-1">Comment ça marche ?</p>
                          <p className="text-sm text-muted-foreground">
                            À chaque publication, l'IA lit votre post, génère un prompt visuel adapté
                            (style « {AI_IMAGE_STYLES.find(s => s.id === settings.aiImageStyle)?.name} »)
                            puis crée une illustration via DALL-E. Testez le rendu à l'étape « Aperçu & Test ».
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Image Style Selection */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-violet-light" />
                        Style de citation
                      </h3>
                      <p className="text-muted-foreground mb-6">Choisissez le style visuel de vos images de citation</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {IMAGE_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setSettings({ ...settings, imageStyle: style.id })}
                            className={`relative overflow-hidden rounded-xl border transition-all ${
                              settings.imageStyle === style.id
                                ? "border-violet ring-2 ring-violet/50"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`h-24 ${style.preview} flex items-center justify-center`}>
                              <span className="text-white/80 text-sm font-medium px-3 text-center">"Votre citation ici"</span>
                            </div>
                            <div className="p-3 bg-card">
                              <p className="font-medium text-white text-sm">{style.name}</p>
                              <p className="text-xs text-muted-foreground">{style.description}</p>
                            </div>
                            {settings.imageStyle === style.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Palette Selection */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-violet-light" />
                        Palette de couleurs
                      </h3>
                      <p className="text-muted-foreground mb-6">Sélectionnez les couleurs de votre image</p>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {COLOR_PALETTES.map((palette) => (
                          <button
                            key={palette.id}
                            onClick={() => setSettings({ ...settings, colorPalette: palette.id })}
                            className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                              settings.colorPalette === palette.id
                                ? "border-violet bg-violet/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${palette.bg}`} />
                            <span className="text-xs text-white/80">{palette.name}</span>
                            {settings.colorPalette === palette.id && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-light" />
                        Aperçu du style
                      </h3>
                      <div className="flex justify-center">
                        <div className={`relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${
                          COLOR_PALETTES.find(p => p.id === settings.colorPalette)?.bg || "from-violet-600 to-pink-500"
                        }`}>
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <div className="text-5xl mb-4">"</div>
                            <p className="text-white text-xl font-medium leading-relaxed mb-6">
                              {settings.customQuote || "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès."}
                            </p>
                            <div className="text-white/80 text-sm">
                              — {user?.name || "Votre nom"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm text-muted-foreground mb-2">Citation personnalisée (optionnel)</label>
                        <textarea
                          value={settings.customQuote}
                          onChange={(e) => setSettings({ ...settings, customQuote: e.target.value })}
                          placeholder="Laissez vide pour extraire automatiquement du post généré..."
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet/50 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("content")}
              >
                Retour
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => setActiveTab("schedule")}
              >
                Suivant : Planning
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-light" />
                Planning de publication
              </h3>
              <p className="text-muted-foreground mb-6">
                Choisissez une date précise ou un créneau récurrent chaque semaine
              </p>

              {/* Planning mode */}
              <div className="flex gap-2 p-1 rounded-lg bg-background/50 border border-white/10 mb-6 max-w-md">
                <button
                  type="button"
                  onClick={() => setPlanningMode("once")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    planningMode === "once" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Date précise
                </button>
                <button
                  type="button"
                  onClick={() => setPlanningMode("recurring")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    planningMode === "recurring" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Chaque semaine
                </button>
              </div>

              {planningMode === "once" ? (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Sélectionnez une date</p>
                  <Input
                    type="date"
                    value={selectedDate}
                    min={formatDateInput(new Date())}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) {
                        setSelectedDay(getDayOfWeekFromDate(e.target.value));
                      }
                    }}
                    className="max-w-xs bg-card border-white/10 [color-scheme:dark]"
                  />
                  {selectedDate && (
                    <p className="text-xs text-violet-light mt-2 capitalize">
                      {formatDisplayDate(selectedDate)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Sélectionnez un jour (récurrent)</p>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedDay === day.id
                            ? "bg-violet text-white border-violet"
                            : "bg-card border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {day.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Sélectionnez une heure</p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        selectedTime === time
                          ? "bg-violet text-white border-violet"
                          : "bg-card border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Button */}
              <Button
                onClick={() => void handleAddScheduleSlot()}
                className="btn-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter ce créneau
              </Button>
            </div>

            {/* Current Schedule */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Planning actuel</h3>
              {schedule.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun créneau configuré. Ajoutez des créneaux ci-dessus.
                </p>
              ) : (
                <div className="space-y-2">
                  {schedule
                    .sort((a, b) => {
                      const dateA = a.publishDate ?? "";
                      const dateB = b.publishDate ?? "";
                      if (dateA !== dateB) return dateA.localeCompare(dateB);
                      return a.dayOfWeek - b.dayOfWeek || a.publishTime.localeCompare(b.publishTime);
                    })
                    .map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={slot.isActive}
                            onCheckedChange={() =>
                              void toggleScheduleSlotActive(
                                slot.dayOfWeek,
                                slot.publishTime,
                                slot.publishDate
                              )
                            }
                            className="data-[state=checked]:bg-emerald-500"
                            aria-label={slot.isActive ? "Désactiver ce créneau" : "Activer ce créneau"}
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${slot.isActive ? "bg-violet/20" : "bg-white/5 opacity-50"}`}>
                            <Calendar className={`w-5 h-5 ${slot.isActive ? "text-violet-light" : "text-muted-foreground"}`} />
                          </div>
                          <div className={slot.isActive ? "" : "opacity-50"}>
                            <p className="font-medium text-white capitalize">
                              {slot.publishDate
                                ? formatDisplayDate(slot.publishDate)
                                : `Chaque ${DAYS.find(d => d.id === slot.dayOfWeek)?.fullName?.toLowerCase()}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.publishTime}
                              {!slot.publishDate && " · récurrent"}
                              {!slot.isActive && " · en pause"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveScheduleSlot(
                              slot.dayOfWeek,
                              slot.publishTime,
                              slot.publishDate
                            )
                          }
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400">
                <strong>💡 Meilleurs horaires LinkedIn :</strong> Les posts publiés entre 7h30-8h30 et 17h30-18h30 en semaine obtiennent plus d'engagement. Mardi et mercredi sont les jours les plus performants.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("visual")}
              >
                Retour
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => setActiveTab("preview")}
              >
                Suivant : Aperçu & Test
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Summary */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">Récapitulatif</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objectifs</span>
                  <span className="text-white">
                    {settings.objectives.length > 0 
                      ? settings.objectives.map(o => OBJECTIVES.find(obj => obj.id === o)?.name).join(", ")
                      : "Non définis"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créateurs inspirants</span>
                  <span className="text-white">{settings.inspiringCreators.length} sélectionné(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Types de contenu</span>
                  <span className="text-white">
                    {settings.contentTypes.length > 0
                      ? settings.contentTypes.map(t => CONTENT_TYPES.find(ct => ct.id === t)?.name).join(", ")
                      : "Non définis"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créneaux de publication</span>
                  <span className="text-white">{schedule.length} créneau(x)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Langue</span>
                  <span className="text-white">{LANGUAGES.find(l => l.id === settings.language)?.name}</span>
                </div>
              </div>
            </div>

            {/* Generate Preview Section */}
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Tester la génération
              </h3>
              <p className="text-muted-foreground mb-4">
                Générez plusieurs aperçus pour choisir le meilleur
              </p>
              
              {/* Preview count selector */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">Nombre d'aperçus :</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPreviewCount(num)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        previewCount === num
                          ? "bg-violet text-white"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  className="btn-gradient"
                  onClick={handleGeneratePreview}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Générer {previewCount} aperçu{previewCount > 1 ? "s" : ""} avec l'IA
                </Button>
                {settings.contentTypes.includes("carousel") && (
                  <Button
                    variant="outline"
                    className="border-violet/50 text-violet-light hover:bg-violet/10"
                    onClick={handleGenerateCarousel}
                    disabled={isGeneratingCarousel}
                  >
                    {isGeneratingCarousel ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Layers className="w-4 h-4 mr-2" />
                    )}
                    Générer un carrousel
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Content */}
            {previewContent && (
              <div className="space-y-6">
                {/* Preview Selector - show when multiple previews */}
                {previewContents.length > 1 && (
                  <div className="p-4 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white">
                        Sélectionnez un aperçu ({selectedPreviewIndex + 1}/{previewContents.length})
                      </h3>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {previewContents.map((content, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectPreview(index)}
                          className={`flex-shrink-0 p-3 rounded-xl border transition-all text-left ${
                            selectedPreviewIndex === index
                              ? "border-violet bg-violet/20 ring-2 ring-violet/50"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                          style={{ width: "200px" }}
                        >
                          <div className="text-xs text-muted-foreground mb-1">Aperçu {index + 1}</div>
                          <p className="text-xs text-white/80 line-clamp-3">
                            {content.substring(0, 100)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editable Post Content */}
                <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet to-rose" />
                    <div>
                      <p className="font-semibold text-white">{user?.name || "Vous"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Éditez le texte généré par l'IA
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[220px] px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground focus:border-violet/50 focus:outline-none resize-y font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* Image Generation */}
                <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Image className="w-5 h-5 text-violet-light" />
                      Visuel pour le post
                    </h3>
                    <div className="flex gap-2 p-1 rounded-lg bg-background/50 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewImageSource("library")}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          previewImageSource === "library" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
                        Médiathèque
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewImageSource("ai")}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          previewImageSource === "ai" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        Image IA
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewImageSource("quote")}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          previewImageSource === "quote" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        Citation
                      </button>
                    </div>
                  </div>

                  {previewImageSource === "library" ? (
                    <div className="space-y-4">
                      {isLoadingSuggestions ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Analyse de votre médiathèque...
                        </div>
                      ) : (
                        <MediaLibraryPicker
                          selectedId={selectedMediaId}
                          suggestions={mediaSuggestions?.suggestions}
                          hasRelevantMatch={mediaSuggestions?.hasRelevantMatch}
                          onSwitchToAi={() => setPreviewImageSource("ai")}
                          onSelect={item => {
                            setSelectedMediaId(item.id);
                            setLibraryImageUrl(item.fileUrl);
                          }}
                        />
                      )}
                      {libraryImageUrl && (
                        <img
                          src={libraryImageUrl}
                          alt="Visuel sélectionné"
                          className="w-full rounded-xl border border-white/10 max-h-72 object-contain"
                        />
                      )}
                      <MediaUploadZone compact onUploaded={() => setMediaSuggestionsApplied(false)} />
                      <Link href="/mes-outils?tab=mediatheque" className="text-xs text-violet-light hover:underline flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" /> Gérer ma médiathèque
                      </Link>
                    </div>
                  ) : previewImageSource === "ai" ? (
                    <div className="space-y-4">
                      {aiImageUrl ? (
                        <>
                          <img src={aiImageUrl} alt="Image IA générée" className="w-full rounded-xl border border-white/10" />
                          {aiImagePrompt && (
                            <p className="text-xs text-muted-foreground italic">Prompt : {aiImagePrompt}</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateAiImage}
                            disabled={generateAiImageMutation.isPending}
                          >
                            {generateAiImageMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Regénérer l'image IA
                          </Button>
                        </>
                      ) : (
                        <div className="py-8 text-center border border-dashed border-violet/30 rounded-xl bg-violet/5">
                          <Sparkles className="w-10 h-10 mx-auto mb-3 text-violet-light/50" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Aucun visuel adapté dans votre médiathèque ? L&apos;IA crée une illustration professionnelle
                          </p>
                          <Button
                            onClick={handleGenerateAiImage}
                            disabled={generateAiImageMutation.isPending}
                            className="btn-gradient"
                          >
                            {generateAiImageMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Génération en cours (30-60s)...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Générer l&apos;image IA
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                        >
                          {isGeneratingImage ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          {generatedImageUrl ? "Regénérer" : "Générer la citation"}
                        </Button>
                        {generatedImageUrl && (
                          <a
                            href={generatedImageUrl}
                            download="linkedin-quote.png"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </a>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {generatedImageUrl ? (
                          <img src={generatedImageUrl} alt="Citation générée" className="max-w-full rounded-xl shadow-2xl" />
                        ) : (
                          <div className={`relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${
                            COLOR_PALETTES.find(p => p.id === settings.colorPalette)?.bg || "from-violet-600 to-pink-500"
                          }`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                              <div className="text-5xl mb-4">"</div>
                              <p className="text-white text-lg font-medium leading-relaxed mb-6">
                                {extractedQuote || settings.customQuote || "Citation extraite du post..."}
                              </p>
                              <div className="text-white/80 text-sm">— {user?.name || "Votre nom"}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Publish or Schedule */}
                <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-[#0077B5]" />
                    Publier ou planifier
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Publiez immédiatement sur LinkedIn ou programmez une date précise
                  </p>

                  <div className="flex gap-2 p-1 rounded-lg bg-background/50 border border-white/10 mb-4">
                    <button
                      type="button"
                      onClick={() => setPublishMode("now")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        publishMode === "now" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Publier maintenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishMode("schedule")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        publishMode === "schedule" ? "bg-violet text-white" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Planifier
                    </button>
                  </div>

                  {publishMode === "schedule" && (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-violet/30 bg-violet/5 mb-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-white">
                          <Calendar className="w-3 h-3" /> Date de diffusion
                        </Label>
                        <Input
                          type="date"
                          value={scheduleDate}
                          min={formatDateInput(new Date())}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="bg-background/50 border-white/10 [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-white">
                          <Clock className="w-3 h-3" /> Heure
                        </Label>
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="bg-background/50 border-white/10 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className={publishMode === "now" ? "w-full bg-[#0077B5] hover:bg-[#006699]" : "w-full btn-gradient"}
                    onClick={handlePublishOrSchedule}
                    disabled={isPublishing || isScheduling}
                  >
                    {(isPublishing || isScheduling) ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : publishMode === "now" ? (
                      <Linkedin className="w-4 h-4 mr-2" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    {publishMode === "now" ? "Publier sur LinkedIn" : "Planifier la publication"}
                  </Button>
                </div>

                {/* Generated Carousel */}
                {generatedCarousel && (
                  <div className="p-6 rounded-2xl border border-violet/30 bg-violet/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-violet-light" />
                        Carrousel généré
                      </h3>
                      <div className="flex gap-2">
                        <a
                          href="/carousels"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet/20 border border-violet/50 text-violet-light hover:bg-violet/30 transition-colors text-sm"
                        >
                          <FileDown className="w-4 h-4" />
                          Voir dans Carrousels
                        </a>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4">
                      <p className="text-white font-medium mb-2">{generatedCarousel.title || "Carrousel sans titre"}</p>
                      <p className="text-muted-foreground text-sm mb-4">
                        {generatedCarousel.slides?.length || 0} slides générées
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {generatedCarousel.slides?.slice(0, 5).map((slide: any, index: number) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-32 h-32 rounded-lg bg-gradient-to-br from-violet/30 to-rose/30 border border-white/10 p-3 flex flex-col justify-between"
                          >
                            <p className="text-xs text-white font-medium line-clamp-2">
                              {slide.title || `Slide ${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {slide.content?.substring(0, 50)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Final CTA */}
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                Prêt à automatiser ?
              </h3>
              <p className="text-emerald-400/70 mb-4">
                Sauvegardez vos paramètres et activez la publication automatique
              </p>
              <Button
                className="btn-gradient"
                onClick={handleSaveAndActivate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder et activer
              </Button>
            </div>
          </div>
        )}
      </div>

      {flowOverlay?.type === "flow" && (
        <AutoPublishFlowAnimation
          phase={flowOverlay.phase}
          phaseIndex={flowOverlay.phaseIndex}
        />
      )}
      {flowOverlay?.type === "success" && (
        <AutoPublishSuccessAnimation
          title={flowOverlay.title}
          message={flowOverlay.message}
          onComplete={() => setFlowOverlay(null)}
        />
      )}
      {flowOverlay?.type === "scheduled" && (
        <AutoPublishScheduledAnimation
          dateLabel={flowOverlay.dateLabel}
          timeLabel={flowOverlay.timeLabel}
          onComplete={() => setFlowOverlay(null)}
        />
      )}
    </div>
  );
}
