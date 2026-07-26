import { useMemo } from 'react'

interface VirtualizationParams<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualization<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualizationParams<T>) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const totalCount = items.length
    const totalHeight = totalCount * itemHeight

    return {
      visibleCount,
      totalCount,
      totalHeight,
      
      // Get items to render at a given scroll position
      getVisibleRange: (scrollTop: number) => {
        const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const endIdx = Math.min(
          totalCount,
          Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        )
        
        return {
          startIdx,
          endIdx,
          offsetY: startIdx * itemHeight,
          visibleItems: items.slice(startIdx, endIdx),
        }
      },
    }
  }, [items, itemHeight, containerHeight, overscan])
}
