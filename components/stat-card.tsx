import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

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
}

const colorMap = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary', text: 'text-primary' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
}

export function StatCard({ label, value, icon: Icon, color = 'primary', trend, subtitle }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-foreground break-words">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div className={`text-xs mt-2 font-semibold ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {Icon && (
            <div className={`${colors.bg} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
