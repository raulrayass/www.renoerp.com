'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, Plus, MapPin, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLoading } from '@/components/loading-screen'

// Los 5 destinos del dock. Cada grupo apunta a su pantalla principal
// y se marca activo también cuando estás en una sub-ruta del grupo.
const navItems = [
  {
    href: '/',
    label: 'Inicio',
    icon: Home,
    match: (p: string) => p === '/',
  },
  {
    href: '/attendees',
    label: 'Personas',
    icon: Users,
    match: (p: string) => ['/attendees', '/staff', '/teams'].some((r) => p.startsWith(r)),
  },
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

// El botón central "+" es contextual: hace algo distinto según la pantalla.
// Por ahora lo mandamos a la acción más común de cada sección.
// (En el siguiente paso lo conectamos a los modales reales vía contexto.)
function getPrimaryAction(pathname: string): { label: string; href: string } {
  if (pathname.startsWith('/transactions') || pathname.startsWith('/categories')) {
    return { label: 'Nueva transacción', href: '/transactions?new=1' }
  }
  if (pathname.startsWith('/rooms') || pathname.startsWith('/churches')) {
    return { label: 'Nueva habitación', href: '/rooms?new=1' }
  }
  if (pathname.startsWith('/games')) {
    return { label: 'Nuevo juego', href: '/games?new=1' }
  }
  if (pathname.startsWith('/staff')) {
    return { label: 'Nuevo staff', href: '/staff?new=1' }
  }
  if (pathname.startsWith('/teams')) {
    return { label: 'Nuevo equipo', href: '/teams?new=1' }
  }
  // Default: agregar campero
  return { label: 'Agregar campero', href: '/attendees?new=1' }
}

export function FloatingDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading } = useLoading()

  if (isLoading) return null

  const action = getPrimaryAction(pathname)
  // Dividimos los 4 ítems en dos grupos para dejar el FAB en el centro.
  const left = navItems.slice(0, 2)
  const right = navItems.slice(2)

  return (
    <nav className="fixed bottom-4 left-3 right-3 z-50 lg:hidden">
      <div className="relative flex items-end justify-between px-3 pt-2 pb-2 rounded-3xl bg-card/95 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
        {/* Grupo izquierdo */}
        <div className="flex flex-1 items-center justify-around">
          {left.map((item) => (
            <DockItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </div>

        {/* FAB central contextual */}
        <div className="flex flex-col items-center justify-end px-2 shrink-0">
          <button
            onClick={() => router.push(action.href)}
            title={action.label}
            aria-label={action.label}
            className="flex items-center justify-center w-14 h-14 -mt-8 rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 ring-4 ring-card transition-all duration-200 hover:bg-green-700 active:scale-95"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>

        {/* Grupo derecho */}
        <div className="flex flex-1 items-center justify-around">
          {right.map((item) => (
            <DockItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </div>
      </div>
    </nav>
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
        'flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 rounded-xl transition-all duration-200',
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
