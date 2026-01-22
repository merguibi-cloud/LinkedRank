import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Building2, 
  Users, 
  UserSearch, 
  PenTool, 
  UserCog,
  Laptop,
  Rocket,
  ChevronRight,
  Check,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface UserProfile {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  objectives: string[];
  recommendedFeatures: string[];
  tips: string[];
}

export const USER_PROFILES: UserProfile[] = [
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    description: "Vous lancez ou développez votre propre entreprise",
    icon: <Rocket className="w-8 h-8" />,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-amber-500/20",
    objectives: ["Développer votre personal branding", "Attirer des clients", "Partager votre vision"],
    recommendedFeatures: ["Générateur IA", "Auto-Publish", "Coaching IA"],
    tips: [
      "Partagez votre parcours entrepreneurial authentique",
      "Publiez 3-4 fois par semaine pour maximiser votre visibilité",
      "Utilisez le storytelling pour créer une connexion émotionnelle"
    ]
  },
  {
    id: "ceo",
    name: "Chef d'entreprise",
    description: "Vous dirigez une entreprise et souhaitez renforcer votre leadership",
    icon: <Building2 className="w-8 h-8" />,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/20",
    objectives: ["Positionner votre expertise", "Attirer des talents", "Développer votre réseau B2B"],
    recommendedFeatures: ["Templates", "Analytics Pro", "A/B Testing"],
    tips: [
      "Partagez vos insights sur votre industrie",
      "Mettez en avant la culture de votre entreprise",
      "Commentez l'actualité de votre secteur"
    ]
  },
  {
    id: "commercial",
    name: "Commercial / Sales",
    description: "Vous vendez des produits ou services et cherchez des prospects",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-500/20",
    objectives: ["Générer des leads qualifiés", "Créer des opportunités", "Établir votre crédibilité"],
    recommendedFeatures: ["Engagement Manager", "Tendances", "Carrousels"],
    tips: [
      "Apportez de la valeur avant de vendre",
      "Partagez des études de cas et témoignages clients",
      "Engagez-vous dans les commentaires de vos prospects"
    ]
  },
  {
    id: "recruiter",
    name: "Recruteur / RH",
    description: "Vous recrutez des talents et développez la marque employeur",
    icon: <UserSearch className="w-8 h-8" />,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-500/20",
    objectives: ["Attirer les meilleurs talents", "Développer la marque employeur", "Créer une communauté"],
    recommendedFeatures: ["Templates", "Auto-Publish", "Analytics"],
    tips: [
      "Montrez les coulisses de votre entreprise",
      "Partagez des témoignages d'employés",
      "Publiez des offres avec du storytelling"
    ]
  },
  {
    id: "creator",
    name: "Créateur de contenu",
    description: "Vous créez du contenu pour développer votre audience",
    icon: <PenTool className="w-8 h-8" />,
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-rose-500/20",
    objectives: ["Développer votre audience", "Monétiser votre expertise", "Devenir une référence"],
    recommendedFeatures: ["Générateur IA", "Carrousels", "Gamification"],
    tips: [
      "Publiez quotidiennement pour maximiser la croissance",
      "Expérimentez différents formats (texte, carrousel, vidéo)",
      "Créez une série de contenus récurrents"
    ]
  },
  {
    id: "freelance",
    name: "Freelance / Consultant",
    description: "Vous proposez vos services en indépendant",
    icon: <Laptop className="w-8 h-8" />,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-teal-500/20",
    objectives: ["Trouver des missions", "Démontrer votre expertise", "Construire votre réputation"],
    recommendedFeatures: ["Générateur IA", "Coaching IA", "Templates"],
    tips: [
      "Partagez vos réalisations et cas clients",
      "Donnez des conseils gratuits pour montrer votre valeur",
      "Créez du contenu éducatif dans votre domaine"
    ]
  },
  {
    id: "manager",
    name: "Manager / Cadre",
    description: "Vous gérez des équipes et souhaitez développer votre leadership",
    icon: <Users className="w-8 h-8" />,
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-yellow-500/20",
    objectives: ["Développer votre leadership", "Inspirer vos équipes", "Évoluer dans votre carrière"],
    recommendedFeatures: ["Templates", "Ressources", "Analytics"],
    tips: [
      "Partagez vos apprentissages en management",
      "Célébrez les succès de votre équipe",
      "Donnez des conseils de carrière"
    ]
  }
];

interface ProfileSelectorProps {
  onSelect: (profile: UserProfile) => void;
  selectedProfile?: string;
}

export function ProfileSelector({ onSelect, selectedProfile }: ProfileSelectorProps) {
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(selectedProfile || null);

  const handleSelect = (profile: UserProfile) => {
    setSelected(profile.id);
    onSelect(profile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Personnalisation</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground"
        >
          Qui êtes-vous ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-md mx-auto"
        >
          Sélectionnez votre profil pour une expérience personnalisée avec des conseils et fonctionnalités adaptés à vos objectifs.
        </motion.p>
      </div>

      {/* Profile Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {USER_PROFILES.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredProfile(profile.id)}
            onMouseLeave={() => setHoveredProfile(null)}
          >
            <Card
              className={`glass-card cursor-pointer transition-all duration-300 overflow-hidden ${
                selected === profile.id 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleSelect(profile)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradient} opacity-50`} />
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-14 h-14 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center ${profile.color}`}>
                    {profile.icon}
                  </div>
                  {selected === profile.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">{profile.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{profile.description}</p>
                
                {/* Objectives preview on hover */}
                <AnimatePresence>
                  {hoveredProfile === profile.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-border/50"
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-2">Vos objectifs :</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.objectives.slice(0, 2).map((obj, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Profile Details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {(() => {
              const profile = USER_PROFILES.find(p => p.id === selected);
              if (!profile) return null;
              
              return (
                <Card className="glass-card border-primary/30 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradient} opacity-30`} />
                  <CardContent className="relative p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Objectives */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">Vos objectifs</h4>
                        </div>
                        <ul className="space-y-2">
                          {profile.objectives.map((obj, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-green-400 shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Recommended Features */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">Fonctionnalités recommandées</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.recommendedFeatures.map((feature, i) => (
                            <Badge key={i} className="bg-primary/20 text-primary border-primary/30">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tips */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">Conseils personnalisés</h4>
                        </div>
                        <ul className="space-y-2">
                          {profile.tips.slice(0, 2).map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
