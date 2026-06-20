import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { LinkedInStatusBadge } from "@/components/LinkedInStatusBadge";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { 
  Menu, X, Sparkles, BarChart3, Users, BookOpen, Zap, LogOut, User, ChevronDown, 
  Linkedin, Bot, Calendar, TrendingUp, Flame, Brain, Trophy, 
  FileText, Target, Lightbulb, Layout, Globe, Award, Rocket, Settings,
  PenTool, LayoutTemplate, LineChart, FolderOpen, Wrench
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotificationCenter } from "./NotificationCenter";

interface SubMenuItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
  badge?: string;
}

interface NavItem {
  label: string;
  icon: any;
  href?: string;
  submenu?: SubMenuItem[];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { status: linkedInStatus } = useLinkedInStatus();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation organisée avec sous-menus
  const navItems: NavItem[] = [
    {
      label: "Découvrir",
      icon: Globe,
      submenu: [
        { href: "/rankings/world", label: "Classements Mondiaux", icon: BarChart3, description: "Top créateurs LinkedIn" },
        { href: "/top-posts", label: "Posts Viraux", icon: Flame, description: "Les posts qui cartonnent", badge: "Hot" },
        { href: "/trending", label: "Tendances", icon: TrendingUp, description: "Ce qui buzz maintenant" },
        { href: "/creators", label: "Créateurs", icon: Users, description: "Inspirez-vous des meilleurs" },
      ]
    },
    {
      label: "Agents IA",
      icon: Brain,
      submenu: [
        { href: "/agents", label: "Mes Agents", icon: Bot, description: "Gérer vos agents IA" },
        { href: "/agents/meet", label: "L'Équipe IA", icon: Users, description: "Rencontrez vos agents", badge: "Nouveau" },
        { href: "/generate", label: "Générer du Contenu", icon: PenTool, description: "Créer avec l'IA" },
        { href: "/auto-publish", label: "Auto-Publication", icon: Rocket, description: "Publiez automatiquement" },
      ]
    },
    {
      label: "Mes Outils",
      icon: Lightbulb,
      submenu: [
        { href: "/mes-outils", label: "Tous les outils", icon: PenTool, description: "Hub de création LinkedIn" },
        { href: "/mes-outils?tab=mediatheque", label: "Médiathèque", icon: Layout, description: "Vos visuels et publications", badge: "Nouveau" },
        { href: "/generate", label: "Générateur IA", icon: Sparkles, description: "Créer avec l'IA" },
        { href: "/carousels", label: "Carrousels", icon: LayoutTemplate, description: "Créer des carrousels" },
        { href: "/templates", label: "Templates", icon: FileText, description: "Modèles de posts prêts" },
        { href: "/schedule", label: "Calendrier", icon: Calendar, description: "Planifiez vos posts" },
        { href: "/auto-publish", label: "Auto-Publication", icon: Rocket, description: "Publiez automatiquement" },
        { href: "/analytics/advanced", label: "Analytics Pro", icon: LineChart, description: "Analysez vos performances" },
        { href: "/achievements", label: "Badges & Niveaux", icon: Trophy, description: "Vos accomplissements", badge: "Fun" },
      ]
    },
    {
      label: "Ressources",
      icon: BookOpen,
      href: "/resources",
    },
  ];

