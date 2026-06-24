import { Link } from "wouter";
import { ArrowLeft, BookOpen, UserX, AlertCircle, Shield, Zap } from "lucide-react";

export default function CGU() {
  return (
    <div className="min-h-screen bg-background">
      
      <div className="container py-12 max-w-4xl">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-violet/20">
              <BookOpen className="w-6 h-6 text-violet-light" />
            </div>
            <h1 className="text-3xl font-bold text-white">Conditions Générales d'Utilisation</h1>
          </div>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Préambule */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Préambule</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'accès et l'utilisation 
                de la plateforme LinkedRank (ci-après "la Plateforme") par tout utilisateur (ci-après "l'Utilisateur").
              </p>
              <p>
                L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
            </div>
          </section>

          {/* Article 1 - Définitions */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 1 - Définitions</h2>
            <div className="space-y-4 text-muted-foreground">
              <ul className="space-y-3">
                <li><strong className="text-white">Plateforme :</strong> Le site web LinkedRank et l'ensemble de ses fonctionnalités</li>
                <li><strong className="text-white">Utilisateur :</strong> Toute personne accédant à la Plateforme, qu'elle soit inscrite ou non</li>
                <li><strong className="text-white">Compte :</strong> Espace personnel créé par l'Utilisateur après inscription</li>
                <li><strong className="text-white">Services :</strong> L'ensemble des fonctionnalités proposées par la Plateforme</li>
                <li><strong className="text-white">Contenu :</strong> Tout texte, image, vidéo ou autre élément publié sur la Plateforme</li>
                <li><strong className="text-white">Contenu Généré :</strong> Contenu créé par l'intelligence artificielle à la demande de l'Utilisateur</li>
              </ul>
            </div>
          </section>

          {/* Article 2 - Description des services */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">Article 2 - Description des services</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>LinkedRank propose les services suivants :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Génération de contenu IA :</strong> Création de posts LinkedIn personnalisés grâce à l'intelligence artificielle</li>
                <li><strong className="text-white">Publication automatique :</strong> Planification et publication automatique sur LinkedIn</li>
                <li><strong className="text-white">Génération d'images :</strong> Création d'images et visuels pour accompagner les publications</li>
                <li><strong className="text-white">Classements :</strong> Accès aux classements des influenceurs LinkedIn par pays et secteur</li>
                <li><strong className="text-white">Analytics :</strong> Statistiques et analyses de performance</li>
                <li><strong className="text-white">Templates :</strong> Bibliothèque de modèles de posts</li>
              </ul>
              <p className="mt-4">
                Les fonctionnalités disponibles varient selon le plan d'abonnement choisi.
              </p>
            </div>
          </section>

          {/* Article 3 - Inscription */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 3 - Inscription et compte</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">3.1 Conditions d'inscription</strong></p>
              <p>
                L'inscription est ouverte à toute personne physique majeure ou personne morale. 
                L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.
              </p>

              <p><strong className="text-white">3.2 Authentification</strong></p>
              <p>
                L'inscription s'effectue via un système d'authentification sécurisé. L'Utilisateur peut 
                également connecter son compte LinkedIn pour bénéficier des fonctionnalités de publication.
              </p>

              <p><strong className="text-white">3.3 Sécurité du compte</strong></p>
              <p>
                L'Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les 
                activités effectuées depuis son compte. En cas de suspicion d'utilisation frauduleuse, 
                l'Utilisateur doit immédiatement nous contacter.
              </p>

              <p><strong className="text-white">3.4 Un compte par personne</strong></p>
              <p>
                Chaque Utilisateur ne peut détenir qu'un seul compte, sauf autorisation expresse 
                pour les comptes professionnels multi-utilisateurs.
              </p>
            </div>
          </section>

          {/* Article 4 - Utilisation des services */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 4 - Utilisation des services</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">4.1 Utilisation conforme</strong></p>
              <p>
                L'Utilisateur s'engage à utiliser la Plateforme conformément à sa destination et aux 
                présentes CGU. L'utilisation doit respecter les lois et réglementations en vigueur.
              </p>

              <p><strong className="text-white">4.2 Connexion LinkedIn</strong></p>
              <p>
                Pour utiliser les fonctionnalités de publication, l'Utilisateur doit connecter son compte 
                LinkedIn. Cette connexion est effectuée via l'API officielle LinkedIn (OAuth 2.0). 
                L'Utilisateur autorise LinkedRank à publier du contenu en son nom.
              </p>

              <p><strong className="text-white">4.3 Contenu généré par IA</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Le contenu généré est créé par intelligence artificielle et peut nécessiter une relecture</li>
                <li>L'Utilisateur est responsable du contenu qu'il publie sur LinkedIn</li>
                <li>L'Utilisateur doit vérifier l'exactitude des informations avant publication</li>
                <li>Le contenu généré devient la propriété de l'Utilisateur</li>
              </ul>

              <p><strong className="text-white">4.4 Limites d'utilisation</strong></p>
              <p>
                Chaque plan d'abonnement comporte des limites d'utilisation (nombre de générations, 
                publications, etc.). Ces limites sont réinitialisées chaque mois.
              </p>
            </div>
          </section>

          {/* Article 5 - Comportements interdits */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-semibold text-white m-0">Article 5 - Comportements interdits</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Il est strictement interdit de :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Utiliser la Plateforme à des fins illégales ou frauduleuses</li>
                <li>Publier du contenu diffamatoire, injurieux, discriminatoire ou haineux</li>
                <li>Usurper l'identité d'un tiers</li>
                <li>Publier du contenu portant atteinte aux droits de propriété intellectuelle</li>
                <li>Tenter de contourner les mesures de sécurité de la Plateforme</li>
                <li>Utiliser des robots, scrapers ou outils automatisés non autorisés</li>
                <li>Revendre ou redistribuer les services sans autorisation</li>
                <li>Spammer ou envoyer des communications non sollicitées via la Plateforme</li>
                <li>Manipuler artificiellement les classements ou statistiques</li>
                <li>Violer les conditions d'utilisation de LinkedIn</li>
              </ul>
            </div>
          </section>

          {/* Article 6 - Contenu utilisateur */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 6 - Contenu et propriété intellectuelle</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">6.1 Contenu de l'Utilisateur</strong></p>
              <p>
                L'Utilisateur conserve tous les droits sur le contenu qu'il fournit à la Plateforme 
                (profil, préférences, contexte). Il accorde à LinkedRank une licence limitée pour 
                utiliser ce contenu dans le cadre de la fourniture des services.
              </p>

              <p><strong className="text-white">6.2 Contenu généré</strong></p>
              <p>
                Le contenu généré par l'IA est cédé en pleine propriété à l'Utilisateur. 
                L'Utilisateur peut l'utiliser, le modifier et le publier librement.
              </p>

              <p><strong className="text-white">6.3 Propriété de la Plateforme</strong></p>
              <p>
                La Plateforme, son code, son design, ses algorithmes et sa documentation sont la propriété 
                exclusive de LinkedRank. Toute reproduction non autorisée est interdite.
              </p>
            </div>
          </section>

          {/* Article 7 - Disponibilité */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 7 - Disponibilité et maintenance</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">7.1 Disponibilité</strong></p>
              <p>
                LinkedRank s'efforce d'assurer une disponibilité optimale de la Plateforme (objectif 99,5%). 
                Toutefois, des interruptions peuvent survenir pour maintenance ou en cas de force majeure.
              </p>

              <p><strong className="text-white">7.2 Maintenance</strong></p>
              <p>
                Des opérations de maintenance peuvent être effectuées. Les maintenances planifiées seront 
                communiquées à l'avance lorsque possible.
              </p>

              <p><strong className="text-white">7.3 Dépendance à LinkedIn</strong></p>
              <p>
                Certaines fonctionnalités dépendent de l'API LinkedIn. LinkedRank ne peut garantir leur 
                disponibilité en cas de modification ou d'indisponibilité de l'API LinkedIn.
              </p>
            </div>
          </section>

          {/* Article 8 - Responsabilité */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold text-white m-0">Article 8 - Limitation de responsabilité</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">8.1 Contenu généré par IA</strong></p>
              <p>
                Le contenu généré par l'IA est fourni "tel quel". LinkedRank ne garantit pas son exactitude, 
                sa pertinence ou son adéquation à un usage particulier. L'Utilisateur est seul responsable 
                de la vérification et de la publication du contenu.
              </p>

              <p><strong className="text-white">8.2 Utilisation de LinkedIn</strong></p>
              <p>
                LinkedRank n'est pas affilié à LinkedIn. L'Utilisateur reste responsable du respect des 
                conditions d'utilisation de LinkedIn. LinkedRank ne peut être tenu responsable des 
                sanctions appliquées par LinkedIn.
              </p>

              <p><strong className="text-white">8.3 Exclusion de responsabilité</strong></p>
              <p>LinkedRank ne saurait être tenu responsable :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Des dommages indirects (perte de revenus, préjudice d'image, etc.)</li>
                <li>Des interruptions dues à des tiers</li>
                <li>De l'utilisation faite du contenu généré</li>
                <li>Des modifications des API tierces</li>
              </ul>
            </div>
          </section>

          {/* Article 9 - Données personnelles */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">Article 9 - Protection des données</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Le traitement des données personnelles est régi par notre{" "}
                <Link href="/legal/confidentialite" className="text-violet-light hover:underline">
                  Politique de Confidentialité
                </Link>
                , qui fait partie intégrante des présentes CGU.
              </p>
              <p>
                En utilisant la Plateforme, l'Utilisateur consent au traitement de ses données 
                conformément à cette politique.
              </p>
            </div>
          </section>

          {/* Article 10 - Suspension et résiliation */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 10 - Suspension et résiliation</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">10.1 Suspension par LinkedRank</strong></p>
              <p>
                LinkedRank se réserve le droit de suspendre ou de résilier le compte d'un Utilisateur 
                en cas de violation des présentes CGU, sans préavis ni indemnité.
              </p>

              <p><strong className="text-white">10.2 Suppression par l'Utilisateur</strong></p>
              <p>
                L'Utilisateur peut demander la suppression de son compte à tout moment. Cette demande 
                entraîne la suppression des données personnelles conformément à notre politique de 
                confidentialité.
              </p>

              <p><strong className="text-white">10.3 Effets de la résiliation</strong></p>
              <p>
                La résiliation entraîne la perte d'accès aux services et aux données associées au compte, 
                sous réserve des obligations légales de conservation.
              </p>
            </div>
          </section>

          {/* Article 11 - Modifications */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 11 - Modifications des CGU</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                LinkedRank se réserve le droit de modifier les présentes CGU à tout moment. 
                Les modifications seront notifiées aux Utilisateurs par email ou via la Plateforme.
              </p>
              <p>
                La poursuite de l'utilisation de la Plateforme après notification vaut acceptation 
                des nouvelles conditions.
              </p>
            </div>
          </section>

          {/* Article 12 - Droit applicable */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 12 - Droit applicable et litiges</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, les parties 
                s'engagent à rechercher une solution amiable avant toute action judiciaire.
              </p>
              <p>
                À défaut d'accord amiable, les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Article 13 - Contact */}
          <section className="p-6 rounded-2xl border border-violet/30 bg-violet/10">
            <h2 className="text-xl font-semibold text-white mb-4">Article 13 - Contact</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Pour toute question concernant ces CGU :</p>
              <p><strong className="text-white">Email :</strong> contact@linkedrank.fr</p>
              <p><strong className="text-white">Objet :</strong> [CGU] Votre question</p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/legal/mentions-legales" className="hover:text-violet-light transition-colors">
              Mentions Légales
            </Link>
            <span>•</span>
            <Link href="/legal/cgv" className="hover:text-violet-light transition-colors">
              Conditions Générales de Vente
            </Link>
            <span>•</span>
            <Link href="/legal/confidentialite" className="hover:text-violet-light transition-colors">
              Politique de Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
