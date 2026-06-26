import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { LinkedInStatusBadge } from "@/components/LinkedInStatusBadge";
import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";
import { getLoginUrl } from "@/const";
import {
  DISCOVER_NAV,
  PRIMARY_NAV,
  TOOLS_NAV,
  isNavLinkActive,
} from "@/lib/navigation";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Linkedin,
  Bot,
  Calendar,
  Settings,
  Zap,
  Globe,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NotificationCenter } from "./NotificationCenter";

interface SubMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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

  // Top nav is intentionally minimal: Créer, Dashboard, Découvrir, Ressources.
  // Agents and the former « Outils » destinations live inside the Découvrir
  // dropdown instead of as separate top-level menus.
  const navItems: NavItem[] = [
    ...PRIMARY_NAV.filter((item) => item.href !== "/" && item.href !== "/agents").map((item) => ({
      label: item.label,
      icon: item.icon,
      href: item.href,
    })),
    {
      label: "Découvrir",
      icon: Globe,
      submenu: [
        ...DISCOVER_NAV.map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
          description: item.description,
        })),
        { href: "/agents", label: "Agents", icon: Bot, description: "Vos agents IA" },
        ...TOOLS_NAV.filter((item) => item.href !== "/generate").map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
          description: item.description,
        })),
      ],
    },
    { label: "Ressources", icon: Sparkles, href: "/resources" },
  ];

  const isActive = (href: string) => isNavLinkActive(location, href);
  const isSubmenuActive = (submenu: SubMenuItem[]) =>
    submenu.some((item) => isActive(item.href));

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
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    setActiveSubmenu(label);
  };

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => setActiveSubmenu(null), 150);
  };

  const linkedinAuthUrl = "/linkedin/connect?redirect=/dashboard";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-xl safe-area-top">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-rose">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight sm:text-xl">
                <span className="text-white">Linked</span>
                <span className="bg-gradient-to-r from-violet-light to-rose bg-clip-text text-transparent">
                  Agents
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-0.5 lg:flex">
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
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            activeSubmenu === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

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
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      isActive(subItem.href)
                                        ? "bg-gradient-to-br from-violet to-rose"
                                        : "bg-white/10"
                                    }`}
                                  >
                                    <subItem.icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-white">
                                      {subItem.label}
                                    </span>
                                    {subItem.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {subItem.description}
                                      </p>
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
                      className={`nav-link flex items-center gap-1.5 ${
                        isActive(item.href!) ? "active" : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <>
                  <Link href="/generate">
                    <Button className="btn-gradient gap-2 h-9">
                      <Zap className="h-4 w-4" />
                      Créer un post
                    </Button>
                  </Link>
                  <NotificationCenter />
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.name?.split(" ")[0] || "Compte"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block p-3 border-b border-white/10 space-y-2 hover:bg-white/5 transition-colors"
                        >
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <LinkedInStatusBadge showPhoto size="sm" />
                        </Link>
                        <div className="p-1">
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10">
                              <Sparkles className="h-4 w-4" />
                              Dashboard
                            </button>
                          </Link>
                          <Link href="/schedule" onClick={() => setUserMenuOpen(false)}>
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10">
                              <Calendar className="h-4 w-4" />
                              Calendrier
                            </button>
                          </Link>
                          <Link href="/settings" onClick={() => setUserMenuOpen(false)}>
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10">
                              <Settings className="h-4 w-4" />
                              Paramètres
                            </button>
                          </Link>
                          {!linkedInStatus.connected && (
                            <>
                              <div className="border-t border-white/10 my-1" />
                              <a href={linkedinAuthUrl}>
                                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-[#0A66C2] to-[#0077B5] text-white hover:opacity-90">
                                  <Linkedin className="h-4 w-4" />
                                  Connecter LinkedIn
                                </button>
                              </a>
                            </>
                          )}
                          <div className="border-t border-white/10 my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm">
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

            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-white/10 py-4 lg:hidden max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-1">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-violet/20 text-white"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                {navItems
                  .filter((item) => item.submenu)
                  .map((item) => (
                    <div key={item.label} className="mt-2">
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <div className="space-y-1 pl-2">
                        {item.submenu!.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${
                              isActive(subItem.href)
                                ? "bg-violet/20 text-white"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                  {user ? (
                    <>
                      <Link href="/generate" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="btn-gradient w-full">Créer un post</Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-red-400 border-red-400/30"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </Button>
                    </>
                  ) : (
                    <a href={linkedinAuthUrl}>
                      <Button className="btn-gradient w-full">Commencer gratuitement</Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
