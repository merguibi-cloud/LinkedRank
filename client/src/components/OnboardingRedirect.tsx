import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

const BYPASS_PATHS = ["/onboarding", "/login", "/signup", "/"];

export function OnboardingRedirect() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: status } = trpc.onboarding.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (loading || !user || !status) return;
    if (status.completed) return;

    const pathname = location.split("?")[0];
    if (BYPASS_PATHS.includes(pathname)) return;

    setLocation("/onboarding?new=1");
  }, [user, loading, status, location, setLocation]);

  return null;
}
