'use client'

import { useState } from 'react'
import { useEventContext } from '@/lib/contexts/event-context'
import { useUser } from '@/components/user-provider'
import { inviteToEvent } from '@/app/actions/events'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Mail } from 'lucide-react'
import { toast } from 'sonner'

export function InviteMembersDialog() {
  const { currentEvent } = useEventContext()
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'leader' | 'coordinator' | 'viewer'>('viewer')
  const [loading, setLoading] = useState(false)

  if (!currentEvent || !user) {
    return null
  }

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('El email es requerido')
      return
    }

    if (!email.includes('@')) {
      toast.error('Email inválido')
      return
    }

    try {
      setLoading(true)
      await inviteToEvent(user.id, currentEvent.id, {
        email: email.toLowerCase().trim(),
        role,
      })

      toast.success(`Invitación enviada a ${email}`)
      setEmail('')
      setRole('viewer')
      setOpen(false)
    } catch (error) {
      console.error('[v0] Error inviting member:', error)
      toast.error('Error al enviar invitación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 h-9 rounded-lg"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Invitar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Invitar al Campamento
          </DialogTitle>
          <DialogDescription>
            Invita a miembros de tu equipo a {currentEvent.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email del miembro
            </label>
            <Input
              type="email"
              placeholder="ejemplo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Rol
            </label>
            <Select value={role} onValueChange={(v: any) => setRole(v)} disabled={loading}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leader">
                  <div>
                    <p className="font-medium">Líder</p>
                    <p className="text-xs text-muted-foreground">Lidera un equipo</p>
                  </div>
                </SelectItem>
                <SelectItem value="coordinator">
                  <div>
                    <p className="font-medium">Coordinador</p>
                    <p className="text-xs text-muted-foreground">Acceso total (solo lectura)</p>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div>
                    <p className="font-medium">Visualizador</p>
                    <p className="text-xs text-muted-foreground">Solo dashboards</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading || !email.trim()}
              className="flex-1 rounded-lg"
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