  const isActive = (href: string) => location === href;
  const isSubmenuActive = (submenu: SubMenuItem[]) => submenu.some(item => location === item.href);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  const handleSubmenuEnter = (label: string) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setActiveSubmenu(label);
  };

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 150);
  };

  // LinkedIn OAuth URL
  const linkedinAuthUrl = "/login?redirect=/dashboard&connectLinkedIn=1";

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Linked</span>
              <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">Agents</span>
            </span>
          </Link>

          {/* Desktop Navigation with Submenus */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => item.submenu && handleSubmenuEnter(item.label)}
                onMouseLeave={handleSubmenuLeave}
              >
                {item.submenu ? (
                  <>
                    <button
                      className={`nav-link flex items-center gap-1.5 ${
                        isSubmenuActive(item.submenu) ? "active" : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronDown className={`h-3 w-3 transition-transform ${activeSubmenu === item.label ? "rotate-180" : ""}`} />
                    </button>
                    
                    {/* Submenu Dropdown */}
                    {activeSubmenu === item.label && (
                      <div 
                        className="absolute left-0 top-full pt-2"
                        onMouseEnter={() => handleSubmenuEnter(item.label)}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        <div className="w-72 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                          <div className="p-2">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-white/10 ${
                                  isActive(subItem.href) ? "bg-violet/20" : ""
                                }`}
                                onClick={() => setActiveSubmenu(null)}
                              >
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  isActive(subItem.href) 
                                    ? "bg-gradient-to-br from-violet to-rose" 
                                    : "bg-white/10"
                                }`}>
                                  <subItem.icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{subItem.label}</span>
                                    {subItem.badge && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-violet to-rose text-white">
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{subItem.description}</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={`nav-link flex items-center gap-1.5 ${isActive(item.href!) ? "active" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button className="btn-gradient gap-2">
                    <Zap className="h-4 w-4" />
                    Générer
                  </Button>
                </Link>
                
                {/* Notifications */}
                <NotificationCenter />
                
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="max-w-[100px] truncate">{user.name?.split(" ")[0] || "Utilisateur"}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-white/10 space-y-2">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <LinkedInStatusBadge showPhoto size="sm" />
                      </div>
                      <div className="p-1">
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                            <Sparkles className="h-4 w-4" />
                            Dashboard
                          </button>
                        </Link>
                        <Link href="/agents" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                            <Bot className="h-4 w-4" />
                            Mes Agents IA
                          </button>
                        </Link>
                        <Link href="/auto-publish" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-violet-light hover:bg-violet/10 transition-colors">
                            <Rocket className="h-4 w-4" />
                            Auto-Publication
                          </button>
                        </Link>
                        <Link href="/schedule" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                            <Calendar className="h-4 w-4" />
                            Calendrier
                          </button>
                        </Link>
                        <Link href="/achievements" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">
                            <Trophy className="h-4 w-4" />
                            Badges & Niveaux
                          </button>
                        </Link>
                        {!linkedInStatus.connected && (
                          <>
                            <div className="border-t border-white/10 my-1" />
                            <a href={linkedinAuthUrl}>
                              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-[#0A66C2] to-[#0077B5] text-white hover:opacity-90 transition-all">
                                <Linkedin className="h-4 w-4" />
                                Connecter LinkedIn
                              </button>
                            </a>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href={linkedinAuthUrl}>
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-[#0A66C2] to-[#0077B5] text-white hover:opacity-90 border-0">
                    <Linkedin className="h-4 w-4" />
                    Connexion
                  </Button>
                </a>
                <a href={linkedinAuthUrl}>
                  <Button className="btn-gradient gap-2">
                    <Zap className="h-4 w-4" />
                    Commencer
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-4 lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <div className="space-y-1 pl-4">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive(subItem.href)
                                ? "bg-violet/20 text-white"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span className="flex-1">{subItem.label}</span>
                            {subItem.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-violet to-rose text-white">
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href!)
                          ? "bg-violet/20 text-white"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile User Section */}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Sparkles className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/generate" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="btn-gradient w-full justify-start gap-2">
                        <Zap className="h-4 w-4" />
                        Générer du contenu
                      </Button>
                    </Link>
                    <a href={linkedinAuthUrl}>
                      <Button variant="outline" className="w-full justify-start gap-2 border-[#0A66C2]/50 text-[#0A66C2]">
                        <Linkedin className="h-4 w-4" />
                        Connecter LinkedIn
                      </Button>
                    </a>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <a href={linkedinAuthUrl}>
                      <Button variant="outline" className="w-full gap-2 border-[#0A66C2]/50 text-[#0A66C2]">
                        <Linkedin className="h-4 w-4" />
                        Connexion LinkedIn
                      </Button>
                    </a>
                    <a href={linkedinAuthUrl}>
                      <Button className="btn-gradient w-full">
                        Commencer gratuitement
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    {/* Réserve l'espace sous la navbar fixe (h-16) pour éviter que le contenu passe dessous */}
    <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
