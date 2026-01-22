import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Clock, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function ROICalculator() {
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [hoursPerPost, setHoursPerPost] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculations
  const weeklyHoursWithout = postsPerWeek * hoursPerPost;
  const weeklyHoursWith = postsPerWeek * 0.25; // 15 min per post with LinkedAgents
  const hoursSaved = weeklyHoursWithout - weeklyHoursWith;
  const monthlySavings = hoursSaved * 4 * hourlyRate;
  const yearlyROI = monthlySavings * 12;
  const linkedAgentsCost = 29; // Monthly cost
  const netROI = monthlySavings - linkedAgentsCost;
  const roiMultiplier = Math.round(monthlySavings / linkedAgentsCost);

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 mb-4"
          >
            <Calculator className="w-4 h-4" />
            Calculateur de ROI
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Calculez vos{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              économies
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Découvrez combien de temps et d'argent vous pouvez économiser avec LinkedAgents
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="p-6 rounded-2xl bg-card/50 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Vos paramètres</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-muted-foreground">Posts par semaine</label>
                    <span className="text-white font-semibold">{postsPerWeek} posts</span>
                  </div>
                  <Slider
                    value={[postsPerWeek]}
                    onValueChange={(v) => setPostsPerWeek(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-muted-foreground">Heures par post (sans IA)</label>
                    <span className="text-white font-semibold">{hoursPerPost}h</span>
                  </div>
                  <Slider
                    value={[hoursPerPost]}
                    onValueChange={(v) => setHoursPerPost(v[0])}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-muted-foreground">Votre taux horaire</label>
                    <span className="text-white font-semibold">{hourlyRate}€/h</span>
                  </div>
                  <Slider
                    value={[hourlyRate]}
                    onValueChange={(v) => setHourlyRate(v[0])}
                    min={20}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet/20 to-rose/20 border border-violet/30">
              <h3 className="text-lg font-semibold text-white mb-6">Vos économies</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-violet-light" />
                    <span className="text-muted-foreground">Temps gagné/semaine</span>
                  </div>
                  <span className="text-xl font-bold text-white">{hoursSaved.toFixed(1)}h</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-muted-foreground">Économies/mois</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">{monthlySavings.toFixed(0)}€</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gold" />
                    <span className="text-muted-foreground">ROI annuel</span>
                  </div>
                  <span className="text-xl font-bold text-gold">{yearlyROI.toFixed(0)}€</span>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-medium">Multiplicateur ROI</span>
                    <span className="text-3xl font-bold text-emerald-400">{roiMultiplier}x</span>
                  </div>
                  <p className="text-sm text-emerald-400/70 mt-2">
                    Pour chaque euro investi, vous en récupérez {roiMultiplier}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 inline mr-2 text-gold" />
              Avec LinkedAgents à seulement <span className="text-white font-semibold">29€/mois</span>, 
              votre ROI net est de <span className="text-emerald-400 font-semibold">{netROI.toFixed(0)}€/mois</span>
            </p>
            <Button className="btn-gradient h-12 px-8">
              Commencer à économiser
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
