import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'accent' | 'highlight'
  children: React.ReactNode
}

export function NeumorphicCard({
  variant = 'default',
  className,
  children,
  ...props
}: NeumorphicCardProps) {
  const variants = {
    default: 'clay-card',
    elevated: 'stat-card',
    accent: 'aurora-card',
    highlight: 'stat-card',
  }

  return (
    <Card
      className={cn(
        variants[variant],
        'p-5 sm:p-6 rounded-xl sm:rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

export function NeumorphicBadge({ children, variant = 'primary' }: { children: React.ReactNode; variant?: string }) {
  const variants: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    destructive: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }

  return (
    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', variants[variant])}>
      {children}
    </span>
  )
}
