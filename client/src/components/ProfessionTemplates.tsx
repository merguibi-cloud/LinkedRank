import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wrench,
  Briefcase,
  Store,
  GraduationCap,
  Building2,
  Users,
  Laptop,
  Heart,
  Camera,
  Utensils,
  Car,
  Home,
  Scissors,
  Palette,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Templates métiers complets avec toutes les configurations
export const PROFESSION_TEMPLATES = [
  {
    id: "plombier",
    category: "Artisanat",
    label: "Plombier / Chauffagiste",
    icon: Wrench,
    color: "from-blue-500 to-cyan-500",
    emoji: "🔧",
    description: "Dépannage, installation, entretien",
    config: {
      tone: "authentique",
      topics: [
        "Conseils d'entretien pour éviter les pannes",
        "Avant/après de mes interventions",
        "Astuces pour économiser l'eau et l'énergie",
        "Témoignages de clients satisfaits",
        "Coulisses de mon quotidien d'artisan"
      ],
      frequency: 3,
      bestDays: ["Mardi", "Jeudi", "Samedi"],
      bestHours: ["7h", "12h", "19h"],
      hashtags: ["#plombier", "#artisan", "#dépannage", "#travaux", "#maison"],
      examplePost: "💧 Astuce du jour : Pour éviter les canalisations bouchées, versez une fois par mois de l'eau bouillante avec du vinaigre blanc. Simple et efficace ! Vous avez des questions sur l'entretien de votre plomberie ? Je réponds en commentaire 👇"
    }
  },
  {
    id: "electricien",
    category: "Artisanat",
    label: "Électricien",
    icon: Wrench,
    color: "from-yellow-500 to-orange-500",
    emoji: "⚡",
    description: "Installation, dépannage, mise aux normes",
    config: {
      tone: "professionnel",
      topics: [
        "Conseils de sécurité électrique",
        "Nouvelles normes et réglementations",
        "Économies d'énergie au quotidien",
        "Projets de rénovation électrique",
        "Témoignages clients"
      ],
      frequency: 3,
      bestDays: ["Lundi", "Mercredi", "Vendredi"],
      bestHours: ["8h", "12h", "18h"],
      hashtags: ["#electricien", "#artisan", "#renovation", "#securite", "#energie"],
      examplePost: "⚡ Saviez-vous que 25% des incendies domestiques sont d'origine électrique ? Faites vérifier votre installation par un professionnel. Je vous explique les 5 signes qui doivent vous alerter..."
    }
  },
  {
    id: "coach",
    category: "Services",
    label: "Coach / Consultant",
    icon: GraduationCap,
    color: "from-violet to-purple-500",
    emoji: "🎯",
    description: "Accompagnement, formation, conseil",
    config: {
      tone: "inspirant",
      topics: [
        "Conseils de développement personnel",
        "Histoires de transformation de clients",
        "Méthodes et outils pratiques",
        "Réflexions sur le leadership",
        "Actualités de mon domaine d'expertise"
      ],
      frequency: 4,
      bestDays: ["Lundi", "Mardi", "Jeudi", "Vendredi"],
      bestHours: ["7h", "12h", "18h"],
      hashtags: ["#coaching", "#developpementpersonnel", "#leadership", "#transformation", "#mindset"],
      examplePost: "🎯 La différence entre ceux qui réussissent et les autres ? Ils passent à l'action malgré la peur. Quelle action avez-vous repoussée cette semaine ? C'est le moment de la faire. 💪"
    }
  },
  {
    id: "coiffeur",
    category: "Beauté",
    label: "Coiffeur / Barbier",
    icon: Scissors,
    color: "from-pink-500 to-rose-500",
    emoji: "✂️",
    description: "Coupe, coloration, soins capillaires",
    config: {
      tone: "chaleureux",
      topics: [
        "Tendances coiffure du moment",
        "Avant/après de mes réalisations",
        "Conseils d'entretien des cheveux",
        "Coulisses du salon",
        "Témoignages clients"
      ],
      frequency: 5,
      bestDays: ["Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      bestHours: ["10h", "14h", "18h"],
      hashtags: ["#coiffure", "#coiffeur", "#haircut", "#tendance", "#beaute"],
      examplePost: "✂️ Transformation du jour ! Marie voulait un changement radical pour la rentrée. On est passé d'un carré long à un bob court texturé. Elle adore, et vous ? 😍 Swipez pour voir l'avant/après →"
    }
  },
  {
    id: "restaurateur",
    category: "Restauration",
    label: "Restaurateur / Chef",
    icon: Utensils,
    color: "from-red-500 to-orange-500",
    emoji: "🍽️",
    description: "Restaurant, traiteur, food truck",
    config: {
      tone: "gourmand",
      topics: [
        "Plats du jour et nouveautés",
        "Coulisses de la cuisine",
        "Produits locaux et de saison",
        "Recettes et astuces",
        "Événements et soirées spéciales"
      ],
      frequency: 6,
      bestDays: ["Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
      bestHours: ["11h", "17h", "19h"],
      hashtags: ["#restaurant", "#gastronomie", "#chef", "#foodie", "#local"],
      examplePost: "🍽️ Notre plat du jour : Filet de bar rôti, risotto aux asperges et émulsion au citron. Produits frais du marché ce matin ! Réservez votre table pour ce soir 📞"
    }
  },
  {
    id: "agent-immo",
    category: "Immobilier",
    label: "Agent Immobilier",
    icon: Home,
    color: "from-emerald-500 to-teal-500",
    emoji: "🏠",
    description: "Vente, location, estimation",
    config: {
      tone: "professionnel",
      topics: [
        "Biens à vendre ou à louer",
        "Conseils pour acheteurs/vendeurs",
        "Actualités du marché immobilier",
        "Témoignages de clients satisfaits",
        "Quartiers et communes à découvrir"
      ],
      frequency: 4,
      bestDays: ["Lundi", "Mardi", "Jeudi", "Samedi"],
      bestHours: ["9h", "12h", "18h"],
      hashtags: ["#immobilier", "#realestate", "#maison", "#appartement", "#investissement"],
      examplePost: "🏠 NOUVEAU : Magnifique maison de 150m² avec jardin à [Ville]. 4 chambres, garage, proche écoles et commerces. Prix : XXX€. Visite ce week-end ! Contactez-moi en MP 📩"
    }
  },
  {
    id: "photographe",
    category: "Créatif",
    label: "Photographe / Vidéaste",
    icon: Camera,
    color: "from-indigo-500 to-blue-500",
    emoji: "📸",
    description: "Photo, vidéo, événementiel",
    config: {
      tone: "créatif",
      topics: [
        "Coulisses de mes shootings",
        "Avant/après retouches",
        "Conseils photo pour débutants",
        "Témoignages clients",
        "Nouveaux projets et collaborations"
      ],
      frequency: 4,
      bestDays: ["Lundi", "Mercredi", "Vendredi", "Dimanche"],
      bestHours: ["10h", "14h", "20h"],
      hashtags: ["#photographe", "#photo", "#shooting", "#portrait", "#evenement"],
      examplePost: "📸 Shooting mariage de Julie & Thomas ce week-end. Un moment magique sous le soleil de Provence. Voici un aperçu de cette belle journée... (Galerie complète bientôt disponible !)"
    }
  },
  {
    id: "garagiste",
    category: "Automobile",
    label: "Garagiste / Mécanicien",
    icon: Car,
    color: "from-slate-600 to-slate-800",
    emoji: "🚗",
    description: "Réparation, entretien, contrôle",
    config: {
      tone: "authentique",
      topics: [
        "Conseils d'entretien automobile",
        "Diagnostics et réparations",
        "Préparation aux contrôles techniques",
        "Témoignages clients",
        "Actualités automobile"
      ],
      frequency: 3,
      bestDays: ["Mardi", "Jeudi", "Samedi"],
      bestHours: ["8h", "12h", "18h"],
      hashtags: ["#garagiste", "#mecanique", "#auto", "#entretien", "#reparation"],
      examplePost: "🚗 Conseil du mécanicien : Vérifiez la pression de vos pneus au moins 1x/mois. Des pneus sous-gonflés = +15% de consommation et usure prématurée. Passez au garage, c'est gratuit !"
    }
  },
  {
    id: "decorateur",
    category: "Créatif",
    label: "Décorateur / Architecte d'intérieur",
    icon: Palette,
    color: "from-amber-500 to-yellow-500",
    emoji: "🎨",
    description: "Décoration, aménagement, home staging",
    config: {
      tone: "inspirant",
      topics: [
        "Tendances déco du moment",
        "Avant/après de mes projets",
        "Conseils d'aménagement",
        "Shopping déco et bons plans",
        "Témoignages clients"
      ],
      frequency: 4,
      bestDays: ["Lundi", "Mercredi", "Vendredi", "Dimanche"],
      bestHours: ["10h", "14h", "19h"],
      hashtags: ["#decoration", "#interiordesign", "#deco", "#amenagement", "#homestaging"],
      examplePost: "🎨 Transformation salon terminée ! On est passé d'un espace sombre et encombré à un lieu lumineux et cosy. Budget : 3000€. Swipez pour voir l'avant/après →"
    }
  },
  {
    id: "rh-recruteur",
    category: "RH",
    label: "RH / Recruteur",
    icon: Users,
    color: "from-rose to-pink-500",
    emoji: "👥",
    description: "Recrutement, marque employeur, talent",
    config: {
      tone: "engageant",
      topics: [
        "Offres d'emploi et opportunités",
        "Conseils pour candidats",
        "Culture d'entreprise et valeurs",
        "Témoignages collaborateurs",
        "Actualités RH et recrutement"
      ],
      frequency: 5,
      bestDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      bestHours: ["8h", "12h", "17h"],
      hashtags: ["#recrutement", "#emploi", "#rh", "#job", "#carriere"],
      examplePost: "👥 On recrute ! 3 postes ouverts chez [Entreprise] : Développeur, Commercial, Chef de projet. CDI, télétravail partiel, super équipe. Intéressé(e) ? Envoyez votre CV en MP ou postulez sur notre site 🚀"
    }
  },
  {
    id: "therapeute",
    category: "Santé",
    label: "Thérapeute / Praticien bien-être",
    icon: Heart,
    color: "from-green-500 to-emerald-500",
    emoji: "🌿",
    description: "Massage, ostéopathie, naturopathie",
    config: {
      tone: "bienveillant",
      topics: [
        "Conseils bien-être au quotidien",
        "Bienfaits de mes pratiques",
        "Témoignages de patients",
        "Exercices et routines",
        "Actualités santé naturelle"
      ],
      frequency: 3,
      bestDays: ["Lundi", "Mercredi", "Vendredi"],
      bestHours: ["9h", "14h", "19h"],
      hashtags: ["#bienetre", "#sante", "#therapie", "#naturel", "#relaxation"],
      examplePost: "🌿 3 exercices de respiration pour calmer le stress en 5 minutes. À faire au bureau, dans les transports ou avant de dormir. Testez et dites-moi en commentaire celui qui vous convient le mieux 👇"
    }
  },
  {
    id: "freelance-dev",
    category: "Tech",
    label: "Développeur / Freelance Tech",
    icon: Laptop,
    color: "from-cyan-500 to-blue-500",
    emoji: "💻",
    description: "Développement web, mobile, logiciel",
    config: {
      tone: "expert",
      topics: [
        "Projets et réalisations",
        "Conseils techniques",
        "Veille technologique",
        "Retours d'expérience freelance",
        "Outils et méthodes de travail"
      ],
      frequency: 3,
      bestDays: ["Mardi", "Jeudi", "Samedi"],
      bestHours: ["9h", "14h", "20h"],
      hashtags: ["#developpeur", "#freelance", "#tech", "#webdev", "#code"],
      examplePost: "💻 Projet terminé : Application mobile de gestion de stock pour une PME. Stack : React Native + Node.js. 3 mois de dev, 0 bug en prod depuis le lancement. Le client est ravi ! 🎉"
    }
  }
];

interface ProfessionTemplatesProps {
  onSelectTemplate: (template: typeof PROFESSION_TEMPLATES[0]) => void;
  selectedId?: string;
}

export function ProfessionTemplates({ onSelectTemplate, selectedId }: ProfessionTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<typeof PROFESSION_TEMPLATES[0] | null>(null);

  const categories = Array.from(new Set(PROFESSION_TEMPLATES.map(t => t.category)));
  
  const filteredTemplates = selectedCategory 
    ? PROFESSION_TEMPLATES.filter(t => t.category === selectedCategory)
    : PROFESSION_TEMPLATES;

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? "bg-violet" : ""}
        >
          Tous
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "bg-violet" : ""}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedId === template.id;
          
          return (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTemplate(template)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected 
                  ? "border-violet bg-violet/10" 
                  : "border-white/10 hover:border-white/30 bg-white/5"
              }`}
            >
              <div className="text-3xl mb-2">{template.emoji}</div>
              <p className="font-semibold text-white text-sm">{template.label}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-violet text-xs">
                  <Check className="w-3 h-3" />
                  Sélectionné
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Preview panel */}
      {previewTemplate && (
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{previewTemplate.emoji}</div>
              <div>
                <h3 className="font-bold text-white">{previewTemplate.label}</h3>
                <p className="text-sm text-muted-foreground">{previewTemplate.category}</p>
              </div>
            </div>
            <Button
              onClick={() => onSelectTemplate(previewTemplate)}
              className="bg-violet hover:bg-violet/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Utiliser ce template
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="w-4 h-4" />
                Fréquence
              </div>
              <p className="text-white font-medium">
                {previewTemplate.config.frequency} posts/semaine
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <MessageSquare className="w-4 h-4" />
                Ton
              </div>
              <p className="text-white font-medium capitalize">
                {previewTemplate.config.tone}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Target className="w-4 h-4" />
                Sujets
              </div>
              <p className="text-white font-medium">
                {previewTemplate.config.topics.length} thèmes
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-muted-foreground mb-2">Exemple de post :</p>
            <p className="text-white text-sm">{previewTemplate.config.examplePost}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// Composant de prévisualisation de template
export function TemplatePreview({ template }: { template: typeof PROFESSION_TEMPLATES[0] }) {
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{template.emoji}</div>
        <div>
          <h3 className="font-bold text-white">{template.label}</h3>
          <p className="text-sm text-muted-foreground">{template.category}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Configuration automatique :</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-violet/20 text-violet-light text-xs">
              {template.config.frequency} posts/semaine
            </span>
            <span className="px-2 py-1 rounded-full bg-rose/20 text-rose text-xs">
              Ton {template.config.tone}
            </span>
            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              {template.config.topics.length} sujets
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Sujets abordés :</p>
          <ul className="space-y-1">
            {template.config.topics.slice(0, 3).map((topic, i) => (
              <li key={i} className="text-sm text-white flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-500" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Meilleurs moments :</p>
          <p className="text-sm text-white">
            {template.config.bestDays.slice(0, 3).join(", ")} à {template.config.bestHours[0]}
          </p>
        </div>
      </div>
    </Card>
  );
}
