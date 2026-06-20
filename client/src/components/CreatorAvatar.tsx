import { useState } from "react";
import { getCreatorAvatarFallbacks } from "@/lib/creatorAvatar";
import { cn } from "@/lib/utils";

type CreatorAvatarProps = {
  name: string;
  profilePicture?: string | null;
  linkedinUsername?: string | null;
  linkedinUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ring?: boolean;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
  "2xl": "h-36 w-36",
};

export function CreatorAvatar({
  name,
  profilePicture,
  linkedinUsername,
  linkedinUrl,
  size = "md",
  className,
  ring = true,
}: CreatorAvatarProps) {
  const sources = getCreatorAvatarFallbacks({
    profilePicture,
    linkedinUsername,
    linkedinUrl,
    name,
  });
  const [sourceIndex, setSourceIndex] = useState(0);

  if (!ring) {
    return (
      <img
        src={sources[sourceIndex]}
        alt={name}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={cn(sizeClasses[size], "rounded-full object-cover bg-muted", className)}
        onError={() => {
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((i) => i + 1);
          }
        }}
      />
    );
  }

  return (
    <div className={cn("rounded-full bg-gradient-to-br from-violet to-rose p-[2px]", sizeClasses[size])}>
      <img
        src={sources[sourceIndex]}
        alt={name}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={cn("h-full w-full rounded-full object-cover bg-muted", className)}
        onError={() => {
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((i) => i + 1);
          }
        }}
      />
    </div>
  );
}
