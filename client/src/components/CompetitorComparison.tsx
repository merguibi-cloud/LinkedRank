import { motion } from "framer-motion";
import { Check, X, Sparkles, Bot, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { name: "Agents IA autonomes", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Génération de contenu IA", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Carrousels automatiques", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Score de viralité", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Mode autonome", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Analyse des tendances", linkedAgents: true, buffer: true, hootsuite: true, later: false },
  { name: "Planification de posts", linkedAgents: true, buffer: true, hootsuite: true, later: true },
  { name: "Analytics avancés", linkedAgents: true, buffer: true, hootsuite: true, later: true },
  { name: "Réponses IA aux commentaires", linkedAgents: true, buffer: false, hootsuite: false, later: false },
  { name: "Gamification & Badges", linkedAgents: true, buffer: false, hootsuite: false, later: false },
];

const competitors = [
  { name: "LinkedAgents", key: "linkedAgents", highlight: true, price: "29€/mois" },
  { name: "Buffer", key: "buffer", highlight: false, price: "99€/mois" },
  { name: "Hootsuite", key: "hootsuite", highlight: false, price: "149€/mois" },
  { name: "Later", key: "later", highlight: false, price: "89€/mois" },
];

export function CompetitorComparison() {
  return (
    <section className="py-20 bg-card/30">
      <div className="container">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-violet-light mb-4"
          >
            <Crown className="w-4 h-4" />
            Pourquoi nous choisir
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            LinkedAgents vs{" "}
            <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
              la concurrence
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Découvrez pourquoi LinkedAgents est la solution la plus complète pour LinkedIn
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left p-4 text-muted-foreground font-medium">Fonctionnalité</th>
                {competitors.map((competitor) => (
                  <th 
                    key={competitor.key}
                    className={cn(
                      "p-4 text-center",
                      competitor.highlight && "bg-violet/10 rounded-t-xl"
                    )}
                  >
                    <div className={cn(
                      "font-bold",
                      competitor.highlight ? "text-violet-light" : "text-white"
                    )}>
                      {competitor.highlight && <Bot className="w-5 h-5 mx-auto mb-1" />}
                      {competitor.name}
                    </div>
                    <div className={cn(
                      "text-sm mt-1",
                      competitor.highlight ? "text-emerald-400 font-semibold" : "text-muted-foreground"
                    )}>
                      {competitor.price}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={feature.name}
                  className={cn(
                    "border-t border-white/5",
                    index % 2 === 0 && "bg-white/[0.02]"
                  )}
                >
                  <td className="p-4 text-white font-medium">{feature.name}</td>
                  {competitors.map((competitor) => {
                    const hasFeature = feature[competitor.key as keyof typeof feature] as boolean;
                    return (
                      <td 
                        key={competitor.key}
                        className={cn(
                          "p-4 text-center",
                          competitor.highlight && "bg-violet/5"
                        )}
                      >
                        {hasFeature ? (
                          <Check className={cn(
                            "w-5 h-5 mx-auto",
                            competitor.highlight ? "text-emerald-400" : "text-emerald-600"
                          )} />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-red-500/50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 inline mr-2 text-gold" />
            LinkedAgents offre <span className="text-white font-semibold">6 fonctionnalités exclusives</span> que la concurrence n'a pas
          </p>
        </motion.div>
      </div>
    </section>
  );
}
