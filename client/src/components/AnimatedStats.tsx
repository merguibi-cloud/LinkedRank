import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Zap, Star, TrendingUp, Award, Target } from "lucide-react";

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
  duration?: number;
}

function AnimatedNumber({ 
  value, 
  suffix = "", 
  prefix = "",
  duration = 2 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <span ref={ref}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
}

function StatCard({ value, suffix, prefix, label, icon: Icon, delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet/20 to-rose/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 rounded-2xl bg-card/50 border border-white/10 hover:border-violet/30 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet/20 to-violet/5 group-hover:from-violet/30 group-hover:to-violet/10 transition-all">
            <Icon className="w-6 h-6 text-violet-light" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AnimatedStats() {
  const stats = [
    { value: 2500, suffix: "+", label: "Créateurs actifs", icon: Users, delay: 0 },
    { value: 150000, suffix: "+", label: "Posts générés", icon: Zap, delay: 0.1 },
    { value: 4.9, suffix: "/5", label: "Note moyenne", icon: Star, delay: 0.2 },
    { value: 98, suffix: "%", label: "Taux de satisfaction", icon: Award, delay: 0.3 },
    { value: 3200000, suffix: "+", label: "Impressions générées", icon: TrendingUp, delay: 0.4 },
    { value: 87, suffix: "%", label: "Taux d'engagement moyen", icon: Target, delay: 0.5 },
  ];

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Des résultats qui parlent{" "}
            <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
              d'eux-mêmes
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de créateurs qui ont transformé leur présence LinkedIn
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Compact version for hero section
export function HeroStats() {
  const stats = [
    { value: 2500, suffix: "+", label: "Créateurs actifs", icon: Users },
    { value: 150, suffix: "K+", label: "Posts générés", icon: Zap },
    { value: 4.9, suffix: "/5", label: "Note moyenne", icon: Star },
    { value: 98, suffix: "%", label: "Satisfaction", icon: Award },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <stat.icon className="w-5 h-5 text-violet-light" />
            <span className="text-2xl md:text-3xl font-bold text-white">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
