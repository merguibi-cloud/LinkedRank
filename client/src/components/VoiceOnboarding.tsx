import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, Bot, Loader2, ArrowRight, Radio, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MAX_VOICE_ATTEMPTS = 3;

type AgentState =
  | "welcome"
  | "preparing_mic"
  | "speaking"
  | "listening"
  | "thinking"
  | "done";

type MicPromptPhase = "speaking" | "waiting" | "denied";

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

export function VoiceOnboarding({
  autoStart = false,
  onComplete,
}: VoiceOnboardingProps) {
  const [, setLocation] = useLocation();
  const { data: questions = [] } = trpc.onboarding.getQuestions.useQuery();
  const finalizeMutation = trpc.onboarding.finalize.useMutation();

  const [agentState, setAgentState] = useState<AgentState>(
    autoStart ? "speaking" : "welcome"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; question: string; answer: string }[]
  >([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [statusLabel, setStatusLabel] = useState("Connexion à votre agent...");
  const [extractedProfile, setExtractedProfile] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [noSpeechHint, setNoSpeechHint] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState("");
  const [micPromptPhase, setMicPromptPhase] = useState<MicPromptPhase>("speaking");
  const [micDenied, setMicDenied] = useState(false);

  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  const isListeningRef = useRef(false);
  const currentAnswerRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frenchVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const startedRef = useRef(false);
  const answersRef = useRef(answers);
  const currentIndexRef = useRef(currentIndex);
  const submitAnswerRef = useRef<(override?: string) => Promise<void>>(
    async () => {}
  );
  const failedAttemptsRef = useRef(0);
  const manualFallbackRef = useRef(false);
  const micGrantedRef = useRef(false);
  const micPrepActiveRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

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
      frenchVoiceRef.current =
        voices.find(v => v.lang.startsWith("fr")) ?? null;
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      // Stop listening before the agent talks so the mic can't pick up its own voice
      // through speaker bleed and mistake it for the user's answer.
      stopListening();

      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      setAgentState(prev =>
        micPrepActiveRef.current ? "preparing_mic" : "speaking"
      );
      if (!micPrepActiveRef.current) {
        setStatusLabel("Votre agent vous parle...");
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      if (frenchVoiceRef.current) utterance.voice = frenchVoiceRef.current;

      // Small buffer after the utterance ends so any residual audio (room echo,
      // speaker tail) decays before the mic starts listening again.
      const finish = () => setTimeout(resolve, 400);
      utterance.onend = finish;
      utterance.onerror = finish;
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
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onstart = () => {
      console.log("[VoiceOnboarding] SpeechRecognition started");
      recognitionActiveRef.current = true;
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      console.log(
        "[VoiceOnboarding] SpeechRecognition result:",
        finalText || "(interim only)"
      );
      if (finalText) {
        setCurrentAnswer(prev => {
          const next = (prev ? `${prev} ${finalText}` : finalText).trim();
          currentAnswerRef.current = next;
          return next;
        });
        resetSilenceTimer(() => void submitAnswerRef.current());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[VoiceOnboarding] SpeechRecognition error:", event.error);
      recognitionActiveRef.current = false;
      stopListening();
      registerVoiceFailure();
    };
    recognition.onend = () => {
      console.log(
        "[VoiceOnboarding] SpeechRecognition ended, isListening:",
        isListeningRef.current
      );
      recognitionActiveRef.current = false;
      if (isListeningRef.current) {
        // Restarting immediately after `onend` can throw/abort because the
        // browser hasn't finished tearing down the previous session yet.
        setTimeout(() => {
          if (!isListeningRef.current || recognitionActiveRef.current) return;
          try {
            recognition.start();
          } catch (err) {
            console.error(
              "[VoiceOnboarding] SpeechRecognition restart failed:",
              err
            );
          }
        }, 250);
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
    setNoSpeechHint(false);
    if (!recognitionRef.current) {
      isListeningRef.current = false;
      manualFallbackRef.current = true;
      setManualMode(true);
      setStatusLabel("Répondez par écrit ci-dessous.");
      toast.info(
        "La reconnaissance vocale n'est pas disponible. Répondez par écrit ci-dessous."
      );
      return;
    }
    if (recognitionActiveRef.current) return;
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error("[VoiceOnboarding] SpeechRecognition start failed:", err);
      isListeningRef.current = false;
      manualFallbackRef.current = true;
      setManualMode(true);
      setStatusLabel("Répondez par écrit ci-dessous.");
      toast.info(
        "La reconnaissance vocale ne fonctionne pas. Répondez par écrit ci-dessous."
      );
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();
    recognitionRef.current?.stop();
  }, []);

  const enterManualMode = useCallback(() => {
    stopListening();
    manualFallbackRef.current = true;
    setNoSpeechHint(false);
    setManualMode(true);
    setAgentState("listening");
    setStatusLabel("Répondez par écrit ci-dessous.");
    toast.info(
      "La reconnaissance vocale ne fonctionne pas. Répondez par écrit ci-dessous."
    );
  }, [stopListening]);

  const registerVoiceFailure = useCallback(() => {
    failedAttemptsRef.current += 1;
    if (failedAttemptsRef.current >= MAX_VOICE_ATTEMPTS) {
      enterManualMode();
    }
  }, [enterManualMode]);

  const askQuestion = useCallback(
    async (index: number, prefix?: string) => {
      const q = questions[index];
      if (!q) return;
      if (!manualFallbackRef.current) failedAttemptsRef.current = 0;
      setManualMode(manualFallbackRef.current);
      setManualText("");
      const text = prefix ? `${prefix} ${q.question}` : q.question;
      await speak(text);
      if (manualFallbackRef.current) {
        setAgentState("listening");
        setStatusLabel("Répondez par écrit ci-dessous.");
      } else {
        startListening();
      }
    },
    [questions, speak, startListening]
  );

  const submitAnswer = useCallback(
    async (answerOverride?: string) => {
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
          const result = await finalizeMutation.mutateAsync({
            answers: newAnswers,
          });
          if (result.usedFallback) {
            toast.info(
              "IA indisponible pour le moment — votre profil a été créé avec une analyse simplifiée de vos réponses."
            );
          }
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

          setStatusLabel("Configuration terminée !");
          await speak(summarySpeech);
          setAgentState("done");
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (error) {
          console.error("Onboarding finalize error:", error);
          setStatusLabel("Une erreur est survenue, réessayons...");
          await speak(
            "Désolé, un problème est survenu. Pouvez-vous répéter votre dernière réponse ?"
          );
          startListening();
        }
        return;
      }

      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      await askQuestion(nextIndex, pickBridge(index));
    },
    [
      questions,
      stopListening,
      finalizeMutation,
      speak,
      askQuestion,
      startListening,
    ]
  );

  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      micGrantedRef.current = true;
      setMicDenied(false);
      return true;
    } catch {
      setMicDenied(true);
      setMicPromptPhase("denied");
      return false;
    }
  }, []);

  const startQuestions = useCallback(async () => {
    if (questions.length === 0) return;
    startedRef.current = true;
    micPrepActiveRef.current = false;
    failedAttemptsRef.current = 0;
    manualFallbackRef.current = false;
    setManualMode(false);
    setManualText("");

    if (!micGrantedRef.current) {
      await speak(
        "Parfait, c'est noté ! Commençons la configuration de vos publications."
      );
    } else {
      await speak("Parfait, je vous entends ! Commençons.");
    }

    await speak(questions[0].question);
    startListening();
  }, [questions, speak, startListening]);

  const beginMicSetup = useCallback(async () => {
    if (questions.length === 0) return;

    if (micGrantedRef.current) {
      void startQuestions();
      return;
    }

    micPrepActiveRef.current = true;
    setAgentState("preparing_mic");
    setMicPromptPhase("speaking");
    setMicDenied(false);
    setStatusLabel("Votre agent vous explique la marche à suivre...");

    const micIntro =
      "Bonjour ! Je suis votre agent LinkedRank. " +
      "Avant de configurer vos publications LinkedIn, j'ai besoin d'accéder à votre micro. " +
      "Dans quelques instants, votre navigateur affichera une fenêtre : cliquez sur Autoriser. " +
      "Ensuite, vous me répondez simplement en parlant — aucun formulaire, juste une conversation naturelle.";

    await speak(micIntro);

    setMicPromptPhase("waiting");
    setStatusLabel("Cliquez sur Autoriser dans la fenêtre du navigateur");

    const granted = await requestMicrophonePermission();
    if (granted) {
      micPrepActiveRef.current = false;
      void startQuestions();
    } else {
      setStatusLabel("Micro non autorisé");
      await speak(
        "Je n'ai pas accès à votre micro. Cliquez sur Réessayer, ou répondez par écrit si vous préférez."
      );
    }
  }, [questions, speak, requestMicrophonePermission, startQuestions]);

  const retryMicPermission = useCallback(async () => {
    setMicPromptPhase("waiting");
    setStatusLabel("Cliquez sur Autoriser dans la fenêtre du navigateur");
    const granted = await requestMicrophonePermission();
    if (granted) {
      micPrepActiveRef.current = false;
      void startQuestions();
    }
  }, [requestMicrophonePermission, startQuestions]);

  const startManualFromMicDenied = useCallback(async () => {
    if (questions.length === 0) return;
    startedRef.current = true;
    micPrepActiveRef.current = false;
    manualFallbackRef.current = true;
    failedAttemptsRef.current = 0;
    setManualMode(true);
    setManualText("");
    setMicDenied(false);
    await speak(
      "Pas de problème. Répondez par écrit à chaque question — voici la première."
    );
    setAgentState("listening");
    setStatusLabel("Répondez par écrit ci-dessous.");
  }, [questions, speak]);

  useEffect(() => {
    if (autoStart && questions.length > 0) {
      void beginMicSetup();
    }
  }, [autoStart, questions, beginMicSetup]);

  const handleFinish = () => {
    onComplete?.();
    setLocation("/dashboard");
  };

  const toggleMic = () => {
    if (isListeningRef.current) {
      if (!currentAnswerRef.current.trim()) {
        setNoSpeechHint(true);
        setTimeout(() => setNoSpeechHint(false), 3000);
        registerVoiceFailure();
        return;
      }
      setNoSpeechHint(false);
      void submitAnswerRef.current();
    } else if (agentState !== "speaking" && agentState !== "thinking") {
      startListening();
    }
  };

  const handleManualSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    stopListening();
    setManualText("");
    void submitAnswerRef.current(trimmed);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet/10 via-background to-rose/10 pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-violet to-rose transition-all duration-700"
          style={{
            width:
              agentState === "welcome"
                ? "3%"
                : agentState === "done"
                  ? "100%"
                  : `${progress}%`,
          }}
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
                  L'agent vous pose des questions à voix haute et vous répondez
                  en parlant. Aucun formulaire — juste une conversation.
                </p>
              </div>
              <Button
                onClick={() => void beginMicSetup()}
                size="lg"
                className="bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white px-10 h-14 text-lg"
                disabled={questions.length === 0}
              >
                <Mic className="w-6 h-6 mr-2" />
                Démarrer la conversation
              </Button>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Votre agent vous expliquera comment activer le micro avant de
                commencer — cliquez sur Autoriser quand le navigateur le demande.
              </p>
            </motion.div>
          )}

          {agentState === "preparing_mic" && (
            <motion.div
              key="preparing_mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-md"
            >
              <AgentOrb state="preparing_mic" />

              <div className="text-center space-y-2">
                <p className="text-white text-xl font-medium">{statusLabel}</p>
                <p className="text-muted-foreground text-sm">
                  {micPromptPhase === "speaking" &&
                    "Écoutez votre agent — il vous guide pas à pas"}
                  {micPromptPhase === "waiting" &&
                    "Une fenêtre du navigateur devrait s'afficher en haut de la page"}
                  {micPromptPhase === "denied" &&
                    "Sans micro, vous pouvez répondre par écrit"}
                </p>
              </div>

              {micPromptPhase !== "speaking" && <MicPermissionVisual />}

              {micPromptPhase === "speaking" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground text-center max-w-xs"
                >
                  Écoutez votre agent — la fenêtre d'autorisation apparaîtra
                  juste après
                </motion.p>
              )}

              {micDenied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <Button
                    onClick={() => void retryMicPermission()}
                    size="lg"
                    className="bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white w-full"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Réessayer l'activation du micro
                  </Button>
                  <Button
                    onClick={() => void startManualFromMicDenied()}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Répondre par écrit
                  </Button>
                </motion.div>
              )}
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
                  {agentState === "speaking" &&
                    "Écoutez votre agent — pas besoin de lire"}
                  {agentState === "listening" &&
                    "Répondez naturellement — je détecte quand vous avez fini"}
                  {agentState === "thinking" && "Un instant..."}
                </p>
                {questions.length > 0 && agentState !== "thinking" && (
                  <p className="text-xs text-muted-foreground/70">
                    Question {Math.min(currentIndex + 1, questions.length)} /{" "}
                    {questions.length}
                  </p>
                )}
              </div>

              {agentState === "listening" && !manualMode && (
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
                        transition={{
                          repeat: Infinity,
                          duration: 0.5 + i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  {noSpeechHint && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-amber-400"
                    >
                      Je n'ai rien entendu, parlez puis cliquez à nouveau.
                    </motion.p>
                  )}
                  <Button
                    onClick={toggleMic}
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <CheckIcon />
                    J'ai fini de parler
                  </Button>
                  <Button
                    onClick={enterManualMode}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Répondre par écrit
                  </Button>
                </motion.div>
              )}

              {agentState === "listening" && manualMode && currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 w-full px-4 sm:px-0"
                >
                  <p className="text-white text-base font-medium leading-relaxed text-center">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.options &&
                    currentQuestion.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {currentQuestion.options.map(option => (
                          <Button
                            key={option}
                            onClick={() => handleManualSubmit(option)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 h-auto py-3 whitespace-normal text-center"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleManualSubmit(manualText);
                    }}
                    className="flex flex-col sm:flex-row gap-2 w-full"
                  >
                    <Input
                      value={manualText}
                      onChange={e => setManualText(e.target.value)}
                      placeholder={
                        currentQuestion.options?.length
                          ? "Ou écrivez votre propre réponse..."
                          : "Écrivez votre réponse..."
                      }
                      autoFocus
                      className="bg-background/50 text-white"
                    />
                    <Button
                      type="submit"
                      disabled={!manualText.trim()}
                      className="bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white shrink-0"
                    >
                      Envoyer
                    </Button>
                  </form>
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  C'est prêt !
                </h2>
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

function MicPermissionVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-amber-400/50"
            style={{ width: 96, height: 96 }}
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              delay: i * 0.65,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25"
        >
          <Mic className="w-12 h-12 text-white" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-full max-w-xs shadow-2xl"
      >
        <div className="flex items-start gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-rose flex items-center justify-center shrink-0"
          >
            <Mic className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="text-white text-sm font-semibold">linkedrank.com</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              souhaite utiliser votre micro
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 py-2.5 rounded-xl bg-white/5 text-center text-xs text-muted-foreground border border-white/10">
            Refuser
          </div>
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.4)",
                "0 0 0 8px rgba(16, 185, 129, 0)",
                "0 0 0 0 rgba(16, 185, 129, 0)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-center text-xs text-white font-semibold"
          >
            Autoriser
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        {["Autoriser", "Parler", "Configurer"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <motion.div
              animate={
                i === 0
                  ? { scale: [1, 1.15, 1], backgroundColor: ["#8b5cf6", "#f59e0b", "#8b5cf6"] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-6 rounded-full bg-violet/30 flex items-center justify-center text-[10px] font-bold text-white"
            >
              {i + 1}
            </motion.div>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AgentOrb({ state }: { state: AgentState | "idle" }) {
  const isActive =
    state === "speaking" ||
    state === "listening" ||
    state === "preparing_mic";
  const color =
    state === "preparing_mic"
      ? "from-amber-400 to-orange-500"
      : state === "listening"
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
            transition={{
              repeat: Infinity,
              duration: state === "listening" ? 1.2 : 1.8,
            }}
            style={{
              width: 160,
              height: 160,
              margin: "auto",
              top: -20,
              left: -20,
            }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-10`}
            animate={{ scale: [1, 1.7, 1], opacity: [0.15, 0, 0.15] }}
            transition={{
              repeat: Infinity,
              duration: state === "listening" ? 0.9 : 1.4,
              delay: 0.2,
            }}
            style={{
              width: 160,
              height: 160,
              margin: "auto",
              top: -20,
              left: -20,
            }}
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
        ) : state === "listening" || state === "preparing_mic" ? (
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
    <svg
      className="w-5 h-5 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
