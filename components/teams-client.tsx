'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Square, ArrowLeftRight, Tag, Users, Church, Zap, Home, Trophy, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/attendees', label: 'Camperos', icon: Users },
  { href: '/staff', label: 'Staff', icon: Briefcase },
  { href: '/teams', label: 'Equipos', icon: Zap },
  { href: '/rooms', label: 'Habitaciones', icon: Home },
  { href: '/', label: 'Dashboard', icon: Square },
  { href: '/games', label: 'Juegos', icon: Trophy },
  { href: '/churches', label: 'Iglesias', icon: Church },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorías', icon: Tag },
]

export function FloatingDock() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-2 right-2 z-50 lg:hidden">
      <div className="flex items-center justify-between gap-0.5 px-2 py-1.5 rounded-2xl bg-card border border-border shadow-lg backdrop-blur-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          const isDashboard = href === '/'

          if (isDashboard) {
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-full shrink-0 -mt-3 transition-all duration-200 shadow-md border-4 border-card',
                  active
                    ? 'bg-green-600 text-white scale-110'
                    : 'bg-card ring-2 ring-inset ring-green-600 text-green-600 hover:bg-green-600/10'
                )}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 p-0 shrink-0',
                active
                  ? 'bg-accent text-accent-foreground shadow-md scale-110'
                  : 'text-foreground hover:bg-muted'
              )}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}