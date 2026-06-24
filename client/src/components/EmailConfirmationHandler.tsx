import { useEffect } from "react";
import { useLocation } from "wouter";
import { PENDING_CONFIRMATION_EMAIL_KEY } from "@/lib/supabase";

export function EmailConfirmationHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const code = search.get("code");
    const errorCode = search.get("error_code") || hash.get("error_code");

    if (!code && !errorCode) return;

    if (code) {
      const pendingEmail = localStorage.getItem(PENDING_CONFIRMATION_EMAIL_KEY);
      localStorage.removeItem(PENDING_CONFIRMATION_EMAIL_KEY);

      const loginParams = new URLSearchParams({ confirmed: "1" });
      if (pendingEmail) loginParams.set("email", pendingEmail);
      setLocation(`/login?${loginParams.toString()}`);
      return;
    }

    setLocation(`/login?confirm_error=${encodeURIComponent(errorCode!)}`);
  }, [setLocation]);

  return null;
}
