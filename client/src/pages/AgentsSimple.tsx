import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Mic, 
  ArrowRight, 
  Plane,
  Check,
  Bot,
  Zap,
  Clock,
  Shield,
  ChevronRight,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { SimpleAgentWizard } from "@/components/SimpleAgentWizard";
import { AutoPilotMode, AutoPilotFirstTimeModal } from "@/components/AutoPilotMode";
import { PROFESSION_TEMPLATES } from "@/components/ProfessionTemplates";
import { useLocation } from "wouter";

export default function AgentsSimple() {
  const [, setLocation] = useLocation();
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showAutoPilotModal, setShowAutoPilotModal] = useState(false);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [configComplete, setConfigComplete] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PROFESSION_TEMPLATES[0] | null>(null);

  const handleVoiceConfigComplete = (config: any) => {
    console.log("Voice config:", config);
    setShowVoiceAssistant(false);
    setConfigComplete(true);
    setShowAutoPilotModal(true);
  };

  const handleWizardComplete = (config: any) => {
    console.log("Wizard config:", config);
    setShowWizard(false);
    setConfigComplete(true);
    setShowAutoPilotModal(true);
  };

  const handleTemplateSelect = (template: typeof PROFESSION_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setConfigComplete(true);
    setShowAutoPilotModal(true);
  };

  const handleAutoPilotActivate = () => {
    setIsAutoPilotActive(true);
    setShowAutoPilotModal(false);
  };

  // Templates populaires à afficher
  const popularTemplates = PROFESSION_TEMPLATES.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-transparent to-rose/20" />
        
        <div className="container py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet/20 text-violet-light text-sm mb-6"
            >
              <Bot className="w-4 h-4" />
              Configuration simplifiée
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Configurez vos Agents IA
              <br />
              <span className="bg-gradient-to-r from-violet to-rose bg-clip-text text-transparent">
                en 2 minutes
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Pas besoin d'être expert. Choisissez votre méthode préférée :
            </motion.p>

            {/* Main action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => setShowVoiceAssistant(true)}
                size="lg"
                className="bg-gradient-to-r from-violet to-rose hover:opacity-90 h-14 px-8 text-lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                Parlez-moi de vous
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => setShowWizard(true)}
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-white/20 hover:bg-white/10"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                3 questions rapides
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Templates Section */}
      <div className="container py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ou choisissez votre métier
          </h2>
          <p className="text-muted-foreground">
            Configuration pré-remplie en 1 clic
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {popularTemplates.map((template) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet/50 hover:bg-violet/10 transition-all text-center group"
            >
              <div className="text-4xl mb-2">{template.emoji}</div>
              <p className="font-medium text-white text-sm">{template.label}</p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-violet transition-colors">
                {template.config.frequency} posts/sem
              </p>
            </motion.button>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/agents")}
            className="text-muted-foreground hover:text-white"
          >
            Voir tous les métiers
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Auto Pilot Section */}
      {configComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container py-12"
        >
          <div className="max-w-2xl mx-auto">
            <AutoPilotMode
              isActive={isAutoPilotActive}
              onActivate={() => setIsAutoPilotActive(true)}
              onDeactivate={() => setIsAutoPilotActive(false)}
              stats={{
                postsGenerated: 12,
                postsPublished: 8,
                engagement: 34
              }}
            />
          </div>
        </motion.div>
      )}

      {/* How it works */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground">
            3 étapes simples pour automatiser votre LinkedIn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              icon: Mic,
              title: "Décrivez votre activité",
              description: "Par la voix ou en répondant à 3 questions simples. L'IA comprend vos besoins."
            },
            {
              step: "2",
              icon: Zap,
              title: "L'IA configure tout",
              description: "Ton, sujets, fréquence... Tout est adapté à votre métier automatiquement."
            },
            {
              step: "3",
              icon: Plane,
              title: "Activez le pilote auto",
              description: "Les posts sont générés et publiés. Vous validez avant publication."
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet/20 to-rose/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-violet" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-violet text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trust badges */}
      <div className="container py-12 border-t border-white/10">
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { icon: Shield, text: "Mode supervisé par défaut" },
            { icon: Clock, text: "Configuration en 2 min" },
            { icon: Check, text: "Désactivable à tout moment" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-5 h-5" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video demo section */}
      <div className="container py-16">
        <Card className="max-w-3xl mx-auto bg-white/5 border-white/10 overflow-hidden">
          <div className="aspect-video relative bg-gradient-to-br from-violet/20 to-rose/20 flex items-center justify-center">
            <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors group">
              <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white font-medium">Voir la démo en 60 secondes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-violet/20 to-rose/20 border-white/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Prêt à automatiser votre LinkedIn ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Rejoignez les 2,500+ entrepreneurs qui gagnent du temps chaque semaine
          </p>
          <Button
            onClick={() => setShowVoiceAssistant(true)}
            size="lg"
            className="bg-white text-violet hover:bg-white/90 h-12 px-8"
          >
            <Mic className="w-5 h-5 mr-2" />
            Commencer maintenant
          </Button>
        </Card>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showVoiceAssistant && (
          <VoiceAssistant
            onConfigComplete={handleVoiceConfigComplete}
            onClose={() => setShowVoiceAssistant(false)}
          />
        )}

        {showWizard && (
          <SimpleAgentWizard
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
            onVoiceMode={() => {
              setShowWizard(false);
              setShowVoiceAssistant(true);
            }}
          />
        )}

        {showAutoPilotModal && (
          <AutoPilotFirstTimeModal
            onActivate={handleAutoPilotActivate}
            onClose={() => setShowAutoPilotModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
