import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from top of page
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Add delay before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("🎉 Offre envoyée !", {
        description: "Vérifiez votre boîte mail pour votre code promo exclusif.",
      });
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-violet/20 via-card to-rose/10 border border-violet/30 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Gift icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30"
              >
                <Gift className="w-12 h-12 text-gold" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Attendez ! 🎁
              </h3>
              <p className="text-lg text-violet-light font-semibold mb-2">
                Offre exclusive : -60% sur le plan Pro
              </p>
              <p className="text-muted-foreground">
                Entrez votre email pour recevoir votre code promo et accéder à toutes les fonctionnalités premium.
              </p>
            </div>

            {/* Timer urgency */}
            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gold">
              <Clock className="w-4 h-4" />
              <span>Offre valable 24h seulement</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                required
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet to-rose hover:opacity-90 text-white font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Recevoir mon code -60%
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ Sans engagement</span>
              <span>✓ Annulation facile</span>
              <span>✓ Support 24/7</span>
            </div>

            {/* Skip link */}
            <button
              onClick={() => setIsVisible(false)}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Non merci, je préfère payer plein tarif
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
