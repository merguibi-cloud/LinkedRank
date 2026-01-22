import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane,
  Sparkles,
  Check,
  Loader2,
  Zap,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  X,
  Play,
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AutoPilotModeProps {
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onClose?: () => void;
  stats?: {
    postsGenerated: number;
    postsPublished: number;
    engagement: number;
  };
}

export function AutoPilotMode({ 
  isActive, 
  onActivate, 
  onDeactivate, 
  onClose,
  stats = { postsGenerated: 0, postsPublished: 0, engagement: 0 }
}: AutoPilotModeProps) {
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onActivate();
    setIsActivating(false);
  };

  const features = [
    {
      icon: Calendar,
      title: "Publication automatique",
      description: "3 posts par semaine aux meilleurs moments"
    },
    {
      icon: MessageSquare,
      title: "Contenu adapté",
      description: "Généré selon votre profil et vos objectifs"
    },
    {
      icon: TrendingUp,
      title: "Optimisation continue",
      description: "L'IA apprend de vos performances"
    },
    {
      icon: Shield,
      title: "Mode supervisé",
      description: "Validez chaque post avant publication"
    }
  ];

  return (
    <Card className="bg-card border-white/10 overflow-hidden">
      {/* Header with gradient */}
      <div className={`p-6 relative overflow-hidden ${
        isActive 
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20" 
          : "bg-gradient-to-r from-violet/20 to-rose/20"
      }`}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {isActive && (
            <>
              <motion.div
                animate={{ 
                  x: [0, 100, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ 
                  x: [0, -50, 0],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"
              />
            </>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isActive 
                ? "bg-emerald-500" 
                : "bg-gradient-to-br from-violet to-rose"
            }`}>
              <Plane className={`w-7 h-7 text-white ${isActive ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Mode Pilote Automatique</h2>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    ACTIF
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {isActive 
                  ? "Vos agents travaillent pour vous 24/7" 
                  : "Laissez l'IA gérer votre présence LinkedIn"
                }
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status when active */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-3xl font-bold text-white">{stats.postsGenerated}</p>
              <p className="text-sm text-muted-foreground">Posts générés</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-3xl font-bold text-white">{stats.postsPublished}</p>
              <p className="text-sm text-muted-foreground">Publiés</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <p className="text-3xl font-bold text-emerald-400">+{stats.engagement}%</p>
              <p className="text-sm text-muted-foreground">Engagement</p>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div 
                key={i}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-emerald-500/20" : "bg-violet/20"
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-violet"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What happens section */}
        {!isActive && (
          <div className="p-4 rounded-xl bg-violet/10 border border-violet/30">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet" />
              Que va-t-il se passer ?
            </h3>
            <ul className="space-y-2">
              {[
                "L'IA analyse votre profil et vos objectifs",
                "3 posts sont générés chaque semaine",
                "Vous recevez une notification pour valider",
                "Les posts sont publiés aux meilleurs moments"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Schedule info when active */}
        {isActive && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-white">Prochain post prévu</p>
                  <p className="text-sm text-muted-foreground">
                    Demain à 9h00 • Sujet : Conseils pratiques
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Voir
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {isActive ? (
            <>
              <Button
                onClick={onDeactivate}
                variant="outline"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Mettre en pause
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Voir les performances
              </Button>
            </>
          ) : (
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full bg-gradient-to-r from-violet to-rose hover:opacity-90 h-12 text-lg"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Activer le Pilote Automatique
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Trust badges */}
        {!isActive && (
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Mode supervisé par défaut
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Désactivable à tout moment
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Composant simplifié pour le dashboard
export function AutoPilotWidget({ 
  isActive, 
  onToggle 
}: { 
  isActive: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isActive 
        ? "bg-emerald-500/10 border-emerald-500/30" 
        : "bg-white/5 border-white/10"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? "bg-emerald-500" : "bg-violet/20"
          }`}>
            <Plane className={`w-5 h-5 ${isActive ? "text-white" : "text-violet"}`} />
          </div>
          <div>
            <p className="font-medium text-white">Pilote Automatique</p>
            <p className="text-xs text-muted-foreground">
              {isActive ? "Actif • 3 posts/semaine" : "Désactivé"}
            </p>
          </div>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
}

// Modal de première activation
export function AutoPilotFirstTimeModal({
  onActivate,
  onClose
}: {
  onActivate: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setStep(2);
    setIsLoading(false);
    setTimeout(() => {
      onActivate();
    }, 2000);
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
        className="w-full max-w-lg"
      >
        <Card className="bg-card border-white/10 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center mb-6">
                  <Plane className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Activez le Pilote Automatique
                </h2>
                <p className="text-muted-foreground mb-6">
                  En un clic, l'IA prend le relais et gère votre présence LinkedIn.
                  Vous gardez le contrôle avec le mode supervisé.
                </p>

                <div className="space-y-3 text-left mb-6">
                  {[
                    "3 posts générés automatiquement par semaine",
                    "Publiés aux meilleurs moments pour votre audience",
                    "Notification avant chaque publication",
                    "Désactivable à tout moment"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-white text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Plus tard
                  </Button>
                  <Button
                    onClick={handleActivate}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-violet to-rose"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activation...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Activer maintenant
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  🎉 Pilote Automatique activé !
                </h2>
                <p className="text-muted-foreground mb-4">
                  Vos agents IA sont maintenant au travail.
                  Votre premier post sera généré dans les prochaines heures.
                </p>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400">
                    💡 Vous recevrez une notification pour valider chaque post avant publication.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
