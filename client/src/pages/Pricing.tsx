import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Shield,
  Clock,
  MessageSquare,
  BarChart3,
  Calendar,
  Image,
  Bot,
  Rocket,
  Building2,
  HeadphonesIcon,
} from "lucide-react";
import { ROICalculator } from "@/components/ROICalculator";
import { CompetitorComparison } from "@/components/CompetitorComparison";

type BillingPeriod = "monthly" | "yearly";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  features: {
    text: string;
    included: boolean;
    highlight?: boolean;
  }[];
  cta: string;
  ctaVariant: "outline" | "default" | "premium";
}

export default function Pricing() {
  const { user } = useAuth();
  
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    // Free plan - just redirect to dashboard
    if (planId === "free" || planId === "starter") {
      if (!user) {
        window.location.href = getLoginUrl();
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }

    // Business plan - contact sales
    if (planId === "business") {
      window.location.href = "mailto:contact@linkedrank.fr?subject=Demande%20plan%20Business";
      return;
    }

    // Pro plan - Stripe checkout
    if (!user) {
      toast.error("Connexion requise", {
        description: "Veuillez vous connecter pour souscrire à un abonnement.",
      });
      window.location.href = getLoginUrl();
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
      console.error("Checkout error:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Starter",
      description: "Parfait pour découvrir la plateforme",
      icon: Zap,
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        { text: "Accès aux classements France", included: true },
        { text: "5 générations IA par mois", included: true },
        { text: "Aperçu des top créateurs", included: true },
        { text: "Guides et ressources basiques", included: true },
        { text: "Publication LinkedIn manuelle", included: true },
        { text: "Classement mondial complet", included: false },
        { text: "Publication automatique", included: false },
        { text: "Génération d'images IA", included: false },
        { text: "Analytics avancés", included: false },
        { text: "Support prioritaire", included: false },
      ],
      cta: "Commencer gratuitement",
      ctaVariant: "outline",
    },
    {
      id: "pro",
      name: "Pro",
      description: "Pour les créateurs sérieux",
      icon: Crown,
      monthlyPrice: 29,
      yearlyPrice: 19,
      popular: true,
      features: [
        { text: "Tout du plan Starter", included: true },
        { text: "Générations IA illimitées", included: true, highlight: true },
        { text: "Classement mondial complet", included: true },
        { text: "Publication automatique", included: true, highlight: true },
        { text: "Génération d'images IA", included: true, highlight: true },
        { text: "Planification des posts", included: true },
        { text: "Analytics de performance", included: true },
        { text: "Export des données", included: true },
        { text: "Support par email", included: true },
        { text: "API Access", included: false },
      ],
      cta: "Essai gratuit 14 jours",
      ctaVariant: "default",
    },
    {
      id: "business",
      name: "Business",
      description: "Pour les équipes et agences",
      icon: Building2,
      monthlyPrice: 79,
      yearlyPrice: 59,
      popular: false,
      features: [
        { text: "Tout du plan Pro", included: true },
        { text: "Jusqu'à 10 comptes LinkedIn", included: true, highlight: true },
        { text: "Gestion d'équipe", included: true, highlight: true },
        { text: "API Access complet", included: true },
        { text: "Webhooks personnalisés", included: true },
        { text: "Analytics multi-comptes", included: true },
        { text: "White-label disponible", included: true },
        { text: "Onboarding personnalisé", included: true },
        { text: "Support prioritaire 24/7", included: true, highlight: true },
        { text: "Account manager dédié", included: true },
      ],
      cta: "Contacter les ventes",
      ctaVariant: "premium",
    },
  ];

  const testimonials = [
    {
      name: "Marie Dupont",
      role: "CEO @ TechStartup",
      avatar: "MD",
      content: "LinkedRank a transformé ma présence LinkedIn. J'ai gagné 50K abonnés en 3 mois grâce à la publication automatique.",
      rating: 5,
    },
    {
      name: "Thomas Martin",
      role: "Consultant Marketing",
      avatar: "TM",
      content: "Le générateur IA produit du contenu de qualité professionnelle. Je gagne 10h par semaine sur ma création de contenu.",
      rating: 5,
    },
    {
      name: "Sophie Bernard",
      role: "Directrice RH",
      avatar: "SB",
      content: "Parfait pour notre équipe de recrutement. Nous publions 3x plus de contenu avec la même équipe.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Puis-je annuler à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation.",
    },
    {
      question: "L'essai gratuit nécessite-t-il une carte bancaire ?",
      answer: "Non, l'essai gratuit de 14 jours ne nécessite aucune carte bancaire. Vous ne serez facturé que si vous décidez de continuer après l'essai.",
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, nous utilisons un chiffrement de bout en bout et respectons le RGPD. Vos données LinkedIn ne sont jamais partagées avec des tiers.",
    },
    {
      question: "Proposez-vous des remises pour les ONG ?",
      answer: "Oui, nous offrons 50% de réduction pour les organisations à but non lucratif. Contactez-nous pour en bénéficier.",
    },
  ];

  const getPrice = (plan: PricingPlan) => {
    return billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    return Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet/5 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Tarifs simples et transparents
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Choisissez le plan qui{" "}
              <span className="gradient-text">booste votre LinkedIn</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Commencez gratuitement, puis passez à un plan payant quand vous êtes prêt à dominer LinkedIn.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-card/50 border border-white/10">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-violet text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === "yearly"
                    ? "bg-violet text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Annuel
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                  -35%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 -mt-8">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = getPrice(plan);
              const savings = getSavings(plan);
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border backdrop-blur-sm transition-all ${
                    plan.popular
                      ? "bg-gradient-to-b from-violet/10 to-card/80 border-violet/30 scale-105 shadow-2xl shadow-violet/20"
                      : "bg-card/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet to-rose text-white text-sm font-medium">
                        Le plus populaire
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${
                        plan.popular ? "bg-violet/20" : "bg-white/5"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          plan.popular ? "text-violet-light" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                          {price === 0 ? "Gratuit" : `${price}€`}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground">/mois</span>
                        )}
                      </div>
                      {billingPeriod === "yearly" && savings > 0 && (
                        <p className="text-sm text-gold mt-1">
                          Économisez {savings}% avec le plan annuel
                        </p>
                      )}
                      {price > 0 && billingPeriod === "yearly" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Facturé {price * 12}€/an
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <Button
                      className={`w-full mb-8 h-12 text-base font-medium ${
                        plan.ctaVariant === "default"
                          ? "bg-gradient-to-r from-violet to-violet-light hover:opacity-90"
                          : plan.ctaVariant === "premium"
                          ? "bg-gradient-to-r from-gold to-gold-light text-background hover:opacity-90"
                          : "border-white/20 hover:bg-white/5"
                      }`}
                      variant={plan.ctaVariant === "outline" ? "outline" : "default"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Chargement...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className={`flex items-start gap-3 text-sm ${
                            feature.included ? "text-white" : "text-muted-foreground/50"
                          }`}
                        >
                          {feature.included ? (
                            <Check className={`w-5 h-5 flex-shrink-0 ${
                              feature.highlight ? "text-gold" : "text-green-500"
                            }`} />
                          ) : (
                            <X className="w-5 h-5 flex-shrink-0 text-muted-foreground/30" />
                          )}
                          <span className={feature.highlight ? "font-medium" : ""}>
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
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin pour{" "}
              <span className="gradient-text">réussir sur LinkedIn</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils puissants pour créer, publier et analyser votre contenu LinkedIn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Bot,
                title: "IA Générative",
                description: "Créez du contenu viral en quelques secondes avec notre IA entraînée sur les meilleurs posts",
              },
              {
                icon: Calendar,
                title: "Publication Auto",
                description: "Planifiez et publiez automatiquement aux meilleurs moments pour maximiser l'engagement",
              },
              {
                icon: Image,
                title: "Images IA",
                description: "Générez des visuels professionnels et des citations inspirantes en un clic",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Suivez vos performances et optimisez votre stratégie avec des données précises",
              },
              {
                icon: Users,
                title: "Top Créateurs",
                description: "Inspirez-vous des meilleurs créateurs LinkedIn classés par secteur et pays",
              },
              {
                icon: TrendingUp,
                title: "Tendances",
                description: "Découvrez les sujets qui buzzent et surfez sur les tendances du moment",
              },
              {
                icon: Shield,
                title: "Sécurité",
                description: "Vos données sont protégées avec un chiffrement de bout en bout",
              },
              {
                icon: HeadphonesIcon,
                title: "Support",
                description: "Une équipe dédiée pour vous accompagner dans votre croissance",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card/30 border border-white/5 hover:border-violet/20 transition-all"
              >
                <div className="p-3 rounded-xl bg-violet/10 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-violet-light" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-violet/5 to-transparent">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ils ont transformé leur LinkedIn
            </h2>
            <p className="text-muted-foreground">
              Rejoignez des milliers de créateurs qui utilisent LinkedRank
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card/50 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-white mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet to-rose flex items-center justify-center text-white font-medium text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground">
              Tout ce que vous devez savoir sur nos offres
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card/30 border border-white/5"
              >
                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Competitor Comparison */}
      <CompetitorComparison />

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-violet/20 via-card/50 to-rose/10 border border-violet/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à dominer LinkedIn ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de créateurs qui utilisent LinkedRank pour développer leur audience et générer des opportunités.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet to-violet-light hover:opacity-90 h-14 px-8 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Commencer l'essai gratuit
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/5 h-14 px-8 text-lg"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Parler à un expert
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              14 jours d'essai gratuit • Aucune carte bancaire requise • Annulation à tout moment
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 LinkedRank. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-white transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
