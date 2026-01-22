import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { USER_PROFILES, type UserProfile } from "@/components/ProfileSelector";

interface UserProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  isLoading: boolean;
  getRecommendedFeatures: () => string[];
  getTips: () => string[];
  getObjectives: () => string[];
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger le profil depuis localStorage au démarrage
    const savedProfileId = localStorage.getItem("linkedagents_user_profile");
    if (savedProfileId) {
      const foundProfile = USER_PROFILES.find(p => p.id === savedProfileId);
      if (foundProfile) {
        setProfileState(foundProfile);
      }
    }
    setIsLoading(false);
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    localStorage.setItem("linkedagents_user_profile", newProfile.id);
    setProfileState(newProfile);
  };

  const clearProfile = () => {
    localStorage.removeItem("linkedagents_user_profile");
    setProfileState(null);
  };

  const getRecommendedFeatures = () => {
    return profile?.recommendedFeatures || [];
  };

  const getTips = () => {
    return profile?.tips || [];
  };

  const getObjectives = () => {
    return profile?.objectives || [];
  };

  return (
    <UserProfileContext.Provider value={{
      profile,
      setProfile,
      clearProfile,
      isLoading,
      getRecommendedFeatures,
      getTips,
      getObjectives
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}

// Conseils personnalisés par profil et par fonctionnalité
export const PROFILE_TIPS: Record<string, Record<string, string[]>> = {
  entrepreneur: {
    generator: [
      "Partagez votre parcours entrepreneurial pour créer une connexion authentique",
      "Utilisez le storytelling pour raconter les hauts et les bas de votre aventure",
      "Mettez en avant les leçons apprises de vos échecs"
    ],
    dashboard: [
      "Suivez votre croissance d'audience pour mesurer votre personal branding",
      "Analysez quels types de posts génèrent le plus de leads",
      "Identifiez les meilleurs moments pour publier selon votre audience"
    ],
    agents: [
      "Activez le Content Creator pour générer du contenu régulier",
      "Utilisez le Trend Hunter pour surfer sur les sujets d'actualité",
      "Le mode autonome vous fait gagner du temps précieux"
    ]
  },
  ceo: {
    generator: [
      "Partagez vos insights stratégiques sur votre industrie",
      "Mettez en avant la culture et les valeurs de votre entreprise",
      "Commentez l'actualité économique avec votre perspective unique"
    ],
    dashboard: [
      "Mesurez l'impact de vos publications sur votre marque employeur",
      "Suivez l'engagement des talents potentiels",
      "Analysez la portée de vos messages auprès des décideurs"
    ],
    agents: [
      "Utilisez l'A/B Testing pour optimiser vos messages clés",
      "Le Coaching IA vous aide à affiner votre positionnement",
      "Planifiez vos publications pour maintenir une présence régulière"
    ]
  },
  commercial: {
    generator: [
      "Créez du contenu qui apporte de la valeur avant de vendre",
      "Partagez des études de cas et témoignages clients",
      "Utilisez les carrousels pour expliquer vos solutions"
    ],
    dashboard: [
      "Identifiez les posts qui génèrent le plus de conversations",
      "Suivez les interactions avec vos prospects cibles",
      "Mesurez le ROI de votre présence LinkedIn"
    ],
    agents: [
      "L'Engagement Manager vous aide à interagir avec vos prospects",
      "Utilisez les tendances pour créer du contenu d'actualité",
      "Automatisez vos publications pour rester visible"
    ]
  },
  recruiter: {
    generator: [
      "Montrez les coulisses et la vie de votre entreprise",
      "Partagez des témoignages d'employés authentiques",
      "Créez des offres d'emploi avec du storytelling"
    ],
    dashboard: [
      "Mesurez l'attractivité de votre marque employeur",
      "Analysez l'engagement des candidats potentiels",
      "Identifiez les contenus qui attirent les meilleurs talents"
    ],
    agents: [
      "Utilisez les templates pour créer des offres attractives",
      "Le Content Creator génère du contenu marque employeur",
      "Planifiez vos publications pour une présence constante"
    ]
  },
  creator: {
    generator: [
      "Expérimentez différents formats : texte, carrousel, vidéo",
      "Créez une série de contenus récurrents pour fidéliser",
      "Utilisez des hooks accrocheurs pour capter l'attention"
    ],
    dashboard: [
      "Analysez la croissance de votre audience en détail",
      "Identifiez vos posts les plus viraux pour les répliquer",
      "Suivez votre taux d'engagement pour optimiser"
    ],
    agents: [
      "Le mode autonome vous permet de publier quotidiennement",
      "Utilisez la gamification pour rester motivé",
      "L'A/B Testing vous aide à trouver les meilleurs formats"
    ]
  },
  freelance: {
    generator: [
      "Partagez vos réalisations et cas clients (avec permission)",
      "Donnez des conseils gratuits pour démontrer votre expertise",
      "Créez du contenu éducatif dans votre domaine"
    ],
    dashboard: [
      "Suivez les demandes de contact générées par vos posts",
      "Analysez quels sujets attirent le plus de prospects",
      "Mesurez votre positionnement d'expert"
    ],
    agents: [
      "Le Coaching IA vous aide à développer votre personal branding",
      "Utilisez les templates pour gagner du temps",
      "Automatisez pour rester visible même en mission"
    ]
  },
  manager: {
    generator: [
      "Partagez vos apprentissages en management et leadership",
      "Célébrez les succès de votre équipe publiquement",
      "Donnez des conseils de carrière basés sur votre expérience"
    ],
    dashboard: [
      "Mesurez l'impact de votre personal branding interne",
      "Suivez l'engagement de votre réseau professionnel",
      "Analysez votre progression vers vos objectifs de carrière"
    ],
    agents: [
      "Utilisez les ressources pour vous former continuellement",
      "Le Coaching IA vous aide à développer votre leadership",
      "Planifiez vos publications pour une présence régulière"
    ]
  }
};

// Hook pour obtenir les conseils personnalisés
export function useProfileTips(feature: string) {
  const { profile } = useUserProfile();
  
  if (!profile) {
    return [];
  }
  
  return PROFILE_TIPS[profile.id]?.[feature] || [];
}
