import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
