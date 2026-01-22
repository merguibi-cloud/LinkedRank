import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Lightbulb,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Zap,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Target,
  Award,
  MessageSquare,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface PostTemplate {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  description: string;
  template: string;
  tips: string[];
  popularity: number;
}

const templates: PostTemplate[] = [
  {
    id: "storytelling",
    name: "Histoire personnelle",
    category: "Storytelling",
    icon: BookOpen,
    color: "text-violet-light",
    description: "Partagez une expérience marquante qui a changé votre vision",
    template: `Il y a [X temps], j'ai vécu quelque chose qui a tout changé.

[Décrivez le contexte et le problème]

J'étais [émotion/situation].

Puis j'ai compris une chose :

[La leçon apprise]

Aujourd'hui, quand je regarde en arrière, je réalise que [insight].

Si vous vivez la même chose, voici mon conseil :

→ [Conseil 1]
→ [Conseil 2]
→ [Conseil 3]

Quelle expérience vous a le plus appris ? 👇`,
    tips: [
      "Commencez par un hook émotionnel",
      "Soyez vulnérable et authentique",
      "Terminez par une question ouverte",
    ],
    popularity: 95,
  },
  {
    id: "contrarian",
    name: "Opinion controversée",
    category: "Thought Leadership",
    icon: Zap,
    color: "text-gold",
    description: "Partagez une opinion qui va à contre-courant",
    template: `Unpopular opinion : [Votre opinion controversée]

Je sais que ça va en surprendre plus d'un.

Mais voici pourquoi je pense ça :

1️⃣ [Argument 1]

2️⃣ [Argument 2]

3️⃣ [Argument 3]

La vraie question n'est pas de savoir si j'ai raison.

C'est de se demander : et si on avait tous tort ?

Qu'en pensez-vous ? D'accord ou pas d'accord ? 🤔`,
    tips: [
      "Choisissez un sujet qui vous passionne",
      "Argumentez avec des faits",
      "Restez respectueux des autres opinions",
    ],
    popularity: 88,
  },
  {
    id: "listicle",
    name: "Liste actionnable",
    category: "Conseils pratiques",
    icon: Target,
    color: "text-emerald-400",
    description: "Partagez des conseils concrets et actionnables",
    template: `[X] [choses/erreurs/conseils] que j'aurais aimé savoir avant de [action] :

1. [Conseil 1]
↳ [Explication courte]

2. [Conseil 2]
↳ [Explication courte]

3. [Conseil 3]
↳ [Explication courte]

4. [Conseil 4]
↳ [Explication courte]

5. [Conseil 5]
↳ [Explication courte]

Le plus important ? [Conclusion]

Quel conseil ajouteriez-vous à cette liste ? 👇`,
    tips: [
      "Utilisez des chiffres impairs (5, 7, 9)",
      "Chaque point doit être actionnable",
      "Ajoutez des emojis pour la lisibilité",
    ],
    popularity: 92,
  },
  {
    id: "before-after",
    name: "Avant / Après",
    category: "Transformation",
    icon: TrendingUp,
    color: "text-rose",
    description: "Montrez une transformation ou une évolution",
    template: `Il y a [X temps] : [Situation avant]

Aujourd'hui : [Situation après]

Qu'est-ce qui a changé ?

❌ J'ai arrêté de [mauvaise habitude 1]
❌ J'ai arrêté de [mauvaise habitude 2]
❌ J'ai arrêté de [mauvaise habitude 3]

✅ J'ai commencé à [bonne habitude 1]
✅ J'ai commencé à [bonne habitude 2]
✅ J'ai commencé à [bonne habitude 3]

Le résultat ? [Résultat concret]

Le changement ne se fait pas du jour au lendemain.

Mais il commence par une décision.

Quelle décision allez-vous prendre aujourd'hui ?`,
    tips: [
      "Utilisez des chiffres concrets",
      "Montrez le contraste clairement",
      "Inspirez l'action",
    ],
    popularity: 90,
  },
  {
    id: "failure",
    name: "Échec & Leçon",
    category: "Vulnérabilité",
    icon: Heart,
    color: "text-blue-400",
    description: "Partagez un échec et ce que vous en avez appris",
    template: `Mon plus gros échec de [année/période] :

[Décrivez l'échec]

J'ai perdu [ce que vous avez perdu].
J'ai douté de [ce dont vous avez douté].
J'ai failli [ce que vous avez failli faire].

Mais cet échec m'a appris 3 choses :

1️⃣ [Leçon 1]
2️⃣ [Leçon 2]
3️⃣ [Leçon 3]

Aujourd'hui, je suis reconnaissant pour cet échec.

Sans lui, je n'aurais jamais [ce que vous avez accompli].

L'échec n'est pas le contraire du succès.
C'est le chemin vers le succès.

Quel échec vous a le plus fait grandir ? 💪`,
    tips: [
      "Soyez authentique et vulnérable",
      "Montrez la transformation",
      "Inspirez les autres",
    ],
    popularity: 87,
  },
  {
    id: "question",
    name: "Question engageante",
    category: "Engagement",
    icon: MessageSquare,
    color: "text-orange-400",
    description: "Posez une question qui génère des commentaires",
    template: `Une question qui me trotte dans la tête :

[Votre question principale]

Je vois beaucoup de gens qui [observation 1].
D'autres qui [observation 2].

Personnellement, je pense que [votre opinion].

Mais je suis curieux de connaître votre avis :

→ Option A : [Première option]
→ Option B : [Deuxième option]
→ Option C : [Troisième option]

Votez en commentaire ! 👇

(Et expliquez pourquoi si vous avez 2 minutes)`,
    tips: [
      "Posez une question ouverte",
      "Donnez des options de réponse",
      "Répondez à chaque commentaire",
    ],
    popularity: 85,
  },
];

