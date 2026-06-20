import { motion } from "framer-motion";
import { Bot, Shield, Zap, Clock } from "lucide-react";

const proofStats = [
  { value: "4", label: "Agents IA actifs", icon: Bot },
  { value: "100%", label: "Gratuit", icon: Zap },
  { value: "24/7", label: "Disponibles", icon: Clock },
  { value: "OAuth", label: "Connexion sécurisée", icon: Shield },
];

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

export function TestimonialsSection() {
  return null;
}

export function LogoCloud() {
  return null;
}

export function LiveActivityFeed() {
  return null;
}

export function UrgencyBanner() {
  return null;
}
