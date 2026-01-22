import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Users, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// Testimonials data
const testimonials = [
  {
    name: "Marie Dupont",
    role: "CEO @ TechStartup",
    avatar: "👩‍💼",
    content: "LinkedAgents a transformé ma présence LinkedIn. En 3 mois, j'ai gagné 15K abonnés et mes posts génèrent 10x plus d'engagement.",
    metrics: "+15K abonnés",
    rating: 5,
  },
  {
    name: "Thomas Martin",
    role: "Consultant Marketing",
    avatar: "👨‍💻",
    content: "L'agent Content Creator comprend parfaitement mon style. Je gagne 5h par semaine et mes posts sont plus performants que jamais.",
    metrics: "5h/semaine gagnées",
    rating: 5,
  },
  {
    name: "Sophie Bernard",
    role: "Fondatrice @ GrowthLab",
    avatar: "👩‍🚀",
    content: "Le mode autonome est incroyable. Mes agents publient automatiquement et je me concentre sur mon business. ROI exceptionnel.",
    metrics: "ROI x12",
    rating: 5,
  },
  {
    name: "Lucas Petit",
    role: "Coach Business",
    avatar: "🧑‍🏫",
    content: "Les carrousels générés sont magnifiques et viraux. Mon dernier a fait 50K vues ! L'IA comprend vraiment ce qui marche.",
    metrics: "50K vues/post",
    rating: 5,
  },
  {
    name: "Emma Leroy",
    role: "Directrice RH",
    avatar: "👩‍💼",
    content: "L'analyse des tendances m'aide à toujours être pertinente. Je suis devenue une référence dans mon secteur grâce à LinkedAgents.",
    metrics: "Top Voice LinkedIn",
    rating: 5,
  },
  {
    name: "Alexandre Moreau",
    role: "Entrepreneur Tech",
    avatar: "🚀",
    content: "J'utilise les 5 agents et c'est comme avoir une équipe marketing complète. Le meilleur investissement pour ma visibilité.",
    metrics: "+200% leads",
    rating: 5,
  },
];

// Stats for social proof
const proofStats = [
  { value: "2,500+", label: "Créateurs actifs", icon: Users },
  { value: "150K+", label: "Posts générés", icon: Zap },
  { value: "4.9/5", label: "Note moyenne", icon: Star },
  { value: "98%", label: "Taux de satisfaction", icon: Award },
];

// Testimonial Card Component
function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative p-6 rounded-2xl bg-card/50 border border-white/10 backdrop-blur-sm hover:border-violet/30 transition-all"
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-violet/20" />
      
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
        ))}
      </div>
      
      {/* Content */}
      <p className="text-white/90 text-sm leading-relaxed mb-4">
        "{testimonial.content}"
      </p>
      
      {/* Metric badge */}
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
        <TrendingUp className="w-3 h-3" />
        {testimonial.metrics}
      </div>
      
      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet/20 to-rose/20 flex items-center justify-center text-xl">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-medium text-white text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Social Proof Stats Section
export function SocialProofStats() {
  return (
    <section className="py-12 border-y border-white/10 bg-gradient-to-r from-violet/5 via-transparent to-rose/5">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {proofStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-rose/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-violet-light" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Grid Section
export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold mb-4"
          >
            <Star className="w-4 h-4 fill-gold" />
            Témoignages clients
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Ils ont transformé leur{" "}
            <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
              LinkedIn
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Découvrez comment nos utilisateurs ont boosté leur présence LinkedIn avec LinkedAgents
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Animated Logo Cloud
export function LogoCloud() {
  const logos = [
    "🏢 TechCorp", "🚀 StartupX", "💼 ConsultPro", "🎯 GrowthCo", 
    "📊 DataLab", "🌐 GlobalTech", "💡 InnovateCo", "🔥 FireBrand"
  ];
  
  return (
    <section className="py-12 overflow-hidden">
      <div className="container">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Utilisé par des créateurs de contenu dans ces entreprises
        </p>
        <div className="relative">
          <div className="flex animate-scroll gap-12">
            {[...logos, ...logos].map((logo, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium whitespace-nowrap"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Live Activity Feed
export function LiveActivityFeed() {
  const activities = [
    { user: "Marie D.", action: "a publié un post viral", time: "il y a 2 min", emoji: "🔥" },
    { user: "Thomas M.", action: "a généré un carrousel", time: "il y a 5 min", emoji: "🎨" },
    { user: "Sophie B.", action: "a activé le mode autonome", time: "il y a 8 min", emoji: "🤖" },
    { user: "Lucas P.", action: "a atteint 10K vues", time: "il y a 12 min", emoji: "📈" },
    { user: "Emma L.", action: "a débloqué un badge", time: "il y a 15 min", emoji: "🏆" },
  ];
  
  return (
    <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-72 p-4 rounded-2xl bg-card/95 border border-white/10 backdrop-blur-xl shadow-xl"
      >
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-white">Activité en direct</span>
        </div>
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center gap-2 text-xs"
            >
              <span>{activity.emoji}</span>
              <span className="text-white font-medium">{activity.user}</span>
              <span className="text-muted-foreground">{activity.action}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Urgency Banner
export function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Vérifier si l'utilisateur a déjà fermé la bannière
    if (typeof window !== 'undefined') {
      return localStorage.getItem('urgencyBannerClosed') !== 'true';
    }
    return true;
  });
  
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('urgencyBannerClosed', 'true');
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-violet to-rose py-3 text-center text-sm font-medium text-white relative z-50"
    >
      <div className="container flex items-center justify-center gap-3 pr-12">
        <span>🎉 <span className="font-bold">Offre de lancement</span> : -50% sur le plan Pro pendant 48h !</span>
        <a href="/pricing" className="ml-2 underline cursor-pointer hover:no-underline font-semibold">En profiter →</a>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 group"
        aria-label="Fermer la bannière"
        title="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </motion.div>
  );
}
