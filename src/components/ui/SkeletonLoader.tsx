'use client';
import { cn } from '../../utils/cn';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-stone-200/70 rounded-lg', className)} />
  );
}

interface WishlistCardSkeletonProps { className?: string; }

export function WishlistCardSkeleton({ className }: WishlistCardSkeletonProps) {
  return (
    <div className={cn('bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)]', className)}>
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
    <div className="bg-white/75 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] flex flex-col">
      <Skeleton className="w-full rounded-none aspect-[4/3]" />
      <div className="flex items-center gap-3 px-4 py-3 border-t border-black/[0.05]">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1.5 ml-auto">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PublicProfileHeaderSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 flex items-center gap-5">
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
