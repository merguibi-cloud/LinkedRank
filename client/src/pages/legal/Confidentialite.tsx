import Navbar from "@/components/Navbar";
import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Lock, Eye, UserCheck, Globe, Clock } from "lucide-react";

export default function Confidentialite() {
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
              <Shield className="w-6 h-6 text-violet-light" />
            </div>
            <h1 className="text-3xl font-bold text-white">Politique de Confidentialité</h1>
          </div>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Introduction */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                LinkedRank (ci-après "nous", "notre" ou "la Plateforme") s'engage à protéger la vie privée de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos 
                données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                Informatique et Libertés.
              </p>
              <p>
                En utilisant notre plateforme, vous acceptez les pratiques décrites dans cette politique.
              </p>
            </div>
          </section>

          {/* Responsable du traitement */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">1. Responsable du traitement</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-white">Responsable :</strong> LinkedRank</p>
              <p><strong className="text-white">Email DPO :</strong> contact@linkedrank.fr</p>
              <p><strong className="text-white">Adresse :</strong> [Adresse à compléter]</p>
            </div>
          </section>

          {/* Données collectées */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">2. Données collectées</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Nous collectons les catégories de données suivantes :</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-white font-medium mb-2">Données d'identification</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Photo de profil (via LinkedIn)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-white font-medium mb-2">Données de connexion LinkedIn</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Token d'accès LinkedIn (chiffré)</li>
                    <li>Identifiant LinkedIn</li>
                    <li>URL du profil LinkedIn</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-white font-medium mb-2">Données d'utilisation</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Posts générés et publiés</li>
                    <li>Préférences de contenu</li>
                    <li>Historique d'utilisation</li>
                    <li>Paramètres de publication automatique</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-white font-medium mb-2">Données techniques</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Données de cookies</li>
                    <li>Logs de connexion</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-white font-medium mb-2">Données de paiement</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Informations de facturation (traitées par Stripe)</li>
                    <li>Historique des abonnements</li>
                  </ul>
                  <p className="text-sm mt-2 text-muted-foreground/80">
                    Note : Nous ne stockons jamais vos numéros de carte bancaire. Les paiements sont gérés 
                    de manière sécurisée par Stripe.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Finalités */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">3. Finalités du traitement</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Fournir nos services :</strong> Génération de contenu IA, publication sur LinkedIn, analytics</li>
                <li><strong className="text-white">Gérer votre compte :</strong> Authentification, préférences, abonnement</li>
                <li><strong className="text-white">Améliorer nos services :</strong> Analyse d'utilisation, optimisation de l'IA</li>
                <li><strong className="text-white">Communication :</strong> Notifications, support client, mises à jour</li>
                <li><strong className="text-white">Obligations légales :</strong> Facturation, conformité fiscale</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">4. Base légale du traitement</h2>
            <div className="space-y-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Exécution du contrat :</strong> Fourniture des services souscrits</li>
                <li><strong className="text-white">Consentement :</strong> Cookies non essentiels, communications marketing</li>
                <li><strong className="text-white">Intérêt légitime :</strong> Amélioration des services, sécurité</li>
                <li><strong className="text-white">Obligation légale :</strong> Conservation des données de facturation</li>
              </ul>
            </div>
          </section>

          {/* Durée de conservation */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">5. Durée de conservation</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Type de données</th>
                    <th className="text-left py-2 text-white">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Données de compte</td>
                    <td className="py-2">Durée de l'abonnement + 3 ans</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Posts générés</td>
                    <td className="py-2">Durée de l'abonnement</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Tokens LinkedIn</td>
                    <td className="py-2">Jusqu'à déconnexion ou expiration</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Données de facturation</td>
                    <td className="py-2">10 ans (obligation légale)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Logs techniques</td>
                    <td className="py-2">1 an</td>
                  </tr>
                  <tr>
                    <td className="py-2">Cookies</td>
                    <td className="py-2">13 mois maximum</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Destinataires */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">6. Destinataires des données</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Vos données peuvent être partagées avec :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">LinkedIn :</strong> Pour la publication de contenu (via API officielle)</li>
                <li><strong className="text-white">Stripe :</strong> Pour le traitement des paiements</li>
                <li><strong className="text-white">Services d'IA :</strong> Pour la génération de contenu (données anonymisées)</li>
                <li><strong className="text-white">Hébergeur :</strong> Pour le stockage sécurisé des données</li>
              </ul>
              <p className="text-sm mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </div>
          </section>

          {/* Transferts internationaux */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">7. Transferts internationaux</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Certains de nos sous-traitants peuvent être situés en dehors de l'Union Européenne. 
                Dans ce cas, nous nous assurons que des garanties appropriées sont en place :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Clauses contractuelles types de la Commission Européenne</li>
                <li>Certification Privacy Shield (le cas échéant)</li>
                <li>Décision d'adéquation de la Commission Européenne</li>
              </ul>
            </div>
          </section>

          {/* Vos droits */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">8. Vos droits</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Droit d'accès :</strong> Obtenir une copie de vos données</li>
                <li><strong className="text-white">Droit de rectification :</strong> Corriger des données inexactes</li>
                <li><strong className="text-white">Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong className="text-white">Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
                <li><strong className="text-white">Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                <li><strong className="text-white">Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong className="text-white">Droit de retirer votre consentement :</strong> À tout moment pour les traitements basés sur le consentement</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <strong className="text-violet-light">contact@linkedrank.fr</strong>
              </p>
              <p>
                Vous pouvez également introduire une réclamation auprès de la CNIL : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-violet-light hover:underline ml-1">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">9. Sécurité des données</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Chiffrement des données sensibles au repos</li>
                <li>Authentification sécurisée (OAuth 2.0)</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance et détection des intrusions</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">10. Politique de cookies</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Nous utilisons différents types de cookies :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                <li><strong className="text-white">Cookies de performance :</strong> Analyse d'utilisation (avec consentement)</li>
                <li><strong className="text-white">Cookies de fonctionnalité :</strong> Mémorisation de vos préférences</li>
              </ul>
              <p className="mt-4">
                Vous pouvez gérer vos préférences de cookies à tout moment via notre bandeau de cookies.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">11. Modifications de cette politique</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, 
                nous vous en informerons par email ou via une notification sur la plateforme.
              </p>
              <p>
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl border border-violet/30 bg-violet/10">
            <h2 className="text-xl font-semibold text-white mb-4">12. Nous contacter</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
              <p><strong className="text-white">Email :</strong> contact@linkedrank.fr</p>
              <p><strong className="text-white">Objet :</strong> [RGPD] Votre demande</p>
              <p className="text-sm mt-4">
                Nous nous engageons à répondre dans un délai de 30 jours.
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
            <Link href="/legal/cgv" className="hover:text-violet-light transition-colors">
              Conditions Générales de Vente
            </Link>
            <span>•</span>
            <Link href="/legal/cgu" className="hover:text-violet-light transition-colors">
              Conditions Générales d'Utilisation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
