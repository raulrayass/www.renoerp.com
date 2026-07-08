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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden px-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-background border border-border shadow-lg backdrop-blur-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary shadow-md'
                  : 'text-foreground/60 hover:text-foreground hover:bg-muted'
              )}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
