import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Trophy,
  Coins,
  UserPlus,
  Star,
  Sparkles,
  Crown,
  Target,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Referral {
  id: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  creditsEarned: number;
  isActive: boolean;
}

// Données simulées de parrainages
const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    name: "Marie Dupont",
    avatar: "👩‍💼",
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    creditsEarned: 500,
    isActive: true
  },
  {
    id: "2",
    name: "Thomas Martin",
    avatar: "👨‍💻",
    joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    creditsEarned: 500,
    isActive: true
  },
  {
    id: "3",
    name: "Sophie Bernard",
    avatar: "👩‍🎨",
    joinedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    creditsEarned: 500,
    isActive: false
  }
];

// Paliers de récompenses
const REFERRAL_TIERS = [
  { count: 3, bonus: 200, badge: "🌱", title: "Ambassadeur Débutant" },
  { count: 5, bonus: 500, badge: "🌿", title: "Ambassadeur Bronze" },
  { count: 10, bonus: 1000, badge: "🌳", title: "Ambassadeur Argent" },
  { count: 25, bonus: 2500, badge: "🏆", title: "Ambassadeur Or" },
  { count: 50, bonus: 5000, badge: "💎", title: "Ambassadeur Diamant" },
  { count: 100, bonus: 10000, badge: "👑", title: "Ambassadeur Légendaire" }
];

export function ReferralSystem() {
  const [referralCode] = useState("YOUSSEF-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [copied, setCopied] = useState(false);
  const [totalCredits, setTotalCredits] = useState(1500);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const referralLink = `https://linkedagents.com/join?ref=${referralCode}`;
  const activeReferrals = referrals.filter(r => r.isActive).length;
  const totalReferrals = referrals.length;

  // Trouver le palier actuel et le prochain
  const currentTier = REFERRAL_TIERS.filter(t => t.count <= totalReferrals).pop();
  const nextTier = REFERRAL_TIERS.find(t => t.count > totalReferrals);
  const progressToNextTier = nextTier 
    ? ((totalReferrals - (currentTier?.count || 0)) / (nextTier.count - (currentTier?.count || 0))) * 100
    : 100;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erreur lors de la copie");
    }
  };

  const shareOnLinkedIn = () => {
    const text = `🚀 Je viens de découvrir LinkedAgents, une plateforme incroyable pour dominer LinkedIn avec l'IA !\n\nRejoignez-moi et obtenez 500 crédits bonus avec mon code : ${referralCode}\n\n${referralLink}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
    toast.success("Partage LinkedIn ouvert !");
  };

  const shareOnTwitter = () => {
    const text = `🚀 Découvrez @LinkedAgents pour dominer LinkedIn avec l'IA ! Utilisez mon code ${referralCode} pour 500 crédits bonus 🎁`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareByEmail = () => {
    const subject = "Rejoins-moi sur LinkedAgents - 500 crédits offerts !";
    const body = `Salut !\n\nJe voulais te partager LinkedAgents, une plateforme géniale qui utilise l'IA pour t'aider à dominer LinkedIn.\n\nUtilise mon code de parrainage "${referralCode}" pour obtenir 500 crédits bonus à l'inscription !\n\nInscris-toi ici : ${referralLink}\n\nÀ bientôt sur la plateforme !`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const claimTierBonus = (tier: typeof REFERRAL_TIERS[0]) => {
    setShowRewardAnimation(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTotalCredits(prev => prev + tier.bonus);
    toast.success(`🎉 +${tier.bonus} crédits bonus débloqués !`);
    setTimeout(() => setShowRewardAnimation(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filleuls actifs</p>
                <p className="text-3xl font-bold text-primary">{activeReferrals}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crédits gagnés</p>
                <p className="text-3xl font-bold text-amber-500">{totalCredits.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="text-xl font-bold text-purple-500">
                  {currentTier?.title || "Nouveau"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                {currentTier?.badge || "🌱"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code de parrainage */}
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-amber-500/10" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Votre code de parrainage
          </CardTitle>
          <CardDescription>
            Partagez ce code et gagnez 500 crédits pour chaque ami qui s'inscrit !
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Code */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input 
                value={referralCode}
                readOnly
                className="text-center text-xl font-mono font-bold tracking-wider bg-secondary/50 border-primary/30"
              />
            </div>
            <Button 
              onClick={() => copyToClipboard(referralCode)}
              variant="outline"
              className="border-primary/30"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Lien complet */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input 
                value={referralLink}
                readOnly
                className="text-sm bg-secondary/30 border-border/50 pr-10"
              />
            </div>
            <Button 
              onClick={() => copyToClipboard(referralLink)}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier le lien
            </Button>
          </div>

          {/* Boutons de partage */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={shareOnLinkedIn}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Partager sur LinkedIn
            </Button>
            <Button 
              onClick={shareOnTwitter}
              variant="outline"
              className="border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter/X
            </Button>
            <Button 
              onClick={shareByEmail}
              variant="outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Bonus info */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Double bonus !</h4>
                <p className="text-sm text-muted-foreground">
                  Vous et votre filleul recevez chacun <span className="text-amber-500 font-bold">500 crédits</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression vers le prochain palier */}
      {nextTier && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Prochain palier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTier?.badge || "🌱"}</span>
                <span className="text-muted-foreground">{currentTier?.title || "Débutant"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{nextTier.badge}</span>
                <span className="font-semibold text-foreground">{nextTier.title}</span>
              </div>
            </div>
            <Progress value={progressToNextTier} className="h-3 mb-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{totalReferrals} filleuls</span>
              <span className="text-primary font-medium">
                {nextTier.count - totalReferrals} de plus pour débloquer +{nextTier.bonus} crédits
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paliers de récompenses */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Paliers de récompenses
          </CardTitle>
          <CardDescription>
            Plus vous parrainez, plus vous gagnez de bonus !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REFERRAL_TIERS.map((tier, index) => {
              const isUnlocked = totalReferrals >= tier.count;
              const isCurrent = currentTier?.count === tier.count;
              
              return (
                <motion.div
                  key={tier.count}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isUnlocked 
                      ? "bg-gradient-to-br from-primary/10 to-amber-500/10 border-primary/30" 
                      : "bg-secondary/20 border-border/30 opacity-60"
                  } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 -right-2 bg-primary">
                      Actuel
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="text-3xl mb-2">{tier.badge}</div>
                    <h4 className="font-semibold text-sm mb-1">{tier.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {tier.count} filleuls
                    </p>
                    <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                      +{tier.bonus} crédits
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des filleuls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Vos filleuls ({totalReferrals})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Pas encore de filleuls</h3>
              <p className="text-sm text-muted-foreground">
                Partagez votre code pour commencer à gagner des crédits !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      {referral.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium">{referral.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {referral.joinedAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={referral.isActive ? "default" : "secondary"}>
                      {referral.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-500">
                        +{referral.creditsEarned}
                      </p>
                      <p className="text-xs text-muted-foreground">crédits</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReferralSystem;
