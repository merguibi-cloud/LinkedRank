import { useAuth } from "@/_core/hooks/useAuth";
import { useLinkedInStatus } from "@/contexts/LinkedInStatusContext";
import { PROFILE_ONBOARDING_KEY } from "@/lib/gettingStartedJourney";
import {
  JOURNEY_DISMISSED_KEY,
  JOURNEY_STEPS,
  type JourneyStepId,
} from "@/lib/gettingStartedJourney";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";

type StepState = {
  id: JourneyStepId;
  number: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  secondaryAction?: { href: string; cta: string };
  completed: boolean;
  current: boolean;
};

export function useGettingStartedJourney() {
  const { user } = useAuth();
  const { status: linkedInStatus, loading: linkedInLoading } =
    useLinkedInStatus();
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(JOURNEY_DISMISSED_KEY) === "true"
      : false
  );
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(false);
  const [autoPublishLoaded, setAutoPublishLoaded] = useState(false);

  const { data: onboardingStatus, isLoading: onboardingLoading } =
    trpc.onboarding.getStatus.useQuery(undefined, { enabled: !!user });

  const { data: postsData, isLoading: postsLoading } =
    trpc.generator.myPosts.useQuery(
      { limit: 1, offset: 0 },
      { enabled: !!user }
    );

  useEffect(() => {
    if (!user) {
      setAutoPublishEnabled(false);
      setAutoPublishLoaded(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/auto-publish/settings", {
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setAutoPublishEnabled(!!data.settings?.isEnabled);
          setAutoPublishLoaded(true);
        }
      } catch {
        if (!cancelled) setAutoPublishLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const profileComplete = useMemo(() => {
    if (!user) return false;
    if (onboardingStatus?.completed) return true;
    return localStorage.getItem(PROFILE_ONBOARDING_KEY) === "true";
  }, [user, onboardingStatus?.completed]);

  const linkedInConnected = linkedInStatus.connected;
  const hasFirstPost = (postsData?.posts?.length ?? 0) > 0;
  const hasStarted = hasFirstPost || autoPublishEnabled;

  const completion = useMemo(
    () => ({
      account: !!user,
      profile: profileComplete,
      linkedin: linkedInConnected,
      "get-started": hasStarted,
    }),
    [user, profileComplete, linkedInConnected, hasStarted]
  );

  const currentStepId = useMemo((): JourneyStepId | null => {
    if (!user) return "account";
    if (!profileComplete) return "profile";
    if (!linkedInConnected) return "linkedin";
    if (!hasStarted) return "get-started";
    return null;
  }, [user, profileComplete, linkedInConnected, hasStarted]);

  const steps: StepState[] = useMemo(
    () =>
      JOURNEY_STEPS.map((step) => ({
        ...step,
        completed: completion[step.id],
        current: step.id === currentStepId,
      })),
    [completion, currentStepId]
  );

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const isComplete = completedCount === steps.length;
  const isLoading =
    !!user &&
    (onboardingLoading ||
      postsLoading ||
      !autoPublishLoaded ||
      linkedInLoading);

  const dismiss = useCallback(() => {
    localStorage.setItem(JOURNEY_DISMISSED_KEY, "true");
    setDismissed(true);
  }, []);

  const showJourney = !!user && !isComplete && !dismissed;

  return {
    steps,
    currentStepId,
    currentStep: steps.find((s) => s.current) ?? null,
    completedCount,
    progress,
    isComplete,
    isLoading,
    showJourney,
    dismiss,
    linkedInConnected,
  };
}