const categories = ["Tous", "Storytelling", "Thought Leadership", "Conseils pratiques", "Transformation", "Vulnérabilité", "Engagement"];

export function PostTemplates({ onSelectTemplate }: { onSelectTemplate?: (template: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null);

  const filteredTemplates = selectedCategory === "Tous"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleCopy = (template: PostTemplate) => {
    navigator.clipboard.writeText(template.template);
    setCopiedId(template.id);
    toast.success("Template copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (template: PostTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.template);
      toast.success("Template appliqué au générateur !");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-light" />
            Templates de Posts
          </h3>
          <p className="text-sm text-white/60 mt-1">
            {templates.length} templates prêts à l'emploi
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-violet/20 text-violet-light border border-violet/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:border-white/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
            onClick={() => setSelectedTemplate(template)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-white/5 ${template.color}`}>
                <template.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-gold fill-gold" />
                <span className="text-xs text-white/60">{template.popularity}%</span>
              </div>
            </div>

            {/* Content */}
            <h4 className="font-semibold text-white mb-1">{template.name}</h4>
            <p className="text-sm text-white/60 mb-3">{template.description}</p>

            {/* Category badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/50">
                {template.category}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(template);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template detail modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-3xl border border-white/10 shadow-2xl"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/5 ${selectedTemplate.color}`}>
                    <selectedTemplate.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-white/60">{selectedTemplate.category}</p>
                  </div>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-6">
                {/* Template preview */}
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-3">Aperçu du template</h4>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                      {selectedTemplate.template}
                    </pre>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-gold" />
                    Conseils pour ce template
                  </h4>
                  <ul className="space-y-2">
                    {selectedTemplate.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-violet-light">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCopy(selectedTemplate)}
                    variant="outline"
                    className="flex-1"
                  >
                    {copiedId === selectedTemplate.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le template
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      handleUse(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-violet to-rose"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Utiliser ce template
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PostTemplates;
