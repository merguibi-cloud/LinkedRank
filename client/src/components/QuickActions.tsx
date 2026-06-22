import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sparkles,
  PenTool,
  Calendar,
  BarChart3,
  Layers,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    id: "generate",
    title: "Générer un post",
    description: "Texte optimisé par l'IA",
    icon: PenTool,
    href: "/generate",
  },
  {
    id: "carousel",
    title: "Carrousel",
    description: "Slides prêtes à publier",
    icon: Layers,
    href: "/carousels",
  },
  {
    id: "schedule",
    title: "Calendrier",
    description: "Planifier vos publications",
    icon: Calendar,
    href: "/schedule",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Mesurer vos performances",
    icon: BarChart3,
    href: "/analytics",
  },
];

export function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Actions rapides</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Link href={action.href}>
              <div className="group p-4 rounded-xl border border-white/10 bg-card/40 hover:border-violet/30 hover:bg-card/60 transition-all h-full">
                <div className="inline-flex p-2.5 rounded-lg bg-violet/15 mb-3 group-hover:bg-violet/25 transition-colors">
                  <action.icon className="w-5 h-5 text-violet-light" />
                </div>
                <h3 className="font-medium text-white text-sm mb-0.5">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
