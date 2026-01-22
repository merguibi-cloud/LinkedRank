import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, X, Volume2, VolumeX, Pause, Maximize2 } from "lucide-react";

export function VideoPresentation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Simulation d'une vidéo de présentation (en production, ce serait une vraie vidéo)
  const videoSteps = [
    {
      time: "0:00",
      title: "Bienvenue sur LinkedAgents",
      description: "Découvrez comment nos agents IA peuvent transformer votre présence LinkedIn.",
      icon: "👋",
    },
    {
      time: "0:15",
      title: "Rencontrez votre équipe IA",
      description: "Léa crée du contenu, Max détecte les tendances, Emma gère l'engagement...",
      icon: "🤖",
    },
    {
      time: "0:30",
      title: "Générez du contenu viral",
      description: "En quelques clics, créez des posts optimisés pour LinkedIn.",
      icon: "✨",
    },
    {
      time: "0:45",
      title: "Analysez vos performances",
      description: "Suivez vos statistiques et optimisez votre stratégie.",
      icon: "📊",
    },
    {
      time: "1:00",
      title: "Commencez maintenant !",
      description: "Activez vos agents IA et dominez LinkedIn.",
      icon: "🚀",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handlePlay = () => {
    setIsOpen(true);
    setIsPlaying(true);
    // Simuler la progression de la vidéo
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= videoSteps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Video Trigger Button */}
      <div className="relative group cursor-pointer" onClick={handlePlay}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet/20 to-rose/20 p-1">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full max-w-md rounded-xl bg-gradient-to-br from-violet/30 via-background to-rose/30 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute h-32 w-32 rounded-full bg-violet/30 blur-3xl animate-pulse" />
              <div className="absolute h-24 w-24 rounded-full bg-rose/30 blur-2xl animate-pulse delay-500" />
            </div>
            
            {/* Content Preview */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 text-5xl">🎬</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Découvrez LinkedAgents en 60 secondes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Une vidéo rapide pour comprendre comment nos agents IA peuvent vous aider
              </p>
              
              {/* Play Button */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-violet to-rose shadow-lg shadow-violet/30 transition-transform group-hover:scale-110">
                <Play className="h-7 w-7 text-white ml-1" fill="white" />
              </div>
            </div>
            
            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
              1:00
            </div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet/50 to-rose/50 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-sm">Fermer</span>
              <X className="h-5 w-5" />
            </button>

            {/* Video Container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet/10 to-rose/10">
              {/* Video Content */}
              <div className="aspect-video w-full bg-gradient-to-br from-background via-violet/5 to-background">
                {/* Animated Step Content */}
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  {/* Step Icon */}
                  <div className="mb-6 text-7xl animate-bounce">
                    {videoSteps[currentStep].icon}
                  </div>
                  
                  {/* Step Title */}
                  <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in">
                    {videoSteps[currentStep].title}
                  </h2>
                  
                  {/* Step Description */}
                  <p className="text-lg text-muted-foreground max-w-lg animate-fade-in">
                    {videoSteps[currentStep].description}
                  </p>

                  {/* Progress Dots */}
                  <div className="mt-8 flex gap-2">
                    {videoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStep
                            ? "w-8 bg-violet"
                            : index < currentStep
                            ? "w-2 bg-violet/50"
                            : "w-2 bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 text-white" />
                      ) : (
                        <Play className="h-5 w-5 text-white ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-white" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-white" />
                      )}
                    </button>
                    <span className="text-sm text-white/70">
                      {videoSteps[currentStep].time} / 1:00
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 mx-4">
                    <div className="h-1 rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet to-rose transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / videoSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Controls */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <Maximize2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA After Video */}
            {currentStep === videoSteps.length - 1 && !isPlaying && (
              <div className="mt-6 flex justify-center gap-4">
                <Button className="btn-gradient h-12 px-8" onClick={handleClose}>
                  Activer mes Agents IA
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-8 border-white/20 hover:bg-white/5"
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(true);
                  }}
                >
                  Revoir la vidéo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
