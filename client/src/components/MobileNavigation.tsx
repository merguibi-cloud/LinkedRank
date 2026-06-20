import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Bot, 
  PenTool, 
  BarChart3, 
  User,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
  Linkedin,
  Gamepad2,
  FlaskConical,
  GraduationCap,
  Activity,
  Flame,
  Crown,
  Target,
  Gift,
  FolderOpen,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

export function MobileNavigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Navigation principale (bottom bar)
  const mainNavItems: NavItem[] = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/mes-outils", label: "Outils", icon: Wrench, badge: "🛠️" },
    { href: "/generate", label: "Créer", icon: PenTool, badge: "IA" },
    { href: "/dashboard", label: "Stats", icon: BarChart3 },
    { href: "#menu", label: "Menu", icon: Menu },
  ];

  // Menu complet (slide-in)
  const fullMenuItems: NavItem[] = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/mes-outils", label: "Mes Outils", icon: Wrench, badge: "🛠️" },
    { href: "/mes-outils?tab=mediatheque", label: "Médiathèque", icon: FolderOpen, badge: "📁" },
    { href: "/agents", label: "Mes Agents IA", icon: Bot },
    { href: "/agents/meet", label: "L'Équipe IA", icon: Sparkles, badge: "Nouveau" },
    { href: "/generate", label: "Générer du Contenu", icon: PenTool },
    { href: "/gamification", label: "Gamification", icon: Gamepad2, badge: "🎮" },
    { href: "/ab-testing", label: "A/B Testing", icon: FlaskConical },
    { href: "/coaching", label: "Coaching IA", icon: GraduationCap },
    { href: "/live-analytics", label: "Live Analytics", icon: Activity, badge: "Live" },
    { href: "/templates", label: "Templates", icon: BookOpen },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/analytics/advanced", label: "Analytics Pro", icon: TrendingUp },
    { href: "/achievements", label: "Badges & Niveaux", icon: Trophy },
    { href: "/rewards", label: "Récompenses", icon: Gift, badge: "🎁" },
    { href: "/resources", label: "Ressources", icon: BookOpen },
    { href: "/settings/linkedin", label: "Paramètres LinkedIn", icon: Linkedin },
  ];

  // Gestion des gestes tactiles (swipe)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && isMenuOpen) {
      setIsMenuOpen(false);
    }
    if (isRightSwipe && !isMenuOpen) {
      setIsMenuOpen(true);
    }
  };

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => {
    if (href === "#menu") {
      setIsMenuOpen(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => (
            item.href === "#menu" ? (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
              >
                <div className="relative">
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </button>
            ) : (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                    isActive(item.href) ? "text-violet-light" : "text-muted-foreground"
                  }`}
                >
                  <div className="relative">
                    <item.icon className={`h-6 w-6 ${isActive(item.href) ? "text-violet-light" : ""}`} />
                    {item.badge && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-violet to-rose px-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-light" />
                    )}
                  </div>
                  <span className={`text-xs ${isActive(item.href) ? "text-violet-light font-medium" : ""}`}>
                    {item.label}
                  </span>
                </button>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Slide-in Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm transform bg-background border-l border-white/10 transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose text-lg font-bold text-white">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </>
            ) : (
              <span className="text-lg font-bold text-white">Menu</span>
            )}
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {fullMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex w-full items-center justify-between rounded-xl p-3 transition-colors ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-violet/20 to-rose/20 text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-violet-light" : ""}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-violet/20 px-2 py-0.5 text-xs text-violet-light">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Auth Actions */}
          {user ? (
            <div className="space-y-2">
              <Link href="/settings/linkedin">
                <button className="flex w-full items-center gap-3 rounded-xl p-3 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                  <span>Paramètres</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-rose hover:bg-rose/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="w-full btn-gradient">
                <Linkedin className="mr-2 h-4 w-4" />
                Se connecter avec LinkedIn
              </Button>
            </a>
          )}
        </div>

        {/* Menu Footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-center text-xs text-muted-foreground">
            LinkedAgents v3.0 • Fait avec 💜 par Youssef
          </p>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}

// Hook pour détecter si on est sur mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
