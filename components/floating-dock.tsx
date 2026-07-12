'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gauge3, ReceiptText, Layers, Users2, Building2, Users3, Package2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Gauge3 },
  { href: '/attendees', label: 'Camperos', icon: Users2 },
  { href: '/teams', label: 'Equipos', icon: Users3 },
  { href: '/rooms', label: 'Habitaciones', icon: Package2 },
  { href: '/games', label: 'Juegos', icon: Trophy },
  { href: '/churches', label: 'Iglesias', icon: Building2 },
  { href: '/transactions', label: 'Transacciones', icon: ReceiptText },
  { href: '/categories', label: 'Categorías', icon: Layers },
]

export function FloatingDock() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden px-3">
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-2xl bg-card border border-border shadow-lg backdrop-blur-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 p-0',
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
