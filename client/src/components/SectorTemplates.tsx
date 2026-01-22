import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  TrendingUp, 
  Users, 
  Megaphone, 
  Search,
  Copy,
  Heart,
  Eye,
  Sparkles,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Target,
  Award,
  MessageSquare,
  FileText,
  Zap,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  sector: "tech" | "finance" | "rh" | "marketing";
  type: "story" | "tips" | "announcement" | "analysis" | "question";
  popularity: number;
  uses: number;
  tags: string[];
}

const TEMPLATES: Template[] = [
  // TECH
  {
    id: "tech-1",
    title: "Lancement de produit",
    description: "Annoncez votre nouveau produit ou fonctionnalité",
    content: `🚀 Après [X] mois de travail acharné, je suis fier de vous présenter [NOM DU PRODUIT] !

Ce qui a commencé comme une simple idée est devenu une solution qui va changer la façon dont vous [BÉNÉFICE PRINCIPAL].

✨ Les 3 fonctionnalités clés :
→ [Fonctionnalité 1] : [Bénéfice]
→ [Fonctionnalité 2] : [Bénéfice]
→ [Fonctionnalité 3] : [Bénéfice]

Le plus fou ? [FAIT MARQUANT ou STATISTIQUE]

Merci à toute l'équipe qui a rendu cela possible 🙏

👉 Lien en commentaire pour découvrir [PRODUIT]

Qu'est-ce qui vous intéresse le plus dans cette annonce ?`,
    sector: "tech",
    type: "announcement",
    popularity: 95,
    uses: 2847,
    tags: ["lancement", "produit", "startup"]
  },
  {
    id: "tech-2",
    title: "Tutoriel technique",
    description: "Partagez vos connaissances techniques",
    content: `💡 Comment j'ai [RÉSULTAT] en utilisant [TECHNOLOGIE] :

Le problème : [Description du problème]

La solution en 5 étapes :

1️⃣ [Étape 1]
   → [Détail ou code]

2️⃣ [Étape 2]
   → [Détail ou code]

3️⃣ [Étape 3]
   → [Détail ou code]

4️⃣ [Étape 4]
   → [Détail ou code]

5️⃣ [Étape 5]
   → [Détail ou code]

📊 Résultat : [Métrique avant] → [Métrique après]

Le code complet est disponible sur mon GitHub (lien en commentaire).

Quelle technologie aimeriez-vous que j'explore ensuite ?`,
    sector: "tech",
    type: "tips",
    popularity: 92,
    uses: 1923,
    tags: ["tutoriel", "code", "développement"]
  },
  {
    id: "tech-3",
    title: "Veille technologique",
    description: "Partagez les dernières tendances tech",
    content: `🔮 Les 5 tendances tech qui vont exploser en [ANNÉE] :

J'ai analysé [X] rapports et discuté avec [X] experts. Voici ce qui ressort :

1. [TENDANCE 1] 📈
   → Pourquoi : [Explication]
   → Impact : [Conséquence]

2. [TENDANCE 2] 🤖
   → Pourquoi : [Explication]
   → Impact : [Conséquence]

3. [TENDANCE 3] ⚡
   → Pourquoi : [Explication]
   → Impact : [Conséquence]

4. [TENDANCE 4] 🌐
   → Pourquoi : [Explication]
   → Impact : [Conséquence]

5. [TENDANCE 5] 🔒
   → Pourquoi : [Explication]
   → Impact : [Conséquence]

Ma prédiction personnelle : [OPINION]

Quelle tendance vous semble la plus prometteuse ?`,
    sector: "tech",
    type: "analysis",
    popularity: 88,
    uses: 1456,
    tags: ["tendances", "veille", "innovation"]
  },
  // FINANCE
  {
    id: "finance-1",
    title: "Analyse de marché",
    description: "Partagez votre analyse des marchés financiers",
    content: `📊 Analyse de marché - [DATE] :

Cette semaine, 3 signaux importants à surveiller :

🟢 Signal haussier : [ACTIF/SECTEUR]
→ [Raison 1]
→ [Raison 2]
→ Objectif : [NIVEAU]

🔴 Signal de prudence : [ACTIF/SECTEUR]
→ [Raison 1]
→ [Raison 2]
→ Support clé : [NIVEAU]

📈 Opportunité à surveiller : [ACTIF/SECTEUR]
→ [Catalyseur attendu]
→ Timing : [PÉRIODE]

⚠️ Rappel : Ceci n'est pas un conseil en investissement. Faites vos propres recherches.

Quel secteur analysez-vous en ce moment ?`,
    sector: "finance",
    type: "analysis",
    popularity: 91,
    uses: 1678,
    tags: ["marchés", "investissement", "analyse"]
  },
  {
    id: "finance-2",
    title: "Conseil investissement",
    description: "Partagez vos conseils d'investissement",
    content: `💰 [X] erreurs que j'aurais aimé éviter quand j'ai commencé à investir :

Après [X] ans d'investissement et [X]€ investis, voici ce que j'ai appris :

❌ Erreur 1 : [ERREUR]
✅ Ce que je fais maintenant : [SOLUTION]

❌ Erreur 2 : [ERREUR]
✅ Ce que je fais maintenant : [SOLUTION]

❌ Erreur 3 : [ERREUR]
✅ Ce que je fais maintenant : [SOLUTION]

❌ Erreur 4 : [ERREUR]
✅ Ce que je fais maintenant : [SOLUTION]

❌ Erreur 5 : [ERREUR]
✅ Ce que je fais maintenant : [SOLUTION]

La leçon la plus importante : [LEÇON CLÉ]

Quelle erreur avez-vous faite en débutant ?`,
    sector: "finance",
    type: "tips",
    popularity: 94,
    uses: 2134,
    tags: ["conseils", "erreurs", "apprentissage"]
  },
  // RH
  {
    id: "rh-1",
    title: "Offre d'emploi engageante",
    description: "Rédigez une offre d'emploi qui attire les talents",
    content: `🚀 On recrute ! [POSTE] - [ENTREPRISE]

Pourquoi nous rejoindre ?

Parce qu'ici, on croit que [VALEUR 1].
Parce qu'on sait que [VALEUR 2].
Parce qu'on veut [VISION].

🎯 Ta mission :
→ [Responsabilité 1]
→ [Responsabilité 2]
→ [Responsabilité 3]

💪 Ce qu'on recherche :
→ [Compétence 1]
→ [Compétence 2]
→ [Soft skill important]

🎁 Ce qu'on offre :
→ [Avantage 1]
→ [Avantage 2]
→ [Avantage 3]

📍 [Lieu] | 💼 [Type de contrat] | 💰 [Fourchette salaire]

Intéressé(e) ? Envoie-moi un message ou postule directement (lien en commentaire).

Tag quelqu'un qui pourrait être intéressé ! 👇`,
    sector: "rh",
    type: "announcement",
    popularity: 89,
    uses: 1567,
    tags: ["recrutement", "emploi", "carrière"]
  },
  {
    id: "rh-2",
    title: "Culture d'entreprise",
    description: "Mettez en avant votre culture d'entreprise",
    content: `🏢 Ce qui rend [ENTREPRISE] unique :

Hier, [ANECDOTE ou ÉVÉNEMENT].

Ça m'a rappelé pourquoi j'aime travailler ici.

Voici 5 choses qu'on fait différemment :

1️⃣ [PRATIQUE 1]
   → Résultat : [IMPACT]

2️⃣ [PRATIQUE 2]
   → Résultat : [IMPACT]

3️⃣ [PRATIQUE 3]
   → Résultat : [IMPACT]

4️⃣ [PRATIQUE 4]
   → Résultat : [IMPACT]

5️⃣ [PRATIQUE 5]
   → Résultat : [IMPACT]

Le secret ? [PHILOSOPHIE ou VALEUR]

Qu'est-ce qui rend votre entreprise unique ?`,
    sector: "rh",
    type: "story",
    popularity: 86,
    uses: 1234,
    tags: ["culture", "entreprise", "valeurs"]
  },
  {
    id: "rh-3",
    title: "Conseil carrière",
    description: "Partagez vos conseils de carrière",
    content: `📈 De [POSTE DÉPART] à [POSTE ACTUEL] en [X] ans :

Voici les [X] décisions qui ont tout changé :

🔑 Décision 1 : [DÉCISION]
→ Ce que j'ai appris : [LEÇON]

🔑 Décision 2 : [DÉCISION]
→ Ce que j'ai appris : [LEÇON]

🔑 Décision 3 : [DÉCISION]
→ Ce que j'ai appris : [LEÇON]

🔑 Décision 4 : [DÉCISION]
→ Ce que j'ai appris : [LEÇON]

Ce que je ferais différemment : [REGRET ou AMÉLIORATION]

Mon conseil pour ceux qui débutent : [CONSEIL]

Quelle a été votre décision de carrière la plus importante ?`,
    sector: "rh",
    type: "tips",
    popularity: 93,
    uses: 1890,
    tags: ["carrière", "évolution", "conseils"]
  },
  // MARKETING
  {
    id: "marketing-1",
    title: "Étude de cas",
    description: "Présentez une étude de cas marketing réussie",
    content: `📈 Comment [ENTREPRISE/CLIENT] a multiplié par [X] son [MÉTRIQUE] :

🎯 Le défi :
[Description du problème initial]

💡 La stratégie :

Phase 1 : [ACTION]
→ Résultat : [MÉTRIQUE]

Phase 2 : [ACTION]
→ Résultat : [MÉTRIQUE]

Phase 3 : [ACTION]
→ Résultat : [MÉTRIQUE]

📊 Les résultats en [X] mois :
• [Métrique 1] : +[X]%
• [Métrique 2] : +[X]%
• [Métrique 3] : +[X]%

🔑 La clé du succès : [INSIGHT PRINCIPAL]

Ce qu'on ferait différemment : [AMÉLIORATION]

Vous voulez les détails de la stratégie ? Commentez "CASE" 👇`,
    sector: "marketing",
    type: "analysis",
    popularity: 90,
    uses: 1456,
    tags: ["étude de cas", "résultats", "stratégie"]
  },
  {
    id: "marketing-2",
    title: "Tendances marketing",
    description: "Partagez les dernières tendances marketing",
    content: `🔥 [X] tendances marketing à adopter MAINTENANT :

J'ai analysé [X] campagnes et voici ce qui fonctionne :

1️⃣ [TENDANCE 1]
   📊 Stat : [DONNÉE]
   💡 Comment l'appliquer : [CONSEIL]

2️⃣ [TENDANCE 2]
   📊 Stat : [DONNÉE]
   💡 Comment l'appliquer : [CONSEIL]

3️⃣ [TENDANCE 3]
   📊 Stat : [DONNÉE]
   💡 Comment l'appliquer : [CONSEIL]

4️⃣ [TENDANCE 4]
   📊 Stat : [DONNÉE]
   💡 Comment l'appliquer : [CONSEIL]

5️⃣ [TENDANCE 5]
   📊 Stat : [DONNÉE]
   💡 Comment l'appliquer : [CONSEIL]

⚠️ La tendance à éviter : [TENDANCE DÉPASSÉE]

Laquelle allez-vous tester en premier ?`,
    sector: "marketing",
    type: "tips",
    popularity: 87,
    uses: 1678,
    tags: ["tendances", "stratégie", "digital"]
  },
  {
    id: "marketing-3",
    title: "Stratégie contenu",
    description: "Partagez votre stratégie de contenu",
    content: `📝 Ma stratégie de contenu qui génère [X] leads/mois :

Pendant [X] mois, j'ai testé [X] approches différentes.

Voici ce qui fonctionne vraiment :

📅 Fréquence : [X] posts/semaine
⏰ Meilleurs horaires : [HORAIRES]
📊 Format gagnant : [FORMAT]

🎯 Ma formule de post viral :

Hook (1ère ligne) : [TECHNIQUE]
Corps : [STRUCTURE]
CTA : [TYPE DE CTA]

📈 Résultats sur [PÉRIODE] :
• Impressions : [NOMBRE]
• Engagement : [TAUX]%
• Leads générés : [NOMBRE]
• CA attribué : [MONTANT]€

🔑 Le secret : [INSIGHT]

Vous voulez mon calendrier éditorial ? Commentez "CALENDRIER" 👇`,
    sector: "marketing",
    type: "tips",
    popularity: 96,
    uses: 2567,
    tags: ["contenu", "stratégie", "leads"]
  }
];

