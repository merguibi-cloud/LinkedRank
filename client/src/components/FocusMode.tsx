import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Coffee,
  Brain,
  Target,
  Clock,
  Zap,
  Trophy,
  Flame,
  CheckCircle2,
  SkipForward
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  bestStreak: number;
  todaySessions: number;
}

const DEFAULT_TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

export function FocusMode() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [customTimes, setCustomTimes] = useState(DEFAULT_TIMES);
  const [stats, setStats] = useState<FocusStats>({
    totalSessions: 47,
    totalMinutes: 1175,
    currentStreak: 3,
    bestStreak: 12,
    todaySessions: 2
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play sound
    if (soundEnabled) {
      playNotificationSound();
    }

    if (mode === "work") {
      // Session de travail terminée
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      setStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + Math.floor(customTimes.work / 60),
        todaySessions: prev.todaySessions + 1,
        currentStreak: prev.currentStreak + 1
      }));

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      toast.success(
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-semibold">Session terminée ! 🎉</p>
            <p className="text-sm text-muted-foreground">
              +50 XP gagnés
            </p>
          </div>
        </div>
      );

      // Déterminer la prochaine pause
      if (newSessionsCompleted % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(customTimes.longBreak);
        toast.info("Vous avez mérité une longue pause ! ☕");
      } else {
        setMode("shortBreak");
        setTimeLeft(customTimes.shortBreak);
      }
    } else {
      // Pause terminée
      toast.info("Pause terminée ! Prêt pour une nouvelle session ? 💪");
      setMode("work");
      setTimeLeft(customTimes.work);
    }
  };

  const playNotificationSound = () => {
    // Créer un son de notification simple
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customTimes[mode]);
  };

  const skipToNext = () => {
    setIsRunning(false);
    if (mode === "work") {
      if ((sessionsCompleted + 1) % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(customTimes.longBreak);
      } else {
        setMode("shortBreak");
        setTimeLeft(customTimes.shortBreak);
      }
    } else {
      setMode("work");
      setTimeLeft(customTimes.work);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const total = customTimes[mode];
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case "work": return "from-primary to-purple-500";
      case "shortBreak": return "from-green-500 to-emerald-500";
      case "longBreak": return "from-blue-500 to-cyan-500";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "work": return "Concentration";
      case "shortBreak": return "Pause courte";
      case "longBreak": return "Pause longue";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "work": return <Brain className="w-6 h-6" />;
      case "shortBreak": return <Coffee className="w-6 h-6" />;
      case "longBreak": return <Coffee className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.todaySessions}</p>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Streak actuel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{Math.floor(stats.totalMinutes / 60)}h</p>
                <p className="text-xs text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer principal */}
      <Card className="glass-card overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getModeColor()} opacity-10`} />
        <CardContent className="relative p-8">
          {/* Mode selector */}
          <div className="flex justify-center gap-2 mb-8">
            {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMode(m);
                  setTimeLeft(customTimes[m]);
                  setIsRunning(false);
                }}
                className={mode === m ? `bg-gradient-to-r ${getModeColor()}` : ""}
              >
                {m === "work" && <Brain className="w-4 h-4 mr-2" />}
                {m === "shortBreak" && <Coffee className="w-4 h-4 mr-2" />}
                {m === "longBreak" && <Coffee className="w-4 h-4 mr-2" />}
                {m === "work" ? "Focus" : m === "shortBreak" ? "Pause" : "Longue pause"}
              </Button>
            ))}
          </div>

          {/* Timer display */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <motion.div
                key={mode}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                {/* Cercle de progression */}
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary/30"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - getProgress() / 100)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={mode === "work" ? "#8B5CF6" : mode === "shortBreak" ? "#10B981" : "#3B82F6"} />
                      <stop offset="100%" stopColor={mode === "work" ? "#A855F7" : mode === "shortBreak" ? "#34D399" : "#06B6D4"} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Temps */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="mb-2">{getModeIcon()}</div>
                  <span className="text-6xl font-bold font-mono">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    {getModeLabel()}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="w-12 h-12 rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={toggleTimer}
              className={`w-20 h-20 rounded-full bg-gradient-to-r ${getModeColor()} hover:opacity-90`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={skipToNext}
              className="w-12 h-12 rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Sessions indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i <= (sessionsCompleted % 4) || (sessionsCompleted % 4 === 0 && sessionsCompleted > 0 && i === 4)
                    ? "bg-primary"
                    : "bg-secondary/50"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {4 - (sessionsCompleted % 4)} sessions avant la longue pause
          </p>
        </CardContent>
      </Card>

      {/* Paramètres */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Paramètres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Son */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Son de notification</p>
                <p className="text-sm text-muted-foreground">
                  Jouer un son à la fin de chaque session
                </p>
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {/* Durées personnalisées */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Durée de focus</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(customTimes.work / 60)} min
                </span>
              </div>
              <Slider
                value={[customTimes.work / 60]}
                onValueChange={([value]) => {
                  setCustomTimes(prev => ({ ...prev, work: value * 60 }));
                  if (mode === "work" && !isRunning) {
                    setTimeLeft(value * 60);
                  }
                }}
                min={5}
                max={60}
                step={5}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pause courte</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(customTimes.shortBreak / 60)} min
                </span>
              </div>
              <Slider
                value={[customTimes.shortBreak / 60]}
                onValueChange={([value]) => {
                  setCustomTimes(prev => ({ ...prev, shortBreak: value * 60 }));
                  if (mode === "shortBreak" && !isRunning) {
                    setTimeLeft(value * 60);
                  }
                }}
                min={1}
                max={15}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pause longue</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(customTimes.longBreak / 60)} min
                </span>
              </div>
              <Slider
                value={[customTimes.longBreak / 60]}
                onValueChange={([value]) => {
                  setCustomTimes(prev => ({ ...prev, longBreak: value * 60 }));
                  if (mode === "longBreak" && !isRunning) {
                    setTimeLeft(value * 60);
                  }
                }}
                min={5}
                max={30}
                step={5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass-card border-primary/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Conseil du jour</h3>
              <p className="text-sm text-muted-foreground">
                La technique Pomodoro fonctionne mieux quand vous éliminez les distractions. 
                Mettez votre téléphone en mode avion et fermez les onglets non essentiels 
                pendant vos sessions de focus.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FocusMode;
