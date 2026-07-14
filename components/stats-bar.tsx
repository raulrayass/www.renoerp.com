interface StatItem {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
}

interface StatsBarProps {
  items: StatItem[]
}

export function StatsBar({ items }: StatsBarProps) {
  const colorClasses = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    destructive: 'text-red-600',
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-3 py-1 px-0">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-0.5">
          {item.icon && <div className={`w-3 h-3 sm:w-4 sm:h-4 ${colorClasses[item.color || 'default']}`}>{item.icon}</div>}
          <div>
            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            <p className={`text-xs sm:text-sm font-semibold ${colorClasses[item.color || 'default']}`}>
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
