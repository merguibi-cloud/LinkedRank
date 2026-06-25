import { LinkedInConnectAnimation } from "@/components/linkedin/LinkedInConnectAnimation";
import { getLinkedInAuthApiUrl } from "@/const";
import { markLinkedInOAuthFlow } from "@/lib/linkedinOAuthFlow";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function LinkedInConnect() {
  const redirect = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/dashboard";
  }, []);
  const skippable = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("skippable") === "1";
  }, []);

  const [phase, setPhase] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    markLinkedInOAuthFlow();

    const phase1 = window.setTimeout(() => setPhase(1), 900);
    const phase2 = window.setTimeout(() => setPhase(2), 1800);
    const redirectTimer = window.setTimeout(() => {
      window.location.href = getLinkedInAuthApiUrl(redirect);
    }, 2900);
    timersRef.current = [phase1, phase2, redirectTimer];

    return () => {
      timersRef.current.forEach(window.clearTimeout);
    };
  }, [redirect]);

  const handleSkip = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    window.location.href = redirect;
  }, [redirect]);

  return (
    <LinkedInConnectAnimation
      phase={phase}
      onSkip={skippable ? handleSkip : undefined}
    />
  );
}
