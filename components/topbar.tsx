'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Tag, Users, LogOut, User, Church } from 'lucide-react'
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
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-0">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/permanece-camp-logo.png"
              alt="Permanece Camp"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-contain"
              priority
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-foreground text-sm">Permanece Camp</span>
              <span className="text-xs text-muted-foreground leading-none">Nueva Creación</span>
            </div>
          </Link>

          {/* Nav - Hidden on mobile, shown on md+ */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-6">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              )
            })}
          </nav>



          {/* User area */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block truncate text-foreground text-sm font-medium max-w-[120px]">
                  {user.name || user.email?.split('@')[0] || 'Usuario'}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal py-2">
                    <p className="text-xs text-muted-foreground">Sesión activa</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
