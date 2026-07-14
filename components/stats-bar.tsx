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
    <div className="flex flex-wrap gap-4 sm:gap-6 py-3 px-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.icon && <div className={`w-5 h-5 ${colorClasses[item.color || 'default']}`}>{item.icon}</div>}
          <div>
            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            <p className={`text-base sm:text-lg font-semibold ${colorClasses[item.color || 'default']}`}>
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
