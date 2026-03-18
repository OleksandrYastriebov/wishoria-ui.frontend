import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/[0.07] rounded-lg',
        className
      )}
    />
  );
}

interface WishlistCardSkeletonProps {
  className?: string;
}

export function WishlistCardSkeleton({ className }: WishlistCardSkeletonProps) {
  return (
    <div className={cn('bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06]', className)}>
      <Skeleton className="w-full h-44 rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-[#111118] rounded-2xl overflow-hidden border border-white/[0.06] flex gap-4 p-4">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function PublicProfileHeaderSkeleton() {
  return (
    <div className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6 flex items-center gap-5">
      <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
