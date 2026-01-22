import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [location] = useLocation();

  // Don't show on pricing page or if user is already subscribed
  const excludedPaths = ["/pricing", "/dashboard", "/agents", "/generate", "/carousels"];
  const shouldShow = !excludedPaths.some(path => location.startsWith(path));

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed && shouldShow) {
        setIsVisible(true);
      } else if (window.scrollY <= 500) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed, shouldShow]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-violet/95 to-rose/95 backdrop-blur-lg border-t border-white/10"
        >
          <div className="container flex items-center justify-between gap-4">
            {/* Left side - Message */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm">
                <Clock className="w-4 h-4" />
                <span>Offre limitée</span>
              </div>
              <div>
                <p className="text-white font-semibold">
                  🎁 -50% sur le plan Pro pendant 48h
                </p>
                <p className="text-white/80 text-sm hidden md:block">
                  Automatisez votre LinkedIn avec 3 agents IA inclus
                </p>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.href = "/pricing"}
                className="bg-white text-violet hover:bg-white/90 font-semibold px-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating CTA button for mobile
export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [location] = useLocation();

  const excludedPaths = ["/pricing", "/dashboard", "/agents", "/generate"];
  const shouldShow = !excludedPaths.some(path => location.startsWith(path));

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && shouldShow) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 left-4 z-40 md:hidden"
        >
          <Button
            onClick={() => window.location.href = "/pricing"}
            className="rounded-full h-14 px-6 bg-gradient-to-r from-violet to-rose shadow-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Essai gratuit
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
