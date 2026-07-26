import React from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  divider?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  action,
  divider = false,
}: SectionHeaderProps) {
  return (
    <div className={divider ? 'pb-4 border-b border-border' : 'pb-4'}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
