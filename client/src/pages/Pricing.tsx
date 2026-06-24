import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getSignupUrl } from "@/const";
import { toast } from "sonner";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Rocket,
  ArrowRight,
  Star,
  Shield,
  MessageSquare,
  Bot,
  TrendingUp,
  BarChart3,
  Calendar,
  Image,
  Users,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Infinity,
  Clock,
} from "lucide-react";

type BillingPeriod = "monthly" | "yearly";

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  trial?: string;
  features: PlanFeature[];
  cta: string;
  badge?: string;
}

export default function Pricing() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (planId: string) => {
    // Starter = essai gratuit 14 jours, pas de carte bancaire
    if (planId === "starter") {
      if (!user) {
        window.location.href = getSignupUrl("/dashboard");
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }

    if (!user) {
      toast.info("Créez un compte pour souscrire à ce plan.");
      window.location.href = getSignupUrl("/pricing");
      return;
    }

    setIsLoading(planId);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingPeriod,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }
    } catch (error) {
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const plans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      tagline: "Pour démarrer sur LinkedIn",
      description: "Idéal pour les créateurs qui veulent publier régulièrement sans y passer des heures.",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      glowColor: "shadow-blue-500/20",
      monthlyPrice: 19,
      yearlyPrice: 15,
      popular: false,
      trial: "14 jours gratuits",
      features: [
        { text: "30 posts IA / mois", included: true, highlight: true },
        { text: "Calendrier éditorial", included: true },
        { text: "Programmation LinkedIn", included: true },
        { text: "Analytics basiques", included: true },
        { text: "1 compte LinkedIn", included: true },
        { text: "Génération de carrousels", included: false },
        { text: "Analytics avancées", included: false },
        { text: "Bibliothèque d'idées", included: false },
        { text: "Personnalisation du ton", included: false },
        { text: "IA entraînée sur votre profil", included: false },
        { text: "Multi-comptes", included: false },
      ],
      cta: "Démarrer l'essai gratuit",
      badge: "14 jours offerts",
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Pour les créateurs sérieux",
      description: "La solution complète pour développer votre audience et dominer votre secteur.",
      icon: Crown,
      color: "from-violet-500 to-purple-600",
      glowColor: "shadow-violet-500/30",
      monthlyPrice: 49,
      yearlyPrice: 39,
      popular: true,
      features: [
        { text: "200 posts IA / mois", included: true, highlight: true },
        { text: "Calendrier éditorial", included: true },
        { text: "Programmation LinkedIn", included: true },
        { text: "Analytics avancées", included: true, highlight: true },
        { text: "Génération de carrousels", included: true, highlight: true },
        { text: "Bibliothèque d'idées", included: true, highlight: true },
        { text: "Personnalisation du ton", included: true, highlight: true },
        { text: "1 compte LinkedIn", included: true },
        { text: "Images IA (Nano Banana)", included: true },
        { text: "IA entraînée sur votre profil", included: false },
        { text: "Multi-comptes", included: false },
      ],
      cta: "Commencer avec Pro",
      badge: "Le plus populaire",
    },
    {
      id: "growth",
      name: "Growth",
      tagline: "Pour les leaders d'opinion",
      description: "Tout ce dont vous avez besoin pour automatiser et scaler votre présence LinkedIn.",
      icon: Rocket,
      color: "from-rose-500 to-orange-500",
      glowColor: "shadow-rose-500/20",
      monthlyPrice: 99,
      yearlyPrice: 79,
      popular: false,
      features: [
        { text: "Posts illimités", included: true, highlight: true },
        { text: "IA entraînée sur votre profil", included: true, highlight: true },
        { text: "Automatisation complète", included: true, highlight: true },
        { text: "Multi-comptes LinkedIn", included: true, highlight: true },
        { text: "Rapports avancés", included: true, highlight: true },
        { text: "Génération de carrousels", included: true },
        { text: "Analytics avancées", included: true },
        { text: "Bibliothèque d'idées", included: true },
        { text: "Personnalisation du ton", included: true },
        { text: "Images IA (Nano Banana)", included: true },
        { text: "Support prioritaire", included: true },
      ],
      cta: "Passer à Growth",
    },
  ];

  const faqs = [
    {
      question: "L'essai gratuit 14 jours nécessite-t-il une carte bancaire ?",
      answer: "Non. L'essai de 14 jours est entièrement gratuit, sans carte bancaire requise. Vous ne serez facturé que si vous choisissez de continuer après la période d'essai.",
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement avec un ajustement au prorata.",
    },
    {
      question: "Que se passe-t-il après l'essai gratuit ?",
      answer: "À la fin des 14 jours, vous recevez un email de rappel. Si vous ne souscrivez pas, votre compte bascule en version limitée. Aucun prélèvement automatique sans accord.",
    },
    {
      question: "Mes données LinkedIn sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons OAuth2 sécurisé pour la connexion LinkedIn. Vos données ne sont jamais stockées en clair ni partagées avec des tiers. Conformité RGPD garantie.",
    },
    {
      question: "Qu'est-ce que l'IA entraînée sur le profil (Growth) ?",
      answer: "Sur le plan Growth, notre IA apprend votre style d'écriture, vos thématiques et votre tonalité spécifique pour générer du contenu qui semble vraiment venir de vous.",
    },
    {
      question: "Combien de comptes LinkedIn puis-je connecter en multi-comptes ?",
      answer: "Le plan Growth inclut jusqu'à 5 comptes LinkedIn. Pour des besoins d'agence (10+ comptes), contactez-nous pour une offre sur mesure.",
    },
  ];

  const getPrice = (plan: PricingPlan) =>
    billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const getSavings = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-violet/15 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-rose/10 blur-[100px]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
              <Sparkles className="h-4 w-4" />
              Tarifs simples • Sans surprise
            </div>

            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Investissez dans votre{" "}
              <span className="bg-gradient-to-r from-violet-light via-rose to-gold bg-clip-text text-transparent">
                présence LinkedIn
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Commencez avec <strong className="text-white">14 jours gratuits</strong> sur le plan Starter.
              Aucune carte bancaire requise.
            </p>

            {/* Billing toggle */}
            <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-white/10 bg-card/50 p-1.5">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-violet text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-violet text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Annuel
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
                  −20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = getPrice(plan);
              const savings = getSavings(plan);

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
                    plan.popular
                      ? `border-violet/40 bg-gradient-to-b from-violet/10 via-card/90 to-card/80 shadow-2xl ${plan.glowColor} scale-[1.02]`
                      : "border-white/10 bg-card/50 hover:border-white/20 hover:shadow-xl"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-lg ${
                          plan.popular
                            ? "bg-gradient-to-r from-violet to-rose"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm font-medium text-violet-light">{plan.tagline}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 border-b border-white/10 pb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-white">{price}€</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <p className="mt-1 text-sm text-gold">
                          Économisez {savings}% · Facturé {price * 12}€/an
                        </p>
                      )}
                      {plan.trial && (
                        <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-400">
                          <BadgeCheck className="h-4 w-4" />
                          {plan.trial} • Sans carte bancaire
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Button
                      className={`mb-8 h-12 w-full text-base font-semibold transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-violet to-violet-light hover:opacity-90 shadow-lg shadow-violet/30"
                          : plan.id === "growth"
                          ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                      }`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Chargement...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {plan.cta}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    {/* Features */}
                    <ul className="flex-1 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-3 text-sm ${
                            feature.included ? "text-white/90" : "text-muted-foreground/40"
                          }`}
                        >
                          {feature.included ? (
                            <Check
                              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                                feature.highlight ? "text-gold" : "text-emerald-400"
                              }`}
                            />
                          ) : (
                            <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                          )}
                          <span className={feature.highlight ? "font-medium text-white" : ""}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trial note */}
          <div className="mx-auto mt-10 max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-sm text-emerald-400">
              <Clock className="h-4 w-4" />
              Le plan Starter inclut <strong className="ml-1">14 jours gratuits</strong> — aucun engagement, annulation en 1 clic
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-white/5 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Comparaison complète des plans
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Choisissez le plan qui correspond à votre rythme de publication
            </p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10">
            {/* Header */}
            <div className="grid grid-cols-4 bg-card/80 px-6 py-4">
              <div className="text-sm font-medium text-muted-foreground">Fonctionnalité</div>
              {plans.map((plan) => (
                <div key={plan.id} className="text-center">
                  <span
                    className={`text-sm font-bold ${
                      plan.popular ? "text-violet-light" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </span>
                </div>
              ))}
            </div>

            {[
              { label: "Posts IA / mois", values: ["30", "200", "Illimités"] },
              { label: "Calendrier éditorial", values: [true, true, true] },
              { label: "Programmation LinkedIn", values: [true, true, true] },
              { label: "Génération de carrousels", values: [false, true, true] },
              { label: "Analytics basiques", values: [true, true, true] },
              { label: "Analytics avancées", values: [false, true, true] },
              { label: "Bibliothèque d'idées", values: [false, true, true] },
              { label: "Personnalisation du ton", values: [false, true, true] },
              { label: "Images IA (Nano Banana)", values: [false, true, true] },
              { label: "IA entraînée sur le profil", values: [false, false, true] },
              { label: "Automatisation complète", values: [false, false, true] },
              { label: "Multi-comptes", values: [false, false, true] },
              { label: "Rapports avancés", values: [false, false, true] },
              { label: "Support prioritaire", values: [false, false, true] },
              { label: "Essai gratuit", values: ["14 jours", false, false] },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 border-t border-white/5 px-6 py-3 ${
                  i % 2 === 0 ? "bg-card/20" : "bg-transparent"
                }`}
              >
                <div className="text-sm text-muted-foreground">{row.label}</div>
                {row.values.map((val, j) => (
                  <div key={j} className="flex justify-center">
                    {typeof val === "boolean" ? (
                      val ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30" />
                      )
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          j === 1 ? "text-violet-light" : j === 2 ? "text-gold" : "text-white"
                        }`}
                      >
                        {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="border-t border-white/5 py-20 bg-card/20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Pourquoi choisir{" "}
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                LinkedRank ?
              </span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                title: "IA Gemini Nano Banana",
                desc: "Génération d'images premium avec le dernier modèle Google",
                color: "from-violet/20 to-purple/20",
              },
              {
                icon: Bot,
                title: "Agents IA autonomes",
                desc: "Votre équipe d'agents travaille 24h/24 pour vous",
                color: "from-blue-500/20 to-cyan-500/20",
              },
              {
                icon: Layers,
                title: "Carrousels en 1 clic",
                desc: "Des carrousels visuels professionnels prêts à publier",
                color: "from-rose/20 to-orange-500/20",
              },
              {
                icon: Shield,
                title: "100% sécurisé",
                desc: "OAuth2 LinkedIn, chiffrement bout-en-bout, RGPD",
                color: "from-emerald-500/20 to-teal-500/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-card/50 p-6 text-center transition-all hover:border-violet/20"
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                >
                  <item.icon className="h-6 w-6 text-violet-light" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ils ont transformé leur LinkedIn
            </h2>
            <p className="mt-4 text-muted-foreground">
              Des créateurs qui publient plus, mieux, et sans effort
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                name: "Marie Dupont",
                role: "CEO @ TechStartup",
                avatar: "MD",
                plan: "Growth",
                content:
                  "J'ai gagné 50K abonnés en 3 mois. L'IA entraînée sur mon profil génère du contenu qui semble vraiment venir de moi.",
                rating: 5,
              },
              {
                name: "Thomas Martin",
                role: "Consultant Marketing",
                avatar: "TM",
                plan: "Pro",
                content:
                  "Les carrousels générés en 1 clic me font gagner 10h par semaine. La qualité est bluffante.",
                rating: 5,
              },
              {
                name: "Sophie Bernard",
                role: "Directrice RH",
                avatar: "SB",
                plan: "Starter",
                content:
                  "J'ai commencé avec l'essai gratuit et j'ai souscrit dès le 3ème jour. Le calendrier éditorial a changé ma façon de travailler.",
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-card/50 p-6"
              >
                <div className="mb-3 flex items-center gap-1">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                  <span className="ml-auto rounded-full bg-violet/20 px-2 py-0.5 text-xs text-violet-light">
                    Plan {t.plan}
                  </span>
                </div>
                <p className="mb-4 text-sm text-white/90">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose text-sm font-medium text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-20 bg-card/20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Questions fréquentes</h2>
            <p className="mt-4 text-muted-foreground">Tout ce que vous devez savoir</p>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-white/10 bg-card/50"
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/5 px-6 py-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet/20 bg-gradient-to-br from-violet/20 via-card/50 to-rose/10 p-12 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-violet blur-[100px]" />
              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-rose blur-[100px]" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                <Sparkles className="h-4 w-4" />
                Commencez aujourd'hui — sans risque
              </div>

              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                14 jours gratuits,{" "}
                <span className="bg-gradient-to-r from-violet-light to-gold bg-clip-text text-transparent">
                  sans carte bancaire
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Essayez toutes les fonctionnalités Starter. Annulez quand vous voulez.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {user ? (
                  <Button
                    className="h-14 bg-gradient-to-r from-violet to-violet-light px-10 text-lg font-semibold hover:opacity-90"
                    onClick={() => { window.location.href = "/dashboard"; }}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Démarrer mon essai gratuit
                  </Button>
                ) : (
                  <a href={getSignupUrl("/dashboard")}>
                    <Button className="h-14 bg-gradient-to-r from-violet to-violet-light px-10 text-lg font-semibold hover:opacity-90">
                      <Rocket className="mr-2 h-5 w-5" />
                      Démarrer mon essai gratuit
                    </Button>
                  </a>
                )}
                <Link href="/">
                  <Button
                    variant="outline"
                    className="h-14 border-white/20 px-10 text-lg hover:bg-white/5"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    En savoir plus
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Aucune carte requise
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  14 jours offerts
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Annulation en 1 clic
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LinkedRank. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/legal/cgu" className="hover:text-white transition-colors">
                CGU
              </Link>
              <a href="mailto:contact@linkedrank.fr" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
