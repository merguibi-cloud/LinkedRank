import { cn } from "@/lib/utils";

// Base skeleton with shimmer effect
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/5",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      style={style}
    />
  );
}

// Post card skeleton
export function PostCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-xl" />
      
      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Agent card skeleton
export function AgentCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      
      <Skeleton className="h-16 w-full rounded-lg" />
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-white/10">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="h-64 flex items-end gap-2 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Carousel slide skeleton
export function CarouselSlideSkeleton() {
  return (
    <div className="aspect-[4/5] rounded-2xl bg-card border border-white/10 p-6 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full rounded-xl mt-auto" />
    </div>
  );
}

// Full page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading spinner with text
export function LoadingSpinner({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-violet/20" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-violet animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

// Pulse dot indicator
export function PulseIndicator({ color = "violet" }: { color?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span 
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          color === "violet" && "bg-violet",
          color === "emerald" && "bg-emerald",
          color === "rose" && "bg-rose",
          color === "gold" && "bg-gold"
        )} 
      />
      <span 
        className={cn(
          "relative inline-flex rounded-full h-3 w-3",
          color === "violet" && "bg-violet",
          color === "emerald" && "bg-emerald",
          color === "rose" && "bg-rose",
          color === "gold" && "bg-gold"
        )} 
      />
    </span>
  );
}
