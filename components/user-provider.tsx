'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getOrCreateUser } from '@/app/actions/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tent } from 'lucide-react'

interface UserCtx {
  user: { id: string; email: string; name: string | null } | null
  signOut: () => void
}

const UserContext = createContext<UserCtx>({ user: null, signOut: () => {} })

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('finanzapp_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('finanzapp_user')
      }
    }
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresa un correo electrónico valido.')
      return
    }
    setSubmitting(true)
    try {
      const u = await getOrCreateUser(trimmed)
      localStorage.setItem('finanzapp_user', JSON.stringify(u))
      setUser(u)
    } catch {
      setError('Ocurrio un error. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = useCallback(() => {
    localStorage.removeItem('finanzapp_user')
    setUser(null)
    setEmail('')
  }, [])

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
              <Tent className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-balance text-center">Permanece Camp</h1>
            <p className="text-primary text-sm font-medium mt-0.5">Nueva Creacion</p>
            <p className="text-muted-foreground text-xs mt-1 text-center">
              Control de ingresos y egresos del campamento
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-1">Ingresa tu correo</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Si es tu primera vez, se creara tu cuenta automaticamente.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  autoFocus
                  required
                />
                {error && <p className="text-destructive text-xs">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Tu correo es tu unico identificador. No se requiere contrasena.
          </p>
        </div>
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ user, signOut }}>
      {children}
    </UserContext.Provider>
  )
}
