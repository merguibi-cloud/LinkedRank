import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Bot,
  Layers,
  MessageSquare,
  Target,
  Rocket,
  Star,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  badge?: string;
}

const quickActions: QuickAction[] = [
  {
    id: "generate",
    title: "Générer un post",
    description: "Créez du contenu viral en 1 clic",
    icon: Sparkles,
    href: "/generate",
    color: "from-violet to-purple-600",
    badge: "Populaire",
  },
  {
    id: "carousel",
    title: "Créer un carrousel",
    description: "Carrousels professionnels en 2 min",
    icon: Layers,
    href: "/carousels",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "trends",
    title: "Voir les tendances",
    description: "Sujets qui buzzent maintenant",
    icon: TrendingUp,
    href: "/trending",
    color: "from-emerald-500 to-teal-600",
    badge: "Nouveau",
  },
  {
    id: "analytics",
    title: "Analyser mes posts",
    description: "Prédicteur de viralité IA",
    icon: BarChart3,
    href: "/analytics/advanced",
    color: "from-gold to-amber-600",
  },
  {
    id: "agents",
    title: "Mon équipe IA",
    description: "Gérez vos 5 agents spécialisés",
    icon: Users,
    href: "/agents/meet",
    color: "from-rose to-pink-600",
  },
  {
    id: "schedule",
    title: "Planifier",
    description: "Publiez au meilleur moment",
    icon: Calendar,
    href: "/schedule",
    color: "from-indigo-500 to-violet-600",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-violet-light" />
          Actions rapides
        </h3>
        <span className="text-sm text-white/40">Accès direct</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={action.href}>
              <div className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                {/* Badge */}
                {action.badge && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet to-rose text-[10px] font-bold text-white">
                    {action.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h4 className="font-semibold text-white mb-1 group-hover:text-violet-light transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-white/50 line-clamp-1">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
