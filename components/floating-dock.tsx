'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, DollarSign, MapPin, Trophy, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLoading } from '@/components/loading-screen'

// Los 4 ítems laterales + Inicio elevado al centro = 5 destinos del mockup:
// Personas · Finanzas · [Inicio] · Logística · Juegos
const leftItems = [
  {
    href: '/attendees',
    label: 'Personas',
    icon: Users,
    match: (p: string) => ['/attendees', '/staff', '/teams'].some((r) => p.startsWith(r)),
  },
  {
    href: '/transactions',
    label: 'Finanzas',
    icon: DollarSign,
    match: (p: string) => ['/transactions', '/categories'].some((r) => p.startsWith(r)),
  },
]

const rightItems = [
  {
    href: '/rooms',
    label: 'Logística',
    icon: MapPin,
    match: (p: string) => ['/rooms', '/churches'].some((r) => p.startsWith(r)),
  },
  {
    href: '/games',
    label: 'Juegos',
    icon: Trophy,
    match: (p: string) => p.startsWith('/games'),
  },
]

// Acción contextual del "+" flotante según la pantalla.
function getPrimaryAction(pathname: string): { label: string; href: string } | null {
  if (pathname === '/') return null // en Inicio no mostramos el "+"
  if (pathname.startsWith('/transactions') || pathname.startsWith('/categories'))
    return { label: 'Nueva transacción', href: '/transactions?new=1' }
  if (pathname.startsWith('/rooms') || pathname.startsWith('/churches'))
    return { label: 'Nueva habitación', href: '/rooms?new=1' }
  if (pathname.startsWith('/games')) return { label: 'Nuevo juego', href: '/games?new=1' }
  if (pathname.startsWith('/staff')) return { label: 'Nuevo staff', href: '/staff?new=1' }
  if (pathname.startsWith('/teams')) return { label: 'Nuevo equipo', href: '/teams?new=1' }
  return { label: 'Agregar campero', href: '/attendees?new=1' }
}

export function FloatingDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading } = useLoading()

  if (isLoading) return null

  const homeActive = pathname === '/'
  const action = getPrimaryAction(pathname)

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 lg:hidden flex items-end gap-2">
      {/* Píldora con los ítems */}
      <nav className="flex-1">
        <div className="relative flex items-end justify-between px-3 pt-2 pb-2 rounded-3xl bg-card/95 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <div className="flex flex-1 items-center justify-around">
            {leftItems.map((item) => (
              <DockItem key={item.href} item={item} active={item.match(pathname)} />
            ))}
          </div>

          {/* Inicio elevado al centro */}
          <div className="flex flex-col items-center justify-end px-2 shrink-0">
            <Link
              href="/"
              title="Inicio"
              aria-label="Inicio"
              className={cn(
                'flex items-center justify-center w-14 h-14 -mt-8 rounded-full ring-4 ring-card shadow-lg transition-all duration-200 active:scale-95',
                homeActive
                  ? 'bg-green-600 text-white shadow-green-600/30'
                  : 'bg-card border-2 border-green-600 text-green-600 hover:bg-green-50'
              )}
            >
              <Home className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-around">
            {rightItems.map((item) => (
              <DockItem key={item.href} item={item} active={item.match(pathname)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Botón de acción circular, separado a la derecha (estilo Draftea) */}
      {action && (
        <button
          onClick={() => router.push(action.href)}
          title={action.label}
          aria-label={action.label}
          className="flex items-center justify-center w-14 h-14 shrink-0 rounded-full bg-green-600 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] shadow-green-600/30 backdrop-blur-md transition-all duration-200 hover:bg-green-700 active:scale-95"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

function DockItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 rounded-xl transition-all duration-200',
        active ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className={cn('w-5 h-5 transition-transform', active && 'scale-110')} />
      <span className={cn('text-[10px] font-medium leading-none', active && 'font-semibold')}>
        {item.label}
      </span>
    </Link>
  )
}
