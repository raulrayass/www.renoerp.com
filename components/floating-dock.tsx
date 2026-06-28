'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Tag, Users, Church } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendees', label: 'Asistentes', icon: Users },
  { href: '/churches', label: 'Iglesias', icon: Church },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tag },
]

export function FloatingDock() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <div className="flex items-center gap-2 px-3 py-3 rounded-full bg-card border border-border shadow-lg backdrop-blur-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 p-0',
                active
                  ? 'bg-accent text-accent-foreground shadow-md scale-110'
                  : 'text-foreground hover:bg-muted'
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
