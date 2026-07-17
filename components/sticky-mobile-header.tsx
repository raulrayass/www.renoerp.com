'use client'

import { cn } from '@/lib/utils'

/**
 * Cabecera fija estilo WhatsApp para páginas de lista en móvil.
 * En móvil: se pega arriba (sticky) y agrupa título + acciones + filtros.
 * En desktop (lg+): se comporta como bloque normal, no fijo.
 */
export function StickyMobileHeader({
  title,
  actions,
  children,
  className,
}: {
  title: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        // Fijo en móvil, normal en desktop
        'sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 pt-2 pb-2 bg-background/95 backdrop-blur-md border-b border-border/60 lg:static lg:mx-0 lg:px-0 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:pb-0',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
