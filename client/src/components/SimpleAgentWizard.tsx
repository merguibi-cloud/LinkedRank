import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Sparkles,
  X,
  Mic,
  Wrench,
  Briefcase,
  Store,
  GraduationCap,
  Building2,
  Users,
  Heart,
  Laptop,
  TrendingUp,
  UserPlus,
  Award,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// Types de métiers avec icônes et configurations par défaut
const PROFESSIONS = [
  { 
    id: "artisan", 
    label: "Artisan", 
    icon: Wrench, 
    description: "Plombier, électricien, menuisier...",
    color: "from-amber-500 to-orange-500",
    defaultConfig: {
      tone: "authentique",
      topics: ["Conseils pratiques", "Coulisses du métier", "Témoignages clients"],
      frequency: 3
    }
  },
  { 
    id: "coach", 
    label: "Coach / Consultant", 
    icon: GraduationCap, 
    description: "Coaching, conseil, accompagnement",
    color: "from-violet to-purple-500",
    defaultConfig: {
      tone: "inspirant",
      topics: ["Conseils d'expert", "Histoires inspirantes", "Méthodes et outils"],
      frequency: 4
    }
  },
  { 
    id: "commercant", 
    label: "Commerçant", 
    icon: Store, 
    description: "Boutique, magasin, e-commerce",
    color: "from-emerald-500 to-teal-500",
    defaultConfig: {
      tone: "chaleureux",
      topics: ["Nouveautés produits", "Coulisses boutique", "Offres spéciales"],
      frequency: 5
    }
  },
  { 
    id: "freelance", 
    label: "Freelance", 
    icon: Laptop, 
    description: "Indépendant, auto-entrepreneur",
    color: "from-blue-500 to-cyan-500",
    defaultConfig: {
      tone: "professionnel",
      topics: ["Expertise métier", "Projets réalisés", "Conseils pratiques"],
      frequency: 3
    }
  },
  { 
    id: "dirigeant", 
    label: "Dirigeant PME", 
    icon: Building2, 
    description: "Chef d'entreprise, gérant",
    color: "from-slate-600 to-slate-800",
    defaultConfig: {
      tone: "leadership",
      topics: ["Vision entreprise", "Management", "Actualités secteur"],
      frequency: 2
    }
  },
  { 
    id: "rh", 
    label: "RH / Recruteur", 
    icon: Users, 
    description: "Ressources humaines, talent acquisition",
    color: "from-rose to-pink-500",
    defaultConfig: {
      tone: "engageant",
      topics: ["Offres d'emploi", "Culture entreprise", "Conseils carrière"],
      frequency: 4
    }
  }
];

// Objectifs disponibles
const OBJECTIVES = [
  { 
    id: "clients", 
    label: "Trouver des clients", 
    icon: TrendingUp,
    description: "Générer des leads et vendre"
  },
  { 
    id: "visibilite", 
    label: "Gagner en visibilité", 
    icon: Award,
    description: "Être reconnu dans mon domaine"
  },
  { 
    id: "recruter", 
    label: "Recruter des talents", 
    icon: UserPlus,
    description: "Attirer les meilleurs profils"
  },
  { 
    id: "reseau", 
    label: "Développer mon réseau", 
    icon: MessageSquare,
    description: "Créer des connexions stratégiques"
  }
];

interface SimpleAgentWizardProps {
  onComplete: (config: any) => void;
  onClose: () => void;
  onVoiceMode: () => void;
}

export function SimpleAgentWizard({ onComplete, onClose, onVoiceMode }: SimpleAgentWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [frequency, setFrequency] = useState(3);

  const profession = PROFESSIONS.find(p => p.id === selectedProfession);

  const handleObjectiveToggle = (id: string) => {
    setSelectedObjectives(prev => 
      prev.includes(id) 
        ? prev.filter(o => o !== id)
        : [...prev, id]
    );
  };

  const handleComplete = () => {
    const config = {
      profession: profession?.label,
      professionId: selectedProfession,
      objectives: selectedObjectives.map(id => OBJECTIVES.find(o => o.id === id)?.label),
      frequency,
      tone: profession?.defaultConfig.tone,
      topics: profession?.defaultConfig.topics
    };
    onComplete(config);
  };

  const canProceed = () => {
    if (step === 1) return selectedProfession !== null;
    if (step === 2) return selectedObjectives.length > 0;
    return true;
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
        className="w-full max-w-3xl"
      >
        <Card className="bg-card border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Configurez vos Agents IA
              </h2>
              <p className="text-sm text-muted-foreground">
                3 étapes simples • 2 minutes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoiceMode}
                className="text-muted-foreground hover:text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Mode vocal
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s < step 
                        ? "bg-emerald-500 text-white" 
                        : s === step 
                          ? "bg-violet text-white" 
                          : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 rounded-full ${s < step ? "bg-emerald-500" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Votre métier</span>
              <span>Vos objectifs</span>
              <span>Fréquence</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Profession */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Qui êtes-vous ? 👋
                    </h3>
                    <p className="text-muted-foreground">
                      Choisissez le profil qui vous correspond le mieux
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PROFESSIONS.map((prof) => {
                      const Icon = prof.icon;
                      const isSelected = selectedProfession === prof.id;
                      return (
                        <button
                          key={prof.id}
                          onClick={() => setSelectedProfession(prof.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? "border-violet bg-violet/10" 
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prof.color} flex items-center justify-center mb-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="font-semibold text-white">{prof.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {prof.description}
                          </p>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1 text-violet text-xs">
                              <Check className="w-3 h-3" />
                              Sélectionné
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Objectives */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Que voulez-vous accomplir ? 🎯
                    </h3>
                    <p className="text-muted-foreground">
                      Sélectionnez un ou plusieurs objectifs
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {OBJECTIVES.map((obj) => {
                      const Icon = obj.icon;
                      const isSelected = selectedObjectives.includes(obj.id);
                      return (
                        <button
                          key={obj.id}
                          onClick={() => handleObjectiveToggle(obj.id)}
                          className={`p-5 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? "border-violet bg-violet/10" 
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isSelected ? "bg-violet" : "bg-white/10"
                            }`}>
                              <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white">{obj.label}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {obj.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-violet" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Frequency */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      À quelle fréquence publier ? 📅
                    </h3>
                    <p className="text-muted-foreground">
                      Choisissez le rythme qui vous convient
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-8">
                    {/* Frequency display */}
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-violet/20 to-rose/20 border border-white/10">
                      <p className="text-6xl font-bold text-white mb-2">{frequency}</p>
                      <p className="text-xl text-muted-foreground">
                        {frequency === 1 ? "post par semaine" : "posts par semaine"}
                      </p>
                    </div>

                    {/* Slider */}
                    <div className="px-4">
                      <Slider
                        value={[frequency]}
                        onValueChange={(value) => setFrequency(value[0])}
                        min={1}
                        max={7}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>1/semaine</span>
                        <span>Tous les jours</span>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400">
                        💡 <strong>Recommandation :</strong> Pour un {profession?.label.toLowerCase()}, 
                        nous recommandons {profession?.defaultConfig.frequency} posts par semaine pour 
                        des résultats optimaux.
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-4">Récapitulatif de votre configuration</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Profil</p>
                        <p className="text-white font-medium">{profession?.label}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Objectifs</p>
                        <p className="text-white font-medium">
                          {selectedObjectives.length} sélectionné{selectedObjectives.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fréquence</p>
                        <p className="text-white font-medium">{frequency} posts/semaine</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-violet hover:bg-violet/90"
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-violet to-rose hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Activer mes Agents IA
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
