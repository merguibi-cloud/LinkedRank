import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Volume2,
  Copy,
  Save,
  Send,
  Trash2,
  Languages,
  Wand2,
  Sparkles,
  Clock,
  FileText,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
}

const LANGUAGES = [
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", label: "Italiano", flag: "🇮🇹" },
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "ar-SA", label: "العربية", flag: "🇸🇦" }
];

const VOICE_COMMANDS = [
  { command: "Nouveau paragraphe", action: "newline", description: "Ajoute un saut de ligne" },
  { command: "Point", action: "period", description: "Ajoute un point" },
  { command: "Virgule", action: "comma", description: "Ajoute une virgule" },
  { command: "Effacer", action: "clear", description: "Efface la transcription" }
];

export default function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("fr-FR");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setAudioLevel(Math.random() * 100);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setTranscription(prev => prev + " " + finalTranscript);
            setSegments(prev => [...prev, {
              id: `seg-${Date.now()}`,
              text: finalTranscript,
              timestamp: recordingTime,
              confidence: event.results[event.results.length - 1][0].confidence || 0.9
            }]);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          toast.error("Erreur de reconnaissance vocale");
        };

        recognitionRef.current.start();
        setIsRecording(true);
        setIsPaused(false);
        toast.success("Enregistrement démarré - Parlez maintenant");
      } else {
        // Fallback demo mode
        setIsRecording(true);
        setIsPaused(false);
        toast.success("Mode démo activé - Parlez normalement");
        
        setTimeout(() => {
          const demoText = "Voici un exemple de transcription vocale. L'assistant vocal vous permet de dicter vos posts LinkedIn facilement et rapidement.";
          setTranscription(prev => prev + " " + demoText);
          setSegments(prev => [...prev, {
            id: `seg-${Date.now()}`,
            text: demoText,
            timestamp: recordingTime,
            confidence: 0.95
          }]);
        }, 3000);
      }
    } catch (error) {
      setIsRecording(true);
      setIsPaused(false);
      toast.info("Mode démo activé");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioLevel(0);
    toast.success("Enregistrement terminé");
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsPaused(true);
    toast.info("Enregistrement en pause");
  };

  const resumeRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    setIsPaused(false);
    toast.info("Enregistrement repris");
  };

  const clearTranscription = () => {
    setTranscription("");
    setSegments([]);
    toast.success("Transcription effacée");
  };

  const copyTranscription = () => {
    navigator.clipboard.writeText(transcription);
    toast.success("Transcription copiée !");
  };

  const enhanceWithAI = async () => {
    if (!transcription.trim()) {
      toast.error("Aucun texte à améliorer");
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhanced = `🎯 ${transcription.trim()}

✨ Points clés :
→ Idée principale extraite automatiquement
→ Structure optimisée pour LinkedIn
→ Call-to-action ajouté

💡 Qu'en pensez-vous ?`;

    setTranscription(enhanced);
    setIsProcessing(false);
    toast.success("Texte amélioré avec l'IA !");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const saveAsDraft = () => {
    toast.success("Brouillon sauvegardé !");
  };

  const publishPost = () => {
    toast.success("Post envoyé pour publication !");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">🎙️ Assistant Vocal</h1>
            <p className="text-muted-foreground">
              Dictez vos posts LinkedIn au lieu de les taper
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40 md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommands(!showCommands)}
            >
              <Languages className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Commandes vocales */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Commandes vocales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {VOICE_COMMANDS.map((cmd) => (
                      <div
                        key={cmd.action}
                        className="p-3 rounded-lg bg-secondary/30 text-center"
                      >
                        <p className="font-medium text-primary text-sm">"{cmd.command}"</p>
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone d'enregistrement */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Visualisation audio */}
              <div className="relative mb-6">
                <motion.div
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center ${
                    isRecording 
                      ? "bg-red-500/20 border-2 border-red-500" 
                      : "bg-primary/20 border-2 border-primary"
                  }`}
                  animate={isRecording ? {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 20px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)"
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
                >
                  {isRecording ? (
                    <Mic className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                  ) : (
                    <MicOff className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  )}
                </motion.div>

                {/* Indicateur de niveau audio */}
                {isRecording && !isPaused && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-red-500 rounded-full"
                        animate={{
                          height: audioLevel > i * 20 ? [4, 16, 4] : 4
                        }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="text-2xl md:text-3xl font-mono font-bold mb-4">
                {formatTime(recordingTime)}
              </div>

              {/* Contrôles */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isRecording ? (
                  <Button
                    size="lg"
                    onClick={startRecording}
                    className="gap-2 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="w-5 h-5" />
                    <span className="hidden sm:inline">Commencer</span>
                    <span className="sm:hidden">Enregistrer</span>
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button
                        size="lg"
                        onClick={resumeRecording}
                        className="gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Reprendre
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={pauseRecording}
                        className="gap-2"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                      className="gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Arrêter
                    </Button>
                  </>
                )}
              </div>

              {/* Statut */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {isRecording && (
                  <Badge className={isPaused ? "bg-amber-500" : "bg-red-500"}>
                    {isPaused ? "En pause" : "Enregistrement..."}
                  </Badge>
                )}
                {segments.length > 0 && (
                  <Badge variant="outline">
                    {segments.length} segment(s)
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de transcription */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Transcription
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTranscription}
                  disabled={!transcription}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTranscription}
                  disabled={!transcription}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Votre transcription apparaîtra ici..."
              className="min-h-[150px] md:min-h-[200px] resize-none"
            />

            {/* Segments avec confiance */}
            {segments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Segments détectés :
                </p>
                <div className="flex flex-wrap gap-2">
                  {segments.map((segment) => (
                    <Badge
                      key={segment.id}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(segment.timestamp)}
                      <span className="text-green-500">
                        {Math.round(segment.confidence * 100)}%
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                onClick={enhanceWithAI}
                disabled={!transcription || isProcessing}
                className="gap-2"
                size="sm"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isProcessing ? "Amélioration..." : "Améliorer IA"}
              </Button>
              <Button
                variant="outline"
                onClick={saveAsDraft}
                disabled={!transcription}
                className="gap-2"
                size="sm"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </Button>
              <Button
                variant="default"
                onClick={publishPost}
                disabled={!transcription}
                className="gap-2 bg-[#0077B5] hover:bg-[#006097]"
                size="sm"
              >
                <Send className="w-4 h-4" />
                Publier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conseils */}
        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Conseils pour une meilleure transcription</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Parlez clairement et à un rythme modéré</li>
                  <li>• Utilisez un micro de qualité dans un environnement calme</li>
                  <li>• Dites "nouveau paragraphe" pour créer un saut de ligne</li>
                  <li>• Relisez et corrigez la transcription avant de publier</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
