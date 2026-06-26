import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex-1 p-3 sm:p-4 space-y-4">
      <Skeleton className="h-12 w-48 rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
