import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook pour gérer les raccourcis clavier globaux de l'application
 */
export function useKeyboardShortcuts() {
  const [, navigate] = useLocation();

  const showShortcutsHelp = useCallback(() => {
    toast.info("Raccourcis clavier disponibles", {
      description: "Ctrl+G: Générateur | Ctrl+D: Dashboard | Ctrl+A: Agents | Ctrl+T: Templates | Ctrl+S: Calendrier | Ctrl+Shift+P: Auto-Publish | Ctrl+/: Aide",
      duration: 6000,
    });
  }, []);

  // Définition des raccourcis
  const shortcuts: ShortcutConfig[] = [
    {
      key: "g",
      ctrl: true,
      action: () => navigate("/generate"),
      description: "Aller au générateur",
    },
    {
      key: "d",
      ctrl: true,
      action: () => navigate("/dashboard"),
      description: "Aller au dashboard",
    },
    {
      key: "a",
      ctrl: true,
      action: () => navigate("/agents"),
      description: "Aller aux agents",
    },
    {
      key: "p",
      ctrl: true,
      shift: true,
      action: () => navigate("/auto-publish"),
      description: "Aller à l'auto-publication",
    },
    {
      key: "t",
      ctrl: true,
      action: () => navigate("/templates"),
      description: "Aller aux templates",
    },
    {
      key: "s",
      ctrl: true,
      action: () => navigate("/schedule"),
      description: "Aller au calendrier",
    },
    {
      key: "/",
      ctrl: true,
      action: () => showShortcutsHelp(),
      description: "Afficher l'aide des raccourcis",
    },
    {
      key: "Escape",
      action: () => {
        // Fermer les modales ouvertes
        const event = new CustomEvent("closeModals");
        window.dispatchEvent(event);
      },
      description: "Fermer les modales",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ne pas intercepter si on est dans un input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, showShortcutsHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts, showShortcutsHelp };
}
