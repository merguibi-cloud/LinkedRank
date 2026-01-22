import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Cookie, X, Settings, Check } from "lucide-react";

const COOKIE_CONSENT_KEY = "linkedrank_cookie_consent";
const COOKIE_PREFERENCES_KEY = "linkedrank_cookie_preferences";

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    
    // Apply preferences (e.g., disable analytics if not consented)
    if (prefs.analytics) {
      // Enable analytics tracking
      console.log("[CookieConsent] Analytics enabled");
    } else {
      // Disable analytics tracking
      console.log("[CookieConsent] Analytics disabled");
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      functional: true,
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      functional: false,
    });
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay for settings modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {showSettings ? (
            // Settings Panel
            <div className="bg-card border border-white/10 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet/20">
                    <Settings className="w-5 h-5 text-violet-light" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Paramètres des cookies</h3>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Cookies essentiels</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-violet-light">
                      <Check className="w-4 h-4" />
                      Toujours actif
                    </div>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium text-white">Cookies analytiques</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet"></div>
                    </label>
                  </div>
                </div>

                {/* Functional cookies */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium text-white">Cookies fonctionnels</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permettent de mémoriser vos préférences et personnaliser votre expérience.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={acceptEssential}
                  variant="outline"
                  className="flex-1"
                >
                  Refuser tout
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1 bg-violet hover:bg-violet/90"
                >
                  Enregistrer mes choix
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                En savoir plus dans notre{" "}
                <Link href="/legal/confidentialite" className="text-violet-light hover:underline">
                  Politique de Confidentialité
                </Link>
              </p>
            </div>
          ) : (
            // Main Banner
            <div className="bg-card border border-white/10 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-violet/20 shrink-0">
                    <Cookie className="w-6 h-6 text-violet-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Nous respectons votre vie privée
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Nous utilisons des cookies pour améliorer votre expérience sur LinkedRank. 
                      Vous pouvez personnaliser vos préférences ou accepter tous les cookies.{" "}
                      <Link href="/legal/confidentialite" className="text-violet-light hover:underline">
                        En savoir plus
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Personnaliser
                  </Button>
                  <Button
                    onClick={acceptEssential}
                    variant="outline"
                    size="sm"
                  >
                    Refuser
                  </Button>
                  <Button
                    onClick={acceptAll}
                    size="sm"
                    className="bg-violet hover:bg-violet/90"
                  >
                    Tout accepter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Hook to check cookie preferences
export function useCookiePreferences(): CookiePreferences {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return preferences;
}

// Function to reset cookie consent (for testing or settings page)
export function resetCookieConsent() {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_PREFERENCES_KEY);
  window.location.reload();
}
