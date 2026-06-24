import { TOOLS_NAV } from "@/lib/navigation";
import { isNavLinkActive } from "@/lib/navigation";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToolsQuickNavProps {
  className?: string;
}

export function ToolsQuickNav({ className }: ToolsQuickNavProps) {
  const [location] = useLocation();

  return (
    <nav
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10",
        className
      )}
      aria-label="Navigation outils"
    >
      {TOOLS_NAV.map((tool, index) => {
        const active = isNavLinkActive(location, tool.href);
        const Icon = tool.icon;

        return (
          <Link key={tool.href} href={tool.href}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer",
                active
                  ? "bg-gradient-to-r from-violet to-rose border-transparent text-white shadow-lg shadow-violet/20"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-violet/30 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium leading-none">{tool.label}</p>
                {!active && tool.description && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                    {tool.description}
                  </p>
                )}
              </div>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
