import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate?: Date;
  hours?: number;
  onComplete?: () => void;
  variant?: "default" | "compact" | "large";
}

export function CountdownTimer({ 
  endDate, 
  hours = 48, 
  onComplete,
  variant = "default" 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Calculate end time
    const end = endDate || new Date(Date.now() + hours * 60 * 60 * 1000);
    
    // Check localStorage for consistent countdown across sessions
    const storedEnd = localStorage.getItem("promoEndTime");
    const targetEnd = storedEnd ? new Date(storedEnd) : end;
    
    if (!storedEnd) {
      localStorage.setItem("promoEndTime", end.toISOString());
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetEnd.getTime() - now.getTime();

      if (difference <= 0) {
        onComplete?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, hours, onComplete]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="w-4 h-4 text-rose" />
        <span className="font-mono font-semibold text-white">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className="flex items-center justify-center gap-4">
        <TimeUnit value={timeLeft.hours} label="Heures" />
        <span className="text-3xl font-bold text-violet-light">:</span>
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <span className="text-3xl font-bold text-violet-light">:</span>
        <TimeUnit value={timeLeft.seconds} label="Secondes" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-rose" />
      <div className="flex items-center gap-1">
        <TimeBlock value={timeLeft.hours} />
        <span className="text-xl font-bold text-white">:</span>
        <TimeBlock value={timeLeft.minutes} />
        <span className="text-xl font-bold text-white">:</span>
        <TimeBlock value={timeLeft.seconds} />
      </div>
    </div>
  );
}

function TimeBlock({ value }: { value: number }) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm"
    >
      <span className="font-mono text-xl font-bold text-white">
        {value.toString().padStart(2, "0")}
      </span>
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet/20 to-rose/20 border border-white/10"
      >
        <span className="font-mono text-4xl font-bold text-white">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="mt-2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// Urgency banner with countdown
export function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-gradient-to-r from-rose/20 to-violet/20 border-y border-white/10 py-3 relative">
      <div className="container flex items-center justify-center gap-4 flex-wrap">
        <span className="text-white font-medium">
          🔥 Offre Flash : -50% sur le plan Pro
        </span>
        <CountdownTimer variant="compact" />
        <a 
          href="/pricing" 
          className="text-violet-light hover:text-white font-semibold underline underline-offset-4"
        >
          En profiter →
        </a>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fermer la bannière"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
