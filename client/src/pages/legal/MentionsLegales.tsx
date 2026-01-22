import Navbar from "@/components/Navbar";
import { Link } from "wouter";
import { ArrowLeft, Scale, Building2, Mail, Phone, Globe } from "lucide-react";

export default function MentionsLegales() {
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
              <Scale className="w-6 h-6 text-violet-light" />
            </div>
            <h1 className="text-3xl font-bold text-white">Mentions Légales</h1>
          </div>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Éditeur */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">1. Éditeur du site</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-white">Raison sociale :</strong> LinkedRank (Marque commerciale)</p>
              <p><strong className="text-white">Forme juridique :</strong> [À compléter - SAS / SARL / Auto-entrepreneur]</p>
              <p><strong className="text-white">Capital social :</strong> [À compléter]</p>
              <p><strong className="text-white">Siège social :</strong> [Adresse à compléter]</p>
              <p><strong className="text-white">SIRET :</strong> [Numéro à compléter]</p>
              <p><strong className="text-white">RCS :</strong> [Ville et numéro à compléter]</p>
              <p><strong className="text-white">Numéro de TVA intracommunautaire :</strong> [À compléter]</p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">2. Directeur de la publication</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-white">Nom :</strong> Youssef Koutari</p>
              <p><strong className="text-white">Qualité :</strong> Fondateur et Gérant</p>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">3. Contact</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-white">Email :</strong> contact@linkedrank.fr</p>
              <p><strong className="text-white">Téléphone :</strong> [À compléter]</p>
              <p><strong className="text-white">Formulaire de contact :</strong> Disponible sur le site</p>
            </div>
          </section>

          {/* Hébergeur */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-violet-light" />
              <h2 className="text-xl font-semibold text-white m-0">4. Hébergement</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><strong className="text-white">Hébergeur :</strong> Manus AI</p>
              <p><strong className="text-white">Adresse :</strong> Services cloud sécurisés</p>
              <p>Le site est hébergé sur une infrastructure cloud conforme aux normes de sécurité européennes.</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">5. Propriété intellectuelle</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                L'ensemble du contenu du site LinkedRank (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) 
                est la propriété exclusive de LinkedRank ou de ses partenaires et est protégé par les lois françaises et 
                internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments 
                du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable 
                de LinkedRank.
              </p>
              <p>
                Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée 
                comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et 
                suivants du Code de Propriété Intellectuelle.
              </p>
            </div>
          </section>

          {/* Données personnelles */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">6. Protection des données personnelles</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles 
                vous concernant.
              </p>
              <p>
                Pour plus d'informations sur la collecte et le traitement de vos données, veuillez consulter notre{" "}
                <Link href="/legal/confidentialite" className="text-violet-light hover:underline">
                  Politique de Confidentialité
                </Link>.
              </p>
              <p>
                <strong className="text-white">Délégué à la Protection des Données (DPO) :</strong> contact@linkedrank.fr
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Le site LinkedRank utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                En naviguant sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique de cookies.
              </p>
              <p>
                Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur 
                ou via notre bandeau de gestion des cookies.
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">8. Limitation de responsabilité</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                LinkedRank s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations 
                diffusées sur ce site. Toutefois, LinkedRank ne peut garantir l'exactitude, la précision ou l'exhaustivité 
                des informations mises à disposition sur ce site.
              </p>
              <p>
                LinkedRank décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des 
                informations disponibles sur ce site, ainsi que pour tous dommages résultant d'une intrusion frauduleuse 
                d'un tiers ayant entraîné une modification des informations mises à disposition sur ce site.
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">9. Liens hypertextes</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Le site LinkedRank peut contenir des liens hypertextes vers d'autres sites internet. LinkedRank n'exerce 
                aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
              <p>
                La création de liens hypertextes vers le site LinkedRank est soumise à l'accord préalable de l'éditeur.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">10. Droit applicable et juridiction</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, et après échec de 
                toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Crédits */}
          <section className="p-6 rounded-2xl border border-white/10 bg-card/50">
            <h2 className="text-xl font-semibold text-white mb-4">11. Crédits</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-white">Conception et développement :</strong> LinkedRank</p>
              <p><strong className="text-white">Technologies utilisées :</strong> React, TypeScript, Node.js</p>
              <p><strong className="text-white">Icônes :</strong> Lucide Icons</p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/legal/cgv" className="hover:text-violet-light transition-colors">
              Conditions Générales de Vente
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
