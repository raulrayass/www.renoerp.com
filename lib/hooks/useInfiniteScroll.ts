import { useState, useCallback, useRef, useEffect } from 'react'

interface UseInfiniteScrollParams {
  onLoadMore: () => Promise<void>
  threshold?: number
  disabled?: boolean
}

export function useInfiniteScroll({
  onLoadMore,
  threshold = 0.1,
  disabled = false,
}: UseInfiniteScrollParams) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoading || disabled || !hasMore) return

    setIsLoading(true)
    try {
      await onLoadMore()
    } catch (error) {
      console.error('[v0] Infinite scroll error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onLoadMore, isLoading, disabled, hasMore])

  useEffect(() => {
    if (!observerTarget.current || disabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          handleLoadMore()
        }
      },
      { threshold }
    )

    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [handleLoadMore, threshold, hasMore, isLoading, disabled])

  return {
    observerTarget,
    isLoading,
    hasMore,
    setHasMore,
  }
}
