import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  X,
  Sparkles,
  Heart,
  Lightbulb,
  Bug,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

type FeedbackType = "like" | "dislike" | "idea" | "bug" | "question";

interface FeedbackOption {
  type: FeedbackType;
  icon: React.ElementType;
  label: string;
  color: string;
  placeholder: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    type: "like",
    icon: ThumbsUp,
    label: "J'adore !",
    color: "text-emerald-400",
    placeholder: "Qu'est-ce que vous aimez le plus ?",
  },
  {
    type: "dislike",
    icon: ThumbsDown,
    label: "À améliorer",
    color: "text-rose",
    placeholder: "Comment pouvons-nous nous améliorer ?",
  },
  {
    type: "idea",
    icon: Lightbulb,
    label: "Idée",
    color: "text-gold",
    placeholder: "Partagez votre idée géniale !",
  },
  {
    type: "bug",
    icon: Bug,
    label: "Bug",
    color: "text-orange-400",
    placeholder: "Décrivez le problème rencontré...",
  },
  {
    type: "question",
    icon: HelpCircle,
    label: "Question",
    color: "text-blue-400",
    placeholder: "Posez votre question...",
  },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Veuillez sélectionner un type de feedback");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Merci pour votre feedback ! 💜");
    setHasSubmitted(true);
    setIsSubmitting(false);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setIsOpen(false);
      setSelectedType(null);
      setMessage("");
      setRating(0);
      setHasSubmitted(false);
    }, 2000);
  };

  const selectedOption = feedbackOptions.find(o => o.type === selectedType);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 z-40 hidden p-3.5 rounded-full bg-gradient-to-r from-violet to-rose shadow-lg shadow-violet/25 hover:shadow-violet/40 transition-shadow md:bottom-6 md:right-6 md:block md:p-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet to-rose">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Votre avis compte !
                    </h3>
                    <p className="text-sm text-white/60">
                      Aidez-nous à améliorer LinkedAgents
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {hasSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex p-4 rounded-full bg-emerald-500/20 mb-4">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      Merci beaucoup ! 💜
                    </h4>
                    <p className="text-white/60">
                      Votre feedback nous aide à nous améliorer
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Feedback type selection */}
                    <div className="mb-6">
                      <p className="text-sm text-white/60 mb-3">
                        Quel type de feedback ?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feedbackOptions.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => setSelectedType(option.type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                              selectedType === option.type
                                ? "bg-white/10 border-white/30"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <option.icon className={`w-4 h-4 ${option.color}`} />
                            <span className="text-sm text-white">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                      <p className="text-sm text-white/60 mb-3">
                        Note globale
                      </p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= rating
                                  ? "text-gold fill-gold"
                                  : "text-white/20"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={selectedOption?.placeholder || "Partagez votre feedback..."}
                        className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-violet/50 transition-colors"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-violet to-rose hover:opacity-90"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Envoyer mon feedback
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default FeedbackWidget;
