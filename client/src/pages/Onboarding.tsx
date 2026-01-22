import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  User,
  Briefcase,
  Target,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  Users,
  Rocket,
} from "lucide-react";

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  role: string;
  company: string;
  industry: string;
  linkedinUrl: string;
  goals: string[];
  targetAudience: string;
  contentTopics: string[];
  postingFrequency: string;
  languages: string[];
}

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    company: "",
    industry: "",
    linkedinUrl: "",
    goals: [],
    targetAudience: "",
    contentTopics: [],
    postingFrequency: "",
    languages: [],
  });

  const roles = [
    { value: "entrepreneur", label: "Entrepreneur / Fondateur", icon: Rocket },
    { value: "executive", label: "Dirigeant / C-Level", icon: Building2 },
    { value: "sales", label: "Commercial / Business Developer", icon: Target },
    { value: "marketing", label: "Marketing / Communication", icon: Sparkles },
    { value: "hr", label: "RH / Recruteur", icon: Users },
    { value: "consultant", label: "Consultant / Freelance", icon: Briefcase },
    { value: "creator", label: "Créateur de contenu", icon: User },
    { value: "other", label: "Autre", icon: Globe },
  ];

  const industries = [
    "Tech / SaaS",
    "Finance / Banque",
    "Conseil / Consulting",
    "E-commerce / Retail",
    "Éducation / Formation",
    "Santé / Pharma",
    "Immobilier",
    "Industrie / Manufacturing",
    "Marketing / Communication",
    "Ressources Humaines",
    "Juridique",
    "Autre",
  ];

  const goals = [
    { value: "visibility", label: "Augmenter ma visibilité" },
    { value: "leads", label: "Générer des leads / clients" },
    { value: "recruiting", label: "Recruter des talents" },
    { value: "branding", label: "Développer mon personal branding" },
    { value: "network", label: "Élargir mon réseau" },
    { value: "thought-leadership", label: "Devenir leader d'opinion" },
    { value: "company-brand", label: "Promouvoir mon entreprise" },
    { value: "partnerships", label: "Trouver des partenaires" },
  ];

  const topics = [
    "Entrepreneuriat",
    "Leadership",
    "Management",
    "Innovation",
    "IA / Tech",
    "Marketing Digital",
    "Vente / Commercial",
    "Personal Branding",
    "Productivité",
    "Carrière",
    "Finance",
    "Développement personnel",
  ];

  const frequencies = [
    { value: "daily", label: "Quotidien (1+ post/jour)" },
    { value: "several-week", label: "Plusieurs fois par semaine" },
    { value: "weekly", label: "1 fois par semaine" },
    { value: "biweekly", label: "2 fois par mois" },
    { value: "monthly", label: "1 fois par mois" },
  ];

  const languages = [
    { value: "fr", label: "🇫🇷 Français" },
    { value: "en", label: "🇬🇧 Anglais" },
    { value: "ar", label: "🇸🇦 Arabe" },
    { value: "es", label: "🇪🇸 Espagnol" },
    { value: "de", label: "🇩🇪 Allemand" },
  ];

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const toggleTopic = (topic: string) => {
    setData((prev) => ({
      ...prev,
      contentTopics: prev.contentTopics.includes(topic)
        ? prev.contentTopics.filter((t) => t !== topic)
        : [...prev.contentTopics, topic],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSubmit = async () => {
    // TODO: Save onboarding data to database
    console.log("Onboarding data:", data);
    setLocation("/dashboard");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet to-rose flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Créez votre profil créateur
          </h1>
          <p className="text-muted-foreground mb-8">
            Connectez-vous pour personnaliser votre expérience et accéder à tous les outils de création de contenu.
          </p>
          <a href={getLoginUrl()}>
            <Button className="btn-gradient w-full">
              Se connecter pour continuer
            </Button>
          </a>
          <Link href="/">
            <Button variant="ghost" className="mt-4 text-muted-foreground">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-gradient-to-r from-violet to-rose transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="container max-w-2xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-xl font-bold text-white mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-rose flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              LinkedRank
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6 mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step
                    ? "bg-gradient-to-r from-violet to-rose text-white"
                    : s < step
                    ? "bg-violet/20 text-violet-light"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Étape {step} sur 4</p>
        </div>

        {/* Step 1: Role & Company */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Parlez-nous de vous
              </h1>
              <p className="text-muted-foreground">
                Ces informations nous aideront à personnaliser votre expérience.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Quel est votre rôle principal ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setData({ ...data, role: role.value })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        data.role === role.value
                          ? "border-violet bg-violet/10 text-white"
                          : "border-white/10 bg-card/50 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      <role.icon className="w-5 h-5 mb-2" />
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nom de votre entreprise
                </label>
                <Input
                  placeholder="Ex: KEOS Business School"
                  value={data.company}
                  onChange={(e) => setData({ ...data, company: e.target.value })}
                  className="bg-card/50 border-white/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Secteur d'activité
                </label>
                <Select
                  value={data.industry}
                  onValueChange={(value) => setData({ ...data, industry: value })}
                >
                  <SelectTrigger className="bg-card/50 border-white/10">
                    <SelectValue placeholder="Sélectionnez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL de votre profil LinkedIn
                </label>
                <Input
                  placeholder="https://linkedin.com/in/votre-profil"
                  value={data.linkedinUrl}
                  onChange={(e) => setData({ ...data, linkedinUrl: e.target.value })}
                  className="bg-card/50 border-white/10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Quels sont vos objectifs ?
              </h1>
              <p className="text-muted-foreground">
                Sélectionnez tous les objectifs qui vous correspondent.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    data.goals.includes(goal.value)
                      ? "border-violet bg-violet/10 text-white"
                      : "border-white/10 bg-card/50 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        data.goals.includes(goal.value)
                          ? "border-violet bg-violet"
                          : "border-white/30"
                      }`}
                    >
                      {data.goals.includes(goal.value) && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Décrivez votre audience cible
              </label>
              <Textarea
                placeholder="Ex: Entrepreneurs et dirigeants de PME en France cherchant à développer leur activité..."
                value={data.targetAudience}
                onChange={(e) => setData({ ...data, targetAudience: e.target.value })}
                className="bg-card/50 border-white/10 min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Content Topics */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Sur quels sujets souhaitez-vous publier ?
              </h1>
              <p className="text-muted-foreground">
                Sélectionnez les thématiques qui vous intéressent.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    data.contentTopics.includes(topic)
                      ? "border-violet bg-violet/20 text-violet-light"
                      : "border-white/10 bg-card/50 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                À quelle fréquence souhaitez-vous publier ?
              </label>
              <div className="space-y-2">
                {frequencies.map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => setData({ ...data, postingFrequency: freq.value })}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      data.postingFrequency === freq.value
                        ? "border-violet bg-violet/10 text-white"
                        : "border-white/10 bg-card/50 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-medium">{freq.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Languages */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Dans quelles langues publiez-vous ?
              </h1>
              <p className="text-muted-foreground">
                Nous adapterons les suggestions de contenu à vos langues.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => toggleLanguage(lang.value)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    data.languages.includes(lang.value)
                      ? "border-violet bg-violet/10 text-white"
                      : "border-white/10 bg-card/50 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <span className="text-lg font-medium">{lang.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-2xl border border-violet/30 bg-violet/5">
              <h3 className="font-semibold text-white mb-4">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-white">Rôle:</span>{" "}
                  {roles.find((r) => r.value === data.role)?.label || "-"}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-white">Entreprise:</span> {data.company || "-"}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-white">Secteur:</span> {data.industry || "-"}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-white">Objectifs:</span>{" "}
                  {data.goals.length > 0
                    ? goals
                        .filter((g) => data.goals.includes(g.value))
                        .map((g) => g.label)
                        .join(", ")
                    : "-"}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-white">Thématiques:</span>{" "}
                  {data.contentTopics.length > 0 ? data.contentTopics.join(", ") : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep((step - 1) as OnboardingStep)}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </Link>
          )}

          {step < 4 ? (
            <Button
              className="btn-gradient"
              onClick={() => setStep((step + 1) as OnboardingStep)}
            >
              Continuer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button className="btn-gradient" onClick={handleSubmit}>
              Terminer
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
