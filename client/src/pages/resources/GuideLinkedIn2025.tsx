import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Calendar,
  User,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Users,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export default function GuideLinkedIn2025() {
  const tableOfContents = [
    { id: "introduction", title: "Introduction" },
    { id: "algorithme", title: "Comprendre l'algorithme LinkedIn 2025" },
    { id: "profil", title: "Optimiser votre profil" },
    { id: "contenu", title: "Créer du contenu qui engage" },
    { id: "frequence", title: "Fréquence et timing de publication" },
    { id: "engagement", title: "Stratégies d'engagement" },
    { id: "analytics", title: "Analyser vos performances" },
    { id: "conclusion", title: "Conclusion" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 border-b border-white/5">
        <div className="container">
          <Link href="/resources">
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux ressources
            </Button>
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet/20 text-violet-light">
                Guide complet
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 min de lecture
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="w-4 h-4" />
                12.5K vues
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Le guide ultime pour{" "}
              <span className="gradient-text">exploser sur LinkedIn en 2025</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Découvrez les stratégies des top créateurs pour atteindre 100K abonnés,
              générer des leads qualifiés et devenir une référence dans votre domaine.
            </p>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-white font-bold">
                  YK
                </div>
                <div>
                  <p className="font-medium text-white">Youssef Koutari</p>
                  <p className="text-sm text-muted-foreground">Expert LinkedIn & Personal Branding</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Mis à jour le 20 Dec 2024
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button variant="outline" size="sm" className="border-white/20">
                <Bookmark className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">
            {/* Main Content */}
            <article className="prose prose-invert prose-lg max-w-none">
              <section id="introduction" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Star className="w-8 h-8 text-gold" />
                  Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  LinkedIn est devenu le réseau social professionnel incontournable avec plus de 
                  <strong className="text-white"> 1 milliard d'utilisateurs</strong> dans le monde. 
                  En 2025, la plateforme offre des opportunités sans précédent pour les créateurs 
                  de contenu, les entrepreneurs et les professionnels qui souhaitent développer 
                  leur personal branding.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ce guide complet vous révèle les stratégies utilisées par les top créateurs 
                  pour construire une audience engagée, générer des leads qualifiés et transformer 
                  LinkedIn en véritable machine à opportunités.
                </p>
                <div className="bg-card/50 border border-white/10 rounded-2xl p-6 my-8">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-gold" />
                    Ce que vous allez apprendre
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Comment fonctionne l'algorithme LinkedIn en 2025
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Les secrets d'un profil optimisé qui convertit
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Les formats de contenu qui génèrent le plus d'engagement
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Les meilleurs moments pour publier
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Comment analyser et améliorer vos performances
                    </li>
                  </ul>
                </div>
              </section>

              <section id="algorithme" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-violet-light" />
                  Comprendre l'algorithme LinkedIn 2025
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  L'algorithme LinkedIn a considérablement évolué en 2025. Voici les principaux 
                  facteurs qui influencent la visibilité de vos publications :
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 my-8">
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-violet-light" />
                      Engagement précoce
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Les 60 premières minutes sont cruciales. Plus votre post reçoit 
                      d'interactions rapidement, plus il sera diffusé.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5 text-gold" />
                      Qualité des connexions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      LinkedIn privilégie les interactions avec des personnes de votre 
                      réseau proche et de votre secteur d'activité.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-rose" />
                      Temps de lecture
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Le "dwell time" (temps passé sur votre post) est un signal fort 
                      de qualité pour l'algorithme.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      Régularité
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Publier régulièrement (3-5 fois par semaine) améliore votre 
                      visibilité globale sur la plateforme.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet/20 to-rose/20 border border-violet/30 rounded-2xl p-6 my-8">
                  <h4 className="text-white font-semibold mb-2">💡 Conseil Pro</h4>
                  <p className="text-muted-foreground">
                    En 2025, LinkedIn favorise les contenus "natifs" - évitez les liens externes 
                    dans vos posts principaux. Préférez ajouter le lien en commentaire.
                  </p>
                </div>
              </section>

              <section id="profil" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <User className="w-8 h-8 text-gold" />
                  Optimiser votre profil
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Votre profil LinkedIn est votre vitrine professionnelle. Voici les éléments 
                  clés à optimiser pour maximiser votre impact :
                </p>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Photo de profil professionnelle</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Utilisez une photo récente, de haute qualité, avec un fond neutre. 
                  Votre visage doit occuper 60-70% du cadre. Un sourire authentique 
                  augmente le taux de connexion de 40%.
                </p>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Bannière personnalisée</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Créez une bannière qui communique votre proposition de valeur. 
                  Incluez votre slogan, vos services ou un appel à l'action clair.
                </p>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. Titre accrocheur</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Oubliez les titres génériques comme "CEO chez X". Utilisez une formule 
                  qui met en avant votre valeur ajoutée :
                </p>
                <div className="bg-card/50 border border-white/10 rounded-xl p-4 my-4">
                  <p className="text-white font-mono text-sm">
                    "J'aide [cible] à [résultat] grâce à [méthode/expertise]"
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">4. Section "À propos" optimisée</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Structurez votre résumé en 3 parties : votre histoire (hook), 
                  votre expertise (preuves), et un appel à l'action clair.
                </p>
              </section>

              <section id="contenu" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-rose" />
                  Créer du contenu qui engage
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Le contenu est roi sur LinkedIn. Voici les formats qui performent le mieux en 2025 :
                </p>

                <div className="space-y-4 my-8">
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">📖 Storytelling personnel</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Engagement élevé
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Partagez vos échecs, vos apprentissages et vos victoires. 
                      L'authenticité crée la connexion émotionnelle.
                    </p>
                  </div>

                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">💡 Posts éducatifs</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Partages élevés
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Partagez votre expertise sous forme de listes, frameworks ou 
                      tutoriels. Apportez de la valeur actionnable.
                    </p>
                  </div>

                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">🎯 Carrousels</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-violet/20 text-violet-light">
                        Dwell time élevé
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Format idéal pour les guides étape par étape. 
                      Limitez-vous à 8-12 slides avec un design épuré.
                    </p>
                  </div>

                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">🎬 Vidéos natives</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">
                        Reach élevé
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Les vidéos courtes (30s-2min) avec sous-titres performent 
                      exceptionnellement bien. Privilégiez le format vertical.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">L'art du hook</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Les 3 premières lignes de votre post sont cruciales. Elles doivent 
                  captiver l'attention et inciter à cliquer sur "voir plus".
                </p>
                <div className="bg-card/50 border border-white/10 rounded-xl p-4 my-4">
                  <p className="text-white mb-2 font-medium">Exemples de hooks efficaces :</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• "J'ai perdu 50K€ en 3 mois. Voici ce que j'aurais aimé savoir."</li>
                    <li>• "97% des créateurs LinkedIn font cette erreur."</li>
                    <li>• "En 2024, j'ai généré 200K€ grâce à LinkedIn. Ma méthode :"</li>
                  </ul>
                </div>
              </section>

              <section id="frequence" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-500" />
                  Fréquence et timing de publication
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  La régularité est essentielle pour construire une audience sur LinkedIn. 
                  Voici les recommandations basées sur l'analyse de milliers de créateurs :
                </p>

                <div className="bg-card/50 border border-white/10 rounded-2xl p-6 my-8">
                  <h4 className="text-white font-semibold mb-4">📅 Fréquence recommandée</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-3xl font-bold text-violet-light">3-5x</p>
                      <p className="text-sm text-muted-foreground">par semaine</p>
                      <p className="text-xs text-muted-foreground mt-1">Idéal pour la croissance</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-3xl font-bold text-gold">1x</p>
                      <p className="text-sm text-muted-foreground">par jour</p>
                      <p className="text-xs text-muted-foreground mt-1">Pour les créateurs avancés</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <p className="text-3xl font-bold text-rose">2x</p>
                      <p className="text-sm text-muted-foreground">minimum</p>
                      <p className="text-xs text-muted-foreground mt-1">Pour maintenir la visibilité</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">⏰ Meilleurs moments pour publier</h3>
                <div className="bg-card/50 border border-white/10 rounded-xl p-5 my-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white font-medium mb-2">🌅 Matin (7h30 - 8h30)</p>
                      <p className="text-sm text-muted-foreground">
                        Les professionnels consultent LinkedIn avant de commencer leur journée.
                      </p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-2">🌆 Fin de journée (17h30 - 18h30)</p>
                      <p className="text-sm text-muted-foreground">
                        Pic d'activité pendant le trajet retour ou la pause.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-white">Jours les plus performants :</strong> Mardi, Mercredi, Jeudi
                    </p>
                  </div>
                </div>
              </section>

              <section id="engagement" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-violet-light" />
                  Stratégies d'engagement
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  L'engagement est la clé de la croissance sur LinkedIn. Voici comment 
                  maximiser les interactions sur vos publications :
                </p>

                <div className="space-y-4 my-8">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-violet/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Répondez à TOUS les commentaires</h4>
                      <p className="text-sm text-muted-foreground">
                        Dans l'heure qui suit la publication si possible. Chaque réponse 
                        booste la visibilité de votre post.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Commentez chez les autres</h4>
                      <p className="text-sm text-muted-foreground">
                        Passez 15-30 min par jour à commenter des posts de votre niche. 
                        Des commentaires pertinents de 3-4 lignes minimum.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Posez des questions</h4>
                      <p className="text-sm text-muted-foreground">
                        Terminez vos posts par une question ouverte pour encourager 
                        les commentaires et le débat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">4</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Créez une communauté</h4>
                      <p className="text-sm text-muted-foreground">
                        Identifiez vos "super fans" et interagissez régulièrement avec eux. 
                        Ils deviendront vos ambassadeurs.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="analytics" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-gold" />
                  Analyser vos performances
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Pour progresser, vous devez mesurer. Voici les métriques clés à suivre :
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-8">
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2">📈 Impressions</h4>
                    <p className="text-sm text-muted-foreground">
                      Nombre de fois où votre contenu a été affiché. 
                      Indicateur de votre portée globale.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2">💬 Taux d'engagement</h4>
                    <p className="text-sm text-muted-foreground">
                      (Likes + Commentaires + Partages) / Impressions. 
                      Visez un taux supérieur à 2%.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2">👥 Croissance des abonnés</h4>
                    <p className="text-sm text-muted-foreground">
                      Suivez votre croissance hebdomadaire. 
                      Un bon rythme : +100-500 abonnés/semaine.
                    </p>
                  </div>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-semibold mb-2">🎯 Visites de profil</h4>
                    <p className="text-sm text-muted-foreground">
                      Indicateur de l'intérêt généré par votre contenu. 
                      Plus de visites = plus d'opportunités.
                    </p>
                  </div>
                </div>
              </section>

              <section id="conclusion" className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-rose" />
                  Conclusion
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Réussir sur LinkedIn en 2025 demande de la stratégie, de la régularité 
                  et de l'authenticité. Les créateurs qui dominent la plateforme sont ceux 
                  qui apportent constamment de la valeur à leur audience.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Commencez par optimiser votre profil, puis publiez régulièrement du contenu 
                  de qualité. Engagez-vous avec votre communauté et analysez vos résultats 
                  pour vous améliorer continuellement.
                </p>

                <div className="bg-gradient-to-r from-violet/20 to-rose/20 border border-violet/30 rounded-2xl p-8 my-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Prêt à passer à l'action ?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Utilisez LinkedRank pour automatiser votre création de contenu 
                    et publier comme un pro.
                  </p>
                  <Link href="/generator">
                    <Button className="bg-gradient-to-r from-violet to-violet-light hover:opacity-90">
                      Essayer le générateur IA
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="bg-card/50 border border-white/10 rounded-2xl p-6 mb-6">
                  <h4 className="text-white font-semibold mb-4">Table des matières</h4>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-muted-foreground hover:text-violet-light transition-colors py-1"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="bg-gradient-to-br from-violet/20 to-rose/20 border border-violet/30 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-2">📧 Newsletter</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recevez nos meilleurs conseils LinkedIn chaque semaine.
                  </p>
                  <Button className="w-full bg-violet hover:bg-violet-light">
                    S'inscrire
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 border-t border-white/5">
        <div className="container">
          <h2 className="text-2xl font-bold text-white mb-8">Articles similaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/resources/hooks-linkedin">
              <div className="group p-6 rounded-2xl border border-white/10 bg-card/50 hover:border-violet/30 transition-all cursor-pointer">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold">
                  Tips
                </span>
                <h3 className="font-semibold text-white mt-4 mb-2 group-hover:text-violet-light transition-colors">
                  Comment écrire un hook qui capte l'attention
                </h3>
                <p className="text-sm text-muted-foreground">
                  Les techniques des meilleurs copywriters pour créer des accroches irrésistibles.
                </p>
              </div>
            </Link>
            <Link href="/resources/algorithme-linkedin">
              <div className="group p-6 rounded-2xl border border-white/10 bg-card/50 hover:border-violet/30 transition-all cursor-pointer">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  News
                </span>
                <h3 className="font-semibold text-white mt-4 mb-2 group-hover:text-violet-light transition-colors">
                  L'algorithme LinkedIn 2025 : ce qui change
                </h3>
                <p className="text-sm text-muted-foreground">
                  Décryptage des dernières évolutions et comment adapter votre stratégie.
                </p>
              </div>
            </Link>
            <Link href="/resources/formats-posts">
              <div className="group p-6 rounded-2xl border border-white/10 bg-card/50 hover:border-violet/30 transition-all cursor-pointer">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet/20 text-violet-light">
                  Guide
                </span>
                <h3 className="font-semibold text-white mt-4 mb-2 group-hover:text-violet-light transition-colors">
                  Les 10 formats de posts les plus engageants
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyse de 10 000 posts pour identifier les formats qui performent.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