const SECTORS = [
  { id: "all", label: "Tous", icon: Sparkles },
  { id: "tech", label: "Tech", icon: Code },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "rh", label: "RH", icon: Users },
  { id: "marketing", label: "Marketing", icon: Megaphone }
];

const TYPES = [
  { id: "all", label: "Tous types" },
  { id: "story", label: "Histoire" },
  { id: "tips", label: "Conseils" },
  { id: "announcement", label: "Annonce" },
  { id: "analysis", label: "Analyse" },
  { id: "question", label: "Question" }
];

export function SectorTemplates() {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSector = selectedSector === "all" || template.sector === selectedSector;
    const matchesType = selectedType === "all" || template.type === selectedType;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSector && matchesType && matchesSearch;
  });

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success("Template copié ! Personnalisez-le avant de publier.");
  };

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case "tech": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "finance": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "rh": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "marketing": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default: return "";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "story": return <FileText className="w-3 h-3" />;
      case "tips": return <Lightbulb className="w-3 h-3" />;
      case "announcement": return <Megaphone className="w-3 h-3" />;
      case "analysis": return <TrendingUp className="w-3 h-3" />;
      case "question": return <MessageSquare className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Templates par secteur</h2>
          <p className="text-muted-foreground">
            Modèles de posts prêts à l'emploi adaptés à votre domaine
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-64"
          />
        </div>
      </div>

      {/* Filtres par secteur */}
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          return (
            <Button
              key={sector.id}
              variant={selectedSector === sector.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSector(sector.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {sector.label}
            </Button>
          );
        })}
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <Badge
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(type.id)}
          >
            {type.label}
          </Badge>
        ))}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{TEMPLATES.length}</p>
            <p className="text-xs text-muted-foreground">Templates disponibles</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">4</p>
            <p className="text-xs text-muted-foreground">Secteurs couverts</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {TEMPLATES.reduce((acc, t) => acc + t.uses, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Utilisations totales</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {Math.round(TEMPLATES.reduce((acc, t) => acc + t.popularity, 0) / TEMPLATES.length)}%
            </p>
            <p className="text-xs text-muted-foreground">Score moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des templates */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSectorColor(template.sector)}>
                          {template.sector.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {getTypeIcon(template.type)}
                          {template.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {template.popularity}%
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {template.uses.toLocaleString()} utilisations
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button
                        onClick={() => copyTemplate(template)}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copier
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setExpandedTemplate(
                          expandedTemplate === template.id ? null : template.id
                        )}
                      >
                        {expandedTemplate === template.id ? "Masquer" : "Aperçu"}
                      </Button>
                    </div>
                  </div>

                  {/* Aperçu du template */}
                  <AnimatePresence>
                    {expandedTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border/30"
                      >
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <p className="text-sm font-medium mb-2 text-muted-foreground">
                            Aperçu du template :
                          </p>
                          <pre className="whitespace-pre-wrap text-sm font-sans">
                            {template.content}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Aucun template trouvé pour ces critères.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedSector("all");
                  setSelectedType("all");
                  setSearchQuery("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SectorTemplates;
