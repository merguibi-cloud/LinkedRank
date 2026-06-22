import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface UserProfile {
  id: string;
  name: string;
  description: string;
  focus: string;
  objectives: string[];
  recommendedFeatures: string[];
  tips: string[];
}

export const USER_PROFILES: UserProfile[] = [
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    description: "Vous lancez ou développez votre propre entreprise",
    focus: "Visibilité & acquisition",
    objectives: ["Développer votre personal branding", "Attirer des clients", "Partager votre vision"],
    recommendedFeatures: ["Générateur de contenu", "Auto-Publish", "Coaching"],
    tips: [
      "Partagez votre parcours entrepreneurial authentique",
      "Publiez 3 à 4 fois par semaine pour rester visible",
      "Utilisez le storytelling pour créer une connexion",
    ],
  },
  {
    id: "ceo",
    name: "Chef d'entreprise",
    description: "Vous dirigez une entreprise et souhaitez renforcer votre leadership",
    focus: "Leadership & recrutement",
    objectives: ["Positionner votre expertise", "Attirer des talents", "Développer votre réseau B2B"],
    recommendedFeatures: ["Templates", "Analytics", "A/B Testing"],
    tips: [
      "Partagez vos insights sur votre industrie",
      "Mettez en avant la culture de votre entreprise",
      "Commentez l'actualité de votre secteur",
    ],
  },
  {
    id: "commercial",
    name: "Commercial / Sales",
    description: "Vous vendez des produits ou services et cherchez des prospects",
    focus: "Génération de leads",
    objectives: ["Générer des leads qualifiés", "Créer des opportunités", "Établir votre crédibilité"],
    recommendedFeatures: ["Engagement Manager", "Tendances", "Carrousels"],
    tips: [
      "Apportez de la valeur avant de vendre",
      "Partagez des études de cas et témoignages clients",
      "Engagez-vous dans les commentaires de vos prospects",
    ],
  },
  {
    id: "recruiter",
    name: "Recruteur / RH",
    description: "Vous recrutez des talents et développez la marque employeur",
    focus: "Marque employeur",
    objectives: ["Attirer les meilleurs talents", "Développer la marque employeur", "Créer une communauté"],
    recommendedFeatures: ["Templates", "Auto-Publish", "Analytics"],
    tips: [
      "Montrez les coulisses de votre entreprise",
      "Partagez des témoignages d'employés",
      "Publiez des offres avec du storytelling",
    ],
  },
  {
    id: "creator",
    name: "Créateur de contenu",
    description: "Vous créez du contenu pour développer votre audience",
    focus: "Audience & notoriété",
    objectives: ["Développer votre audience", "Monétiser votre expertise", "Devenir une référence"],
    recommendedFeatures: ["Générateur de contenu", "Carrousels", "Statistiques"],
    tips: [
      "Publiez régulièrement pour maintenir la croissance",
      "Testez différents formats : texte, carrousel, vidéo",
      "Créez une série de contenus récurrents",
    ],
  },
  {
    id: "freelance",
    name: "Freelance / Consultant",
    description: "Vous proposez vos services en indépendant",
    focus: "Expertise & missions",
    objectives: ["Trouver des missions", "Démontrer votre expertise", "Construire votre réputation"],
    recommendedFeatures: ["Générateur de contenu", "Coaching", "Templates"],
    tips: [
      "Partagez vos réalisations et cas clients",
      "Donnez des conseils concrets dans votre domaine",
      "Créez du contenu éducatif ciblé",
    ],
  },
  {
    id: "manager",
    name: "Manager / Cadre",
    description: "Vous gérez des équipes et souhaitez développer votre leadership",
    focus: "Carrière & influence",
    objectives: ["Développer votre leadership", "Inspirer vos équipes", "Évoluer dans votre carrière"],
    recommendedFeatures: ["Templates", "Ressources", "Analytics"],
    tips: [
      "Partagez vos apprentissages en management",
      "Célébrez les succès de votre équipe",
      "Donnez des conseils de carrière",
    ],
  },
];

interface ProfileSelectorProps {
  onSelect: (profile: UserProfile) => void;
  selectedProfile?: string;
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
        selected ? "border-foreground bg-foreground" : "border-muted-foreground/40"
      )}
      aria-hidden
    >
      {selected && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
    </span>
  );
}

export function ProfileSelector({ onSelect, selectedProfile }: ProfileSelectorProps) {
  const [selected, setSelected] = useState<string | null>(selectedProfile || null);
  const activeProfile = USER_PROFILES.find((p) => p.id === selected) ?? null;

  const handleSelect = (profile: UserProfile) => {
    setSelected(profile.id);
    onSelect(profile);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 max-w-xl">
        <h2 className="text-2xl md:text-[1.65rem] font-semibold text-foreground font-sans leading-snug tracking-tight">
          Quelle situation vous décrit le mieux ?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nous adaptons vos recommandations, outils et rythme de publication à votre contexte professionnel.
        </p>
      </div>

      <div
        className="grid sm:grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Profil professionnel"
      >
        {USER_PROFILES.map((profile) => {
          const isSelected = selected === profile.id;

          return (
            <button
              key={profile.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(profile)}
              className={cn(
                "group flex gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors",
                isSelected
                  ? "border-foreground/25 bg-foreground/[0.04]"
                  : "border-border/60 bg-transparent hover:border-border hover:bg-muted/20"
              )}
            >
              <RadioIndicator selected={isSelected} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground font-sans">
                  {profile.name}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">
                  {profile.description}
                </span>
                <span className="mt-2 block text-[11px] text-muted-foreground/70 uppercase tracking-wide">
                  {profile.focus}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeProfile ? (
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 pt-6">
              <p className="text-xs text-muted-foreground mb-4">
                Configuration pour <span className="text-foreground">{activeProfile.name}</span>
              </p>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Objectifs
                  </h4>
                  <ul className="space-y-2">
                    {activeProfile.objectives.map((obj) => (
                      <li key={obj} className="text-sm text-foreground/80 leading-snug">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Outils activés
                  </h4>
                  <ul className="space-y-2">
                    {activeProfile.recommendedFeatures.map((feature) => (
                      <li key={feature} className="text-sm text-foreground/80">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Conseils
                  </h4>
                  <ul className="space-y-2">
                    {activeProfile.tips.map((tip) => (
                      <li key={tip} className="text-sm text-muted-foreground leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-foreground/60 border-t border-border/40 pt-6"
          >
            Sélectionnez un profil pour voir ce qui sera configuré.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
