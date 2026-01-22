import Navbar from "@/components/Navbar";
import { Link } from "wouter";
import { ArrowLeft, FileText, CreditCard, RefreshCcw, AlertTriangle, CheckCircle } from "lucide-react";

export default function CGV() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
              <FileText className="w-6 h-6 text-violet-light" />
            </div>
            <h1 className="text-3xl font-bold text-white">Conditions Générales de Vente</h1>
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
                Les présentes Conditions Générales de Vente (ci-après "CGV") régissent les relations contractuelles 
                entre LinkedRank (ci-après "le Prestataire") et toute personne physique ou morale souhaitant 
                souscrire à un abonnement aux services proposés sur la plateforme (ci-après "le Client").
              </p>
              <p>
                Toute souscription à un abonnement implique l'acceptation sans réserve des présentes CGV.
              </p>
            </div>
          </section>

          {/* Article 1 - Objet */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 1 - Objet</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Les présentes CGV ont pour objet de définir les conditions dans lesquelles le Prestataire 
                fournit au Client les services suivants :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Génération de contenu LinkedIn par intelligence artificielle</li>
                <li>Publication automatique sur LinkedIn</li>
                <li>Génération d'images pour les publications</li>
                <li>Accès aux classements d'influenceurs LinkedIn</li>
                <li>Analytics et statistiques de performance</li>
                <li>Outils de planification de contenu</li>
              </ul>
            </div>
          </section>

          {/* Article 2 - Offres et tarifs */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">Article 2 - Offres et tarifs</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">2.1 Plans disponibles</strong></p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-white">Plan</th>
                      <th className="text-left py-2 text-white">Prix mensuel</th>
                      <th className="text-left py-2 text-white">Prix annuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Starter</td>
                      <td className="py-2">Gratuit</td>
                      <td className="py-2">Gratuit</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Pro</td>
                      <td className="py-2">29€ HT/mois</td>
                      <td className="py-2">19€ HT/mois (228€/an)</td>
                    </tr>
                    <tr>
                      <td className="py-2">Business</td>
                      <td className="py-2">79€ HT/mois</td>
                      <td className="py-2">59€ HT/mois (708€/an)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mt-4"><strong className="text-white">2.2 TVA</strong></p>
              <p>
                Les prix indiqués sont hors taxes (HT). La TVA applicable sera ajoutée au moment du paiement 
                selon le taux en vigueur (20% pour la France).
              </p>

              <p><strong className="text-white">2.3 Modification des tarifs</strong></p>
              <p>
                Le Prestataire se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs 
                s'appliqueront aux nouvelles souscriptions et aux renouvellements. Le Client sera informé 
                de toute modification au moins 30 jours avant son application.
              </p>
            </div>
          </section>

          {/* Article 3 - Souscription */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 3 - Souscription et paiement</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">3.1 Processus de souscription</strong></p>
              <p>
                La souscription s'effectue en ligne sur la plateforme LinkedRank. Le Client doit créer un compte, 
                choisir son plan d'abonnement et procéder au paiement.
              </p>

              <p><strong className="text-white">3.2 Moyens de paiement</strong></p>
              <p>
                Les paiements sont effectués par carte bancaire via notre prestataire de paiement sécurisé Stripe. 
                Les cartes acceptées sont : Visa, Mastercard, American Express.
              </p>

              <p><strong className="text-white">3.3 Facturation</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Abonnement mensuel : facturation le même jour chaque mois</li>
                <li>Abonnement annuel : facturation en une fois pour l'année entière</li>
              </ul>
              <p>
                Une facture est automatiquement envoyée par email après chaque paiement.
              </p>

              <p><strong className="text-white">3.4 Période d'essai</strong></p>
              <p>
                Les plans Pro et Business bénéficient d'une période d'essai gratuite de 14 jours. 
                Aucune carte bancaire n'est requise pendant l'essai. À l'issue de cette période, 
                le Client peut choisir de souscrire à un abonnement payant ou de revenir au plan gratuit.
              </p>
            </div>
          </section>

          {/* Article 4 - Durée et renouvellement */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCcw className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">Article 4 - Durée et renouvellement</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">4.1 Durée</strong></p>
              <p>
                L'abonnement est souscrit pour une durée d'un mois (abonnement mensuel) ou d'un an (abonnement annuel) 
                à compter de la date de souscription.
              </p>

              <p><strong className="text-white">4.2 Renouvellement automatique</strong></p>
              <p>
                L'abonnement est renouvelé automatiquement à l'issue de chaque période, sauf résiliation par le Client 
                avant la date de renouvellement.
              </p>

              <p><strong className="text-white">4.3 Changement de plan</strong></p>
              <p>
                Le Client peut à tout moment passer à un plan supérieur (upgrade). Le changement prend effet immédiatement 
                et le montant est calculé au prorata. Le passage à un plan inférieur (downgrade) prend effet à la fin 
                de la période en cours.
              </p>
            </div>
          </section>

          {/* Article 5 - Résiliation */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 5 - Résiliation</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">5.1 Résiliation par le Client</strong></p>
              <p>
                Le Client peut résilier son abonnement à tout moment depuis son espace personnel. 
                La résiliation prend effet à la fin de la période d'abonnement en cours. 
                Aucun remboursement n'est effectué pour la période restante.
              </p>

              <p><strong className="text-white">5.2 Résiliation par le Prestataire</strong></p>
              <p>
                Le Prestataire se réserve le droit de résilier l'abonnement en cas de :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Non-paiement après mise en demeure</li>
                <li>Violation des Conditions Générales d'Utilisation</li>
                <li>Utilisation frauduleuse des services</li>
                <li>Atteinte aux droits de tiers</li>
              </ul>

              <p><strong className="text-white">5.3 Effets de la résiliation</strong></p>
              <p>
                À la résiliation, le Client perd l'accès aux fonctionnalités payantes mais conserve l'accès 
                au plan gratuit. Les données sont conservées pendant 30 jours, après quoi elles peuvent être supprimées.
              </p>
            </div>
          </section>

          {/* Article 6 - Droit de rétractation */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold text-white m-0">Article 6 - Droit de rétractation</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être 
                exercé pour les contrats de fourniture de contenu numérique non fourni sur un support matériel 
                dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès 
                à son droit de rétractation.
              </p>
              <p>
                En souscrivant à un abonnement et en commençant à utiliser les services, le Client reconnaît 
                expressément renoncer à son droit de rétractation.
              </p>
              <p className="p-4 rounded-xl bg-gold/10 border border-gold/30">
                <strong className="text-gold">Important :</strong> La période d'essai gratuite de 14 jours vous permet 
                de tester les services sans engagement. Nous vous recommandons de l'utiliser avant de souscrire 
                à un abonnement payant.
              </p>
            </div>
          </section>

          {/* Article 7 - Obligations */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 7 - Obligations des parties</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">7.1 Obligations du Prestataire</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fournir les services conformément aux descriptions des plans</li>
                <li>Assurer la disponibilité de la plateforme (objectif 99,5%)</li>
                <li>Protéger les données personnelles du Client</li>
                <li>Informer le Client de toute modification substantielle des services</li>
                <li>Fournir un support client réactif</li>
              </ul>

              <p className="mt-4"><strong className="text-white">7.2 Obligations du Client</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fournir des informations exactes lors de l'inscription</li>
                <li>Régler les sommes dues dans les délais</li>
                <li>Respecter les Conditions Générales d'Utilisation</li>
                <li>Ne pas utiliser les services à des fins illégales</li>
                <li>Maintenir la confidentialité de ses identifiants</li>
              </ul>
            </div>
          </section>

          {/* Article 8 - Responsabilité */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 8 - Limitation de responsabilité</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Le Prestataire s'engage à mettre en œuvre tous les moyens nécessaires pour assurer la qualité 
                et la continuité des services. Toutefois, sa responsabilité est limitée aux dommages directs 
                et prévisibles résultant d'un manquement à ses obligations.
              </p>
              <p>
                Le Prestataire ne saurait être tenu responsable :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Des interruptions de service dues à des tiers (LinkedIn, hébergeur, etc.)</li>
                <li>Des modifications des API LinkedIn affectant les fonctionnalités</li>
                <li>De l'utilisation faite par le Client du contenu généré</li>
                <li>Des dommages indirects (perte de chiffre d'affaires, préjudice d'image, etc.)</li>
              </ul>
              <p>
                En tout état de cause, la responsabilité du Prestataire est limitée au montant des sommes 
                versées par le Client au cours des 12 derniers mois.
              </p>
            </div>
          </section>

          {/* Article 9 - Propriété intellectuelle */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 9 - Propriété intellectuelle</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">9.1 Propriété du Prestataire</strong></p>
              <p>
                La plateforme, son code source, son design, ses algorithmes et sa documentation sont la propriété 
                exclusive du Prestataire et sont protégés par le droit de la propriété intellectuelle.
              </p>

              <p><strong className="text-white">9.2 Contenu généré</strong></p>
              <p>
                Le contenu généré par l'IA à la demande du Client lui est cédé en pleine propriété. 
                Le Client est libre de l'utiliser, le modifier et le publier sans restriction.
              </p>
            </div>
          </section>

          {/* Article 10 - Données personnelles */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 10 - Protection des données</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Le traitement des données personnelles est régi par notre{" "}
                <Link href="/legal/confidentialite" className="text-violet-light hover:underline">
                  Politique de Confidentialité
                </Link>
                , qui fait partie intégrante des présentes CGV.
              </p>
            </div>
          </section>

          {/* Article 11 - Réclamations */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 11 - Réclamations et médiation</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">11.1 Service client</strong></p>
              <p>
                Pour toute réclamation, le Client peut contacter le service client à l'adresse : contact@linkedrank.fr
              </p>

              <p><strong className="text-white">11.2 Médiation</strong></p>
              <p>
                Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu, 
                le Client consommateur peut recourir gratuitement au service de médiation. Le médiateur compétent est : 
                [Nom du médiateur à compléter].
              </p>
              <p>
                Le Client peut également utiliser la plateforme européenne de règlement en ligne des litiges : 
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-violet-light hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </section>

          {/* Article 12 - Droit applicable */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Article 12 - Droit applicable et juridiction</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Les présentes CGV sont régies par le droit français. En cas de litige, et après échec de toute 
                tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
              </p>
              <p>
                Pour les clients professionnels, le Tribunal de Commerce de [Ville à compléter] sera exclusivement compétent.
              </p>
            </div>
          </section>

          {/* Acceptation */}
          <section className="p-6 rounded-2xl border border-violet/30 bg-violet/10">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">Acceptation des CGV</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                En souscrivant à un abonnement LinkedRank, le Client déclare avoir pris connaissance des présentes 
                Conditions Générales de Vente et les accepter sans réserve.
              </p>
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
            <Link href="/legal/cgu" className="hover:text-violet-light transition-colors">
              Conditions Générales d'Utilisation
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
