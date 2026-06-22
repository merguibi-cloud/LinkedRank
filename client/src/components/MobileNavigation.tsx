import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Linkedin,
  Settings,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { shouldShowMobileNav } from "@/lib/mobileNav";
import {
  MOBILE_FULL_MENU,
  MOBILE_PRIMARY_NAV,
  isNavLinkActive,
} from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function MobileNavigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const isActive = (href: string) => isNavLinkActive(location, href);

  if (!shouldShowMobileNav(location)) {
    return null;
  }

  const bottomNavItems = [
    ...MOBILE_PRIMARY_NAV,
    { href: "#menu", label: "Menu", icon: Menu },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-stretch justify-around py-1.5">
          {bottomNavItems.map((item) =>
            item.href === "#menu" ? (
              <button
                key={item.href}
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-muted-foreground active:scale-95"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] leading-tight sm:text-xs">{item.label}</span>
              </button>
            ) : (
              <Link key={item.href} href={item.href} className="flex-1">
                <button
                  type="button"
                  className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 active:scale-95 ${
                    isActive(item.href) ? "text-violet-light" : "text-muted-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive(item.href) ? "text-violet-light" : ""}`}
                  />
                  <span
                    className={`text-[10px] leading-tight sm:text-xs ${
                      isActive(item.href) ? "text-violet-light font-medium" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            )
          )}
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col transform border-l border-white/10 bg-background transition-transform duration-300 ease-out md:hidden safe-area-top ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose text-sm font-semibold text-white">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name || "Compte"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </>
            ) : (
              <span className="text-lg font-semibold text-white">Navigation</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {MOBILE_FULL_MENU.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-xl p-3 transition-colors ${
                        isActive(item.href)
                          ? "bg-violet/20 text-white"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`h-5 w-5 ${isActive(item.href) ? "text-violet-light" : ""}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="my-4 border-t border-white/10" />

          {user ? (
            <div className="space-y-2">
              <Link href="/settings">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-muted-foreground hover:bg-white/5 hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  Paramètres
                </button>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-rose hover:bg-rose/10"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="w-full btn-gradient">
                <Linkedin className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </a>
          )}
        </div>

        <div className="safe-area-bottom border-t border-white/10 p-4">
          <p className="text-center text-xs text-muted-foreground">LinkedAgents</p>
        </div>
      </div>

      <div className="pb-mobile-nav md:hidden" aria-hidden="true" />
    </>
  );
}
