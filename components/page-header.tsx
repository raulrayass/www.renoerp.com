import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {children}
        </div>
      )}
    </div>
  )
}
