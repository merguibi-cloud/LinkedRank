import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Loader2,
  Volume2,
  X,
  ArrowRight,
  Building2,
  Target,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DetectedConfig {
  profession: string;
  sector: string;
  objectives: string[];
  tone: string;
  frequency: number;
  topics: string[];
}

interface VoiceAssistantProps {
  onConfigComplete: (config: DetectedConfig) => void;
  onClose: () => void;
}

export function VoiceAssistant({ onConfigComplete, onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedConfig, setDetectedConfig] = useState<DetectedConfig | null>(null);
  const [step, setStep] = useState<"intro" | "listening" | "analyzing" | "confirm">("intro");
  const recognitionRef = useRef<any>(null);

  // Exemples de phrases pour guider l'utilisateur
  const examplePhrases = [
    "Je suis plombier à Lyon, je veux plus de clients locaux",
    "Coach en développement personnel, je cherche à me faire connaître",
    "Dirigeant d'une PME dans le BTP, je veux recruter des talents",
    "Consultant freelance en marketing digital"
  ];

  useEffect(() => {
    // Vérifier si la reconnaissance vocale est disponible
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Redémarrer si on écoute toujours
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    setTranscript("");
    setIsListening(true);
    setStep("listening");
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    if (transcript.trim()) {
      analyzeTranscript();
    }
  };

  const analyzeTranscript = async () => {
    setStep("analyzing");
    setIsAnalyzing(true);

    // Simuler l'analyse IA (dans la vraie app, appeler l'API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Analyse simplifiée basée sur des mots-clés
    const text = transcript.toLowerCase();
    
    const config: DetectedConfig = {
      profession: detectProfession(text),
      sector: detectSector(text),
      objectives: detectObjectives(text),
      tone: detectTone(text),
      frequency: detectFrequency(text),
      topics: detectTopics(text)
    };

    setDetectedConfig(config);
    setIsAnalyzing(false);
    setStep("confirm");
  };

  const detectProfession = (text: string): string => {
    const professions: Record<string, string[]> = {
      "Artisan": ["plombier", "électricien", "menuisier", "maçon", "peintre", "carreleur", "artisan"],
      "Coach": ["coach", "coaching", "accompagnement", "développement personnel"],
      "Consultant": ["consultant", "conseil", "freelance", "indépendant"],
      "Dirigeant": ["dirigeant", "patron", "chef d'entreprise", "pme", "tpe", "gérant"],
      "Commerçant": ["commerce", "boutique", "magasin", "vente"],
      "Recruteur": ["recruteur", "rh", "ressources humaines", "talent"],
      "Formateur": ["formateur", "formation", "enseigner"]
    };

    for (const [profession, keywords] of Object.entries(professions)) {
      if (keywords.some(kw => text.includes(kw))) {
        return profession;
      }
    }
    return "Entrepreneur";
  };

  const detectSector = (text: string): string => {
    const sectors: Record<string, string[]> = {
      "BTP & Construction": ["btp", "construction", "bâtiment", "chantier", "travaux"],
      "Services": ["service", "prestation"],
      "Tech & Digital": ["tech", "digital", "informatique", "web", "marketing digital"],
      "Santé & Bien-être": ["santé", "bien-être", "médical", "thérapie"],
      "Commerce": ["commerce", "retail", "vente"],
      "Formation": ["formation", "éducation", "enseignement"]
    };

    for (const [sector, keywords] of Object.entries(sectors)) {
      if (keywords.some(kw => text.includes(kw))) {
        return sector;
      }
    }
    return "Services aux entreprises";
  };

  const detectObjectives = (text: string): string[] => {
    const objectives: string[] = [];
    
    if (text.includes("client") || text.includes("vendre") || text.includes("chiffre")) {
      objectives.push("Trouver de nouveaux clients");
    }
    if (text.includes("connaître") || text.includes("visibilité") || text.includes("notoriété")) {
      objectives.push("Augmenter ma visibilité");
    }
    if (text.includes("recruter") || text.includes("talent") || text.includes("embauche")) {
      objectives.push("Recruter des talents");
    }
    if (text.includes("expert") || text.includes("crédibilité") || text.includes("autorité")) {
      objectives.push("Devenir une référence");
    }

    return objectives.length > 0 ? objectives : ["Développer mon activité"];
  };

  const detectTone = (text: string): string => {
    if (text.includes("professionnel") || text.includes("sérieux") || text.includes("expert")) {
      return "Professionnel";
    }
    if (text.includes("sympa") || text.includes("décontracté") || text.includes("cool")) {
      return "Décontracté";
    }
    if (text.includes("inspir") || text.includes("motiv")) {
      return "Inspirant";
    }
    return "Authentique";
  };

  const detectFrequency = (text: string): number => {
    if (text.includes("tous les jours") || text.includes("quotidien")) return 7;
    if (text.includes("souvent") || text.includes("régulier")) return 5;
    if (text.includes("peu") || text.includes("parfois")) return 2;
    return 3; // Par défaut 3 fois par semaine
  };

  const detectTopics = (text: string): string[] => {
    const topics: string[] = [];
    
    if (text.includes("conseil") || text.includes("astuce") || text.includes("tip")) {
      topics.push("Conseils pratiques");
    }
    if (text.includes("témoignage") || text.includes("client") || text.includes("projet")) {
      topics.push("Témoignages clients");
    }
    if (text.includes("coulisse") || text.includes("quotidien") || text.includes("journée")) {
      topics.push("Coulisses de mon métier");
    }
    if (text.includes("actualité") || text.includes("tendance")) {
      topics.push("Actualités du secteur");
    }

    return topics.length > 0 ? topics : ["Conseils pratiques", "Témoignages clients"];
  };

  const handleConfirm = () => {
    if (detectedConfig) {
      onConfigComplete(detectedConfig);
    }
  };

  // Fonction pour utiliser un exemple
  const useExample = (example: string) => {
    setTranscript(example);
    analyzeTranscript();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-card border-white/10 p-8 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-transparent to-rose/10 pointer-events-none" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="relative z-10">
            {/* Step: Intro */}
            {step === "intro" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Parlez-moi de votre activité
                  </h2>
                  <p className="text-muted-foreground">
                    Décrivez simplement qui vous êtes et ce que vous voulez accomplir sur LinkedIn.
                    L'IA configurera tout pour vous.
                  </p>
                </div>

                <Button
                  onClick={startListening}
                  size="lg"
                  className="bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white px-8"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Commencer à parler
                </Button>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ou cliquez sur un exemple :
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {examplePhrases.map((phrase, i) => (
                      <button
                        key={i}
                        onClick={() => useExample(phrase)}
                        className="px-3 py-1.5 text-sm rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                      >
                        "{phrase.substring(0, 30)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Listening */}
            {step === "listening" && (
              <div className="text-center space-y-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center"
                >
                  <Volume2 className="w-12 h-12 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Je vous écoute...
                  </h2>
                  <p className="text-muted-foreground">
                    Parlez naturellement, comme si vous expliquiez à un ami
                  </p>
                </div>

                {/* Transcript display */}
                <div className="min-h-[100px] p-4 rounded-xl bg-white/5 border border-white/10">
                  {transcript ? (
                    <p className="text-white text-lg">{transcript}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Votre texte apparaîtra ici...
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={stopListening}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    J'ai terminé
                  </Button>
                  <Button
                    onClick={() => {
                      setTranscript("");
                      setStep("intro");
                      setIsListening(false);
                      recognitionRef.current?.stop();
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Recommencer
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Analyzing */}
            {step === "analyzing" && (
              <div className="text-center space-y-6 py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-20 h-20 mx-auto"
                >
                  <Sparkles className="w-20 h-20 text-violet" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analyse en cours...
                  </h2>
                  <p className="text-muted-foreground">
                    L'IA comprend vos besoins et prépare la configuration idéale
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-violet" />
                  <span className="text-muted-foreground">Quelques secondes...</span>
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === "confirm" && detectedConfig && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Configuration détectée !
                  </h2>
                  <p className="text-muted-foreground">
                    Vérifiez que tout est correct, puis activez vos agents
                  </p>
                </div>

                {/* Detected config cards */}
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-violet" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Votre profil</p>
                        <p className="text-white font-medium">
                          {detectedConfig.profession} • {detectedConfig.sector}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-rose" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vos objectifs</p>
                        <p className="text-white font-medium">
                          {detectedConfig.objectives.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fréquence</p>
                        <p className="text-white font-medium">
                          {detectedConfig.frequency} posts par semaine • Ton {detectedConfig.tone.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Sujets détectés :</p>
                  <div className="flex flex-wrap gap-2">
                    {detectedConfig.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-violet/20 text-violet-light text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleConfirm}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Activer mes Agents IA
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      setStep("intro");
                      setTranscript("");
                      setDetectedConfig(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
