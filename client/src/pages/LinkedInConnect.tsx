import { LinkedInConnectAnimation } from "@/components/linkedin/LinkedInConnectAnimation";
import { getLinkedInAuthApiUrl } from "@/const";
import { markLinkedInOAuthFlow } from "@/lib/linkedinOAuthFlow";
import { useEffect, useMemo, useState } from "react";

export default function LinkedInConnect() {
  const redirect = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/dashboard";
  }, []);

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    markLinkedInOAuthFlow();

    const phase1 = window.setTimeout(() => setPhase(1), 900);
    const phase2 = window.setTimeout(() => setPhase(2), 1800);
    const redirectTimer = window.setTimeout(() => {
      window.location.href = getLinkedInAuthApiUrl(redirect);
    }, 2900);

    return () => {
      window.clearTimeout(phase1);
      window.clearTimeout(phase2);
      window.clearTimeout(redirectTimer);
    };
  }, [redirect]);

  return <LinkedInConnectAnimation phase={phase} />;
}
