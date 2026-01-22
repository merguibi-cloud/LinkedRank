import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  ChevronRight,
  Lightbulb,
  Play,
  BookOpen,
  Video,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpTip {
  id: string;
  title: string;
  content: string;
  icon?: React.ElementType;
  videoUrl?: string;
  learnMoreUrl?: string;
}

interface ContextualHelpProps {
  pageId: string;
  tips: HelpTip[];
}

const pageHelpContent: Record<string, HelpTip[]> = {
  dashboard: [
    {
      id: "welcome",
      title: "Bienvenue sur votre Dashboard !",
      content: "C'est votre centre de commande. Ici, vous pouvez voir vos statistiques, vos posts récents et accéder rapidement à toutes les fonctionnalités.",
      icon: Lightbulb,
    },
    {
      id: "quick-actions",
      title: "Actions rapides",
      content: "Utilisez les boutons d'action rapide pour générer un post, créer un carrousel ou voir les tendances en un clic.",
      icon: Play,
    },
    {
      id: "agents",
      title: "Vos agents IA",
      content: "Vos 5 agents travaillent en arrière-plan. Léa crée du contenu, Max détecte les tendances, Emma booste l'engagement, Alex analyse les performances et Sam planifie vos publications.",
      icon: BookOpen,
    },
  ],
  generator: [
    {
      id: "theme",
      title: "Choisissez votre thématique",
      content: "Sélectionnez un thème parmi les options proposées ou entrez votre propre sujet pour un post personnalisé.",
      icon: Lightbulb,
    },
    {
      id: "tone",
      title: "Ajustez le ton",
      content: "Le ton influence le style de votre post. Choisissez 'Inspirant' pour motiver, 'Éducatif' pour informer, ou 'Storytelling' pour raconter une histoire.",
      icon: BookOpen,
    },
    {
      id: "generate",
      title: "Générez et personnalisez",
      content: "Cliquez sur 'Générer' puis modifiez le texte selon vos besoins. Vous pouvez régénérer autant de fois que nécessaire.",
      icon: Play,
    },
  ],
  agents: [
    {
      id: "team",
      title: "Votre équipe d'agents IA",
      content: "Chaque agent a une spécialité unique. Activez ceux dont vous avez besoin et laissez-les travailler pour vous 24/7.",
      icon: Lightbulb,
    },
    {
      id: "activate",
      title: "Activer un agent",
      content: "Cliquez sur 'Activer' pour mettre un agent au travail. Vous pouvez configurer ses paramètres et sa fréquence d'action.",
      icon: Play,
    },
  ],
  templates: [
    {
      id: "choose",
      title: "Choisissez un template",
      content: "Parcourez les templates par catégorie. Chaque template a un score de popularité basé sur les performances moyennes.",
      icon: Lightbulb,
    },
    {
      id: "customize",
      title: "Personnalisez",
      content: "Remplacez les [placeholders] par votre propre contenu. Gardez la structure mais ajoutez votre touche personnelle.",
      icon: BookOpen,
    },
  ],
};

export function ContextualHelp({ pageId }: { pageId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasSeenHelp, setHasSeenHelp] = useState(false);

  const tips = pageHelpContent[pageId] || [];

  useEffect(() => {
    // Check if user has seen help for this page
    const seenHelp = localStorage.getItem(`help-seen-${pageId}`);
    if (!seenHelp && tips.length > 0) {
      // Show help automatically for first-time visitors
      setTimeout(() => setIsOpen(true), 2000);
    } else {
      setHasSeenHelp(true);
    }
  }, [pageId, tips.length]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`help-seen-${pageId}`, "true");
    setHasSeenHelp(true);
  };

  const nextTip = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      handleClose();
    }
  };

  const prevTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(currentTipIndex - 1);
    }
  };

  if (tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];
  const TipIcon = currentTip.icon || HelpCircle;

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-40 p-3 rounded-full shadow-lg transition-all ${
          hasSeenHelp
            ? "bg-white/10 hover:bg-white/20"
            : "bg-gradient-to-r from-violet to-rose animate-pulse"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-5 h-5 text-white" />
      </motion.button>

      {/* Help modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-5 border-b border-white/10">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet/20 to-rose/20">
                    <TipIcon className="w-6 h-6 text-violet-light" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{currentTip.title}</h3>
                    <p className="text-xs text-white/50">
                      Conseil {currentTipIndex + 1} sur {tips.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-white/80 leading-relaxed">
                  {currentTip.content}
                </p>

                {/* Video link if available */}
                {currentTip.videoUrl && (
                  <a
                    href={currentTip.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Video className="w-5 h-5 text-violet-light" />
                    <span className="text-sm text-white">Voir le tutoriel vidéo</span>
                    <ExternalLink className="w-4 h-4 text-white/50 ml-auto" />
                  </a>
                )}

                {/* Learn more link if available */}
                {currentTip.learnMoreUrl && (
                  <a
                    href={currentTip.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-3 text-sm text-violet-light hover:text-violet transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    En savoir plus
                  </a>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 py-3">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTipIndex
                        ? "bg-violet w-6"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 p-5 pt-0">
                {currentTipIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={prevTip}
                    className="flex-1"
                  >
                    Précédent
                  </Button>
                )}
                <Button
                  onClick={nextTip}
                  className={`flex-1 bg-gradient-to-r from-violet to-rose ${
                    currentTipIndex === 0 ? "w-full" : ""
                  }`}
                >
                  {currentTipIndex < tips.length - 1 ? (
                    <>
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    "C'est compris !"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ContextualHelp;
