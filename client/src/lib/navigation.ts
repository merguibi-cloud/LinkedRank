import type { LucideIcon } from "lucide-react";
import {
  Home,
  PenTool,
  LayoutDashboard,
  Bot,
  Calendar,
  BarChart3,
  Layers,
  FileText,
  Zap,
  TrendingUp,
  Trophy,
  Settings,
  Linkedin,
  BookOpen,
  Globe,
  Flame,
  Users,
  Wrench,
  FolderOpen,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavLink[];
}

/** Navigation principale — visible dans la barre du haut */
export const PRIMARY_NAV: NavLink[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/generate", label: "Créer", icon: PenTool },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
];

/** Menu « Découvrir » pour visiteurs */
export const DISCOVER_NAV: NavLink[] = [
  { href: "/rankings/france", label: "Classements", icon: Trophy, description: "Top créateurs LinkedIn" },
  { href: "/top-posts", label: "Posts viraux", icon: Flame, description: "Inspiration concrète" },
  { href: "/trending", label: "Tendances", icon: TrendingUp, description: "Sujets du moment" },
  { href: "/creators", label: "Créateurs", icon: Users, description: "Profils à suivre" },
];

/** Menu « Outils » — actions courantes */
export const TOOLS_NAV: NavLink[] = [
  { href: "/generate", label: "Générateur IA", icon: PenTool, description: "Créer un post en 4 étapes" },
  { href: "/carousels", label: "Carrousels", icon: Layers, description: "Slides professionnels" },
  { href: "/templates", label: "Templates", icon: FileText, description: "Modèles prêts à l'emploi" },
  { href: "/schedule", label: "Calendrier", icon: Calendar, description: "Planifier vos publications" },
  { href: "/auto-publish", label: "Auto-publication", icon: Zap, description: "Publier automatiquement" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Suivre vos performances" },
];

/** Barre mobile basse — 5 entrées max */
export const MOBILE_PRIMARY_NAV: NavLink[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/generate", label: "Créer", icon: PenTool },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
];

/** Menu latéral mobile complet */
export const MOBILE_FULL_MENU: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/", label: "Accueil", icon: Home },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/generate", label: "Générateur IA", icon: PenTool },
      { href: "/agents", label: "Mes agents", icon: Bot },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/mes-outils", label: "Mes outils", icon: Wrench },
      { href: "/mes-outils?tab=mediatheque", label: "Médiathèque", icon: FolderOpen },
      { href: "/carousels", label: "Carrousels", icon: Layers },
      { href: "/templates", label: "Templates", icon: FileText },
      { href: "/schedule", label: "Calendrier", icon: Calendar },
      { href: "/auto-publish", label: "Auto-publication", icon: Zap },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/trending", label: "Tendances", icon: TrendingUp },
      { href: "/rankings/france", label: "Classements", icon: Trophy },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/resources", label: "Ressources", icon: BookOpen },
      { href: "/linkedin-settings", label: "LinkedIn", icon: Linkedin },
      { href: "/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

/** Sidebar dashboard — structure épurée */
export const SIDEBAR_NAV: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/generate", label: "Générateur", icon: PenTool, badge: "IA" },
      { href: "/agents", label: "Mes agents", icon: Bot },
      { href: "/auto-publish", label: "Auto-publication", icon: Zap },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/mes-outils", label: "Mes outils", icon: Wrench },
      { href: "/mes-outils?tab=mediatheque", label: "Médiathèque", icon: FolderOpen },
      { href: "/carousels", label: "Carrousels", icon: Layers },
      { href: "/templates", label: "Templates", icon: FileText },
      { href: "/schedule", label: "Calendrier", icon: Calendar },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/trending", label: "Tendances", icon: TrendingUp },
      { href: "/rankings/france", label: "Classements", icon: Trophy },
    ],
  },
  {
    title: "Compte",
    items: [
      { href: "/resources", label: "Ressources", icon: BookOpen },
      { href: "/settings", label: "Paramètres", icon: Settings },
      { href: "/linkedin-settings", label: "LinkedIn", icon: Linkedin },
    ],
  },
];

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href.includes("?")) {
    const [path, query] = href.split("?");
    const tab = new URLSearchParams(query).get("tab");
    const currentTab = new URLSearchParams(window.location.search).get("tab");
    return pathname === path && currentTab === tab;
  }
  if (href === "/mes-outils") {
    return pathname === "/mes-outils" && !window.location.search.includes("tab=mediatheque");
  }
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
