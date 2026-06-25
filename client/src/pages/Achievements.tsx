import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { GamificationDashboard } from "@/components/Gamification";
import { GamificationBadges } from "@/components/GamificationBadges";
import { Trophy, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Achievements() {
  const { user } = useAuth();
  
  // Fetch user stats for gamification
  const { data: postsData } = trpc.posts.list.useQuery({ limit: 1000 });
  
  // Calculate user stats
  const userStats = {
    totalPosts: postsData?.posts?.length || 10,
    totalLikes: Math.floor(Math.random() * 5000) + 500, // Simulated
    totalComments: Math.floor(Math.random() * 500) + 50, // Simulated
    currentStreak: 7,
    longestStreak: 14,
    lastPostDate: new Date(),
    xp: (postsData?.posts?.length || 10) * 50 + 200, // 50 XP per post + base
    agentsUsed: 3,
    connectionsCount: 45,
    hasViralPost: false,
    isEarlyAdopter: true,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Vos Succès & Badges
            </h1>
            <p className="text-muted-foreground mb-8">
              Connectez-vous pour voir vos badges, votre niveau et votre progression.
            </p>
            <a href={getLoginUrl()}>
              <Button className="btn-gradient">Se connecter</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              Succès & Badges
            </h1>
            <p className="text-muted-foreground">
              Débloquez des badges et montez en niveau en créant du contenu
            </p>
          </div>
        </div>

        {/* Gamification Dashboard */}
        <GamificationDashboard userStats={userStats} />
        
        {/* Badges Section */}
        <div className="mt-12">
          <GamificationBadges />
        </div>
        
        {/* How to earn XP */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet/10 to-rose/10 border border-violet/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-light" />
            Comment gagner des XP ?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { action: "Publier un post", xp: "+50 XP", icon: "📝" },
              { action: "Générer un carrousel", xp: "+30 XP", icon: "🎨" },
              { action: "Maintenir un streak", xp: "+10 XP/jour", icon: "🔥" },
              { action: "Utiliser un agent IA", xp: "+20 XP", icon: "🤖" },
              { action: "Recevoir 100 likes", xp: "+100 XP", icon: "❤️" },
              { action: "Post viral (10K vues)", xp: "+500 XP", icon: "🚀" },
              { action: "Compléter l'onboarding", xp: "+100 XP", icon: "✅" },
              { action: "Inviter un ami", xp: "+200 XP", icon: "👥" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm text-white font-medium">{item.action}</p>
                  <p className="text-xs text-emerald-400 font-bold">{item.xp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
