import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";
import { CheckCircle2, Linkedin, XCircle } from "lucide-react";

type LinkedInStatusBadgeProps = {
  showPhoto?: boolean;
  size?: "sm" | "md";
};

export function LinkedInStatusBadge({
  showPhoto = false,
  size = "sm",
}: LinkedInStatusBadgeProps) {
  const { status, loading } = useLinkedInStatus();

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse" aria-hidden="true">
        <div className={`${size === "md" ? "h-8 w-8" : "h-6 w-6"} rounded-full bg-muted`} />
        <div className={`${size === "md" ? "h-4 w-20" : "h-3 w-16"} rounded bg-muted`} />
      </div>
    );
  }

  const photoSize = size === "md" ? "h-8 w-8" : "h-6 w-6";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-center gap-2">
      {showPhoto && status.connected && status.profilePicture ? (
        <img
          src={status.profilePicture}
          alt={status.profileName ?? "Profil LinkedIn"}
          className={`${photoSize} rounded-full object-cover border border-[#0077B5]/40`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${photoSize} flex items-center justify-center rounded-full ${
            status.connected ? "bg-[#0077B5]/20" : "bg-amber-500/20"
          }`}
        >
          <Linkedin
            className={`${size === "md" ? "h-4 w-4" : "h-3 w-3"} ${
              status.connected ? "text-[#0077B5]" : "text-amber-400"
            }`}
          />
        </div>
      )}
      <div className="flex flex-col">
        <span
          className={`${textSize} font-medium flex items-center gap-1 ${
            status.connected ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {status.connected ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          LinkedIn : {status.connected ? "Oui" : "Non"}
        </span>
        {status.connected && status.profileName && (
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {status.profileName}
          </span>
        )}
      </div>
    </div>
  );
}
