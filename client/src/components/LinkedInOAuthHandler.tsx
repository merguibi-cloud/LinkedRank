import { useEffect } from "react";
import { toast } from "sonner";

export function LinkedInOAuthHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("linkedin_connected") === "true") {
      toast.success("LinkedIn connecté avec succès !");
      fetch("/api/linkedin/sync", { method: "POST", credentials: "include" })
        .catch(() => undefined)
        .finally(() => {
          window.dispatchEvent(new CustomEvent("linkedin-status-changed"));
        });
      params.delete("linkedin_connected");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", next);
    }

    const linkedinError = params.get("linkedin_error");
    if (linkedinError) {
      toast.error(`Erreur LinkedIn : ${linkedinError}`);
      params.delete("linkedin_error");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  return null;
}
