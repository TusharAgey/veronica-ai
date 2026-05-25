import { cn } from "../../utilities/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * A shimmer skeleton loader that matches the glass-morphism aesthetic.
 * Use it as a placeholder while lazy-loaded components are being fetched.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-white/[0.04] border border-white/[0.06]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent",
        className,
      )}
    />
  );
}

/**
 * A skeleton specifically for the main view area, matching the layout
 * of the lazy-loaded components (Dashboard, PasswordManager, etc.).
 */
export function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-2 h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <Skeleton className="col-span-2 min-h-[200px]" />
        <div className="flex flex-col gap-6">
          <Skeleton className="flex-1 min-h-[100px]" />
          <Skeleton className="flex-1 min-h-[100px]" />
        </div>
      </div>
    </div>
  );
}
