import React from 'react'
import { NeumorphicCard, NeumorphicBadge } from './neumorphic-card'
import { LucideIcon } from 'lucide-react'

interface StatBoxProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendPercent?: number
  subtext?: string
  color?: string
  badge?: string
}

export function StatBox({
  label,
  value,
  icon: Icon,
  trend,
  trendPercent,
  subtext,
  color = '#16a34a',
  badge,
}: StatBoxProps) {
  return (
    <NeumorphicCard variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 flex-col gap-1"
          style={{ backgroundColor: color + '15' }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
        </div>
      </div>

      {(trend || badge) && (
        <div className="flex items-center justify-between">
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendPercent}%
            </span>
          )}
          {badge && <NeumorphicBadge variant="success">{badge}</NeumorphicBadge>}
        </div>
      )}
    </NeumorphicCard>
  )
}
