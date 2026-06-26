import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IllustrationSlotProps {
  /** Path to drop a generated image into (e.g. /images/empty-carousels.png). */
  src: string;
  /**
   * Shown until the image exists, and if it ever fails to load. Omit for a
   * purely decorative hero slot that should just collapse to nothing.
   */
  icon?: LucideIcon;
  alt: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Hero/empty-state visual slot. Renders the Lucide icon fallback (or nothing,
 * for decorative hero banners with no icon prop) until a file actually
 * exists at `src` — then it swaps to that image instead. No code change
 * needed when dropping in a generated illustration later.
 */
export function IllustrationSlot({
  src,
  icon: Icon,
  alt,
  className,
  iconClassName,
}: IllustrationSlotProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return Icon ? (
      <Icon className={cn("text-muted-foreground/50", iconClassName)} />
    ) : null;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
