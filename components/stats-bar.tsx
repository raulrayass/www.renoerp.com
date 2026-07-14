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
    <div className="flex items-center justify-start gap-3 sm:gap-6 py-0">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-0">
          <div className="flex items-center gap-1">
            {item.icon && <div className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClasses[item.color || 'default']}`}>{item.icon}</div>}
            <p className={`text-sm sm:text-base font-semibold ${colorClasses[item.color || 'default']}`}>
              {item.value}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
