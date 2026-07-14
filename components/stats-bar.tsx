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
    <div className="flex flex-wrap gap-2 sm:gap-4 py-1.5 px-0">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          {item.icon && <div className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClasses[item.color || 'default']}`}>{item.icon}</div>}
          <div>
            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            <p className={`text-sm sm:text-base font-semibold ${colorClasses[item.color || 'default']}`}>
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
