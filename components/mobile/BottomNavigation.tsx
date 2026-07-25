'use client'

import { ReactNode } from 'react'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  icon: ReactNode
  active?: boolean
  onClick: () => void
  badge?: number
}

interface BottomNavigationProps {
  items: NavItem[]
  className?: string
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const isMobile = !useMediaQuery('(min-width: 768px)')

  if (!isMobile) return null

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom', className)}>
      <div className="flex items-center justify-around h-16 md:h-20 px-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors relative',
              'text-xs font-medium h-full flex-1',
              item.active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="truncate text-xs">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
