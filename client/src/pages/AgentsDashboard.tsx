import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { 
  Bot, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  TrendingUp,
  MessageSquare,
  Users,
  Zap,
  Settings,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Calendar,
  BarChart3,
  Brain,
  Loader2,
  AlertCircle,
  Rocket,
  Save,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import AgentScheduleModal from "@/components/AgentScheduleModal";
import { isAgentAvailable, getAgentByBackendType } from "@/lib/agentsRoster";

// Import types from shared
import type { Agent as SharedAgent, AgentTask as SharedAgentTask, AgentConfig } from "@/../../shared/agentTypes";

// Extended Agent type for UI
interface Agent extends Omit<SharedAgent, 'config' | 'description' | 'avatar' | 'successRate' | 'lastActiveAt'> {
  description?: string | null;
  avatar?: string | null;
  successRate?: string | null;
  lastActiveAt?: Date | string | null;
  config?: AgentConfig | null;
}

interface AgentTask {
  id: number;
  agentId: number;
  type: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  outputData?: {
    generatedPost?: {
      title?: string;
      content?: string;
      hashtags?: string[];
      suggestedMedia?: string;
      callToAction?: string;
    };
    carousel?: {
      slides?: any[];
      topic?: string;
    };
    trends?: any[];
    analysis?: string;
    recommendations?: string[];
    suggestions?: any[];
    metadata?: any;
  } | null;
  createdAt: string | Date;
}

interface AgentLog {
  id: number;
  agentId: number | null;
  action: string;
  level: string;
  message: string;
  createdAt: string | Date;
}

// Configuration Modal Component
function ConfigureAgentModal({ 
  agent, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  agent: Agent | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (agentId: number, config: any) => void;
}) {
  const [config, setConfig] = useState({
    tone: "professional",
    topics: [] as string[],
    frequency: "daily",
    targetAudience: "professionals",
    contentLength: "medium",
    hashtagCount: 5,
    emojiUsage: "moderate",
    autonomyLevel: "supervised" as "supervised" | "semi_autonomous" | "autonomous",
    requiresApproval: true,
  });
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    if (agent?.config) {
      const cfg = agent.config as any;
      setConfig({
        tone: cfg.writingStyle || cfg.tone || "professional",
        topics: cfg.preferredTopics || cfg.topics || [],
        frequency: cfg.postingFrequency || cfg.frequency || "daily",
        targetAudience: cfg.targetAudience || "professionals",
        contentLength: cfg.contentLength || "medium",
        hashtagCount: cfg.hashtagCount || 5,
        emojiUsage: cfg.emojiUsage || "moderate",
        autonomyLevel: agent.autonomyLevel || "supervised",
        requiresApproval: agent.requiresApproval ?? true,
      });
    }
  }, [agent]);

  const addTopic = () => {
    if (topicInput.trim() && !config.topics.includes(topicInput.trim())) {
      setConfig({ ...config, topics: [...config.topics, topicInput.trim()] });
      setTopicInput("");
    }
  };

  const removeTopic = (topic: string) => {
    setConfig({ ...config, topics: config.topics.filter(t => t !== topic) });
  };

  const handleSave = () => {
    if (agent) {
      onSave(agent.id, config);
      onClose();
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurer {agent.name}
          </DialogTitle>
          <DialogDescription>
            Personnalisez le comportement de votre agent IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Autonomy Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Niveau d'autonomie</Label>
            <Select 
              value={config.autonomyLevel} 
              onValueChange={(value: "supervised" | "semi_autonomous" | "autonomous") => 
                setConfig({ ...config, autonomyLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervised">
                  <div className="flex flex-col">
                    <span>Supervisé</span>
                    <span className="text-xs text-muted-foreground">Approbation requise pour chaque action</span>
                  </div>
                </SelectItem>
                <SelectItem value="semi_autonomous">
                  <div className="flex flex-col">
                    <span>Semi-autonome</span>
                    <span className="text-xs text-muted-foreground">Approbation pour les actions importantes</span>
                  </div>
                </SelectItem>
                <SelectItem value="autonomous">
                  <div className="flex flex-col">
                    <span>Autonome</span>
                    <span className="text-xs text-muted-foreground">Actions automatiques sans approbation</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label className="text-base font-semibold">Approbation requise</Label>
              <p className="text-sm text-muted-foreground">
                Demander votre validation avant chaque publication
              </p>
            </div>
            <Switch 
              checked={config.requiresApproval}
              onCheckedChange={(checked) => setConfig({ ...config, requiresApproval: checked })}
            />
          </div>

          {/* Tone */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Ton de communication</Label>
            <Select 
              value={config.tone} 
              onValueChange={(value) => setConfig({ ...config, tone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professionnel</SelectItem>
                <SelectItem value="casual">Décontracté</SelectItem>
                <SelectItem value="inspirational">Inspirant</SelectItem>
                <SelectItem value="educational">Éducatif</SelectItem>
                <SelectItem value="humorous">Humoristique</SelectItem>
                <SelectItem value="authoritative">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sujets de prédilection</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Ajouter un sujet..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTopic()}
              />
              <Button onClick={addTopic} variant="secondary">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.topics.map((topic, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {topic}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTopic(topic)}
                  />
                </Badge>
              ))}
              {config.topics.length === 0 && (
                <span className="text-sm text-muted-foreground">Aucun sujet défini</span>
              )}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Fréquence de publication</Label>
            <Select 
              value={config.frequency} 
              onValueChange={(value) => setConfig({ ...config, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_daily">Plusieurs fois par jour</SelectItem>
                <SelectItem value="daily">Une fois par jour</SelectItem>
                <SelectItem value="every_other_day">Un jour sur deux</SelectItem>
                <SelectItem value="weekly">Une fois par semaine</SelectItem>
                <SelectItem value="on_demand">À la demande uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Length */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Longueur du contenu</Label>
            <Select 
              value={config.contentLength} 
              onValueChange={(value) => setConfig({ ...config, contentLength: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Court (moins de 500 caractères)</SelectItem>
                <SelectItem value="medium">Moyen (500-1500 caractères)</SelectItem>
                <SelectItem value="long">Long (1500-3000 caractères)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hashtag Count */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Nombre de hashtags</Label>
              <span className="text-sm font-medium">{config.hashtagCount}</span>
            </div>
            <Slider 
              value={[config.hashtagCount]}
              onValueChange={([value]) => setConfig({ ...config, hashtagCount: value })}
              min={0}
              max={15}
              step={1}
            />
          </div>

          {/* Emoji Usage */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Utilisation des emojis</Label>
            <Select 
              value={config.emojiUsage} 
              onValueChange={(value) => setConfig({ ...config, emojiUsage: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="minimal">Minimal (1-2)</SelectItem>
                <SelectItem value="moderate">Modéré (3-5)</SelectItem>
                <SelectItem value="abundant">Abondant (6+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Launch Task Modal Component
function LaunchTaskModal({ 
  agent, 
  isOpen, 
  onClose, 
  onLaunch 
}: { 
  agent: Agent | null; 
  isOpen: boolean; 
  onClose: () => void;
  onLaunch: (agentId: number, taskType: string, taskTitle: string, description: string, priority: string) => void;
}) {
  const [taskType, setTaskType] = useState("generate_post");
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    if (agent) {
      // Set default task type based on agent type
      if (agent.type === "content_creator") {
        setTaskType("generate_post");
        setTaskTitle("Générer un post LinkedIn");
      } else if (agent.type === "trend_hunter") {
        setTaskType("detect_trend");
        setTaskTitle("Détecter les tendances actuelles");
      } else if (agent.type === "engagement_manager") {
        setTaskType("suggest_response");
        setTaskTitle("Analyser les commentaires récents");
      } else if (agent.type === "growth_strategist") {
        setTaskType("analyze_performance");
        setTaskTitle("Analyser les performances");
      } else if (agent.type === "network_builder") {
        setTaskType("suggest_connection");
        setTaskTitle("Suggérer des connexions");
      }
    }
  }, [agent]);

  const handleLaunch = () => {
    if (agent && taskTitle) {
      onLaunch(agent.id, taskType, taskTitle, description, priority);
      onClose();
      setDescription("");
    }
  };

  if (!agent) return null;

  const getTaskTypes = () => {
    switch (agent.type) {
      case "content_creator":
        return [
          { value: "generate_post", label: "Générer un post" },
          { value: "generate_carousel", label: "Générer un carrousel" },
          { value: "generate_infographic", label: "Générer une infographie" },
        ];
      case "trend_hunter":
        return [
          { value: "detect_trend", label: "Détecter les tendances" },
          { value: "analyze_trends", label: "Analyser les tendances" },
        ];
      case "engagement_manager":
        return [
          { value: "suggest_response", label: "Suggérer des réponses" },
          { value: "analyze_comments", label: "Analyser les commentaires" },
        ];
      case "growth_strategist":
        return [
          { value: "analyze_performance", label: "Analyser les performances" },
          { value: "suggest_strategy", label: "Suggérer une stratégie" },
        ];
      case "network_builder":
        return [
          { value: "suggest_connection", label: "Suggérer des connexions" },
          { value: "analyze_network", label: "Analyser le réseau" },
        ];
      default:
        return [{ value: "generate_post", label: "Générer un post" }];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Lancer une tâche - {agent.name}
          </DialogTitle>
          <DialogDescription>
            Configurez et lancez une nouvelle tâche pour cet agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Type */}
          <div className="space-y-2">
            <Label>Type de tâche</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getTaskTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label>Titre de la tâche</Label>
            <Input 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ex: Créer un post sur l'IA"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Instructions supplémentaires (optionnel)</Label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce que vous attendez de l'agent..."
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priorité</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleLaunch} disabled={!taskTitle}>
            <Play className="h-4 w-4 mr-2" />
            Lancer la tâche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Agent card component
function AgentCard({ agent, onToggle, onConfigure, onLaunchTask, onSchedule, isToggling }: { 
  agent: Agent; 
  onToggle: (id: number, active: boolean) => void;
  onConfigure: (agent: Agent) => void;
  onLaunchTask: (agent: Agent) => void;
  onSchedule: (agent: Agent) => void;
  isToggling: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "learning": return "bg-blue-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "paused": return "En pause";
      case "learning": return "Apprentissage";
      case "error": return "Erreur";
      default: return status;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "content_creator": return <Sparkles className="h-6 w-6" />;
      case "trend_hunter": return <TrendingUp className="h-6 w-6" />;
      case "engagement_manager": return <MessageSquare className="h-6 w-6" />;
      case "growth_strategist": return <BarChart3 className="h-6 w-6" />;
      case "network_builder": return <Users className="h-6 w-6" />;
      default: return <Bot className="h-6 w-6" />;
    }
  };

  const successRate = agent.tasksCompleted > 0 
    ? Math.round((agent.tasksApproved / agent.tasksCompleted) * 100)
    : 0;

  const rosterEntry = getAgentByBackendType(agent.type);
  const available = isAgentAvailable(agent.type);
  const displayName = rosterEntry?.name ?? agent.name;

  return (
    <Card className={`relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all ${
      available ? "hover:border-primary/30" : "opacity-70 border-dashed"
    }`}>
      {!available && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px] z-[1] pointer-events-none" />
      )}
      <div className={`absolute top-0 left-0 w-1 h-full ${available ? getStatusColor(agent.status) : "bg-amber-500/60"}`} />
      
      <CardHeader className="pb-3 relative z-[2]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10 text-primary ${!available ? "grayscale" : ""}`}>
              {agent.avatar ? (
                <span className="text-2xl">{agent.avatar}</span>
              ) : (
                getAgentIcon(agent.type)
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {displayName}
                {!available && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 gap-1">
                    <Lock className="w-3 h-3" />
                    Arrive bientôt
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {rosterEntry?.role ?? agent.description ?? `Agent ${agent.type.replace(/_/g, " ")}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {available ? (
              <>
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel(agent.status)}
                </Badge>
                <Switch 
                  checked={agent.status === "active"}
                  onCheckedChange={(checked) => onToggle(agent.id, checked)}
                  disabled={isToggling}
                />
              </>
            ) : (
              <Badge variant="secondary" className="text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                Bientôt
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-[2]">
        {!available ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {rosterEntry?.description ?? "Cet agent sera disponible prochainement."}
            </p>
          </div>
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-primary">{agent.tasksCompleted}</p>
            <p className="text-xs text-muted-foreground">Tâches</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-green-500">{agent.tasksApproved}</p>
            <p className="text-xs text-muted-foreground">Approuvées</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-red-500">{agent.tasksRejected}</p>
            <p className="text-xs text-muted-foreground">Rejetées</p>
          </div>
        </div>

        {/* Success rate */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Taux de succès</span>
            <span className="font-medium">{successRate}%</span>
          </div>
          <Progress value={successRate} className="h-1.5" />
        </div>

        {/* Autonomy level */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Autonomie</span>
          <Badge variant={agent.autonomyLevel === "autonomous" ? "default" : "secondary"}>
            {agent.autonomyLevel === "supervised" && "Supervisé"}
            {agent.autonomyLevel === "semi_autonomous" && "Semi-autonome"}
            {agent.autonomyLevel === "autonomous" && "Autonome"}
          </Badge>
        </div>

        {/* Schedule info */}
        {agent.scheduleEnabled && (
          <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-500/10">
            <span className="text-green-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Planifié
            </span>
            <span className="text-xs text-muted-foreground">
              {agent.scheduleDays?.length || 0} jours/sem
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onConfigure(agent)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Config
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onSchedule(agent)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Planifier
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onLaunchTask(agent)}
          >
            <Rocket className="h-4 w-4" />
          </Button>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Task approval card
function TaskApprovalCard({ task, onApprove, onReject, isProcessing }: {
  task: AgentTask;
  onApprove: (taskId: number) => void;
  onReject: (taskId: number, reason: string) => void;
  isProcessing: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-500 bg-red-500/10";
      case "high": return "text-orange-500 bg-orange-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{task.title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {new Date(task.createdAt).toLocaleString("fr-FR")}
            </CardDescription>
          </div>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Generated content preview */}
        {task.outputData?.generatedPost?.content && (
          <div className="p-3 rounded-lg bg-muted/50 max-h-48 overflow-y-auto">
            {task.outputData.generatedPost.title && (
              <p className="text-sm font-semibold mb-2">{task.outputData.generatedPost.title}</p>
            )}
            <p className="text-sm whitespace-pre-wrap">
              {task.outputData.generatedPost.content}
            </p>
            {task.outputData.generatedPost.hashtags && task.outputData.generatedPost.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.outputData.generatedPost.hashtags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {task.outputData.generatedPost.callToAction && (
              <p className="text-xs text-primary mt-2 italic">{task.outputData.generatedPost.callToAction}</p>
            )}
          </div>
        )}
        
        {/* Carousel preview */}
        {task.outputData?.carousel?.slides && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold mb-2">Carrousel: {task.outputData.carousel.topic}</p>
            <p className="text-xs text-muted-foreground">{task.outputData.carousel.slides.length} slides générées</p>
          </div>
        )}
        
        {/* Trends analysis preview */}
        {task.outputData?.trends && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold mb-2">Tendances détectées</p>
            {task.outputData.analysis && (
              <p className="text-sm mb-2">{task.outputData.analysis}</p>
            )}
            {task.outputData.recommendations && (
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                {task.outputData.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Response suggestions preview */}
        {task.outputData?.suggestions && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold mb-2">Suggestions de réponse</p>
            {task.outputData.suggestions.map((sug: any, i: number) => (
              <div key={i} className="text-sm p-2 bg-background/50 rounded mb-1">
                <Badge variant="outline" className="text-xs mb-1">{sug.type}</Badge>
                <p className="text-xs">{sug.response}</p>
              </div>
            ))}
          </div>
        )}

        {/* Rejection form */}
        {showRejectForm && (
          <div className="space-y-2">
            <Textarea
              placeholder="Raison du rejet (optionnel)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                disabled={isProcessing}
                onClick={() => {
                  onReject(task.id, rejectionReason);
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Confirmer le rejet
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRejectForm(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showRejectForm && (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
              onClick={() => onApprove(task.id)}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ThumbsUp className="h-4 w-4 mr-1" />}
              Approuver
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10"
              onClick={() => setShowRejectForm(true)}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Rejeter
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity log item
function ActivityLogItem({ log }: { log: AgentLog }) {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {getLevelIcon(log.level)}
      <div className="flex-1 min-w-0">
        <p className="text-sm">{log.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(log.createdAt).toLocaleString("fr-FR")}
        </p>
      </div>
    </div>
  );
}

// Main dashboard component
export default function AgentsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isToggling, setIsToggling] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [configureAgent, setConfigureAgent] = useState<Agent | null>(null);
  const [launchAgent, setLaunchAgent] = useState<Agent | null>(null);
  const [scheduleAgent, setScheduleAgent] = useState<Agent | null>(null);
  
  // tRPC queries
  const { data: agentsData, isLoading: isLoadingAgents, refetch: refetchAgents } = trpc.agents.list.useQuery();
  const { data: pendingTasksData, isLoading: isLoadingTasks, refetch: refetchTasks } = trpc.agents.pendingTasks.useQuery();
  const { data: logsData, isLoading: isLoadingLogs, refetch: refetchLogs } = trpc.agents.logs.useQuery({ limit: 50 });
  
  // tRPC mutations
  const initializeAgents = trpc.agents.initialize.useMutation({
    onSuccess: () => {
      refetchAgents();
      toast.success("Agents initialisés", {
        description: "Vos agents IA sont prêts à travailler !",
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const toggleAgentStatus = trpc.agents.toggleStatus.useMutation({
    onSuccess: () => {
      refetchAgents();
      setIsToggling(false);
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
      setIsToggling(false);
    },
  });

  const updateAgentConfig = trpc.agents.updateConfig.useMutation({
    onSuccess: () => {
      refetchAgents();
      toast.success("Configuration sauvegardée", {
        description: "Les paramètres de l'agent ont été mis à jour.",
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const approveTaskMutation = trpc.agents.approveTask.useMutation({
    onSuccess: () => {
      refetchTasks();
      refetchAgents();
      refetchLogs();
      setIsProcessingTask(false);
      toast.success("Tâche approuvée", {
        description: "Le contenu a été approuvé et sera publié.",
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
      setIsProcessingTask(false);
    },
  });

  const rejectTaskMutation = trpc.agents.rejectTask.useMutation({
    onSuccess: () => {
      refetchTasks();
      refetchAgents();
      refetchLogs();
      setIsProcessingTask(false);
      toast.success("Tâche rejetée", {
        description: "La tâche a été rejetée et l'agent apprendra de ce feedback.",
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
      setIsProcessingTask(false);
    },
  });

  const createTaskMutation = trpc.agents.createTask.useMutation({
    onSuccess: (task) => {
      // Automatically process the task after creation
      if (task?.id) {
        processTaskMutation.mutate({ taskId: task.id });
      }
      refetchTasks();
      refetchLogs();
      refetchAgents();
      toast.success("Tâche créée", {
        description: "L'agent traite votre demande...",
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const processTaskMutation = trpc.agents.processTask.useMutation({
    onSuccess: () => {
      refetchTasks();
      refetchLogs();
      refetchAgents();
      toast.success("Tâche traitée", {
        description: "Le contenu est prêt pour approbation !",
      });
    },
    onError: (error) => {
      toast.error("Erreur de traitement", {
        description: error.message,
      });
    },
  });

  const processAllPendingMutation = trpc.agents.processAllPending.useMutation({
    onSuccess: (result) => {
      refetchTasks();
      refetchLogs();
      refetchAgents();
      toast.success("Tâches traitées", {
        description: `${result.processed} tâche(s) traitée(s), ${result.failed} échec(s)`,
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  // Initialize agents if none exist
  useEffect(() => {
    if (!isLoadingAgents && agentsData && agentsData.length === 0) {
      initializeAgents.mutate();
    }
  }, [isLoadingAgents, agentsData]);

  const agents = agentsData || [];
  const pendingTasks = (pendingTasksData || []) as AgentTask[];
  const activityLogs = (logsData || []) as AgentLog[];

  const stats = {
    totalTasksToday: 0,
    tasksAwaitingApproval: pendingTasks.length,
    activeAgents: agents.filter((a: Agent) => a.status === "active").length,
    successRate: agents.length > 0 
      ? Math.round((agents.reduce((sum: number, a: Agent) => sum + a.tasksApproved, 0) / 
          Math.max(1, agents.reduce((sum: number, a: Agent) => sum + a.tasksCompleted, 0))) * 100) + "%"
      : "0%",
  };

  const handleToggleAgent = (agentId: number, active: boolean) => {
    setIsToggling(true);
    toggleAgentStatus.mutate({ agentId, active });
    toast.success(active ? "Agent activé" : "Agent mis en pause", {
      description: `L'agent a été ${active ? "activé" : "mis en pause"} avec succès.`,
    });
  };

  const handleConfigureAgent = (agent: Agent) => {
    setConfigureAgent(agent);
  };

  const handleSaveConfig = (agentId: number, config: any) => {
    updateAgentConfig.mutate({ agentId, config });
  };

  const handleLaunchTask = (agent: Agent) => {
    setLaunchAgent(agent);
  };

  const handleScheduleAgent = (agent: Agent) => {
    setScheduleAgent(agent);
  };

  const handleCreateTask = (agentId: number, taskType: string, taskTitle: string, description: string, priority: string) => {
    createTaskMutation.mutate({
      agentId,
      type: taskType as any,
      title: taskTitle,
      description: description || undefined,
      priority: priority as any,
    });
  };

  const handleApproveTask = (taskId: number) => {
    setIsProcessingTask(true);
    approveTaskMutation.mutate({ taskId });
  };

  const handleRejectTask = (taskId: number, reason: string) => {
    setIsProcessingTask(true);
    rejectTaskMutation.mutate({ taskId, reason: reason || "Pas de raison spécifiée" });
  };

  const handleRefresh = () => {
    refetchAgents();
    refetchTasks();
    refetchLogs();
    toast.success("Données actualisées");
  };

  const handleReinitialize = () => {
    initializeAgents.mutate();
  };

  const isLoading = isLoadingAgents || isLoadingTasks || isLoadingLogs;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              Mes Agents IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Supervisez et contrôlez vos agents autonomes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" onClick={handleReinitialize}>
              <Zap className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTasksToday}</p>
                  <p className="text-xs text-muted-foreground">Tâches aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.tasksAwaitingApproval}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Bot className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeAgents}</p>
                  <p className="text-xs text-muted-foreground">Agents actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.successRate}</p>
                  <p className="text-xs text-muted-foreground">Taux de succès</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Approbations</span>
              {pendingTasks.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Activité</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent: Agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggle={handleToggleAgent}
                  onConfigure={handleConfigureAgent}
                  onLaunchTask={handleLaunchTask}
                  onSchedule={handleScheduleAgent}
                  isToggling={isToggling}
                />
              ))}
              
              {/* Add Agent Card */}
              <Card className="border-dashed border-2 border-border/50 bg-transparent hover:border-primary/30 transition-all cursor-pointer flex items-center justify-center min-h-[280px]">
                <CardContent className="text-center">
                  <div className="p-4 rounded-full bg-muted/50 mx-auto w-fit mb-3">
                    <Bot className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Ajouter un Agent</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Débloquez plus d'agents avec Pro
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-6">
            {pendingTasks.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Tout est à jour !</h3>
                  <p className="text-muted-foreground mt-1">
                    Aucune tâche en attente d'approbation
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingTasks.map((task) => (
                  <TaskApprovalCard
                    key={task.id}
                    task={task}
                    onApprove={handleApproveTask}
                    onReject={handleRejectTask}
                    isProcessing={isProcessingTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Journal d'activité</CardTitle>
                <CardDescription>
                  Historique des actions de vos agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {activityLogs.map((log) => (
                      <ActivityLogItem key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Calendrier des tâches</h3>
                <p className="text-muted-foreground mt-1">
                  Planifiez les actions de vos agents
                </p>
                <Button className="mt-4" variant="outline">
                  Configurer le calendrier
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Configuration Modal */}
      <ConfigureAgentModal
        agent={configureAgent}
        isOpen={!!configureAgent}
        onClose={() => setConfigureAgent(null)}
        onSave={handleSaveConfig}
      />

      {/* Launch Task Modal */}
      <LaunchTaskModal
        agent={launchAgent}
        isOpen={!!launchAgent}
        onClose={() => setLaunchAgent(null)}
        onLaunch={handleCreateTask}
      />

      {/* Schedule Modal */}
      <AgentScheduleModal
        agent={scheduleAgent as any}
        isOpen={!!scheduleAgent}
        onClose={() => setScheduleAgent(null)}
        onSuccess={() => refetchAgents()}
      />
    </DashboardLayout>
  );
}
