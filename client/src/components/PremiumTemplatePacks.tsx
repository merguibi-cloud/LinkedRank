import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Crown, 
  Sparkles, 
  Lock, 
  Unlock,
  Star,
  Check,
  Eye,
  ShoppingCart,
  Gift,
  Zap,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Heart
} from "lucide-react";
import { toast } from "sonner";

interface TemplatePack {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  price: number;
  originalPrice?: number;
  templates: string[];
  features: string[];
  popular?: boolean;
  new?: boolean;
  owned?: boolean;
}

const TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: "growth-hacker",
    name: "Growth Hacker",
    description: "Templates viraux pour exploser votre croissance LinkedIn",
    icon: Rocket,
    color: "from-purple-500 to-pink-500",
    price: 2500,
    originalPrice: 4000,
    templates: [
      "Hook viral en 3 lignes",
      "Storytelling transformation",
      "Chiffres qui impressionnent",
      "Avant/Après percutant",
      "Question provocante",
      "Liste de hacks",
      "Thread LinkedIn",
      "Carrousel viral"
    ],
    features: [
      "8 templates haute conversion",
      "Guide d'utilisation",
      "Exemples réels",
      "Mises à jour gratuites"
    ],
    popular: true
  },
  {
    id: "thought-leader",
    name: "Thought Leader",
    description: "Positionnez-vous comme expert de votre secteur",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    price: 3000,
    templates: [
      "Opinion tranchée",
      "Prédiction marché",
      "Analyse tendance",
      "Leçon d'expérience",
      "Conseil contre-intuitif",
      "Débat ouvert",
      "Vision long terme",
      "Manifeste personnel"
    ],
    features: [
      "8 templates d'autorité",
      "Framework de positionnement",
      "Calendrier éditorial",
      "Support prioritaire"
    ],
    new: true
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet",
    description: "Générez des leads qualifiés avec chaque post",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    price: 3500,
    templates: [
      "Offre irrésistible",
      "Étude de cas client",
      "Résultat chiffré",
      "Témoignage puissant",
      "Problème/Solution",
      "Checklist gratuite",
      "Webinar teaser",
      "Consultation offerte"
    ],
    features: [
      "8 templates conversion",
      "Scripts de CTA",
      "Séquences de nurturing",
      "Tracking des leads"
    ]
  },
  {
    id: "personal-brand",
    name: "Personal Brand",
    description: "Construisez une marque personnelle mémorable",
    icon: Star,
    color: "from-blue-500 to-cyan-500",
    price: 2000,
    templates: [
      "Mon histoire",
      "Mes valeurs",
      "Ma mission",
      "Mes échecs",
      "Mes apprentissages",
      "Mon parcours",
      "Ma vision",
      "Mon pourquoi"
    ],
    features: [
      "8 templates authentiques",
      "Guide de storytelling",
      "Exercices d'introspection",
      "Feedback personnalisé"
    ]
  },
  {
    id: "recruiter-pro",
    name: "Recruiter Pro",
    description: "Attirez les meilleurs talents avec des posts impactants",
    icon: Users,
    color: "from-indigo-500 to-violet-500",
    price: 2500,
    templates: [
      "Offre d'emploi attractive",
      "Culture d'entreprise",
      "Témoignage employé",
      "Journée type",
      "Avantages uniques",
      "Valeurs équipe",
      "Success story interne",
      "Behind the scenes"
    ],
    features: [
      "8 templates RH",
      "Guide employer branding",
      "Métriques de recrutement",
      "Templates messages"
    ]
  },
  {
    id: "sales-master",
    name: "Sales Master",
    description: "Vendez sans vendre avec du contenu de valeur",
    icon: Briefcase,
    color: "from-red-500 to-rose-500",
    price: 3000,
    templates: [
      "Social selling story",
      "Objection handling",
      "ROI démontré",
      "Comparatif intelligent",
      "Urgence subtile",
      "Preuve sociale",
      "Demo teaser",
      "Closing doux"
    ],
    features: [
      "8 templates vente",
      "Scripts de prospection",
      "Séquences outreach",
      "Analyse concurrence"
    ]
  }
];

export function PremiumTemplatePacks() {
  const [selectedPack, setSelectedPack] = useState<TemplatePack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [userCredits] = useState(5000);
  const [ownedPacks, setOwnedPacks] = useState<string[]>([]);

  const handlePurchase = (pack: TemplatePack) => {
    if (userCredits >= pack.price) {
      setOwnedPacks([...ownedPacks, pack.id]);
      toast.success(`Pack "${pack.name}" débloqué !`, {
        description: `${pack.templates.length} templates ajoutés à votre bibliothèque`
      });
    } else {
      toast.error("Crédits insuffisants", {
        description: `Il vous manque ${pack.price - userCredits} crédits`
      });
    }
  };

  const isOwned = (packId: string) => ownedPacks.includes(packId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Packs Premium
          </h2>
          <p className="text-sm text-muted-foreground">
            Collections exclusives de templates haute performance
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-500">{userCredits.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">crédits</span>
        </div>
      </div>

      {/* Grille des packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_PACKS.map((pack, index) => {
          const Icon = pack.icon;
          const owned = isOwned(pack.id);
          
          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card overflow-hidden relative ${owned ? "border-green-500/50" : ""}`}>
                {/* Badge populaire ou nouveau */}
                {(pack.popular || pack.new) && (
                  <div className="absolute top-3 right-3 z-10">
                    {pack.popular && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                        <Zap className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                    {pack.new && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Nouveau
                      </Badge>
                    )}
                  </div>
                )}

                {/* Header avec gradient */}
                <div className={`h-24 bg-gradient-to-r ${pack.color} flex items-center justify-center relative`}>
                  <Icon className="w-12 h-12 text-white" />
                  {owned && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <Badge className="bg-green-500 text-white">
                        <Unlock className="w-3 h-3 mr-1" />
                        Débloqué
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-1">{pack.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pack.description}</p>

                  {/* Templates inclus */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {pack.templates.length} templates inclus :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pack.templates.slice(0, 4).map((template, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {template}
                        </Badge>
                      ))}
                      {pack.templates.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{pack.templates.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Prix et actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      {pack.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          {pack.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xl font-bold text-primary">
                        {pack.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">crédits</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPack(pack);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {owned ? (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          Acquis
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(pack)}
                          disabled={userCredits < pack.price}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Acheter
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPack && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${selectedPack.color} flex items-center justify-center`}>
                    <selectedPack.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span>{selectedPack.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedPack.description}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Templates inclus */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {selectedPack.templates.length} Templates inclus
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPack.templates.map((template, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{template}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Ce qui est inclus
                  </h4>
                  <div className="space-y-2">
                    {selectedPack.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {selectedPack.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through mr-2">
                        {selectedPack.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary">
                      {selectedPack.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">crédits</span>
                  </div>
                  
                  {isOwned(selectedPack.id) ? (
                    <Button size="lg" className="bg-green-500 hover:bg-green-600">
                      <Check className="w-5 h-5 mr-2" />
                      Déjà acquis
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => {
                        handlePurchase(selectedPack);
                        setShowPreview(false);
                      }}
                      disabled={userCredits < selectedPack.price}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Acheter maintenant
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PremiumTemplatePacks;
