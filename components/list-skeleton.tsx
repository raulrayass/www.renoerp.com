import { CardSkeleton, Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  count?: number
  variant?: 'card' | 'row' | 'compact'
}

export function ListSkeleton({ count = 5, variant = 'card' }: ListSkeletonProps) {
  if (variant === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-lg animate-skeleton-shimmer bg-muted">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-20 h-6" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  // Default card variant
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} className="h-40" />
      ))}
    </div>
  )
}
