import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-1">
          {children}
        </div>
      )}
    </div>
  )
}
