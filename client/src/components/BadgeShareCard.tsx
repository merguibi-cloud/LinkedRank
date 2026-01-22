import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, 
  Linkedin, 
  Copy, 
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Trophy,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BADGES, LEVELS, generateBadgeShareText, generateLinkedInShareUrl, calculateLevel } from "@/lib/gamificationService";

interface BadgeShareCardProps {
  badgeId: string;
  userXp: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeShareCard({ badgeId, userXp, userName, isOpen, onClose }: BadgeShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState("");
  
  const badge = BADGES.find(b => b.id === badgeId);
  const level = calculateLevel(userXp);
  
  if (!badge) return null;

  const defaultShareText = generateBadgeShareText(badge, level);
  const shareText = customText || defaultShareText;
  const linkedInUrl = generateLinkedInShareUrl(shareText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Texte copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleShareLinkedIn = () => {
    window.open(linkedInUrl, "_blank", "width=600,height=600");
    toast.success("Redirection vers LinkedIn...");
  };

  const getBadgeColor = (badgeId: string) => {
    if (badgeId.includes("streak")) return "from-orange-500 to-red-500";
    if (badgeId.includes("engagement")) return "from-pink-500 to-rose-500";
    if (badgeId.includes("views")) return "from-blue-500 to-cyan-500";
    if (badgeId.includes("posts")) return "from-purple-500 to-violet-500";
    if (badgeId.includes("viral")) return "from-yellow-500 to-amber-500";
    return "from-primary to-purple-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-primary/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Partager votre badge
          </DialogTitle>
          <DialogDescription>
            Partagez votre accomplissement avec votre réseau LinkedIn !
          </DialogDescription>
        </DialogHeader>

        {/* Badge Preview Card */}
        <div className="relative">
          <Card className="overflow-hidden border-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${getBadgeColor(badge.id)} opacity-20`} />
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                {/* Badge Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getBadgeColor(badge.id)} p-1 shadow-lg`}>
                  <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center text-4xl">
                    {badge.emoji}
                  </div>
                </div>
                
                {/* Badge Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-medium">Badge débloqué !</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
              
              {/* User Info */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold">{userName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">Niveau {level.level} - {level.name}</p>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Star className="w-3 h-3 mr-1" />
                  +{badge.xpReward} XP
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Personnalisez votre message</label>
          <Textarea
            value={customText || defaultShareText}
            onChange={(e) => setCustomText(e.target.value)}
            className="min-h-[120px] bg-secondary/30"
            placeholder="Votre message de partage..."
          />
          <p className="text-xs text-muted-foreground">
            {shareText.length} caractères
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copier le texte
              </>
            )}
          </Button>
          
          <Button
            className="flex-1 bg-[#0077B5] hover:bg-[#006699]"
            onClick={handleShareLinkedIn}
          >
            <Linkedin className="w-4 h-4 mr-2" />
            Partager sur LinkedIn
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>

        {/* Tips */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Conseil :</strong> Les posts célébrant des accomplissements génèrent en moyenne 3x plus d'engagement. Ajoutez une question pour encourager les commentaires !
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Composant pour afficher un badge avec option de partage
interface ShareableBadgeProps {
  badge: typeof BADGES[0];
  unlocked: boolean;
  userXp: number;
  userName: string;
  progress?: number;
}

export function ShareableBadge({ badge, unlocked, userXp, userName, progress }: ShareableBadgeProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const getBadgeColor = (badgeId: string) => {
    if (badgeId.includes("streak")) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    if (badgeId.includes("engagement")) return "text-pink-400 bg-pink-500/10 border-pink-500/30";
    if (badgeId.includes("views")) return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    if (badgeId.includes("posts")) return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    if (badgeId.includes("viral")) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-primary bg-primary/10 border-primary/30";
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: unlocked ? 1.05 : 1 }}
        className={`relative p-4 rounded-xl border ${unlocked ? getBadgeColor(badge.id) : "bg-secondary/20 border-border/30 opacity-50"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${unlocked ? "" : "grayscale"}`}>
            {badge.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{badge.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
            {!unlocked && progress !== undefined && (
              <div className="mt-1">
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((progress / badge.requirement) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {progress}/{badge.requirement}
                </p>
              </div>
            )}
          </div>
          {unlocked && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setIsShareOpen(true)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {unlocked && (
          <Badge className="absolute -top-2 -right-2 bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
            <Check className="w-3 h-3 mr-0.5" />
            Débloqué
          </Badge>
        )}
      </motion.div>

      <BadgeShareCard
        badgeId={badge.id}
        userXp={userXp}
        userName={userName}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
}
