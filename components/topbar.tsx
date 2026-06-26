'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tent, LayoutDashboard, ArrowLeftRight, Tag, Users, LogOut, User, Church } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/user-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendees', label: 'Asistentes', icon: Users },
  { href: '/churches', label: 'Iglesias', icon: Church },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tag },
]

export function Topbar() {
  const pathname = usePathname()
  const { user, signOut } = useUser()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Tent className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-bold text-foreground text-sm">Permanece Camp</span>
              <span className="text-[11px] text-slate-500 leading-none">Sistema de Gestión</span>
            </div>
          </Link>

          {/* Nav - Hidden on mobile, shown on md+ */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-8">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile nav dropdown */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Navegación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href}>
                      <DropdownMenuItem className={cn('gap-2', active && 'bg-blue-50 text-blue-600')}>
                        <Icon className="w-4 h-4" />
                        {label}
                      </DropdownMenuItem>
                    </Link>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User area */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block truncate text-slate-700 text-sm font-medium max-w-[120px]">
                  {user.name || user.email?.split('@')[0] || 'Usuario'}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-xs text-slate-500">Sesión activa</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
