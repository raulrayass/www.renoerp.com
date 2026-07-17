import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: 'primary' | 'green' | 'red' | 'orange' | 'blue'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  subtitle?: string
  className?: string
}
const colorMap = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary', text: 'text-primary' },
  green: { bg: 'bg-emerald-600/10', icon: 'text-emerald-600', text: 'text-emerald-600' },
  red: { bg: 'bg-red-600/10', icon: 'text-red-600', text: 'text-red-600' },
  orange: { bg: 'bg-orange-600/10', icon: 'text-orange-600', text: 'text-orange-600' },
  blue: { bg: 'bg-blue-600/10', icon: 'text-blue-600', text: 'text-blue-600' },
}
export function StatCard({ label, value, icon: Icon, color = 'primary', trend, subtitle, className }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-1 sm:p-2">
        <div className="flex items-start justify-between gap-0.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight truncate">{label}</p>
            <p className="text-xs sm:text-sm font-bold mt-0.5 text-foreground break-words">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            {trend && (
              <div className={`text-xs mt-0.5 font-semibold ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {Icon && (
            <div className={`${colors.bg} p-1.5 sm:p-2 rounded-lg flex-shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
