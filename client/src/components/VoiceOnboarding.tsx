import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Bot, Loader2, ArrowRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

type AgentState = "welcome" | "speaking" | "listening" | "thinking" | "done";

interface VoiceOnboardingProps {
  autoStart?: boolean;
  onComplete?: () => void;
}

const BRIDGE_PHRASES = [
  "Super, merci !",
  "Parfait, j'ai bien noté.",
  "Excellent, continuons.",
  "Très bien, passons à la suite.",
  "Merci pour cette réponse.",
];

function pickBridge(index: number) {
  return BRIDGE_PHRASES[index % BRIDGE_PHRASES.length];
}

export function VoiceOnboarding({ autoStart = false, onComplete }: VoiceOnboardingProps) {
  const [, setLocation] = useLocation();
  const { data: questions = [] } = trpc.onboarding.getQuestions.useQuery();
  const finalizeMutation = trpc.onboarding.finalize.useMutation();

  const [agentState, setAgentState] = useState<AgentState>(autoStart ? "speaking" : "welcome");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; question: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [statusLabel, setStatusLabel] = useState("Connexion à votre agent...");
  const [extractedProfile, setExtractedProfile] = useState<Record<string, unknown> | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const currentAnswerRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frenchVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const startedRef = useRef(false);
  const answersRef = useRef(answers);
  const currentIndexRef = useRef(currentIndex);
  const submitAnswerRef = useRef<(override?: string) => Promise<void>>(async () => {});

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      frenchVoiceRef.current = voices.find((v) => v.lang.startsWith("fr")) ?? null;
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      setAgentState("speaking");
      setStatusLabel("Votre agent vous parle...");

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      if (frenchVoiceRef.current) utterance.voice = frenchVoiceRef.current;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const resetSilenceTimer = useCallback((onSilence: () => void) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (currentAnswerRef.current.trim()) onSilence();
    }, 2200);
  }, []);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setCurrentAnswer((prev) => {
          const next = (prev ? `${prev} ${finalText}` : finalText).trim();
          currentAnswerRef.current = next;
          return next;
        });
        resetSilenceTimer(() => void submitAnswerRef.current());
      }
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      recognition.stop();
      window.speechSynthesis?.cancel();
    };
  }, [resetSilenceTimer]);

  const startListening = useCallback(() => {
    setCurrentAnswer("");
    currentAnswerRef.current = "";
    isListeningRef.current = true;
    setAgentState("listening");
    setStatusLabel("Parlez maintenant, je vous écoute...");
    try {
      recognitionRef.current?.start();
    } catch {
      /* already started */
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();
    recognitionRef.current?.stop();
  }, []);

  const askQuestion = useCallback(
    async (index: number, prefix?: string) => {
      const q = questions[index];
      if (!q) return;
      const text = prefix ? `${prefix} ${q.question}` : q.question;
      await speak(text);
      startListening();
    },
    [questions, speak, startListening]
  );

  const submitAnswer = useCallback(async (answerOverride?: string) => {
    const index = currentIndexRef.current;
    const question = questions[index];
    const answerText = (answerOverride ?? currentAnswerRef.current).trim();
    if (!question || !answerText) return;

    stopListening();
    setAgentState("thinking");
    setStatusLabel("Je note votre réponse...");

    const newAnswers = [
      ...answersRef.current,
      {
        questionId: question.id,
        question: question.question,
        answer: answerText,
      },
    ];
    setAnswers(newAnswers);
    answersRef.current = newAnswers;
    setCurrentAnswer("");
    currentAnswerRef.current = "";

    const nextIndex = index + 1;

    if (nextIndex >= questions.length) {
      setStatusLabel("Je configure votre profil et l'automatisation...");
      try {
        const result = await finalizeMutation.mutateAsync({ answers: newAnswers });
        setExtractedProfile(result.profile as Record<string, unknown>);
        localStorage.setItem("linkedagents_onboarding_completed", "true");
        localStorage.setItem("linkedrank_voice_onboarding_completed", "true");

        const profile = result.profile as Record<string, unknown>;
        const summarySpeech = [
          "Parfait, tout est configuré !",
          `Votre activité : ${profile.companyName}.`,
          `Vous publierez environ ${profile.postsPerWeek} fois par semaine.`,
          "Vos agents IA vont maintenant automatiser vos publications LinkedIn.",
          "Bienvenue sur LinkedRank !",
        ].join(" ");

        setAgentState("done");
        setStatusLabel("Configuration terminée !");
        await speak(summarySpeech);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (error) {
        console.error("Onboarding finalize error:", error);
        setStatusLabel("Une erreur est survenue, réessayons...");
        await speak("Désolé, un problème est survenu. Pouvez-vous répéter votre dernière réponse ?");
        startListening();
      }
      return;
    }

    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;
    await askQuestion(nextIndex, pickBridge(index));
  }, [questions, stopListening, finalizeMutation, speak, askQuestion, startListening]);

  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);

  const beginConversation = useCallback(async () => {
    if (startedRef.current || questions.length === 0) return;
    startedRef.current = true;
    setAgentState("speaking");

    const intro =
      "Bonjour ! Je suis votre agent LinkedRank. Nous allons configurer vos publications ensemble, simplement en parlant. " +
      questions[0].question;

    await speak(intro);
    startListening();
  }, [questions, speak, startListening]);

  useEffect(() => {
    if (autoStart && questions.length > 0) {
      void beginConversation();
    }
  }, [autoStart, questions, beginConversation]);

  const handleFinish = () => {
    onComplete?.();
    setLocation("/dashboard");
  };

  const toggleMic = () => {
    if (isListeningRef.current) {
      void submitAnswerRef.current();
    } else if (agentState !== "speaking" && agentState !== "thinking") {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet/10 via-background to-rose/10 pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-violet to-rose transition-all duration-700"
          style={{ width: agentState === "welcome" ? "3%" : agentState === "done" ? "100%" : `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <AnimatePresence mode="wait">
          {agentState === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center max-w-lg space-y-8"
            >
              <AgentOrb state="idle" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/20 text-violet-light text-sm mb-4">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Agent vocal en direct
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  Parlez à votre agent
                </h1>
                <p className="text-muted-foreground text-lg">
                  L'agent vous pose des questions à voix haute et vous répond à voix haute.
                  Aucun formulaire — juste une conversation.
                </p>
              </div>
              <Button
                onClick={() => void beginConversation()}
                size="lg"
                className="bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white px-10 h-14 text-lg"
                disabled={questions.length === 0}
              >
                <Mic className="w-6 h-6 mr-2" />
                Démarrer la conversation
              </Button>
              <p className="text-xs text-muted-foreground">Autorisez le micro quand le navigateur le demande</p>
            </motion.div>
          )}

          {(agentState === "speaking" ||
            agentState === "listening" ||
            agentState === "thinking") && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-10 w-full max-w-md"
            >
              <AgentOrb state={agentState} />

              <div className="text-center space-y-2">
                <p className="text-white text-xl font-medium">{statusLabel}</p>
                <p className="text-muted-foreground text-sm">
                  {agentState === "speaking" && "Écoutez votre agent — pas besoin de lire"}
                  {agentState === "listening" && "Répondez naturellement — je détecte quand vous avez fini"}
                  {agentState === "thinking" && "Un instant..."}
                </p>
                {questions.length > 0 && agentState !== "thinking" && (
                  <p className="text-xs text-muted-foreground/70">
                    Question {Math.min(currentIndex + 1, questions.length)} / {questions.length}
                  </p>
                )}
              </div>

              {agentState === "listening" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex gap-1 h-8 items-end">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-violet rounded-full"
                        animate={{ height: [8, 24 + Math.random() * 16, 8] }}
                        transition={{ repeat: Infinity, duration: 0.5 + i * 0.1 }}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={toggleMic}
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <CheckIcon />
                    J'ai fini de parler
                  </Button>
                </motion.div>
              )}

              {agentState === "speaking" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    startListening();
                  }}
                >
                  Passer à ma réponse
                </Button>
              )}
            </motion.div>
          )}

          {agentState === "done" && extractedProfile && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8 text-center max-w-md"
            >
              <AgentOrb state="done" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">C'est prêt !</h2>
                <p className="text-muted-foreground">
                  Votre profil est enregistré. L'automatisation est activée.
                </p>
              </div>
              <Button
                onClick={handleFinish}
                size="lg"
                className="w-full bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white"
              >
                Accéder au dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AgentOrb({ state }: { state: AgentState | "idle" }) {
  const isActive = state === "speaking" || state === "listening";
  const color =
    state === "listening"
      ? "from-emerald-500 to-teal-400"
      : state === "done"
        ? "from-emerald-500 to-emerald-400"
        : "from-violet to-rose";

  return (
    <div className="relative">
      {isActive && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-20`}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ repeat: Infinity, duration: state === "listening" ? 1.2 : 1.8 }}
            style={{ width: 160, height: 160, margin: "auto", top: -20, left: -20 }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-10`}
            animate={{ scale: [1, 1.7, 1], opacity: [0.15, 0, 0.15] }}
            transition={{ repeat: Infinity, duration: state === "listening" ? 0.9 : 1.4, delay: 0.2 }}
            style={{ width: 160, height: 160, margin: "auto", top: -20, left: -20 }}
          />
        </>
      )}
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={`w-32 h-32 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl shadow-violet/30`}
      >
        {state === "thinking" ? (
          <Loader2 className="w-14 h-14 text-white animate-spin" />
        ) : state === "listening" ? (
          <Mic className="w-14 h-14 text-white" />
        ) : (
          <Bot className="w-14 h-14 text-white" />
        )}
      </motion.div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
