import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

// The global Navbar (rendered by AppShell on every page) already covers
// navigation, so this is just a thin auth-gated content wrapper now —
// no per-page sidebar.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Connectez-vous pour continuer
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Accédez à votre espace de travail LinkedAgents.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return <main className="flex-1 p-3 sm:p-4 safe-area-bottom">{children}</main>;
}
