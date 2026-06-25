import { Bot, Check, ClipboardList, Linkedin, Sparkles, PenTool, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { ReactNode } from "react";

export type AuthMode = "login" | "signup";
export type SignupStep = 1 | 2;

const JOURNEY_STEPS = [
  { icon: Sparkles, label: "Créer votre compte", description: "30 secondes chrono" },
  { icon: ClipboardList, label: "Personnaliser votre profil", description: "Questions guidées en quelques clics" },
  { icon: Linkedin, label: "Connecter LinkedIn", description: "OAuth sécurisé" },
  { icon: PenTool, label: "Première publication", description: "Post généré par l'IA" },
];

const LOGIN_HIGHLIGHTS = [
  { icon: Bot, text: "4 agents IA prêts à travailler pour vous" },
  { icon: PenTool, text: "Posts, carrousels et planification" },
  { icon: BarChart3, text: "Analytics et score de viralité" },
];

interface AuthLayoutProps {
  mode: AuthMode;
  signupStep?: SignupStep;
  children: ReactNode;
}

export function AuthLayout({ mode, signupStep = 1, children }: AuthLayoutProps) {
  const activeJourneyIndex = mode === "signup" ? signupStep - 1 : -1;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panneau gauche — storytelling */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-background to-rose/10" />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-violet/25 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-rose/20 blur-[90px]" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose transition-transform group-hover:scale-105">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LinkedAgents</span>
            </Link>
          </div>

          <div className="space-y-8">
            {mode === "signup" ? (
              <>
                <div>
                  <motion.p
                    key={`badge-${signupStep}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 text-sm text-violet-light mb-4"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Étape {signupStep} sur 2 — inscription
                  </motion.p>
                  <motion.h2
                    key={`title-${signupStep}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-3xl xl:text-4xl font-bold text-white leading-tight"
                  >
                    {signupStep === 1
                      ? "Votre équipe LinkedIn IA vous attend"
                      : "Plus qu'un clic pour démarrer"}
                  </motion.h2>
                  <motion.p
                    key={`desc-${signupStep}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-3 text-muted-foreground text-lg leading-relaxed"
                  >
                    {signupStep === 1
                      ? "Des milliers de professionnels utilisent nos agents pour publier sans effort sur LinkedIn."
                      : "Ensuite, répondez à quelques questions — l'IA structure votre profil et calibre vos posts."}
                  </motion.p>
                </div>

                <div className="space-y-3">
                  {JOURNEY_STEPS.map((step, index) => {
                    const isActive = index === activeJourneyIndex;
                    const isDone = index < activeJourneyIndex;
                    const Icon = step.icon;

                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${
                          isActive
                            ? "border-violet/40 bg-violet/10 shadow-lg shadow-violet/10"
                            : isDone
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isActive
                              ? "bg-gradient-to-br from-violet to-rose"
                              : isDone
                                ? "bg-emerald-500/20"
                                : "bg-white/5"
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${isActive || isDone ? "text-white" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 mb-4">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Vos agents sont actifs
                  </p>
                  <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                    Bon retour — votre LinkedIn vous attend
                  </h2>
                  <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
                    Reprenez où vous en étiez : contenu, planification et analytics en un seul espace.
                  </p>
                </div>

                <div className="space-y-3">
                  {LOGIN_HIGHLIGHTS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet/20 to-rose/20">
                          <Icon className="h-4 w-4 text-violet-light" />
                        </div>
                        <p className="text-white/90">{item.text}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { value: "4", label: "Agents IA" },
                    { value: "100%", label: "Gratuit" },
                    { value: "24/7", label: "Disponible" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Connexion LinkedIn OAuth2 · Données chiffrées · Conforme RGPD
          </p>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header mobile */}
        <div className="lg:hidden p-4 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-rose">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">LinkedAgents</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
