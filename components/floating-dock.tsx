'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Tag, Users, Church, Zap, Home, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendees', label: 'Camperos', icon: Users },
  { href: '/teams', label: 'Equipos', icon: Zap },
  { href: '/rooms', label: 'Habitaciones', icon: Home },
  { href: '/games', label: 'Juegos', icon: Trophy },
  { href: '/churches', label: 'Iglesias', icon: Church },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorías', icon: Tag },
]

export function FloatingDock() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 lg:hidden mx-3">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-card border border-border shadow-lg backdrop-blur-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 p-0',
                active
                  ? 'bg-accent text-accent-foreground shadow-md scale-105'
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
