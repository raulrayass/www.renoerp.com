'use client'

import { useSession } from '@/lib/auth-client'
import { useEventContext } from '@/lib/contexts/event-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, LogOut, ChevronRight } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export default function ProfilePage() {
  const session = useSession()
  const { events, currentEventId, setCurrentEventId, refetchEvents } = useEventContext()
  const router = useRouter()

  if (!session?.data?.user) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  const user = session.data.user
  const currentEvent = events.find(e => e.id === currentEventId)

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/auth/signin')
  }

  const handleCreateEvent = () => {
    router.push('/events/create')
  }

  const handleSelectEvent = (eventId: number) => {
    setCurrentEventId(eventId)
    router.push('/')
    toast.success('Evento seleccionado')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu cuenta y campamentos</p>
        </div>

        {/* User Info */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Información Personal</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-base font-medium text-foreground">{user.name || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                <p className="text-base font-medium text-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Events Management */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Campamentos</h2>
              <Button
                onClick={handleCreateEvent}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </Button>
            </div>

            {events.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No tienes campamentos aún</p>
                <p className="text-sm mt-1">Crea uno para empezar a gestionar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      currentEventId === event.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30 bg-muted/30'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">{event.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{event.role}</p>
                    </div>
                    {currentEventId === event.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                          Activo
                        </span>
                        <ChevronRight className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
