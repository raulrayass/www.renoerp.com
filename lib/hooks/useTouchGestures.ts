'use client'

import { useRef, useEffect } from 'react'

interface GestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchGestures(handlers: GestureHandlers) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const {
    threshold = 50,
    longPressDelay = 500,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
  } = handlers

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
        }, longPressDelay)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      clearTimeout(longPressTimer.current!)

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current

      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaX > 0 ? onSwipeRight?.() : onSwipeLeft?.()
      } else if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
        deltaY > 0 ? onSwipeDown?.() : onSwipeUp?.()
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [threshold, longPressDelay, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress])
}
