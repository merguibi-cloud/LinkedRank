import { LinkedInReturnAnimation } from "@/components/linkedin/LinkedInReturnAnimation";
import { clearLinkedInOAuthFlow, isLinkedInOAuthFlow } from "@/lib/linkedinOAuthFlow";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type OverlayState =
  | { type: "idle" }
  | { type: "success"; profileName?: string | null }
  | { type: "error"; errorCode: string };

function cleanOAuthParams(params: URLSearchParams, keys: string[]) {
  for (const key of keys) params.delete(key);
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
}

export function LinkedInOAuthHandler() {
  const [overlay, setOverlay] = useState<OverlayState>({ type: "idle" });

  const dismissOverlay = () => setOverlay({ type: "idle" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinConnected = params.get("linkedin_connected") === "true";
    const linkedinError = params.get("linkedin_error");

    if (!linkedinConnected && !linkedinError) return;

    const fromOAuthFlow = isLinkedInOAuthFlow();
    clearLinkedInOAuthFlow();

    if (linkedinConnected) {
      cleanOAuthParams(params, ["linkedin_connected"]);

      setOverlay({ type: "success" });

      fetch("/api/linkedin/sync", { method: "POST", credentials: "include" })
        .then(async (res) => {
          if (!res.ok) return null;
          return res.json() as Promise<{ profileName?: string | null }>;
        })
        .then((data) => {
          if (data?.profileName) {
            setOverlay({ type: "success", profileName: data.profileName });
          }
        })
        .catch(() => undefined)
        .finally(() => {
          window.dispatchEvent(new CustomEvent("linkedin-status-changed"));
        });

      if (!fromOAuthFlow) {
        toast.success("LinkedIn connecté avec succès !");
      }
      return;
    }

    if (linkedinError) {
      cleanOAuthParams(params, ["linkedin_error"]);
      setOverlay({ type: "error", errorCode: linkedinError });

      if (!fromOAuthFlow) {
        toast.error(`Erreur LinkedIn : ${linkedinError}`);
      }
    }
  }, []);

  if (overlay.type === "idle") return null;

  return (
    <LinkedInReturnAnimation
      type={overlay.type === "error" ? "error" : "success"}
      errorCode={overlay.type === "error" ? overlay.errorCode : undefined}
      profileName={overlay.type === "success" ? overlay.profileName : undefined}
      onComplete={dismissOverlay}
    />
  );
}
