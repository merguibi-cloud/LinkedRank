import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Star, 
  Sparkles, 
  ShoppingBag,
  Check,
  Lock,
  Coins,
  Crown,
  Zap,
  BookOpen,
  Palette,
  Clock,
  BarChart3,
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { REWARDS, type Reward } from "@/lib/gamificationService";

interface RewardsShopProps {
  userCredits: number;
  onPurchase: (reward: Reward) => void;
  purchasedRewards: string[];
}

export function RewardsShop({ userCredits, onPurchase, purchasedRewards }: RewardsShopProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "template": return <BookOpen className="w-5 h-5" />;
      case "feature": return <Zap className="w-5 h-5" />;
      case "boost": return <Sparkles className="w-5 h-5" />;
      case "cosmetic": return <Palette className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "feature": return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case "boost": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "cosmetic": return "text-pink-400 bg-pink-500/10 border-pink-500/30";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "template": return "Template";
      case "feature": return "Fonctionnalité";
      case "boost": return "Boost";
      case "cosmetic": return "Cosmétique";
      default: return "Récompense";
    }
  };

  const handlePurchase = async () => {
    if (!selectedReward) return;
    
    if (userCredits < selectedReward.cost) {
      toast.error("Crédits insuffisants !");
      setIsConfirmOpen(false);
      return;
    }

    setIsPurchasing(true);
    
    // Simulation d'achat
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    onPurchase(selectedReward);
    toast.success(`🎉 ${selectedReward.name} débloqué !`);
    
    setIsPurchasing(false);
    setIsConfirmOpen(false);
    setSelectedReward(null);
  };

  const isPurchased = (rewardId: string) => purchasedRewards.includes(rewardId);
  const canAfford = (cost: number) => userCredits >= cost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Boutique de Récompenses</h2>
            <p className="text-muted-foreground">Échangez vos crédits contre des avantages exclusifs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="text-xl font-bold text-amber-400">{userCredits.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">crédits</span>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["template", "feature", "boost", "cosmetic"].map((type) => {
          const count = REWARDS.filter(r => r.type === type).length;
          return (
            <Card key={type} className={`glass-card ${getTypeColor(type)} cursor-pointer hover:scale-105 transition-transform`}>
              <CardContent className="p-4 flex items-center gap-3">
                {getTypeIcon(type)}
                <div>
                  <p className="font-medium">{getTypeLabel(type)}s</p>
                  <p className="text-xs text-muted-foreground">{count} disponibles</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rewards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map((reward) => {
          const purchased = isPurchased(reward.id);
          const affordable = canAfford(reward.cost);
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: purchased ? 1 : 1.02 }}
            >
              <Card className={`glass-card overflow-hidden ${purchased ? "opacity-60" : ""} ${!affordable && !purchased ? "border-red-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getTypeColor(reward.type)}`}>
                      {reward.icon}
                    </div>
                    <Badge variant="outline" className={getTypeColor(reward.type)}>
                      {getTypeLabel(reward.type)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{reward.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className={`font-bold ${affordable || purchased ? "text-amber-400" : "text-red-400"}`}>
                        {reward.cost.toLocaleString()}
                      </span>
                    </div>
                    
                    {purchased ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Obtenu
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!affordable}
                        onClick={() => {
                          setSelectedReward(reward);
                          setIsConfirmOpen(true);
                        }}
                        className={affordable ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {affordable ? (
                          <>
                            Obtenir
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Insuffisant
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Confirmer l'achat
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment échanger vos crédits contre cette récompense ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getTypeColor(selectedReward.type)}`}>
                  {selectedReward.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedReward.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-muted-foreground">Coût</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-400">{selectedReward.cost.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground">Solde après achat</span>
                <span className="font-bold text-foreground">{(userCredits - selectedReward.cost).toLocaleString()} crédits</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Achat en cours...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmer l'achat
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
